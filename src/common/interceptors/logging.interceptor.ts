import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

function sanitizeBody(body: any) {
  if (!body || typeof body !== 'object') return body;
  const clone: any = Array.isArray(body) ? [] : {};
  for (const k of Object.keys(body)) {
    if (['password', 'otp', 'token', 'authorization'].includes(k.toLowerCase())) {
      clone[k] = '***REDACTED***';
    } else {
      clone[k] = body[k];
    }
  }
  return clone;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request & { body?: any }>();
    const res = ctx.getResponse();

    const method = req.method || (req as any).method;
    const url = (req as any).url || (req as any).originalUrl;
    const ip = (req as any).ip || (req as any).headers['x-forwarded-for'] || (req as any).connection?.remoteAddress;

    const sanitizedBody = sanitizeBody((req as any).body);

    this.logger.log(`${method} ${url} - incoming - ip=${ip} body=${JSON.stringify(sanitizedBody)}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - now;
          const status = (res as any).statusCode;
          this.logger.log(`${method} ${url} - ${status} - ${ms}ms - ip=${ip}`);
        },
        error: (err) => {
          const ms = Date.now() - now;
          // The exception filter will log details; still log summary here
          const status = (res as any).statusCode || (err?.status || 500);
          this.logger.error(`${method} ${url} - ${status} - ${ms}ms - ip=${ip} - error=${err?.message}`);
        },
      }),
    );
  }
}
