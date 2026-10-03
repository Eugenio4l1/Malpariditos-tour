# Guía de interfaz — Malpariditos Tours (Laboratorio 7)

## 1. Paleta de color (Verificada desde AA)

| Rol | Nombre | Código | Nota |
|---|---|---|---|
| Primario | Azul Río | `#24609C` | Original. 6.51:1 con blanco |
| Primario oscuro | Azul Profundo | `#1B4B7C` | Nuevo. Enlaces, hover y foco |
| Acento | Naranja Tostado | `#9A5214` | Ajustado desde `#BA6A23` (4.06:1 → 5.85:1) |
| Superficie | Arena | `#D7CBA7` | Original. Solo fondos y bordes |
| Fondo de página | Crema | `#F6F1E4` | Nuevo |
| Texto | Tinta | `#1F2933` | 13.08:1 sobre crema |
| Texto secundario | Gris Piedra | `#4A5560` | 6.75:1 sobre crema |
| Borde de campos | Gris Borde | `#6B7280` | 4.83:1 sobre blanco |
| Error | Rojo Error | `#B3261E` | 6.54:1 sobre blanco |
| Éxito | Verde Éxito | `#2E7D32` | 5.13:1 sobre blanco |
| Deshabilitado | Fondo `#E7E2D3` / texto `#5B6670` | | 4.53:1 |

El naranja original `#BA6A23` queda solo para ilustraciones y elementos grandes (mínimo 3:1).
Ningún estado depende solo del color: siempre lleva ícono, texto o forma.

## 2. Tipografía y escala

- Títulos: **Poppins** (600/700). Cuerpo e interfaz: **Inter** (400/500/600). Fallback: `system-ui, Arial, sans-serif`.

| Nivel | px / interlínea | Peso |
|---|---|---|
| Display | 48 / 56 | Bold |
| H1 | 38 / 46 | Bold |
| H2 | 30 / 38 | SemiBold |
| H3 | 24 / 32 | SemiBold |
| H4 | 20 / 28 | SemiBold |
| Cuerpo | 16 / 24 | Regular |
| Pequeño | 14 / 20 | Regular |
| Leyenda | 12 / 16 | Medium (mínimo) |

## 3. Espaciado y retícula

- Escala (base 4 px): xs 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · 3xl 48 · 4xl 64.
- Contenedor máx. 1200 px; 4 / 8 / 12 columnas; quiebres 360 · 768 · 1024 · 1280 px.
- Radios: 8 px (botones, campos, tarjetas). Área táctil mínima: 44 × 44 px.

## 4. Estados de los componentes

| Estado | Regla |
|---|---|
| Normal | Botón primario `#24609C` con texto blanco; campo con borde `#6B7280` de 1.2 px |
| Hover | Botón en `#1B4B7C`; el secundario rellena con Arena |
| Foco | Anillo de 3 px en `#1B4B7C` con 2 px de separación blanca; nunca se quita el outline |
| Error | Borde de 2 px en `#B3261E` + ícono ! + mensaje bajo el campo (`aria-describedby`) |
| Deshabilitado | Fondo `#E7E2D3`, texto `#5B6670`, atributo `disabled`, cursor `not-allowed` |

## 5. Mapa de navegación y bosquejos

Ver el PDF adjunto (páginas 7 a 9):

1. Inicio
2. Catálogo de paquetes
3. Detalle del paquete y reserva