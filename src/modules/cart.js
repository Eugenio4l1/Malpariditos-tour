/* Carrito de reservas. Se guarda en el navegador (localStorage) y avisa con el evento "cart:change". */
const KEY = "malpariditos.cart";
export const MAX_PERSONAS = 10;
export const TASA_IMPUESTOS = 0.13;

function leer() {
  try {
    const datos = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardar(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* Sin almacenamiento disponible: el carrito solo vive mientras la página esté abierta. */
  }
  window.dispatchEvent(new CustomEvent("cart:change"));
}

const nuevoId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getCart = () => leer();
export const cartCount = () => leer().length;

/* Si ya existe el mismo tour con la misma fecha, se suman las personas en vez de duplicar la línea. */
export function addItem({ tourId, nombre, precio, fecha, personas, imagen = "" }) {
  const items = leer();
  const cantidad = Math.min(MAX_PERSONAS, Math.max(1, Math.floor(Number(personas)) || 1));
  const igual = items.find((i) => String(i.tourId) === String(tourId) && i.fecha === fecha);

  if (igual) {
    igual.personas = Math.min(MAX_PERSONAS, igual.personas + cantidad);
    igual.precio = Number(precio) || 0;
  } else {
    items.push({ id: nuevoId(), tourId, nombre, precio: Number(precio) || 0, fecha, personas: cantidad, imagen });
  }
  guardar(items);
}

export function setPersonas(id, personas) {
  const items = leer();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  item.personas = Math.min(MAX_PERSONAS, Math.max(1, Math.floor(Number(personas)) || 1));
  guardar(items);
}

export function removeItem(id) {
  guardar(leer().filter((i) => i.id !== id));
}

export function clearCart() {
  guardar([]);
}

export function calcular(items = leer()) {
  const subtotal = items.reduce((suma, i) => suma + i.precio * i.personas, 0);
  const impuestos = Math.round(subtotal * TASA_IMPUESTOS);
  return { subtotal, impuestos, total: subtotal + impuestos };
}