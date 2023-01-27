import {CallHandler, ExecutionContext, Injectable, NestInterceptor,} from "@nestjs/common";
import {Observable} from "rxjs";
import {User} from "../entities/user.entity";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context
            .switchToHttp()
            .getRequest<Request & { user?: User }>();
        const nestCookie = (request.headers['cookie'] || '').split(';')
            .map(cookieKeyValue => cookieKeyValue.split('='))
            .find(([key, value]) => key === 'nest')
        console.log(`${request.method} ${request.url} ${request?.user?.email} ${nestCookie?.[1].slice(2,5)}`);
        return next
            .handle()
            .pipe
            //tap(() => console.log(`After... ${Date.now() - now}ms`)),
            ();
    }
}
