import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerPSQL } from '../entities/answer.entity';

@Injectable()
export class AnswerRepository {
  constructor(
    @InjectRepository(AnswerPSQL) private readonly repo: Repository<AnswerPSQL>,
  ) {}

  async save(answer: AnswerPSQL): Promise<AnswerPSQL> {
    return this.repo.save(answer);
  }
}
