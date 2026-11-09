import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/app.setup';

describe('Contrato común (NestJS)', () => {
  let app: INestApplication;
  let token: string;
  const creados: number[] = [];

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    configurarApp(app);
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: 'admin@prueba.test', password: 'Admin1234!' });
    token = res.body.data.token;
  });

  afterAll(async () => {
    for (const id of creados) {
      await request(app.getHttpServer())
        .delete(`/api/tours/${id}`)
        .set('Authorization', `Bearer ${token}`);
    }
    await app.close();
  });

  it('1. crea un tour con datos válidos como admin: 201, Location y cuerpo { data }', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tours')
      .set('Authorization', `Bearer ${token}`)
      .send({
        categoria_id: 1,
        nombre: `Prueba e2e ${Date.now()}`,
        descripcion: 'Creado por la prueba automática.',
        precio: 25000,
        duracion_horas: 3,
        estado: 'activo',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeGreaterThan(0);
    expect(res.headers['location']).toMatch(new RegExp(`/api/tours/${res.body.data.id}$`));
    creados.push(res.body.data.id);
  });

  it('2. rechaza nombre ausente y precio negativo: 422 VALIDACION_FALLIDA con errores por campo', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tours')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria_id: 1, precio: -5, duracion_horas: 3, estado: 'activo' });
    expect(res.status).toBe(422);
    expect(res.body.codigo).toBe('VALIDACION_FALLIDA');
    expect(res.body.errores).toHaveProperty('nombre');
    expect(res.body.errores).toHaveProperty('precio');
  });

  it('3. crear un tour sin token responde 401 NO_AUTENTICADO', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tours')
      .send({ categoria_id: 1, nombre: 'Sin token', precio: 1000, duracion_horas: 2, estado: 'activo' });
    expect(res.status).toBe(401);
    expect(res.body.codigo).toBe('NO_AUTENTICADO');
  });
});
