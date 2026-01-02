import {
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { config } from '../../Settings/config';
import { QuizGameModule } from './quiz-game.module';
import { QuizGameService } from './quiz-game.service';
import { AuthModule } from '../AuthModule/auth.module';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { CreateUserCommand } from '../AuthModule/users/Service/use-cases/createUserCommand';
import { User, UserInputModel } from '../AuthModule/users/users.entity';
import { AppService } from '../../app.service';
import { QuestionInputModel } from './DTOs/question.dto';
import { QuestionPSQL } from './entities/question.entity';
import { QuestionRepository } from './Repository/question.repository';
import {
  GameProgressViewModel,
  GameStatus,
  GameStatusViewModel,
} from './DTOs/game.dto';
import { AnswerStatus } from './DTOs/answer.dto';
import { GameRepository } from './Repository/game.repository';
import { initTestingModule } from '../../../test/helpers/app-start';

const someUserInput: UserInputModel = {
  login: 'loginnn',
  password: '123123123',
  email: 'somemail@email.com',
};

function questionGenerator(count: number): QuestionInputModel[] {
  const result: QuestionInputModel[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      body: 'body' + i,
      correctAnswers: ['answer' + i],
    });
  }
  return result;
}

async function initializeGameWithPlayers(
  commandBus: CommandBus,
  service: QuizGameService,
) {
  const user1 = await commandBus.execute<CreateUserCommand, User>(
    new CreateUserCommand(someUserInput, true),
  );
  const promiseOfUser1 = service.JoinGame(user1.id);
  const someUserInput2 = {
    ...someUserInput,
    login: someUserInput.login + '1',
    email: someUserInput.email + '1',
  };
  const user2 = await commandBus.execute<CreateUserCommand, User>(
    new CreateUserCommand(someUserInput2, true),
  );
  await promiseOfUser1;
  const game = (await service.JoinGame(user2.id))!;
  return { user1, user2, game };
}

describe('QuizGameService', () => {
  let app: INestApplication;
  let service: QuizGameService;
  let commandBus: CommandBus;
  let appService: AppService;
  let questionRepo: QuestionRepository;
  let gameRepo: GameRepository;

  beforeAll(async () => {
    const moduleRef = await initTestingModule([
      CqrsModule.forRoot(),
      QuizGameModule,
      AuthModule,
    ]);
    app = moduleRef.createNestApplication();
    await app.init();

    service = moduleRef.get(QuizGameService);
    commandBus = moduleRef.get(CommandBus);
    appService = moduleRef.get(AppService);
    questionRepo = moduleRef.get(QuestionRepository);
    gameRepo = moduleRef.get(GameRepository);

    await appService.deleteAll();
    const promises: Promise<any>[] = [];
    for (const question of questionGenerator(config.QUIZ_GAME_QUESTION_COUNT)) {
      const qEntity = new QuestionPSQL(question.body, question.correctAnswers);
      promises.push(questionRepo.save(qEntity));
    }
    await Promise.all(promises);
  });

  describe('JoinGame function', () => {
    describe('Positive tests', () => {
      it('Create game', async () => {
        const user = await commandBus.execute<CreateUserCommand, User>(
          new CreateUserCommand(someUserInput, true),
        );
        const result = await service.JoinGame(user.id);
        expect(result).not.toBeNull();
        expect(result!.status).toBe(GameStatusViewModel.pending);
        expect(result!.questions).toBeNull();
        expect(result!.secondPlayerProgress).toBeNull();
        expect(result!.startGameDate).toBeNull();
        expect(result!.finishGameDate).toBeNull();
        expect(result!.firstPlayerProgress.player.login).toBe(user.login);
      });
      it('Join a game', async () => {
        const someUserInput1 = {
          ...someUserInput,
          login: someUserInput.login + '1',
          email: someUserInput.email + '1',
        };
        const user = await commandBus.execute<CreateUserCommand, User>(
          new CreateUserCommand(someUserInput1, true),
        );
        const result = await service.JoinGame(user.id);
        expect(result).not.toBeNull();
        expect(result!.status).toBe(GameStatusViewModel.active);
        expect(result!.questions).not.toBeNull();
        expect(result!.questions!.length).toBe(config.QUIZ_GAME_QUESTION_COUNT);
        expect(result!.secondPlayerProgress).not.toBeNull();
        expect(result!.secondPlayerProgress!.player.login).toBe(user.login);
        expect(result!.startGameDate).not.toBeNull();
        expect(result!.finishGameDate).toBeNull();
      });
    });

    describe('Negative tests', () => {
      let user: User;
      beforeEach(async () => {
        await appService.deleteAll();
        user = await commandBus.execute<CreateUserCommand, User>(
          new CreateUserCommand(someUserInput, true),
        );
      });

      it('Join 2 games at once, should 403', async () => {
        await service.JoinGame(user.id);
        await expect(service.JoinGame(user.id)).rejects.toThrow();
      });

      it('Calling with non-existing user, should 401', async () => {
        await expect(service.JoinGame('not-an-id')).rejects.toThrow();
      });
    });
  });

  describe('ReceiveAnswer function', () => {
    let user1: User;
    let user2: User;
    let game: GameProgressViewModel;
    beforeEach(async () => {
      await appService.deleteAll();
      ({ user1, user2, game } = await initializeGameWithPlayers(
        commandBus,
        service,
      ));
    });

    describe('Positive tests', () => {
      it('Answer correctly all 5 questions for both players', async () => {
        for (const q of game.questions!) {
          expect(
            (
              await service.ReceiveAnswer(
                user1.id,
                'answer' + q.body[q.body.length - 1],
              )
            ).answerStatus,
          ).toBe(AnswerStatus.Correct);
          expect(
            (
              await service.ReceiveAnswer(
                user2.id,
                'answer' + q.body[q.body.length - 1],
              )
            ).answerStatus,
          ).toBe(AnswerStatus.Correct);
        }
        const result = (await gameRepo.findById(game.id))!;
        expect(result.status).toBe(GameStatusViewModel.finished);
        expect(result.finishedAt).not.toBeNull();
        expect(result.players[0].score).toBe(6);
        expect(result.players[1].score).toBe(5);
      });
    });

    describe('Negative tests', () => {
      it('Answer more then 5 questions', async () => {
        for (const q of game.questions!) {
          expect(
            (
              await service.ReceiveAnswer(
                user1.id,
                'answer' + q.body[q.body.length - 1],
              )
            ).answerStatus,
          ).toBe(AnswerStatus.Correct);
        }
        await expect(service.ReceiveAnswer(user1.id, 'text')).rejects.toThrow();
      });

      it('Answering with no active game', async () => {
        const someUserInput3 = {
          ...someUserInput,
          login: someUserInput.login + '3',
          email: someUserInput.email + '3',
        };
        const user3 = await commandBus.execute<CreateUserCommand, User>(
          new CreateUserCommand(someUserInput3, true),
        );
        await expect(service.ReceiveAnswer(user3.id, 'text')).rejects.toThrow(
          ForbiddenException,
        );
      });

      it('Answering before game start (solo)', async () => {
        const someUserInput4 = {
          ...someUserInput,
          login: someUserInput.login + '4',
          email: someUserInput.email + '4',
        };
        const user3 = await commandBus.execute<CreateUserCommand, User>(
          new CreateUserCommand(someUserInput4, true),
        );
        await service.JoinGame(user3.id);
        await expect(service.ReceiveAnswer(user3.id, 'text')).rejects.toThrow();
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
