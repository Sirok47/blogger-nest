import {CommentInputModel } from "../../../Blogger platform/src/models/comment-models";
import {
  CommentsRepositoryPSQL
} from '../../src/Modules/BloggerPlatform/comments/Repository/PostgreSQL/comments.repository.psql';
import { CommentPSQL } from '../../src/Modules/BloggerPlatform/comments/comments.entity';
import { UsersRepositoryPSQL } from '../../src/Modules/AuthModule/users/Repository/PostgreSQL/users.repository.psql';

export function createSomeCommentInputObject(content: string = 'valid content should be > 20'): CommentInputModel{
    return {
        content: content
    }
}

export async function populateDBWithSomeComments(commentsRepo: CommentsRepositoryPSQL, usersRepo: UsersRepositoryPSQL, quantity: number, userId: string, postId: string){
    const commentsProms: Promise<CommentPSQL>[] = []
    for (let i = 0; i < quantity; i++) {
        const comment = CommentPSQL.CreateDocument(postId,{
            ...createSomeCommentInputObject('content '+i),

        }, {
        userId: userId,
          userLogin: (await usersRepo.findById(userId))!.login
      },)
      commentsProms.push(commentsRepo.save(comment));
    }
    await Promise.all(commentsProms);
}

export async function getSomeExistingCommentId(commentsRepo: CommentsRepositoryPSQL): Promise<string> {
    return (await commentsRepo.findRandom())!.id
}