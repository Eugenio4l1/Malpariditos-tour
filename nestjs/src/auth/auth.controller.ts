import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Usuario } from './usuario.decorator';
import type { Payload } from '../common/decoradores';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './login.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas (CREDENCIALES_INVALIDAS).' })
  @ApiResponse({ status: 422, description: 'Datos inválidos (VALIDACION_FALLIDA).' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Token revocado.' })
  @ApiResponse({ status: 401, description: 'Sin token o token inválido (NO_AUTENTICADO).' })
  logout(@Usuario() usuario: Payload) {
    this.auth.revocar(usuario.jti);
    return { mensaje: 'Sesión cerrada correctamente.' };
  }
}
