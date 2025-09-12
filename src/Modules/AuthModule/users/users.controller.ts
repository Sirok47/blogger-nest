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
import { UsersService } from './Service/users.service';
import { UsersQueryRepo } from './users.queryRepo';
import { UserDocument, UserInputModel, UserViewModel } from './users.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { InputID } from '../../../Models/IDmodel';
import { AdminAuthGuard } from '../../../Request-Modifications/Guards/basicAuth.guard';
import { CreateUserCommand } from './Service/use-cases/createUserCommand';
import { DeleteUserCommand } from './Service/use-cases/deleteUserCommand';
import { CommandBus } from '@nestjs/cqrs';

@Controller('users')
@UseGuards(AdminAuthGuard)
export class UsersController {
  constructor(
    private queryRepo: UsersQueryRepo,
    private readonly commandBus: CommandBus,
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
    return (
      await this.commandBus.execute<CreateUserCommand, UserDocument>(
        new CreateUserCommand(user, true),
      )
    ).mapToViewModel();
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param() { id }: InputID): Promise<void> {
    if (!(await this.commandBus.execute(new DeleteUserCommand(id)))) {
      throw new NotFoundException();
    }
  }
}
