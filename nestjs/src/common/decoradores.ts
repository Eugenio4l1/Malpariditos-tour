import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export interface Payload {
  sub: number;
  role: string;
  jti: string;
}

export interface PeticionBase {
  protocol: string;
  headers: { host?: string };
}

export const urlBase = (req: PeticionBase) => `${req.protocol}://${req.headers.host}`;

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const TourActual = createParamDecorator(
  (_d: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().tour,
);
