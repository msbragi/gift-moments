#!/bin/bash

# Create guards directory and files
mkdir -p src/common/guards

# Create JWT Auth Guard
cat > src/common/guards/jwt-auth.guard.ts << 'EOF'
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
}
EOF

# Create Public Decorator
mkdir -p src/common/decorators
cat > src/common/decorators/public.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
EOF

# Create interceptors directory and files
mkdir -p src/common/interceptors

# Create Logging Interceptor
cat > src/common/interceptors/logging.interceptor.ts << 'EOF'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body } = request;
        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const delay = Date.now() - now;
                this.logger.log(
                    `${method} ${url} ${response.statusCode} ${delay}ms`,
                );
            }),
        );
    }
}
EOF

# Create Transform Interceptor
cat > src/common/interceptors/transform.interceptor.ts << 'EOF'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
    timestamp: string;
    path: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const request = context.switchToHttp().getRequest();
        return next.handle().pipe(
            map(data => ({
                data,
                timestamp: new Date().toISOString(),
                path: request.url,
            })),
        );
    }
}
EOF

# Create Error Interceptor
cat > src/common/interceptors/error.interceptor.ts << 'EOF'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError(error => {
                if (error instanceof HttpException) {
                    return throwError(() => error);
                }
                return throwError(
                    () =>
                        new HttpException(
                            'Internal server error',
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        ),
                );
            }),
        );
    }
}
EOF

# Create Cache Interceptor
cat > src/common/interceptors/cache.interceptor.ts << 'EOF'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private cache: Map<string, any> = new Map();

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const key = request.url;
        
        if (request.method !== 'GET') {
            return next.handle();
        }

        if (this.cache.has(key)) {
            return of(this.cache.get(key));
        }

        return next.handle().pipe(
            tap(response => this.cache.set(key, response)),
        );
    }
}
EOF

# Make script executable