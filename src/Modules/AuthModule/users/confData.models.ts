import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserPSQL } from './users.models';

@Entity('ConfirmationData')
export class ConfirmationDataPSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  confirmationCode: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  confirmationCodeExpDate: Date;

  @Column('boolean', { default: false })
  isConfirmed: boolean;

  @OneToOne(() => UserPSQL, (user) => user.confirmationData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserPSQL;

  @Column()
  userId: string;
}
