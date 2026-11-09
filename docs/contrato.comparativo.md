# Contrato común del estudio comparativo de frameworks de back-end

**Curso:** IF0009 Desarrollo de Software IV · II Ciclo 2026
**Proyecto:** Malpariditos Tour
**Referencia del contrato:** la API de Laravel entregada (Lab 4 a 6). NestJS y ASP.NET Core 8 la replican.
**Estado:** congelado después del Hito 1. Todo cambio posterior se registra en la sección 10.

Este documento define lo que las **tres implementaciones** (Laravel 13, NestJS y ASP.NET Core 8) deben cumplir de forma **idéntica**: mismas rutas, mismos códigos de estado, mismas estructuras de respuesta, misma base de datos y mismos datos de prueba.

---

## 1. Alcance

| Aspecto | Definición |
|---|---|
| Entidad del contrato | `Tour` |
| Relación | `Tour` pertenece a `Categoria` (muchos a uno) |
| Operaciones del contrato (6) | Listar, listar con filtros, ver por id, crear, actualizar, eliminar |
| Operaciones de apoyo | `POST /api/login` y `POST /api/logout` (necesarias para la autenticación; no cuentan entre las 6) |
| Prefijo de rutas | `/api` |
| Formato | JSON (`Content-Type: application/json`), UTF-8 |
| Autenticación | Token de portador: `Authorization: Bearer <token>` |
| Envío de datos | **Cuerpo JSON.** No se aceptan datos en la URL para crear o actualizar. |

> **Sobre el nombre del recurso.** El enunciado usa `/api/recursos` como nombre genérico. En este proyecto el recurso es `tours`.

> **Desviaciones deliberadas respecto de la plantilla del enunciado** (se registran en la sección 10): el listado y el detalle son públicos (la plantilla pide 401 sin token), la búsqueda por nombre se llama `buscar` (la plantilla usa `q`), y la actualización acepta `PUT` y `PATCH`.

---

## 2. Base de datos y datos de prueba

### 2.1 Base de datos

- **Una sola base compartida** por las tres implementaciones. *[CONFIRMAR motor: SQLite en desarrollo; MySQL 8 en Docker para las mediciones de rendimiento.]*
- **El esquema lo gestiona Laravel** mediante sus migraciones. NestJS y ASP.NET Core **no** crean ni modifican tablas.
- Tablas involucradas: `users`, `categorias`, `tours`, `salida_tours`, `reservas` y `clientes`.

### 2.2 Esquema de `tours`

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | bigint | PK, autoincremental |
| `categoria_id` | bigint | FK a `categorias.id` |
| `nombre` | varchar(150) | obligatorio, único |
| `descripcion` | text | nulo permitido |
| `precio` | decimal(10,2) | obligatorio |
| `duracion_horas` | int | obligatorio |
| `estado` | varchar(30) | `activo` o `inactivo` |
| `created_at`, `updated_at` | timestamp | |

### 2.3 Datos de prueba (idénticos para las tres)

Se cargan con un único script y se restauran **antes de cada medición**.

| Dato | Valor |
|---|---|
| Categorías | 5: `Aventura`, `Naturaleza`, `Cultural`, `Gastronomía`, `Playa` (ids 1 a 5) |
| Tours | 200, `Tour de prueba 001` a `Tour de prueba 200` (ids 1 a 200), categoría `((id - 1) mod 5) + 1` |
| Estado | 180 `activo` y 20 `inactivo` (los de `id` múltiplo de 10) |
| `created_at` | Distinto en cada tour (un minuto de diferencia, desde 2026-09-01 00:00 UTC), para que el orden por defecto sea determinista |
| Tours con reservas activas | `id` 1 a 5: una salida con una reserva `pendiente` (sirven para probar el 409) |
| Tours con reservas canceladas | `id` 6 a 10: una salida con una reserva `cancelada` (se pueden eliminar) |
| Administrador | `admin@prueba.test` / `Admin1234!` / rol `admin` |
| Guía | `guia@prueba.test` / `Guia1234!` / rol `guia` |
| Cliente | `cliente@prueba.test` / `Cliente1234!` / rol `cliente` |

Las contraseñas usan **bcrypt** con prefijo `$2y$`, como las genera Laravel. Las tres implementaciones deben poder verificar ese hash.

---

## 3. Recurso `Tour` (JSON)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | entero | |
| `categoria_id` | entero | |
| `nombre` | cadena | |
| `descripcion` | cadena o `null` | |
| `precio` | **número** | Nunca como cadena |
| `duracion_horas` | entero | |
| `estado` | cadena | `activo` o `inactivo` |
| `categoria` | objeto | `{ id, nombre, descripcion }`. **Solo aparece cuando la categoría está cargada** (ver tabla de la sección 5) |
| `creado_en` | cadena | ISO 8601 en UTC, formato `2026-09-20T10:15:00+00:00` |
| `actualizado_en` | cadena | Igual que `creado_en` |

El orden de las claves es el de la tabla.

```json
{
  "data": {
    "id": 12,
    "categoria_id": 1,
    "nombre": "Caminata al volcán Rincón de la Vieja",
    "descripcion": "Recorrido guiado de medio día.",
    "precio": 45000,
    "duracion_horas": 4,
    "estado": "activo",
    "categoria": { "id": 1, "nombre": "Aventura", "descripcion": "Rutas al aire libre entre bosques, ríos y volcanes." },
    "creado_en": "2026-09-20T10:15:00+00:00",
    "actualizado_en": "2026-09-20T10:15:00+00:00"
  }
}
```

> **Pendiente de confirmar con el docente:** el enunciado fija un máximo de ocho campos por entidad. El recurso entrega nueve con `actualizado_en`. Si se decide recortarlo, debe omitirse en las tres implementaciones.

---

## 4. Convenciones comunes

### 4.1 Envoltorio de respuestas

Toda respuesta con cuerpo exitoso va envuelta en `{ "data": ... }`. El listado agrega `links` y `meta`. El `204` no tiene cuerpo.

### 4.2 Formato de errores

Todos los errores usan `{ mensaje, codigo }` y, en validación, además `errores`:

```json
{
  "mensaje": "Los datos enviados no son válidos.",
  "codigo": "VALIDACION_FALLIDA",
  "errores": {
    "nombre": ["El nombre del tour es obligatorio."],
    "precio": ["El precio no puede ser negativo."]
  }
}
```

| Estado | `codigo` | `mensaje` |
|---|---|---|
| 400 | `SOLICITUD_MALFORMADA` | (libre) JSON ilegible |
| 401 | `NO_AUTENTICADO` | No autenticado. Envíe un token válido. |
| 401 (login) | `CREDENCIALES_INVALIDAS` | Las credenciales proporcionadas no son válidas. |
| 403 | `PROHIBIDO` | No tiene permiso para realizar esta acción. |
| 404 | `RECURSO_NO_ENCONTRADO` | Recurso no encontrado. |
| 405 | `METODO_NO_PERMITIDO` | Método no permitido para este recurso. |
| 409 (eliminar) | `TOUR_CON_DEPENDENCIAS` | No se puede eliminar el tour porque tiene salidas con reservas activas (pendientes o confirmadas). |
| 422 | `VALIDACION_FALLIDA` | Los datos enviados no son válidos. |
| 500 | `ERROR_INTERNO` | Error interno del servidor. (sin trazas ni detalles de la base) |

Un id inexistente o no numérico (`/api/tours/abc`) responde **404**, igual que una ruta inexistente.

### 4.3 Autorización

| Operación | Quién |
|---|---|
| Listar, ver por id | Cualquier persona (sin token) |
| Crear, actualizar, eliminar | Solo rol `admin`. Los roles `guia` y `cliente` reciben **403**. |

Orden de comprobaciones: autenticación (401), rol (403), existencia del recurso (404), validación (422), regla de negocio (409).

> **Pendiente de comprobar en Laravel:** que `PUT /api/tours/99999` con el rol `cliente` responda 403 y no 404.

---

## 5. Operaciones

### 5.1 Listar y listar con filtros

`GET /api/tours` · Público.

| Parámetro | Regla |
|---|---|
| `page` | Entero ≥ 1. Cualquier otro valor se trata como 1. |
| `per_page` | Por defecto 15. Se limita al rango 1 a 50 (fuera de rango o no numérico se corrige, no da error). |
| `sort_by` | `nombre`, `precio`, `duracion_horas` o `created_at`. Otro valor equivale a `created_at`. |
| `sort_dir` | `asc` o `desc`. Otro valor equivale a `desc`. |
| `categoria_id` | Igualdad |
| `estado` | Igualdad |
| `precio_min`, `precio_max` | `precio >= min` y `precio <= max` |
| `buscar` | `nombre` contiene el texto |

Orden por defecto: `created_at` descendente. Un valor vacío o `0` en un filtro se **ignora**. Los filtros son combinables.

```json
{
  "data": [ { "id": 200, "...": "..." } ],
  "links": {
    "first": "http://host/api/tours?page=1",
    "last": "http://host/api/tours?page=14",
    "prev": null,
    "next": "http://host/api/tours?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 14,
    "path": "http://host/api/tours",
    "per_page": 15,
    "to": 15,
    "total": 200
  }
}
```

- Las URL de `links` son absolutas (esquema y host de la petición) y solo llevan `page`.
- Página vacía: `data: []`, `from` y `to` en `null`.
- Laravel agrega además `meta.links` (arreglo de enlaces para botones de página). **No es parte del contrato** y las otras implementaciones pueden omitirlo.
- Cada tour del listado incluye `categoria`.

| Estado | Condición |
|---|---|
| 200 | Siempre (no requiere token) |

### 5.2 Ver por id

`GET /api/tours/{id}` · Público.

| Estado | Condición |
|---|---|
| 200 | `{ "data": Tour }` con `categoria` |
| 404 | El tour no existe |

### 5.3 Crear

`POST /api/tours` · Solo `admin`.

Todos los campos son obligatorios salvo `descripcion`.

| Campo | Reglas |
|---|---|
| `categoria_id` | Obligatorio, entero, debe existir |
| `nombre` | Obligatorio, texto, de 3 a 150 caracteres, único |
| `descripcion` | Opcional (admite `null`), texto, máximo 2000 caracteres |
| `precio` | Obligatorio, numérico, de 0 a 999999.99 |
| `duracion_horas` | Obligatorio, entero, de 1 a 24 |
| `estado` | Obligatorio, `activo` o `inactivo` |

Un valor numérico enviado como cadena (`"5"`, `"150"`) se acepta.

| Estado | Condición |
|---|---|
| 201 | `{ "data": Tour }` **sin** `categoria`, y encabezado `Location: http://host/api/tours/{id}` (URL absoluta) |
| 401 | Sin token o token inválido |
| 403 | La persona no es `admin` |
| 422 | Datos inválidos |

**Mensajes de validación** (idénticos en las tres implementaciones; un mensaje por campo):

| Campo | Mensajes |
|---|---|
| `categoria_id` | obligatorio: *La categoría es obligatoria.* · tipo: *La categoría no es válida.* · existencia: *La categoría seleccionada no existe.* |
| `nombre` | obligatorio: *El nombre del tour es obligatorio.* · tipo: *El nombre debe ser texto.* · mínimo: *El nombre debe tener al menos 3 caracteres.* · máximo: *El nombre no puede superar los 150 caracteres.* · único: *Ya existe un tour registrado con ese nombre.* |
| `descripcion` | tipo: *La descripción debe ser texto.* · máximo: *La descripción no puede superar los 2000 caracteres.* |
| `precio` | obligatorio: *El precio es obligatorio.* · tipo: *El precio debe ser un número.* · mínimo: *El precio no puede ser negativo.* · máximo: *El precio no puede superar 999999.99.* |
| `duracion_horas` | obligatorio: *La duración es obligatoria.* · tipo: *La duración debe ser un número entero de horas.* · mínimo: *La duración mínima es de 1 hora.* · máximo: *La duración máxima es de 24 horas.* |
| `estado` | obligatorio: *El estado es obligatorio.* · tipo: *El estado debe ser texto.* · valor: *El estado debe ser "activo" o "inactivo".* |

### 5.4 Actualizar

`PUT /api/tours/{id}` y `PATCH /api/tours/{id}` · Solo `admin`. **Ambos métodos hacen lo mismo.**

Es una actualización **parcial**: todos los campos son opcionales, pero si un campo viene (incluso como `null`) debe cumplir las reglas de 5.3. Un cuerpo vacío `{}` responde 200 sin cambios. La unicidad de `nombre` ignora al propio registro.

| Estado | Condición |
|---|---|
| 200 | `{ "data": Tour }` **con** `categoria` |
| 401 | Sin token o token inválido |
| 403 | La persona no es `admin` |
| 404 | El tour no existe |
| 422 | Datos inválidos |

### 5.5 Eliminar

`DELETE /api/tours/{id}` · Solo `admin`.

| Estado | Condición |
|---|---|
| 204 | Eliminado, sin cuerpo (las salidas del tour se eliminan en cascada) |
| 401 | Sin token o token inválido |
| 403 | La persona no es `admin` |
| 404 | El tour no existe |
| 409 | Alguna salida del tour tiene reservas en estado `pendiente` o `confirmada` (`TOUR_CON_DEPENDENCIAS`) |

La regla de reservas activas se evalúa dentro de una transacción.

### 5.6 Inicio de sesión (apoyo)

`POST /api/login`

Cuerpo: `{ "email": "...", "password": "..." }`

| Estado | Condición |
|---|---|
| 200 | Credenciales correctas |
| 422 | Datos inválidos |
| 401 | Credenciales incorrectas (mismo mensaje si el correo no existe o la contraseña falla) |

```json
{
  "mensaje": "Inicio de sesión exitoso.",
  "data": {
    "usuario": { "id": 1, "name": "Admin Prueba", "email": "admin@prueba.test", "role": "admin", "capacidades": ["tours:crear", "..."] },
    "token": "..."
  }
}
```

Mensajes de validación: `email` obligatorio *El correo electrónico es obligatorio.*, tipo *El correo electrónico debe ser texto.*, formato *El correo electrónico no tiene un formato válido.*; `password` obligatorio *La contraseña es obligatoria.*, tipo *La contraseña debe ser texto.*

`capacidades` por rol:

| Rol | Capacidades |
|---|---|
| `admin` | `tours:crear`, `tours:editar`, `tours:eliminar`, `reservas:ver`, `reservas:editar`, `reservas:eliminar`, `reservas:estado`, `clientes:ver` |
| `guia` | `reservas:ver`, `reservas:estado`, `clientes:ver` |
| `cliente` | `reservas:ver`, `reservas:crear`, `reservas:editar`, `reservas:eliminar`, `clientes:ver` |

> Laravel limita el login a 5 intentos por minuto por correo e IP. Es un control de seguridad que se compara en el Hito 3, **no** parte del contrato funcional.

### 5.7 Cierre de sesión (apoyo)

`POST /api/logout`

| Estado | Condición |
|---|---|
| 200 | `{ "mensaje": "Sesión cerrada correctamente." }`. El token queda revocado: reutilizarlo responde 401. |
| 401 | Sin token o token inválido |

---

## 6. Requisitos del token

| Aspecto | Definición |
|---|---|
| Transporte | `Authorization: Bearer <token>` |
| Revocación | Obligatoria mediante `POST /api/logout` |
| Contenido mínimo | Identificador de la persona y su rol |
| Tipo | Libre (token opaco de Sanctum, JWT, etc.), pero **documentado** en el informe, porque determina el esfuerzo de autenticación a medir |

---

## 7. Pruebas mínimas por implementación

Tres pruebas equivalentes (mismo escenario, distinta herramienta):

| N.º | Escenario | Resultado esperado |
|---|---|---|
| 1 | Crear un tour con datos válidos como `admin` | 201, `Location` y cuerpo `{ data }` con el `id` |
| 2 | Crear un tour sin `nombre` y con `precio` negativo | 422, `codigo: VALIDACION_FALLIDA` y errores en ambos campos |
| 3 | Crear un tour sin token | 401, `codigo: NO_AUTENTICADO` |

---

## 8. Condiciones de medición (variables controladas)

Aplican a las **tres** implementaciones y se reportan completas en el informe.

| Variable | Valor fijado |
|---|---|
| Máquina | Una sola. Se registran CPU, RAM, sistema operativo y versión de Docker. |
| Base de datos | La instancia única de la sección 2, restaurada con el script de datos antes de cada corrida. |
| Modo de ejecución | Producción (sin depuración ni recarga en caliente). |
| Servicios en ejecución | Solo el framework bajo prueba y la base de datos. |
| Herramienta de carga | k6 (misma versión siempre). |
| Escenario de carga | `GET /api/tours?page=1&per_page=15` (público, sin token). |
| Carga | 50 usuarios virtuales concurrentes; 30 s de calentamiento descartados y 60 s medidos. |
| Repeticiones | 3 corridas por framework; se reporta la mediana y el rango. |
| Métricas | Peticiones por segundo y latencia p95. |
| Huella | Memoria residente en reposo (60 s sin tráfico) y tamaño del artefacto desplegable. |

El procedimiento exacto (comandos, scripts de k6 y versiones) se guarda en `docs/procedimiento-mediciones.md`.

---

## 9. Criterios de aceptación

Una implementación cumple el contrato solo si:

- [ ] Las 6 operaciones y las 2 de apoyo responden con los estados de la sección 5.
- [ ] Los errores usan exactamente el formato y los códigos de la sección 4.2.
- [ ] Las respuestas usan el envoltorio `data` y la forma de la sección 3 (`precio` numérico, `categoria` solo donde corresponde).
- [ ] La autorización respeta la sección 4.3.
- [ ] Usa la base y los datos de prueba de la sección 2.
- [ ] Las 3 pruebas de la sección 7 pasan.
- [ ] Verifica correctamente el hash bcrypt `$2y$` de Laravel.

---


