import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

type Res = { status(n: number): { json(b: unknown): void } };

// Errores que no construimos nosotros (ruta inexistente, método no permitido, JSON ilegible...).
const ESTANDAR: Record<number, { mensaje: string; codigo: string }> = {
  401: { mensaje: 'No autenticado. Envíe un token válido.', codigo: 'NO_AUTENTICADO' },
  403: { mensaje: 'No tiene permiso para realizar esta acción.', codigo: 'PROHIBIDO' },
  404: { mensaje: 'Recurso no encontrado.', codigo: 'RECURSO_NO_ENCONTRADO' },
  405: { mensaje: 'Método no permitido para este recurso.', codigo: 'METODO_NO_PERMITIDO' },
  429: { mensaje: 'Demasiadas solicitudes. Intente más tarde.', codigo: 'DEMASIADAS_SOLICITUDES' },
};

@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errores');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Res>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'mensaje' in body) {
        return res.status(status).json(body);
      }
      if (status === 400) {
        return res
          .status(400)
          .json({ mensaje: exception.message, codigo: 'SOLICITUD_MALFORMADA' });
      }
      const estandar = ESTANDAR[status];
      return res.status(status).json(
        estandar ?? { mensaje: exception.message, codigo: 'ERROR_HTTP' },
      );
    }

    // JSON ilegible: lo lanza el analizador del cuerpo antes de llegar a Nest.
    const e = exception as { status?: number; type?: string; message?: string };
    if (e?.status === 400 && e?.type === 'entity.parse.failed') {
      return res
        .status(400)
        .json({ mensaje: e.message ?? 'JSON inválido.', codigo: 'SOLICITUD_MALFORMADA' });
    }

    this.logger.error(exception);
    return res
      .status(500)
      .json({ mensaje: 'Error interno del servidor.', codigo: 'ERROR_INTERNO' });
  }
}
