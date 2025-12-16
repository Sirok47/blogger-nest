import { BadRequestException, Injectable } from '@nestjs/common';
import { QuestionRepository } from './Repository/question.repository';
import { QuestionPSQL } from './entities/question.entity';
import { QuestionViewModel } from './DTOs/question.dto';

@Injectable()
export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async createQuestion(
    body: string,
    questions: string[],
  ): Promise<QuestionViewModel> {
    const question = new QuestionPSQL(body, questions);
    return (await this.questionRepository.save(question)).mapToViewModel();
  }

  async publish(id: string): Promise<boolean> {
    const question: QuestionPSQL | null =
      await this.questionRepository.findById(id);
    if (!question) return false;
    if (!question.answers.length)
      throw new BadRequestException('No answers found');
    question.isPublished = true;
    return !!(await this.questionRepository.save(question));
  }

  async updateQuestion(
    id: string,
    body: string,
    questions: string[],
  ): Promise<boolean> {
    const question: QuestionPSQL | null =
      await this.questionRepository.findById(id);
    if (!question) {
      return false;
    }
    if (question.isPublished)
      throw new BadRequestException('Already published');
    question.body = body;
    question.answers = questions;
    return !!(await this.questionRepository.save(question));
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return this.questionRepository.delete(id);
  }
}
