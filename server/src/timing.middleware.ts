import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class TimingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
        const start = Date.now();
        res.on('finish', () => {
            const end = Date.now();
            const duration = end - start;
            console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
        });
        next();
    }
}