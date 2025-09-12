import {
  ArgumentMetadata,
  Injectable,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { APIErrorResult } from '../../Models/Error.models';
import { CustomBadRequestException } from '../Exception-Filters/custom400';

@Injectable()
export class CustomTrimAndErrLimitPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errorsMap = new Map<string, string>();

        //Лимит по 1 ошибке на поле
        validationErrors.forEach((err) => {
          if (!err.constraints) return;
          const firstMessage = Object.values(err.constraints)[0];
          if (!errorsMap.has(err.property)) {
            errorsMap.set(err.property, firstMessage);
          }
        });

        const result: APIErrorResult = {
          errorsMessages: Array.from(errorsMap.entries()).map(
            ([field, message]) => ({
              field,
              message,
            }),
          ),
        };

        return new CustomBadRequestException(result);
      },
    });
  }

  //Переопределение трансформа для авто-трима всех инпут строк
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'object' && value !== null) {
      Object.keys(value as object).forEach((key: string) => {
        if (typeof value[key] === 'string') {
          value[key] = value[key].trim();
        }
      });
    }
    return super.transform(value, metadata);
  }
}
