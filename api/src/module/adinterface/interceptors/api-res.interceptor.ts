import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';

export class ApiResInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // console.log('ApiResInterceptor', data);
        return {
          data: data,
          code: 200,
          message: 'success',
        };
      }),
      catchError((error) => {
        return throwError(
          () => new HttpException(error.message, HttpStatus.BAD_REQUEST),
        );
      }),
    );
  }
}
