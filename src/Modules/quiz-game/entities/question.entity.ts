import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Questions' })
export class QuestionPSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 1000 })
  body: string;

  @Column('varchar', { array: true, length: 255 })
  answers: string[];

  @Column('boolean')
  isPublished: boolean;
}
