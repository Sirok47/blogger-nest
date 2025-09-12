import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { APIErrorResult } from '../Models/Error.models';
import { Response } from 'express';

export class CustomBadRequestException extends BadRequestException {
  constructor(public readonly errMsg: APIErrorResult) {
    super(errMsg);
  }
}

@Catch(CustomBadRequestException)
export class CustomBadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: CustomBadRequestException, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(exception.getStatus())
      .json(exception.errMsg);
  }
}
