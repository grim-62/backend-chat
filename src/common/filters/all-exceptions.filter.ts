import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    this.logger.error(
      `Unhandled exception for ${req.method} ${req.url}`,
      exception?.stack || exception,
    );

    const status = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;
    if (status === HttpStatus.BAD_REQUEST && exception?.response?.message) {
      message = exception.response.message; // <-- validation errors here
    } else if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Internal server error';
    } else {
      message = exception?.message || 'Unexpected error';
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message,
    };

    res.status(status).json(responseBody);
  }
}
