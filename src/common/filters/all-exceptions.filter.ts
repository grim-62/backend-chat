import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // log the full exception (stack, message)
    this.logger.error(`Unhandled exception for ${req.method} ${req.url}`, exception?.stack || exception);

    const status = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : exception?.message;

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message,
    };

    res.status(status).json(responseBody);
  }
}
