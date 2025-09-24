import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  type IUsersQueryRepo,
  USERS_QUERY_REPO,
} from './Service/users.service';
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
    @Inject(USERS_QUERY_REPO)
    private queryRepo: IUsersQueryRepo,
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
    const createdUser = await this.commandBus.execute<
      CreateUserCommand,
      UserDocument
    >(new CreateUserCommand(user, true));
    const result = await this.queryRepo.findOneById(createdUser.id);
    if (!result) {
      throw new InternalServerErrorException();
    }
    return result;
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param() { id }: InputID): Promise<void> {
    if (!(await this.commandBus.execute(new DeleteUserCommand(id)))) {
      throw new NotFoundException();
    }
  }
}
