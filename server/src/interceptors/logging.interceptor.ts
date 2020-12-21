import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {User} from "../entities/user.entity";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request & {user?: User}>();
        console.log(`${request.method} ${request.url} ${request?.user?.email}`)
        return next
            .handle()
            .pipe(
                //tap(() => console.log(`After... ${Date.now() - now}ms`)),
            );
    }
}