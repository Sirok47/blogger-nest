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
import { AuthService } from './Service/auth.service';
import { config } from '../../../Settings/config';
import { UserAuthGuard } from '../../../Request-Modifications/Guards/accessToken.guard';
import {
  CodeInputModel,
  NewPasswordRecoveryInputModel,
  ProvideEmailInputModel,
} from './auth.models';
import { type Request, type Response } from 'express';
import { APIErrorResult } from '../../../Models/Error.models';
import { CustomBadRequestException } from '../../../Request-Modifications/Exception-Filters/custom400';
import { LoginCommand } from './Service/use-cases/login.command';
import { CommandBus } from '@nestjs/cqrs';
import { ConfirmPasswordChangeCommand } from './Service/use-cases/new-password.command';
import { RecoverPasswordCommand } from './Service/use-cases/recover-password.command';
import { RegisterUserCommand } from './Service/use-cases/registration.command';
import { ConfirmEmailCommand } from './Service/use-cases/email-confirmation.command';
import { ResendConfirmationEmailCommand } from './Service/use-cases/resend-email.command';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RefreshTokenGuard } from '../../../Request-Modifications/Guards/refreshToken.guard';
import { LogoutCommand } from './Service/use-cases/logout.command';
import { RefreshTokenCommand } from './Service/use-cases/refresh-token.command';

@Controller('auth')
export class AuthController {
  constructor(
    private service: AuthService,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async login(
    @Body() body: LoginInputModel,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokenPair = await this.commandBus.execute<
      LoginCommand,
      { accessToken: string; refreshToken: string }
    >(
      new LoginCommand(body.loginOrEmail, body.password, {
        IP: req.ip!,
        userAgent: req.header('user-agent')!,
      }),
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

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokenPair = await this.commandBus.execute<
      RefreshTokenCommand,
      { accessToken: string; refreshToken: string }
    >(
      new RefreshTokenCommand(req.cookies.refreshToken, {
        IP: req.ip!,
        userAgent: req.header('user-agent')!,
      }),
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

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async logOut(@Req() req: Request): Promise<void> {
    try {
      await this.commandBus.execute(
        new LogoutCommand(req.cookies.refreshToken),
      );
    } catch (_) {
      throw new UnauthorizedException();
    }
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
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async signIn(@Body() user: UserInputModel): Promise<void> {
    if (!(await this.commandBus.execute(new RegisterUserCommand(user)))) {
      throw new InternalServerErrorException();
    }
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async confirmEmail(@Body() { code }: CodeInputModel): Promise<void> {
    let result: boolean;
    try {
      result = await this.commandBus.execute(new ConfirmEmailCommand(code));
    } catch (error) {
      const errMsg: APIErrorResult = {
        errorsMessages: [
          {
            field: 'code',
            message: (error as string).toString(),
          },
        ],
      };
      throw new CustomBadRequestException(errMsg);
    }
    if (!result) {
      throw new InternalServerErrorException();
    }
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async resendCode(@Body() { email }: ProvideEmailInputModel): Promise<void> {
    let result: boolean;
    try {
      result = await this.commandBus.execute(
        new ResendConfirmationEmailCommand(email),
      );
    } catch (error) {
      const errMsg: APIErrorResult = {
        errorsMessages: [
          {
            field: 'email',
            message: (error as string).toString(),
          },
        ],
      };
      throw new CustomBadRequestException(errMsg);
    }
    if (!result) {
      throw new InternalServerErrorException();
    }
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async recoverPassword(
    @Body() { email }: ProvideEmailInputModel,
  ): Promise<void> {
    if (!(await this.commandBus.execute(new RecoverPasswordCommand(email)))) {
      throw new BadRequestException();
    }
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async changePassword(
    @Body() { recoveryCode, newPassword }: NewPasswordRecoveryInputModel,
  ): Promise<void> {
    if (
      !(await this.commandBus.execute(
        new ConfirmPasswordChangeCommand(recoveryCode, newPassword),
      ))
    ) {
      throw new BadRequestException();
    }
  }
}
