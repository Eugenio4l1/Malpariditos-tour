# Laboratorio 4 — Capa de negocios: validaciones, reglas de dominio y CRUD con paginación
## Proyecto: Malparidos Tour

## 1. Entidades principales elegidas

Se trabajó sobre dos entidades del modelo definido en el Laboratorio 3:

- **Tour**: el producto principal del catálogo. CRUD directo, con una regla de dependencia.
- **Reserva**: la entidad con más reglas de negocio del dominio (cupo, vigencia de la salida, estados, descuentos), lo que permite cubrir con holgura el criterio de "cuatro o más reglas".

## 2. Validaciones declarativas (Form Requests)

### 2.1 Tour — `StoreTourRequest` / `UpdateTourRequest`

| Campo | Regla | Categoría cubierta |
|---|---|---|
| `categoria_id` | `required`, `integer`, `exists:categorias,id` | Obligatorio + existencia de FK |
| `nombre` | `required`, `min:3`, `max:150`, `unique:tours,nombre` | Obligatorio + longitud + unicidad |
| `descripcion` | `nullable`, `max:2000` | Longitud |
| `precio` | `required`, `numeric`, `min:0`, `max:999999.99` | Rango numérico |
| `duracion_horas` | `required`, `integer`, `min:1`, `max:24` | Rango numérico |
| `estado` | `required`, `in:activo,inactivo` | Formato/valor permitido |

En `UpdateTourRequest`, todos los campos usan `sometimes` (permite actualizaciones parciales) y `unique` se aplica con `->ignore($tourId)` para que el tour no choque con su propio nombre al no modificarlo.

### 2.2 Reserva — `StoreReservaRequest` / `UpdateReservaRequest`

| Campo | Regla | Categoría cubierta |
|---|---|---|
| `cliente_id` | `required`, `integer`, `exists:clientes,id` | Obligatorio + existencia de FK |
| `salida_tour_id` | `required`, `integer`, `exists:salida_tours,id`, `unique` compuesto (por cliente + estado ≠ cancelada) | Obligatorio + existencia de FK + unicidad condicional |
| `cantidad_personas` | `required`, `integer`, `min:1`, `max:20` | Rango numérico |
| `fecha_reserva` | `required`, `date` | Formato de fecha |

En `UpdateReservaRequest`, `cantidad_personas` y `fecha_reserva` usan `sometimes` (no se permite reasignar cliente ni salida en una edición).

Todos los mensajes de validación están en español y asociados a cada campo individualmente vía `messages()` — no se usa un texto de error único genérico.

## 3. Reglas de negocio no declarativas

Implementadas en la capa de servicio (`TourService`, `ReservaService`), lanzando `App\Exceptions\BusinessRuleException` cuando se violan. Esta excepción se traduce automáticamente a una respuesta **HTTP 409** con el cuerpo:

```json
{
  "mensaje": "<mensaje descriptivo>",
  "codigo": "<CODIGO_DE_ERROR>"
}
```

(mapeo configurado en `bootstrap/app.php`, listo para refinarse por código en el Laboratorio 5).

| # | Código | Entidad | Descripción | Comportamiento esperado |
|---|---|---|---|---|
| 1 | `TOUR_CON_DEPENDENCIAS` | Tour | No se permite eliminar un tour si alguna de sus salidas tiene reservas en estado `pendiente` o `confirmada`. | `DELETE /api/tours/{id}` → 409. Si el tour no tiene reservas activas (o solo tiene canceladas), se elimina normalmente (204). |
| 2 | `SALIDA_TOUR_VENCIDA` | Reserva | No se permite crear una reserva sobre una salida de tour cuya fecha/hora ya pasó. | `POST /api/reservas` con una salida vencida → 409. |
| 3 | `CUPO_INSUFICIENTE` | Reserva | No se permite reservar más personas de las que caben en el cupo disponible de la salida (calculado dinámicamente restando las reservas activas ya existentes). | `POST /api/reservas` o `PUT /api/reservas/{id}` que exceda el cupo → 409, incluye el cupo disponible real en el mensaje. |
| 4 | *(descuento, regla no declarativa pero sin excepción)* | Reserva | Si `cantidad_personas >= 5`, se aplica un 10% de descuento sobre el total (`precio_tour × cantidad`). | El campo `total` de la reserva creada refleja el descuento automáticamente; no requiere que el cliente lo calcule. |
| 5 | `RESERVA_NO_MODIFICABLE` | Reserva | No se permite modificar una reserva que ya está `confirmada` o `cancelada`. | `PUT /api/reservas/{id}` sobre una reserva en esos estados → 409. |
| 6 | `ESTADO_INVALIDO` | Reserva | No se permite confirmar una reserva que no esté en estado `pendiente`, ni cancelar una que ya esté `cancelada`. | `POST /api/reservas/{id}/confirmar` o `/cancelar` en un estado inválido → 409. |
| 7 | `RESERVA_CON_DEPENDENCIAS` | Reserva | No se permite eliminar una reserva que ya está `confirmada` (se considera una dependencia activa del negocio). | `DELETE /api/reservas/{id}` sobre una reserva confirmada → 409. Sobre una `pendiente` sí se permite (204). |

Esto cubre de sobra el mínimo de 4 reglas pedido por el enunciado, incluyendo los cuatro ejemplos sugeridos: dependencia con eliminación (#1 y #7), confirmación de un registro sin condiciones cumplidas (#6), descuento por umbral (#4) y una regla propia del dominio del proyecto (#2, vigencia de la salida de tour).

## 4. Transacciones y consistencia

Toda operación que escribe en más de una tabla (o que necesita leer y escribir de forma atómica para evitar condiciones de carrera) está envuelta en `DB::transaction()`:

- `ReservaService::create()` — usa `lockForUpdate()` sobre la salida del tour mientras verifica vigencia y cupo, antes de insertar la reserva. Evita que dos reservas simultáneas exploten el cupo disponible.
- `ReservaService::update()` — igual, con bloqueo al recalcular cupo si cambia `cantidad_personas`.
- `ReservaService::cancel()` — transacción simple de actualización de estado.
- `TourService::delete()` — la verificación de dependencias activas y el borrado ocurren dentro de la misma transacción.

**Verificación de reversión ante fallo intermedio:** la prueba `test_falla_intermedia_no_deja_registros_parciales` (en `ReservaServiceTest`) crea una salida con cupo máximo de 1 e intenta reservar 5 personas. La regla de cupo insuficiente lanza `BusinessRuleException` dentro de la transacción, y se verifica con `assertDatabaseCount('reservas', 0)` que no queda ningún registro parcial en la base de datos.

## 5. Listado, paginación, orden y filtros

Implementado en `list()` de ambos servicios:

| Aspecto | Tour | Reserva |
|---|---|---|
| Tamaño de página | Configurable vía `per_page`, tope máximo de **50** (`MAX_PAGE_SIZE`) sin importar lo que pida el cliente | Igual, tope de 50 |
| Campos ordenables (whitelist) | `nombre`, `precio`, `duracion_horas`, `created_at` | `fecha_reserva`, `total`, `cantidad_personas`, `created_at` |
| Dirección de orden | `sort_dir=asc\|desc` (por defecto `desc`) | Igual |
| Filtros combinables | `categoria_id`, `estado`, `precio_min`, `precio_max`, `buscar` (nombre, parcial) | `cliente_id`, `estado`, `fecha_desde`, `fecha_hasta` |

El campo por el que se ordena nunca se pasa directo del request a `orderBy()`: se valida contra una lista blanca (`SORTABLE_FIELDS`) para evitar que un valor arbitrario llegue a la consulta SQL.

## 6. Excepción de negocio propia

`App\Exceptions\BusinessRuleException` (extiende de `Exception`), con:

- `getMessage()` — heredado, mensaje descriptivo para el usuario.
- `getErrorCode(): string` — código corto y estable (ej. `CUPO_INSUFICIENTE`), pensado para mapearse a códigos de estado HTTP específicos en el Laboratorio 5 (hoy todos responden 409 de forma genérica).

## 7. Pruebas automatizadas (PHPUnit)

Una prueba por cada regla de negocio implementada, más pruebas adicionales de CRUD, filtros, orden y paginación.

### `tests/Feature/ReservaServiceTest.php` (5 pruebas)
- `test_no_permite_reservar_salida_de_tour_vencida` → regla `SALIDA_TOUR_VENCIDA`
- `test_no_permite_reservar_sin_cupo_disponible_suficiente` → regla `CUPO_INSUFICIENTE`
- `test_aplica_descuento_por_umbral_de_personas` → regla de descuento
- `test_no_permite_eliminar_una_reserva_confirmada` → regla `RESERVA_CON_DEPENDENCIAS`
- `test_falla_intermedia_no_deja_registros_parciales` → verificación de reversión transaccional

### `tests/Feature/TourServiceTest.php` (9 pruebas)
- `test_crea_un_tour`, `test_actualiza_un_tour`, `test_elimina_un_tour_sin_dependencias` → CRUD
- `test_no_permite_eliminar_un_tour_con_dependencias_activas` → regla `TOUR_CON_DEPENDENCIAS`
- `test_permite_eliminar_un_tour_cuyas_reservas_estan_canceladas` → caso borde de la misma regla
- `test_lista_tours_filtrando_por_estado`, `test_lista_tours_con_filtros_combinados` → filtros
- `test_lista_tours_ordenados_por_precio_ascendente` → ordenamiento
- `test_el_listado_respeta_el_tope_maximo_de_pagina` → tope de paginación

Ejecución: `php artisan test` (o por archivo: `php artisan test tests/Feature/TourServiceTest.php --testdox`). Corren contra una base de datos SQLite en memoria (`phpunit.xml`), aislada de los datos reales del proyecto.

## 8. Evidencia manual (cliente HTTP)

Se probó cada operación CRUD y cada regla de negocio manualmente con Postman (colección `MalpariditosTour.postman_collection.json`, adjunta en el repositorio), incluyendo:

- CRUD completo de Tour y Reserva (creación válida, listado, ver detalle, editar, eliminar).
- Casos de validación inválida (422) por campos faltantes o fuera de rango.
- Violación de cada regla de negocio (409) con su código correspondiente.
- Confirmación y cancelación de reservas, incluyendo los estados inválidos.

Las capturas de cada caso se adjuntan como evidencia en la entrega de Mediación Virtual.
