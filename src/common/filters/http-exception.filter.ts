import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    // exceptionResponse can be a string or object
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exceptionResponse;

    const payload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      message,
    };

    this.logger.warn(`${req.method} ${req.url} ${status} - ${JSON.stringify(message)}`);
    res.status(status).json(payload);
  }
}
