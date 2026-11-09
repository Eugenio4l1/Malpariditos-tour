import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

// Laravel acepta "5" como entero y "150" como número: convertimos solo cadenas numéricas.
const aNumero = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))
    ? Number(value)
    : value;

// Todos los campos obligatorios (equivale a StoreTourRequest).
export class CrearTourDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'La categoría no es válida.' })
  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  @Transform(aNumero)
  categoria_id: number;

  @ApiProperty({ example: 'Caminata al volcán Rincón de la Vieja' })
  @MaxLength(150, { message: 'El nombre no puede superar los 150 caracteres.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre del tour es obligatorio.' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Recorrido guiado de medio día.', nullable: true })
  @IsOptional()
  @MaxLength(2000, { message: 'La descripción no puede superar los 2000 caracteres.' })
  @IsString({ message: 'La descripción debe ser texto.' })
  descripcion?: string | null;

  @ApiProperty({ example: 45000 })
  @Max(999999.99, { message: 'El precio no puede superar 999999.99.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @IsNotEmpty({ message: 'El precio es obligatorio.' })
  @Transform(aNumero)
  precio: number;

  @ApiProperty({ example: 4 })
  @Max(24, { message: 'La duración máxima es de 24 horas.' })
  @Min(1, { message: 'La duración mínima es de 1 hora.' })
  @IsInt({ message: 'La duración debe ser un número entero de horas.' })
  @IsNotEmpty({ message: 'La duración es obligatoria.' })
  @Transform(aNumero)
  duracion_horas: number;

  @ApiProperty({ enum: ['activo', 'inactivo'] })
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo".' })
  @IsString({ message: 'El estado debe ser texto.' })
  @IsNotEmpty({ message: 'El estado es obligatorio.' })
  estado: string;
}

// Campos opcionales, pero si vienen deben ser válidos (equivale a "sometimes|required" de UpdateTourRequest).
export class ActualizarTourDto {
  @ApiPropertyOptional({ example: 2 })
  @ValidateIf((o) => o.categoria_id !== undefined)
  @IsInt({ message: 'La categoría no es válida.' })
  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  @Transform(aNumero)
  categoria_id?: number;

  @ApiPropertyOptional({ example: 'Caminata nocturna al volcán' })
  @ValidateIf((o) => o.nombre !== undefined)
  @MaxLength(150, { message: 'El nombre no puede superar los 150 caracteres.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre del tour es obligatorio.' })
  nombre?: string;

  @ApiPropertyOptional({ example: 'Ahora con transporte incluido.', nullable: true })
  @IsOptional()
  @MaxLength(2000, { message: 'La descripción no puede superar los 2000 caracteres.' })
  @IsString({ message: 'La descripción debe ser texto.' })
  descripcion?: string | null;

  @ApiPropertyOptional({ example: 52000 })
  @ValidateIf((o) => o.precio !== undefined)
  @Max(999999.99, { message: 'El precio no puede superar 999999.99.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @IsNotEmpty({ message: 'El precio es obligatorio.' })
  @Transform(aNumero)
  precio?: number;

  @ApiPropertyOptional({ example: 5 })
  @ValidateIf((o) => o.duracion_horas !== undefined)
  @Max(24, { message: 'La duración máxima es de 24 horas.' })
  @Min(1, { message: 'La duración mínima es de 1 hora.' })
  @IsInt({ message: 'La duración debe ser un número entero de horas.' })
  @IsNotEmpty({ message: 'La duración es obligatoria.' })
  @Transform(aNumero)
  duracion_horas?: number;

  @ApiPropertyOptional({ enum: ['activo', 'inactivo'] })
  @ValidateIf((o) => o.estado !== undefined)
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo".' })
  @IsString({ message: 'El estado debe ser texto.' })
  @IsNotEmpty({ message: 'El estado es obligatorio.' })
  estado?: string;
}
