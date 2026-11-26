/* Página del carrito: lista de reservas, cambio de personas, quitar y resumen. */
import { getCart, setPersonas, removeItem, clearCart, calcular, MAX_PERSONAS } from "./cart.js";
import { isAuthenticated, getAuthSession, redirectToLogin } from "./auth/authState.js";
import { apiClient, ApiError } from "./api/ApiClient.js";

const formatoPrecio = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });
const colones = (n) => `₡${formatoPrecio.format(Number(n) || 0)}`;

function fechaCorta(iso) {
  const [anio, mes, dia] = String(iso).split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : String(iso || "");
}

const lista = document.getElementById("carrito-lista");
const vacio = document.getElementById("carrito-vacio");
const resumen = document.getElementById("carrito-resumen");
const estado = document.getElementById("carrito-estado");
const confirmacion = document.getElementById("carrito-confirmacion");
const botonContinuar = document.getElementById("carrito-continuar");

const crear = (etiqueta, clase, texto) => {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
};

function botonPersonas(item, accion, simbolo, etiqueta, deshabilitado) {
  const boton = crear("button", "btn btn--secondary cart-qty__btn", simbolo);
  boton.type = "button";
  boton.disabled = deshabilitado;
  boton.dataset.id = item.id;
  boton.dataset.accion = accion;
  boton.setAttribute("aria-label", `${etiqueta} (${item.nombre})`);
  boton.addEventListener("click", () => {
    setPersonas(item.id, item.personas + (accion === "mas" ? 1 : -1)); // vuelve a pintar con "cart:change"
    [...lista.querySelectorAll("[data-accion]")]
      .find((b) => b.dataset.id === item.id && b.dataset.accion === accion && !b.disabled)
      ?.focus();
  });
  return boton;
}

function pintarItem(item) {
  const li = crear("li", "cart-item");

  if (item.imagen) {
    const img = crear("img", "cart-item__img");
    img.src = item.imagen;
    img.alt = "";
    img.width = 96;
    img.height = 72;
    img.loading = "lazy";
    li.append(img);
  }

  const cuerpo = crear("div", "cart-item__body");
  const titulo = crear("p", "cart-item__title");
  if (item.tourId && item.tourId !== "ejemplo") {
    const enlace = crear("a", "", item.nombre);
    enlace.href = `paquete.html?tour=${encodeURIComponent(item.tourId)}`;
    titulo.append(enlace);
  } else {
    titulo.textContent = item.nombre;
  }

  const fecha = crear("p", "text-small text-muted", `Fecha: ${fechaCorta(item.fecha)}`);
  const unitario = crear("p", "text-small text-muted", `${colones(item.precio)} por persona`);

  const cantidad = crear("div", "cart-qty");
  const numero = crear("span", "cart-qty__value", `${item.personas} ${item.personas === 1 ? "persona" : "personas"}`);
  cantidad.append(
    botonPersonas(item, "menos", "−", "Quitar una persona", item.personas <= 1),
    numero,
    botonPersonas(item, "mas", "+", "Agregar una persona", item.personas >= MAX_PERSONAS),
  );

  cuerpo.append(titulo, fecha, unitario, cantidad);

  const lado = crear("div", "cart-item__side");
  lado.append(crear("p", "cart-item__total", colones(item.precio * item.personas)));
  const quitar = crear("button", "btn btn--secondary", "Quitar");
  quitar.type = "button";
  quitar.setAttribute("aria-label", `Quitar ${item.nombre} del carrito`);
  quitar.addEventListener("click", () => removeItem(item.id));
  lado.append(quitar);

  li.append(cuerpo, lado);
  return li;
}

function pintar() {
  const items = getCart();
  lista.replaceChildren(...items.map(pintarItem));
  vacio.hidden = items.length > 0;
  resumen.hidden = items.length === 0;
  estado.hidden = true;

  const { subtotal, impuestos, total } = calcular(items);
  document.getElementById("carrito-subtotal").textContent = colones(subtotal);
  document.getElementById("carrito-impuestos").textContent = colones(impuestos);
  document.getElementById("carrito-total").textContent = colones(total);
}

document.getElementById("carrito-vaciar")?.addEventListener("click", () => {
  if (window.confirm("¿Quitar todas las reservas del carrito?")) clearCart();
});

/* ---------- Continuar con la reserva: guarda cada línea del carrito en la base de datos (POST /api/reservas) ---------- */
const hoyISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function mensajeDeError(error) {
  if (!(error instanceof ApiError)) return "Ocurrió un error inesperado.";
  if (error.isConnectionError) return "No se pudo conectar con el servidor. Intenta de nuevo en un momento.";
  if (error.status === 403) return "Tu cuenta no puede crear reservas. Ingresa con una cuenta de cliente.";
  if (error.isValidationError && error.details) {
    const primero = Object.values(error.details)[0];
    return Array.isArray(primero) ? primero[0] : String(primero);
  }
  return error.message;
}

async function reservarItem(item, clienteId) {
  if (!item.tourId || item.tourId === "ejemplo") {
    throw new ApiError("Este paquete es solo de ejemplo y no se puede reservar.");
  }
  const cuerpo = {
    tour_id: Number(item.tourId),
    fecha: item.fecha, // AAAA-MM-DD: el servidor busca (o programa) la salida de ese día
    cantidad_personas: item.personas,
    fecha_reserva: hoyISO(),
  };
  if (clienteId) cuerpo.cliente_id = clienteId; // el servidor igual usa el cliente de la sesión
  return apiClient.post("reservas", cuerpo);
}

function mostrarResultado({ creadas, fallidas }) {
  const partes = [];

  if (creadas.length) {
    const p = crear("p", "cart-result__ok",
      creadas.length === 1
        ? "¡Reserva registrada! Quedó en estado pendiente."
        : `¡${creadas.length} reservas registradas! Quedaron en estado pendiente.`);
    partes.push(p);
  }

  if (fallidas.length) {
    partes.push(crear("p", "cart-result__error",
      fallidas.length === 1 ? "No se pudo reservar este paquete:" : "No se pudieron reservar estos paquetes:"));
    const ul = crear("ul", "cart-result__list");
    fallidas.forEach(({ item, mensaje }) => ul.append(crear("li", "", `${item.nombre} (${fechaCorta(item.fecha)}): ${mensaje}`)));
    partes.push(ul);
    partes.push(crear("p", "text-small", "Siguen en tu carrito para que puedas corregirlos y volver a intentar."));
  }

  confirmacion.replaceChildren(...partes);
  confirmacion.dataset.error = String(fallidas.length > 0);
  confirmacion.hidden = false;
  confirmacion.scrollIntoView({ block: "nearest" });
}

let enviando = false;

botonContinuar?.addEventListener("click", async () => {
  if (enviando) return;

  if (!isAuthenticated()) {
    redirectToLogin({ returnTo: window.location.href });
    return;
  }

  const items = getCart();
  if (items.length === 0) return;

  enviando = true;
  botonContinuar.disabled = true;
  botonContinuar.textContent = "Reservando…";
  confirmacion.hidden = true;

  const clienteId = getAuthSession()?.usuario?.cliente_id;
  const creadas = [];
  const fallidas = [];
  let sesionVencida = false;

  for (const item of items) { // una por una, para saber cuál falló
    try {
      await reservarItem(item, clienteId);
      creadas.push(item);
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        sesionVencida = true;
        break;
      }
      fallidas.push({ item, mensaje: mensajeDeError(error) });
    }
  }

  creadas.forEach((item) => removeItem(item.id)); // lo reservado sale del carrito
  enviando = false;
  botonContinuar.disabled = false;
  botonContinuar.textContent = "Continuar con la reserva";

  if (sesionVencida) {
    if (creadas.length) mostrarResultado({ creadas, fallidas });
    redirectToLogin({ returnTo: window.location.href });
    return;
  }

  mostrarResultado({ creadas, fallidas });
});

window.addEventListener("cart:change", pintar);
window.addEventListener("storage", pintar); // cambios hechos desde otra pestaña
pintar();