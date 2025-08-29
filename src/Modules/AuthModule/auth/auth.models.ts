import { IsEmail, IsUUID, Length } from 'class-validator';

export class NewPasswordRecoveryInputModel {
  @Length(6, 20)
  newPassword: string;

  @IsUUID()
  recoveryCode: string;
}

export class ProvideEmailInputModel {
  @IsEmail()
  email: string;
}

export class CodeInputModel {
  @IsUUID()
  code: string;
}
