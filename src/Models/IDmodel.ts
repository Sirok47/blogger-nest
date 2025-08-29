import { IsMongoId } from 'class-validator';

export class InputID {
  @IsMongoId()
  id: string;
}
