import { Module } from '@nestjs/common';
import { HashService } from './bcrypt';

@Module({
  providers: [HashService],
  exports: [HashService],
})
export class HashModule {}
