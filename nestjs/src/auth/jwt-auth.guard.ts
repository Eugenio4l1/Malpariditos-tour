import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { noAutenticado } from '../common/errores';
import type { Payload } from '../common/decoradores';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const [tipo, token] = String(req.headers['authorization'] ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw noAutenticado();

    let payload: Payload;
    try {
      payload = await this.jwt.verifyAsync<Payload>(token);
    } catch {
      throw noAutenticado();
    }
    if (this.auth.estaRevocado(payload.jti)) throw noAutenticado();

    req.usuario = payload;
    return true;
  }
}
