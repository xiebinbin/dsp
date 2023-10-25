// error.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class AdapiGlobalErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    console.log('exception.message', exception.message, status);
    if (status === 404) {
      exception.message = '访问路径不存在';
    }
    response.status(status).json({
      statusCode: status,
      message: exception.message, // 这里可以根据需要返回自定义错误信息
    });
  }
}
