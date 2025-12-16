import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionQueryRepo } from './Repository/question.queryRepo';
import { AdminAuthGuard } from '../../Request-Modifications/Guards/basicAuth.guard';
import { QuestionInputModel, QuestionViewModel } from './DTOs/question.dto';
import { Paginated, Paginator } from '../../Models/paginator.models';
import { InputID } from '../../Models/IDmodel';

@Controller('sa/quiz/questions')
@UseGuards(AdminAuthGuard)
export class QuestionController {
  constructor(
    private readonly service: QuestionService,
    private readonly queryRepo: QuestionQueryRepo,
  ) {}

  @Get()
  async getAllQuestions(
    @Query() query: Paginator,
  ): Promise<Paginated<QuestionViewModel>> {
    return this.queryRepo.findWithSearchAndPagination(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async postQuestion(
    @Body() { body, correctAnswers }: QuestionInputModel,
  ): Promise<QuestionViewModel> {
    return this.service.createQuestion(body, correctAnswers);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param() { id }: InputID): Promise<void> {
    if (!(await this.service.deleteQuestion(id))) throw new NotFoundException();
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param() { id }: InputID,
    @Body() { body, correctAnswers }: QuestionInputModel,
  ): Promise<void> {
    if (!(await this.service.updateQuestion(id, body, correctAnswers)))
      throw new NotFoundException();
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(@Param() { id }: InputID): Promise<void> {
    if (!(await this.service.publish(id))) throw new NotFoundException();
  }
}
