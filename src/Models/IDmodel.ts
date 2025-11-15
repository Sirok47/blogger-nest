import { IsMongoId, IsUUID } from 'class-validator';

export class InputMongoID {
  @IsMongoId()
  id: string;
}

export class InputID {
  @IsUUID()
  id: string;
}

export class InputBlogID {
  @IsUUID()
  blogId: string;
}
