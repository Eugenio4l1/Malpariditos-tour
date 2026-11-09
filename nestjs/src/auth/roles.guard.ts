import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prohibido } from '../common/errores';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!roles) return true;
    const usuario = ctx.switchToHttp().getRequest().usuario;
    if (!usuario || !roles.includes(usuario.role)) throw prohibido();
    return true;
  }
}
