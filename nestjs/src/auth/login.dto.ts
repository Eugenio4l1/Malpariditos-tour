import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@prueba.test' })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsString({ message: 'El correo electrónico debe ser texto.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @ApiProperty({ example: 'Admin1234!' })
  @IsString({ message: 'La contraseña debe ser texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password: string;
}
