import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

// Formato único de error (igual que Laravel): { mensaje, codigo, [errores] }

export const noAutenticado = () =>
  new UnauthorizedException({
    mensaje: 'No autenticado. Envíe un token válido.',
    codigo: 'NO_AUTENTICADO',
  });

export const credencialesInvalidas = () =>
  new UnauthorizedException({
    mensaje: 'Las credenciales proporcionadas no son válidas.',
    codigo: 'CREDENCIALES_INVALIDAS',
  });

export const prohibido = () =>
  new ForbiddenException({
    mensaje: 'No tiene permiso para realizar esta acción.',
    codigo: 'PROHIBIDO',
  });

export const noEncontrado = () =>
  new NotFoundException({
    mensaje: 'Recurso no encontrado.',
    codigo: 'RECURSO_NO_ENCONTRADO',
  });

export const tourConDependencias = () =>
  new ConflictException({
    mensaje:
      'No se puede eliminar el tour porque tiene salidas con reservas activas (pendientes o confirmadas).',
    codigo: 'TOUR_CON_DEPENDENCIAS',
  });

export const invalido = (errores: Record<string, string[]>) =>
  new UnprocessableEntityException({
    mensaje: 'Los datos enviados no son válidos.',
    codigo: 'VALIDACION_FALLIDA',
    errores,
  });
