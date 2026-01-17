import {
  UserInputModel,
  UserPSQL,
} from '../../src/Modules/AuthModule/users/users.entity';
import { QuestionPSQL } from '../../src/Modules/quiz-game/entities/question.entity';
import { GameStatus } from '../../src/Modules/quiz-game/DTOs/game.dto';
import { PlayerResult } from '../../src/Modules/quiz-game/DTOs/player.dto';
import { QuizGameStatsPSQL } from '../../src/Modules/quiz-game/entities/quiz-game-stats.entity';
import { GamePSQL } from '../../src/Modules/quiz-game/entities/game.entity';
import { PlayerPSQL } from '../../src/Modules/quiz-game/entities/player.entity';
import { AnswerPSQL } from '../../src/Modules/quiz-game/entities/answer.entity';
import { UsersRepositoryPSQL } from '../../src/Modules/AuthModule/users/Repository/PostgreSQL/users.repository.psql';
import { QuizGameStatsRepository } from '../../src/Modules/quiz-game/Repository/quiz-game-stats.repository';
import { PlayerRepository } from '../../src/Modules/quiz-game/Repository/player.repository';
import { GameRepository } from '../../src/Modules/quiz-game/Repository/game.repository';
import { QuestionRepository } from '../../src/Modules/quiz-game/Repository/question.repository';
import { AnswerRepository } from '../../src/Modules/quiz-game/Repository/answer.repository';

/**
 * Заполняет тестовую БД данными для проверки лидерборда.
 * Создает 5 пользователей, 5 игр и соответствующие статистики.
 * @param repos Объекты репозиториев TypeORM.
 */

interface TestRepos {
  userRepo: UsersRepositoryPSQL;
  statsRepo: QuizGameStatsRepository;
  gameRepo: GameRepository;
  playerRepo: PlayerRepository;
  questionRepo: QuestionRepository;
  answerRepo: AnswerRepository;
}

export async function seedLeaderboardData(repos: TestRepos): Promise<void> {
  const {
    userRepo,
    statsRepo,
    gameRepo,
    playerRepo,
    questionRepo,
    answerRepo,
  } = repos;

  // 1. Предварительно определенные данные для 5 пользователей и их статистики
  const usersData = [
    { login: 'U1_HighestScore', score: 200, wins: 5, losses: 3, draws: 2 }, // games: 10
    { login: 'U2_HighestAvg', score: 150, wins: 4, losses: 0, draws: 1 }, // games: 5
    { login: 'U3_ScoreTie', score: 150, wins: 2, losses: 2, draws: 6 }, // games: 10
    { login: 'U4_LowestScore', score: 50, wins: 0, losses: 10, draws: 0 }, // games: 10
    { login: 'U5_HighestGames', score: 100, wins: 1, losses: 18, draws: 1 }, // games: 20
  ];

  // 2. Создание 5 общих вопросов
  const questions: QuestionPSQL[] = [];
  for (let i = 0; i < 5; i++) {
    // QuestionPSQL не имеет конструктора, который сохранял бы в БД.
    // Используем create/save.
    const q = new QuestionPSQL(`Test Question Body ${i + 1}`, [
      `answer${i + 1}`,
    ]);
    q.isPublished = true;
    await questionRepo.save(q);
    questions.push(q);
  }

  const createdUsers: UserPSQL[] = [];

  for (const data of usersData) {
    const gamesToSimulate = data.wins + data.losses + data.draws;

    // 3. Создание пользователя (использует статический конструктор)
    const userInput: UserInputModel = {
      login: data.login,
      email: `${data.login}@test.com`,
      password: 'password_hash',
    };
    const user = UserPSQL.CreateRegularUser(userInput);
    await userRepo.save(user);
    createdUsers.push(user);

    // 4. Генерация "Игр" и "Игроков"

    // **!!! Ключевое изменение: Создание PlayerPSQL для QuizGameStatsPSQL !!!**
    // Создадим массив "модельных" игроков, чтобы передать его в конструктор QuizGameStatsPSQL.
    const simulatedPlayers: PlayerPSQL[] = [];

    // Для простоты, создадим только те PlayerPSQL, которые будут использоваться
    // в конструкторе QuizGameStatsPSQL, с нужным score и result.
    // Поскольку конструктор QuizGameStatsPSQL принимает `PlayerPSQL[]`,
    // мы должны создать его с нужными свойствами.

    const singleSimulatedPlayer = new PlayerPSQL(user);
    singleSimulatedPlayer.score = data.score;
    singleSimulatedPlayer.result =
      data.wins > data.losses
        ? PlayerResult.victory
        : data.losses > data.wins
          ? PlayerResult.loss
          : PlayerResult.draw;

    // Создадим массив игроков, где каждый игрок будет иметь одну из
    // W/L/D сгенерированных статистикой (для gamesToSimulate)
    for (let i = 0; i < gamesToSimulate; i++) {
      const tempPlayer = new PlayerPSQL(user); // Просто пустой инстанс
      tempPlayer.score = data.score / gamesToSimulate; // Распределяем очки
      if (i < data.wins) {
        tempPlayer.result = PlayerResult.victory;
      } else if (i < data.wins + data.losses) {
        tempPlayer.result = PlayerResult.loss;
      } else {
        tempPlayer.result = PlayerResult.draw;
      }
      simulatedPlayers.push(tempPlayer);
    }

    // 5. Создание статистики (используем конструктор)
    // Конструктор автоматически вычислит sumScore, avgScores, gamesCount и т.д.
    const stats = new QuizGameStatsPSQL(user.id, simulatedPlayers);
    // Не используем repo.create(), так как конструктор уже вернул готовый объект.
    // Сохраняем:
    await statsRepo.save(stats);

    // 6. Создание реальной завершенной игры (для консистентности)
    // Используем конструктор GamePSQL(questions: QuestionPSQL[])
    const game = new GamePSQL(questions);
    game.status = GameStatus.finished;
    game.startedAt = new Date();
    game.finishedAt = new Date(Date.now() + 1000);
    await gameRepo.save(game); // Сохраняем GamePSQL (и GameQuestionPSQL через cascade)

    // 7. Создание реального Player (связанного с User и Game)
    // PlayerPSQL(user: UserPSQL) - только для инициализации user.
    // Остальные поля (score, result, gameId) нужно установить вручную.
    const player = new PlayerPSQL(user);
    player.gameId = game.id;
    player.game = game;
    // Устанавливаем итоговую статистику (очки и результат)
    player.score = data.score;
    player.result = singleSimulatedPlayer.result; // Используем result из нашего симулятора
    await playerRepo.save(player);

    // 8. Создание ответов для игрока (для Score)
    const correctAnswers = Math.floor(data.score / 10);
    for (let i = 0; i < 5; i++) {
      const isCorrect = i < correctAnswers;
      // AnswerPSQL(body, status, player, question) - используем конструктор
      const answer = new AnswerPSQL(
        isCorrect ? 'Correct Answer' : 'Incorrect Answer',
        isCorrect,
        player,
        questions[i],
      );
      await answerRepo.save(answer);
    }
  }

  console.log(
    `Successfully seeded ${createdUsers.length} users and their stats.`,
  );
}
