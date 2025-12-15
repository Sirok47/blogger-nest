import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionPSQL } from '../entities/question.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectRepository(QuestionPSQL)
    private readonly repo: Repository<QuestionPSQL>,
  ) {}

  async save(question: QuestionPSQL): Promise<QuestionPSQL> {
    return this.repo.save(question);
  }

  async retrieveRandomQuestions(count: number): Promise<QuestionPSQL[]> {
    return await this.repo
      .createQueryBuilder('q')
      .orderBy('RANDOM()')
      .take(count)
      .getMany();
  }
}
