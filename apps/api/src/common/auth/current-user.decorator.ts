import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedRequestUser } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedRequestUser | undefined => {
    const request = context.switchToHttp().getRequest<{ currentUser?: AuthenticatedRequestUser }>();
    return request.currentUser;
  },
);

