# Laboratorio 3 — Modelo de datos con Eloquent
## Proyecto: Malparidos Tour

## 1. Entidades

El dominio del proyecto modela un sistema de reservas para tours turísticos. Se definieron 9 entidades:

- **categoria**: clasifica los tours (ej. Aventura, Cultural, Playa).
- **tour**: el producto principal que se ofrece, con precio y duración.
- **salida_tour**: una fecha/hora concreta en la que se ejecuta un tour (un mismo tour puede tener muchas salidas).
- **guia**: personal que conduce las salidas.
- **guia_salida**: tabla intermedia que asigna guías a salidas específicas, con datos propios de esa asignación.
- **cliente**: usuario que reserva y valora tours.
- **reserva**: la reserva de un cliente para una salida concreta.
- **llegada_tour**: registro del cierre/llegada de una salida ya ejecutada.
- **valoracion**: reseña que deja un cliente sobre un tour que realizó.

## 2. Relaciones principales

### Relación 1:N — categoria → tour
Una categoría puede tener muchos tours, pero cada tour pertenece a una sola categoría. Es la relación jerárquica más simple del modelo y sirve de base para filtrar/organizar el catálogo.

### Relación N:M con tabla intermedia simple — guia ↔ salida_tour
Un guía puede trabajar en varias salidas, y una salida puede tener varios guías asignados. Se modela con la tabla `guia_salida`.

### Relación N:M con datos adicionales en el pivote — guia_salida
A diferencia de una tabla pivote estándar (que solo tendría las dos llaves foráneas), `guia_salida` almacena información propia de la asignación: `rol` (ej. guía principal / asistente), `fecha_asignacion` y `estado`. Por eso se implementó con su propio modelo Eloquent (`GuiaSalida`) en vez de dejarla como pivote implícito — así se puede consultar y actualizar esos datos extra directamente.

### Relación 1:1 — salida_tour ↔ llegada_tour
Cada salida tiene, a lo sumo, un único registro de llegada. Se garantiza con una restricción `unique()` sobre la llave foránea `salida_tour_id` en `llegada_tours`.

## 3. Políticas de borrado (FKs)

| Relación | Política | Justificación |
|---|---|---|
| tour → categoria | `restrict` | No se debe poder borrar una categoría si todavía tiene tours asociados; obliga a reasignar o eliminar los tours primero. |
| reserva → cliente | `restrict` | Un historial de reservas no debe desaparecer si se elimina el cliente; protege la integridad de los datos financieros/históricos. |
| salida_tour → tour | `cascade` | Si se elimina un tour, sus salidas dejan de tener sentido y se eliminan junto con él. |
| reserva → salida_tour | `cascade` | Las reservas dependen completamente de que exista la salida; sin salida, la reserva pierde su razón de ser. |
| llegada_tour → salida_tour | `cascade` | El registro de llegada es un detalle de la salida; no tiene sentido independiente. |
| valoracion → cliente / tour | `cascade` | Las valoraciones son contenido generado por el cliente sobre un tour específico; si cualquiera de los dos se elimina, la valoración pierde contexto. |
| guia_salida → guia / salida_tour | `cascade` | Es una tabla de asignación pura; si se borra el guía o la salida, la asignación deja de aplicar. |

## 4. Datos de prueba (factories y seeders)

Se decidió usar `tour` como entidad principal (mínimo 20 registros exigido por la rúbrica). Para que las consultas de agregación tuvieran sentido representativo, el seeder:

1. Crea primero un set fijo de **5 categorías** (`Categoria::factory(5)->create()`).
2. Genera **20 tours**, cada uno asignado aleatoriamente a una de esas 5 categorías (`categoria_id => fn () => $categorias->random()->id`).

Esto evita que cada tour termine con su propia categoría única (que habría hecho que un `GROUP BY categoria_id` careciera de sentido, con total=1 en cada grupo), y en cambio produce una distribución realista de varios tours por categoría.

## 5. Consultas implementadas

- **Scope reutilizable**: `Tour::scopeActivos()`, expuesto como `Tour::activos()->get()`, filtra tours con `estado = 'activo'`. Implementado en `routes/web.php` bajo `/tours-activos`.
- **Agregación con GROUP BY**: cuenta y calcula el precio promedio de tours agrupados por categoría (`COUNT(*)`, `AVG(precio)` con `GROUP BY categoria_id`). Implementado en `routes/web.php` bajo `/tours-por-categoria`.