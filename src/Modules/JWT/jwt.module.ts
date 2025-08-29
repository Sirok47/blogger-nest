import { Module } from '@nestjs/common';
import { TokenService } from './jwt.service';

@Module({
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
