import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  LoginInputModel,
  MeViewModel,
  UserInputModel,
} from '../users/users.models';
import { AuthService } from './auth.service';
import { config } from '../../../Settings/config';
import { UserAuthGuard } from '../../../Guards/accessToken.guard';
import {
  CodeInputModel,
  NewPasswordRecoveryInputModel,
  ProvideEmailInputModel,
} from './auth.models';
import { type Request, type Response } from 'express';
import { APIErrorResult } from '../../../Models/Error.models';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginInputModel,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokenPair = await this.service.logIn(
      body.loginOrEmail,
      body.password,
      { IP: req.ip!, userAgent: req.header('user-agent')! },
    );
    if (!tokenPair) {
      throw new UnauthorizedException();
    }
    const result = {
      accessToken: tokenPair.accessToken,
    };
    res.cookie('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: true,
      domain: config.CURRENT_URL,
      path: config.COOKIE_PATH,
    });
    return result;
  }

  @Get('me')
  @UseGuards(UserAuthGuard)
  @HttpCode(200)
  async meView(@Param('token') token: string): Promise<MeViewModel> {
    const result: MeViewModel | null = await this.service.aboutMe(token);
    if (!result) {
      throw new UnauthorizedException();
    }
    return result;
  }

  @Post('registration')
  @HttpCode(204)
  async signIn(@Body() user: UserInputModel): Promise<void> {
    let result: boolean;
    try {
      result = await this.service.registerWithEmailConf(user);
    } catch (error) {
      const errMsg: APIErrorResult = {
        errorsMessages: [
          {
            field: (error as Error).message,
            message: (error as string) + ' must be unique',
          },
        ],
      };
      throw new BadRequestException(errMsg);
    }
    if (!result) {
      throw new InternalServerErrorException();
    }
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmEmail(@Body() { code }: CodeInputModel): Promise<void> {
    let result: boolean;
    try {
      result = await this.service.confirmEmail(code);
    } catch (error) {
      const errMsg: APIErrorResult = {
        errorsMessages: [
          {
            field: 'code',
            message: (error as string).toString(),
          },
        ],
      };
      throw new BadRequestException(errMsg);
    }
    if (!result) {
      throw new InternalServerErrorException();
    }
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async resendCode(@Body() { email }: ProvideEmailInputModel): Promise<void> {
    let result: boolean;
    try {
      result = await this.service.resendConfirmationMail(email);
    } catch (error) {
      const errMsg: APIErrorResult = {
        errorsMessages: [
          {
            field: 'email',
            message: (error as string).toString(),
          },
        ],
      };
      throw new BadRequestException(errMsg);
    }
    if (!result) {
      throw new InternalServerErrorException();
    }
  }

  @Post('password-recovery')
  @HttpCode(204)
  async recoverPassword(
    @Body() { email }: ProvideEmailInputModel,
  ): Promise<void> {
    if (!(await this.service.recoverPasswordWithEmail(email))) {
      throw new BadRequestException();
    }
  }

  @Post('new-password')
  @HttpCode(204)
  async changePassword(
    @Body() { recoveryCode, newPassword }: NewPasswordRecoveryInputModel,
  ): Promise<void> {
    if (
      !(await this.service.confirmPasswordChange(recoveryCode, newPassword))
    ) {
      throw new BadRequestException();
    }
  }
}
