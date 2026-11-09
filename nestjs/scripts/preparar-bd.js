// Carga los datos de prueba del contrato (docs/contrato-comparativo.md, sección 2.3)
// en la COPIA de la base de NestJS. Crea las tablas solo si no existen.
// Uso (desde nestjs/):  node scripts/preparar-bd.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { hashSync } = require('bcryptjs');

const ruta = process.env.DB_DATABASE || 'data/dev.sqlite';
const abs = path.resolve(ruta);
if (!abs.startsWith(process.cwd())) {
  console.error('Por seguridad, la base debe estar dentro de la carpeta nestjs/: ' + abs);
  process.exit(1);
}
fs.mkdirSync(path.dirname(abs), { recursive: true });

const db = new Database(abs);
db.pragma('foreign_keys = ON');

const fmt = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
const ahora = fmt(new Date());

// Mismo esquema que las migraciones de Laravel (solo se crea si la tabla no existe).
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id integer primary key autoincrement not null,
  name varchar not null,
  email varchar not null,
  email_verified_at datetime,
  password varchar not null,
  remember_token varchar,
  created_at datetime,
  updated_at datetime,
  role varchar not null default 'cliente'
);
CREATE TABLE IF NOT EXISTS categorias (
  id integer primary key autoincrement not null,
  nombre varchar not null,
  descripcion varchar,
  created_at datetime,
  updated_at datetime
);
CREATE TABLE IF NOT EXISTS clientes (
  id integer primary key autoincrement not null,
  nombre varchar not null,
  email varchar not null,
  telefono varchar,
  password varchar not null,
  created_at datetime,
  updated_at datetime,
  user_id integer references users(id) on delete set null
);
CREATE TABLE IF NOT EXISTS tours (
  id integer primary key autoincrement not null,
  categoria_id integer not null references categorias(id),
  nombre varchar not null,
  descripcion text,
  precio numeric not null,
  duracion_horas integer not null,
  estado varchar not null,
  created_at datetime,
  updated_at datetime
);
CREATE TABLE IF NOT EXISTS salida_tours (
  id integer primary key autoincrement not null,
  tour_id integer not null references tours(id) on delete cascade,
  fecha date not null,
  hora time not null,
  cupo_maximo integer not null,
  estado varchar not null,
  created_at datetime,
  updated_at datetime
);
CREATE TABLE IF NOT EXISTS reservas (
  id integer primary key autoincrement not null,
  cliente_id integer not null references clientes(id) on delete restrict,
  salida_tour_id integer not null references salida_tours(id) on delete cascade,
  cantidad_personas integer not null,
  fecha_reserva datetime not null,
  estado varchar not null,
  total numeric not null,
  created_at datetime,
  updated_at datetime
);
`);

const hash = (p) => hashSync(p, 10).replace(/^\$2[ab]\$/, '$2y$'); // mismo prefijo que Laravel

const cargar = db.transaction(() => {
  db.exec('DELETE FROM reservas; DELETE FROM salida_tours; DELETE FROM tours; DELETE FROM categorias;');
  db.prepare("DELETE FROM clientes WHERE email = 'cliente@prueba.test'").run();
  db.prepare(
    "DELETE FROM users WHERE email IN ('admin@prueba.test','guia@prueba.test','cliente@prueba.test')",
  ).run();
  try {
    db.exec(
      "DELETE FROM sqlite_sequence WHERE name IN ('reservas','salida_tours','tours','categorias');",
    );
  } catch {}
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS tours_nombre_unico ON tours(nombre);');

  // --- Categorías
  const cat = db.prepare(
    'INSERT INTO categorias (nombre, descripcion, created_at, updated_at) VALUES (?, ?, ?, ?)',
  );
  const categorias = [
    ['Aventura', 'Rutas al aire libre entre bosques, ríos y volcanes.'],
    ['Naturaleza', 'Observación de flora y fauna.'],
    ['Cultural', 'Historia, comunidades y tradiciones.'],
    ['Gastronomía', 'Sabores y productos de la región.'],
    ['Playa', 'Costa y actividades acuáticas.'],
  ];
  for (const [n, d] of categorias) cat.run(n, d, ahora, ahora);

  // --- 200 tours. created_at distinto en cada uno para que el orden por defecto sea determinista.
  const tour = db.prepare(
    `INSERT INTO tours (categoria_id, nombre, descripcion, precio, duracion_horas, estado, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const base = Date.UTC(2026, 8, 1, 0, 0, 0); // 2026-09-01 00:00:00 UTC
  for (let i = 1; i <= 200; i++) {
    const creado = fmt(new Date(base + i * 60000)); // un minuto de diferencia entre tours
    tour.run(
      ((i - 1) % 5) + 1,
      `Tour de prueba ${String(i).padStart(3, '0')}`,
      `Tour de prueba número ${i}.`,
      20000 + (i % 10) * 5000,
      1 + (i % 8),
      i % 10 === 0 ? 'inactivo' : 'activo',
      creado,
      creado,
    );
  }

  // --- Usuarios (admin, guía y cliente) y el cliente vinculado
  const user = db.prepare(
    'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  );
  user.run('Admin Prueba', 'admin@prueba.test', hash('Admin1234!'), 'admin', ahora, ahora);
  user.run('Guía Prueba', 'guia@prueba.test', hash('Guia1234!'), 'guia', ahora, ahora);
  const clienteUser = user.run(
    'Cliente Prueba', 'cliente@prueba.test', hash('Cliente1234!'), 'cliente', ahora, ahora,
  );
  db.prepare(
    'INSERT INTO clientes (nombre, email, telefono, password, created_at, updated_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run('Cliente Prueba', 'cliente@prueba.test', '88888888', hash('Cliente1234!'), ahora, ahora, clienteUser.lastInsertRowid);

  // --- Salidas y reservas para probar el 409 (tours 1 a 5) y la eliminación en cascada (tours 6 a 10)
  const salida = db.prepare(
    `INSERT INTO salida_tours (tour_id, fecha, hora, cupo_maximo, estado, created_at, updated_at)
     VALUES (?, '2026-12-01', '08:00:00', 20, 'programada', ?, ?)`,
  );
  const reserva = db.prepare(
    `INSERT INTO reservas (cliente_id, salida_tour_id, cantidad_personas, fecha_reserva, estado, total, created_at, updated_at)
     VALUES (1, ?, 2, '2026-11-20 10:00:00', ?, 50000, ?, ?)`,
  );
  for (let id = 1; id <= 10; id++) {
    const s = salida.run(id, ahora, ahora);
    reserva.run(s.lastInsertRowid, id <= 5 ? 'pendiente' : 'cancelada', ahora, ahora);
  }
});
cargar();

const c = (t) => db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
console.log(`Listo en ${abs}`);
console.log(
  `categorias=${c('categorias')} tours=${c('tours')} salida_tours=${c('salida_tours')} ` +
    `reservas=${c('reservas')} users=${c('users')} clientes=${c('clientes')}`,
);
db.close();
