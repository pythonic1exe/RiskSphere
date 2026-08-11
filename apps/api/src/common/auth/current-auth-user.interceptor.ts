import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';

import type { AuthenticatedRequest, AuthenticatedRequestUser } from './auth.types';

@Injectable()
export class CurrentAuthUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.authUser) {
      const currentUser: AuthenticatedRequestUser = {
        id: request.authUser.userId,
        email: request.authUser.email,
      };
      request.currentUser = currentUser;
    }

    return next.handle();
  }
}

