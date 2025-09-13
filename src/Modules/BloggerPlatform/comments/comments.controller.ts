import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepo } from './comments.queryRepo';
import { CommentInputModel, CommentViewModel } from './comments.models';
import { InputID } from '../../../Models/IDmodel';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './Service/use-cases/update-comment.command';
import { DeleteCommentCommand } from './Service/use-cases/delete-comment.command';
import { LikeInputModel } from '../likes/likes.models';
import { ChangeLikeForCommentCommand } from './Service/use-cases/change-like-for-comment.command';
import { UserAuthGuard } from '../../../Request-Modifications/Guards/accessToken.guard';
import { OptionalAccessTokenGuardGuard } from '../../../Request-Modifications/Guards/optionalAccessToken.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly queryRepo: CommentsQueryRepo,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/:id')
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getComment(
    @Param() { id }: InputID,
    @Param('userId') userId: string,
  ): Promise<CommentViewModel> {
    const result: CommentViewModel | null = await this.queryRepo.findById(
      id,
      userId,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Put('/:id')
  @UseGuards(UserAuthGuard)
  @HttpCode(204)
  async updateComment(
    @Param() { id }: InputID,
    @Body() newComment: CommentInputModel,
    @Param('token') token: string,
  ): Promise<void> {
    const result = await this.commandBus.execute<UpdateCommentCommand, boolean>(
      new UpdateCommentCommand(id, newComment, token),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }

  @Delete('/:id')
  @UseGuards(UserAuthGuard)
  @HttpCode(204)
  async deleteComment(
    @Param() { id }: InputID,
    @Param('token') token: string,
  ): Promise<void> {
    const result = await this.commandBus.execute<DeleteCommentCommand, boolean>(
      new DeleteCommentCommand(id, token),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }

  @Put(':id/like-status')
  @UseGuards(UserAuthGuard)
  @HttpCode(204)
  async setLikeStatus(
    @Param() { id }: InputID,
    @Body() { likeStatus }: LikeInputModel,
    @Param('token') token: string,
  ): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new ChangeLikeForCommentCommand(id, likeStatus, token),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }
}
