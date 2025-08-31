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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryRepo } from './users.queryRepo';
import { UserInputModel, UserViewModel } from './users.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { InputID } from '../../../Models/IDmodel';
import { AdminAuthGuard } from '../../../Guards/BasicAuth.guard';

@Controller('users')
@UseGuards(AdminAuthGuard)
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
    return (await this.service.postOneUser(user, true)).mapToViewModel();
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param() { id }: InputID): Promise<void> {
    if (!(await this.service.deleteOneUser(id))) {
      throw new NotFoundException();
    }
  }
}
