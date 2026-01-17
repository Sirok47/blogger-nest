import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppService } from '../../../app.service';
import { QuestionRepository } from './question.repository';
import { GameRepository } from './game.repository';
import { PlayerRepository } from './player.repository';
import { initTestingModule } from '../../../../test/helpers/app-start';
import { QuizGameModule } from '../quiz-game.module';
import { AuthModule } from '../../AuthModule/auth.module';
import { seedLeaderboardData } from '../../../../test/helpers/DB-seeder.quiz-game';
import { UsersRepositoryPSQL } from '../../AuthModule/users/Repository/PostgreSQL/users.repository.psql';
import { AnswerRepository } from './answer.repository';
import { QuizGameStatsRepository } from './quiz-game-stats.repository';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { QuizGameStatsQueryRepo } from './quiz-game-stats.queryRepo';

describe('QuizGameStatsQueryRepo', () => {
  let app: INestApplication;
  let appService: AppService;
  let questionRepo: QuestionRepository;
  let gameRepo: GameRepository;
  let playerRepo: PlayerRepository;
  let userRepo: UsersRepositoryPSQL;
  let answerRepo: AnswerRepository;
  let statsRepo: QuizGameStatsRepository;
  let repo: QuizGameStatsQueryRepo;

  beforeAll(async () => {
    const moduleRef = await initTestingModule([
      CqrsModule.forRoot(),
      QuizGameModule,
      AuthModule,
    ]);
    app = moduleRef.createNestApplication();
    await app.init();

    appService = moduleRef.get(AppService);
    questionRepo = moduleRef.get(QuestionRepository);
    gameRepo = moduleRef.get(GameRepository);
    playerRepo = moduleRef.get(PlayerRepository);
    userRepo = moduleRef.get(UsersRepositoryPSQL);
    answerRepo = moduleRef.get(AnswerRepository);
    statsRepo = moduleRef.get(QuizGameStatsRepository);
    repo = moduleRef.get(QuizGameStatsQueryRepo);
  });

  beforeEach(async () => {
    await appService.deleteAll();
    await seedLeaderboardData({
      userRepo: userRepo,
      gameRepo: gameRepo,
      answerRepo: answerRepo,
      playerRepo: playerRepo,
      questionRepo: questionRepo,
      statsRepo: statsRepo,
    });
  });

  describe('getLeaderboard test', () => {
    it('should sort by sumScore DESC and use s.id ASC as tie-breaker', async () => {
      // Порядок: U1(200), U2(150), U3(150), U5(100), U4(50)

      const pagination = new Paginator();
      pagination.pageNumber = 1;
      pagination.pageSize = 5;
      pagination.sort = ['sumScore DESC'];

      const result: Paginated<any> = await repo.getLeaderboard(pagination);

      expect(result.totalCount).toBe(5);
      expect(result.items).not.toBeNull(); // !!! Проверка на null
      const logins = result.items!.map((i) => i.player.login); // Обращение с !

      expect(logins[0]).toBe('U1_HighestScore');
      expect(logins[1]).toBe('U2_HighestAvg');
      expect(logins[2]).toBe('U3_ScoreTie');
      expect(logins[3]).toBe('U5_HighestGames');
      expect(logins[4]).toBe('U4_LowestScore');
    });

    // =======================================================
    // ТЕСТ 2: Сортировка по avgScores
    // =======================================================
    it('should sort by avgScores DESC and use s.id ASC as tie-breaker', async () => {
      // Порядок: U2(30.0), U1(20.0), U3(15.0), U4(5.0), U5(5.0)

      const pagination = new Paginator();
      pagination.pageNumber = 1;
      pagination.pageSize = 5;
      pagination.sort = ['avgScores DESC'];

      const result: Paginated<any> = await repo.getLeaderboard(pagination);

      expect(result.items).not.toBeNull(); // !!! Проверка на null
      const logins = result.items!.map((i) => i.player.login);

      expect(logins[0]).toBe('U2_HighestAvg');
      expect(logins[1]).toBe('U1_HighestScore');
      expect(logins[2]).toBe('U3_ScoreTie');
      expect(logins[3]).toBe('U4_LowestScore');
      expect(logins[4]).toBe('U5_HighestGames');
    });

    // =======================================================
    // ТЕСТ 3: Множественная сортировка (avgScores ASC, winsCount DESC)
    // =======================================================
    it('should handle complex multiple sort instructions', async () => {
      // Порядок: U5(5.0/1win), U4(5.0/0wins), U3(15.0), U1(20.0), U2(30.0)

      const pagination = new Paginator();
      pagination.pageNumber = 1;
      pagination.pageSize = 5;
      pagination.sort = ['avgScores ASC', 'winsCount DESC'];

      const result: Paginated<any> = await repo.getLeaderboard(pagination);

      expect(result.items).not.toBeNull(); // !!! Проверка на null
      const logins = result.items!.map((i) => i.player.login);

      expect(logins[0]).toBe('U5_HighestGames');
      expect(logins[1]).toBe('U4_LowestScore');
      expect(logins[2]).toBe('U3_ScoreTie');
      expect(logins[3]).toBe('U1_HighestScore');
      expect(logins[4]).toBe('U2_HighestAvg');
    });

    // =======================================================
    // ТЕСТ 4: Проверка пагинации с сортировкой по умолчанию
    // =======================================================
    it('should return correct items and totalCount for the second page using default sort', async () => {
      // Сортировка по умолчанию: ['avgScores desc', 'sumScore desc']
      // 1. avgScores desc: U2(30.0), U1(20.0), U3(15.0), U4/U5(5.0)
      // 2. sumScore desc для 5.0: U5(100), U4(50)
      // Итоговый порядок: U2, U1, U3, U5, U4
      // Page 2 (3, 4): U3, U5

      const pagination = new Paginator();
      pagination.pageNumber = 2;
      pagination.pageSize = 2;
      // pagination.sort = ['avgScores desc', 'sumScore desc']; // Значение по умолчанию

      const result: Paginated<any> = await repo.getLeaderboard(pagination);

      expect(result.totalCount).toBe(5);
      expect(result.items).not.toBeNull(); // !!! Проверка на null
      expect(result.items!.length).toBe(2);
      const logins = result.items!.map((i) => i.player.login);

      expect(logins[0]).toBe('U3_ScoreTie'); // 3rd item (15.0)
      expect(logins[1]).toBe('U5_HighestGames'); // 4th item (5.0, 100 sum)
    });

    // =======================================================
    // ТЕСТ 5: Обработка пустого результата (пустая БД)
    // =======================================================
    it('should return 0 totalCount and null items for empty leaderboard', async () => {
      await appService.deleteAll();

      const pagination = new Paginator();
      pagination.pageNumber = 1;
      pagination.pageSize = 10;

      const result: Paginated<any> = await repo.getLeaderboard(pagination);

      expect(result.totalCount).toBe(0);
      expect(result.items?.length).toBe(0); // Ожидаем null или пустой массив, в зависимости от Paginate
      // Если ваш Paginate возвращает пустой массив: expect(result.items).toEqual([]);
      // Если ваш Paginate возвращает null: expect(result.items).toBeNull();
      // У вас Paginate возвращает пустой массив в случае 0 totalCount
      expect(result.items).toEqual([]); // Проверяем, что Paginate возвращает пустой массив

      // ВАЖНО: В Paginate<ViewModelType> { items: mappedData } - если mappedData пустой, то items не null, а [].
      // Перепишем, основываясь на реализации:
      // if (!statIds.length) { return paginationSettings.Paginate<...>(0, []); }
      // Paginate: totalCount=0, mappedData=[] -> items: []
      expect(result.items).toEqual([]);
    });

    // =======================================================
    // ТЕСТ 6: Невалидное поле сортировки (BadRequestException)
    // =======================================================
    it('should throw BadRequestException for non-sortable field', async () => {
      const pagination = new Paginator();
      pagination.sort = ['login DESC'];

      await expect(repo.getLeaderboard(pagination as any)).rejects.toThrow(
        'Bad Request',
      );
    });
  });
});
