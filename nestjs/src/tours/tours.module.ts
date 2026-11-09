import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Categoria } from '../categorias/categoria.entity';
import { Tour } from './tour.entity';
import { TourExisteGuard } from './tour-existe.guard';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tour, Categoria]), AuthModule],
  controllers: [ToursController],
  providers: [ToursService, TourExisteGuard],
})
export class ToursModule {}
