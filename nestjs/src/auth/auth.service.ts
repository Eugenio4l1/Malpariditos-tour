import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { credencialesInvalidas } from '../common/errores';
import { CAPACIDADES_POR_ROL } from './capacidades';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  // Lista de tokens revocados en memoria (se pierde al reiniciar el servidor).
  private readonly revocados = new Set<string>();

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findOneBy({ email });
    const ok = user ? await compare(password, user.password) : false;
    if (!user || !ok) throw credencialesInvalidas();

    const token = await this.jwt.signAsync({
      sub: user.id,
      role: user.role,
      jti: randomUUID(),
    });
    return {
      mensaje: 'Inicio de sesión exitoso.',
      data: {
        usuario: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          capacidades: CAPACIDADES_POR_ROL[user.role] ?? [],
        },
        token,
      },
    };
  }

  revocar(jti: string) {
    this.revocados.add(jti);
  }

  estaRevocado(jti: string) {
    return this.revocados.has(jti);
  }
}
