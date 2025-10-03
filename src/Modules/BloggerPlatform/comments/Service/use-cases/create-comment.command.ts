import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CommentDocument,
  CommentInputModel,
  type CommentModelType,
  CommentViewModel,
} from '../../comments.models';
import { CommentsRepository } from '../../comments.repository';
import { PostDocument } from '../../../posts/posts.models';
import { InjectModel } from '@nestjs/mongoose';
import { TokenService } from '../../../../JWT/jwt.service';
import { UserDocument } from '../../../../AuthModule/users/users.models';
import { Comment } from '../../comments.models';
import { likeStatus } from '../../../likes/likes.models';
import { Inject } from '@nestjs/common';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../../AuthModule/users/Service/users.service';
import {
  type IPostsRepository,
  POSTS_REPOSITORY,
} from '../../../posts/Service/posts.service';

export class CreateCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly comment: CommentInputModel,
    public readonly userToken: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
    private readonly repository: CommentsRepository,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: IPostsRepository,
    private readonly authToken: TokenService,
  ) {}

  async execute({
    postId,
    comment,
    userToken,
  }: CreateCommentCommand): Promise<CommentViewModel | null> {
    const post: PostDocument | null =
      await this.postsRepository.findById(postId);
    if (!post) return null;
    const userId: string = this.authToken.extractJWTPayload(userToken)
      ?.userId as string;
    if (!userId) return null;
    const user: UserDocument | null =
      await this.usersRepository.findById(userId);
    if (!user) return null;
    const userLogin: string = user.login;
    if (!userLogin) return null;
    const newComment: CommentDocument = this.CommentModel.CreateDocument(
      postId,
      comment,
      {
        userId: userId,
        userLogin: userLogin,
      },
    );
    const insertedComment: CommentDocument =
      await this.repository.save(newComment);
    if (!insertedComment) return null;
    return insertedComment.mapToViewModel({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    });
  }
}
