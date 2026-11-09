import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { noEncontrado } from '../common/errores';
import { Tour } from './tour.entity';

// Se ejecuta antes de validar el cuerpo, para que el 404 tenga prioridad sobre el 422.
@Injectable()
export class TourExisteGuard implements CanActivate {
  constructor(@InjectRepository(Tour) private readonly repo: Repository<Tour>) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const id = Number(req.params.id);
    const tour =
      Number.isInteger(id) && id > 0
        ? await this.repo.findOne({ where: { id }, relations: { categoria: true } })
        : null;
    if (!tour) throw noEncontrado();
    req.tour = tour;
    return true;
  }
}
