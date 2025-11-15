import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Comment,
  CommentInputModel,
  CommentViewModel,
} from '../../comments.models';
import { Post } from '../../../posts/posts.models';
import { TokenService } from '../../../../JWT/jwt.service';
import { User } from '../../../../AuthModule/users/users.models';
import { LikeStatus } from '../../../likes/likes.models';
import { Inject } from '@nestjs/common';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../../AuthModule/users/Service/users.service';
import {
  type IPostsRepository,
  POSTS_REPOSITORY,
} from '../../../posts/Service/posts.service';
import {
  COMMENTS_REPOSITORY,
  type ICommentsRepository,
} from '../comments.service';

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
    @Inject(COMMENTS_REPOSITORY)
    private readonly repository: ICommentsRepository,
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
    const post: Post | null = await this.postsRepository.findById(postId);
    if (!post) return null;
    const userId: string = this.authToken.extractJWTPayload(userToken)
      ?.userId as string;
    if (!userId) return null;
    const user: User | null = await this.usersRepository.findById(userId);
    if (!user) return null;
    const userLogin: string = user.login;
    if (!userLogin) return null;
    const newComment: Comment = this.repository.create(postId, comment, {
      userId: userId,
      userLogin: userLogin,
    });
    const insertedComment: Comment = await this.repository.save(newComment);
    if (!insertedComment) return null;
    return insertedComment.mapToViewModel(
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
      user,
    );
  }
}
