import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ErrorFilter } from './common/error.filter';
import { invalido } from './common/errores';

// Configuración compartida por main.ts y las pruebas e2e.
export function configurarApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errs: ValidationError[]) => {
        const errores: Record<string, string[]> = {};
        for (const e of errs) errores[e.property] = Object.values(e.constraints ?? {});
        return invalido(errores);
      },
    }),
  );
}
