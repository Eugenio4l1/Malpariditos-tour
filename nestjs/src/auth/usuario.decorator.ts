import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Usuario = createParamDecorator(
  (_d: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().usuario,
);
