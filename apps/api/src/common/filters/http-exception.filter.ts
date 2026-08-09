import {
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

import type { ApiErrorResponse } from '../types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'object' && payload !== null) {
        const body = payload as Omit<ApiErrorResponse, 'message'> & {
          error?: string;
          errors?: unknown[];
          message?: string | string[];
        };

        response.status(status).json({
          statusCode: body.statusCode ?? status,
          code: body.code ?? exception.name.toUpperCase(),
          message:
            typeof body.message === 'string'
              ? body.message
              : Array.isArray(body.message)
                ? body.message.join(', ')
                : exception.message,
          errors: body.errors ?? [],
        });
        return;
      }

      response.status(status).json({
        statusCode: status,
        code: exception.name.toUpperCase(),
        message: exception.message,
        errors: [],
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      errors: [],
    });
  }
}
