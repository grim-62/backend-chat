import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
class TryCatchInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        console.error('trycatch error ----->', err);
        return throwError(() => err);
      }),
    );
  }
}

export function AsyncTryCatch() {
  return applyDecorators(UseInterceptors(TryCatchInterceptor));
}
