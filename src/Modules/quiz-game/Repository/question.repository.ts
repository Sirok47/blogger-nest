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

  async findById(id: string): Promise<QuestionPSQL | null> {
    return this.repo.findOneBy({ id: id });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return !!result.affected;
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAll();
  }

  async retrieveRandomQuestions(count: number): Promise<QuestionPSQL[]> {
    return await this.repo
      .createQueryBuilder('q')
      .orderBy('RANDOM()')
      .take(count)
      .getMany();
  }
}
