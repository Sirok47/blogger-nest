import { IsMongoId, IsUUID } from 'class-validator';

export class InputID {
  @IsMongoId()
  id: string;
}

export class InputUUID {
  @IsUUID()
  id: string;
}
