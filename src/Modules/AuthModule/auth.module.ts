import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { UsersQueryRepo } from './users/users.queryRepo';
import { UsersService } from './users/users.service';
import { User, UserSchema } from './users/users.models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersQueryRepo, UsersRepository],
  exports: [UsersRepository],
})
export class AuthModule {}
