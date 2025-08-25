import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryRepo } from './users.queryRepo';
import { type UserInputModel, UserViewModel } from './users.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';

@Controller('users')
export class UsersController {
  constructor(
    private service: UsersService,
    private queryRepo: UsersQueryRepo,
  ) {}

  @Get()
  @HttpCode(200)
  async getUsers(
    @Query() paginationSettings: Paginator,
  ): Promise<Paginated<UserViewModel>> {
    return await this.queryRepo.findWithSearchAndPagination(paginationSettings);
  }

  @Post()
  @HttpCode(201)
  async postUser(@Body() user: UserInputModel): Promise<UserViewModel> {
    return await this.service.postOneUser(user);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const result = await this.service.deleteOneUser(id);
    if (!result) {
      throw new NotFoundException();
    }
  }
}
