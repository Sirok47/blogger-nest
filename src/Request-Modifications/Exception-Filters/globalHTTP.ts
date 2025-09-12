import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';
import { APIErrorResult, FieldError } from '../../Models/Error.models';

@Catch(BadRequestException)
export class GlobalHTTPExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const res = exception.getResponse() as any;
    const messages = Array.isArray(res.message) ? res.message : [res.message];

    const errors: FieldError[] = messages.map((msg: string) => {
      const [field, ...rest] = msg.split(' ');
      return {
        field: field || null,
        message: rest.join(' ') || msg,
      };
    });

    const result: APIErrorResult = {
      errorsMessages: errors.length > 0 ? errors : null,
    };
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(exception.getStatus())
      .json(result);
  }
}
