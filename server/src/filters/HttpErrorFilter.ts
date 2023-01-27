import {ExceptionFilter, Catch, HttpException, ArgumentsHost} from '@nestjs/common';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();

        if (exception.message.indexOf("Cannot set headers after they are sent to the client") !== -1) {
            console.error("Cannot set headers after they are sent to the client error");
        }
        // Add your custom logic here to handle the error
    }
}