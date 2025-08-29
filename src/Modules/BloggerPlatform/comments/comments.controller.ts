import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { CommentsQueryRepo } from './comments.queryRepo';
import { CommentDocument, CommentViewModel } from './comments.models';
import { InputID } from '../../../Models/IDmodel';

@Controller('comments')
export class CommentsController {
  constructor(protected queryRepo: CommentsQueryRepo) {}

  @Get('/:id')
  @HttpCode(200)
  async getComment(@Param() { id }: InputID): Promise<CommentViewModel> {
    const result: CommentDocument | null = await this.queryRepo.findById(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result.mapToViewModel();
  }
}
