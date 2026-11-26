/* Página del carrito: lista de reservas, cambio de personas, quitar y resumen. */
import { getCart, setPersonas, removeItem, clearCart, calcular, MAX_PERSONAS } from "./cart.js";
import { isAuthenticated, redirectToLogin } from "./auth/authState.js";

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

document.getElementById("carrito-continuar")?.addEventListener("click", () => {
  if (!isAuthenticated()) {
    redirectToLogin({ returnTo: window.location.href });
    return;
  }
  estado.textContent = "Tu carrito está listo. La confirmación final de las reservas todavía no está habilitada.";
  estado.hidden = false;
});

window.addEventListener("cart:change", pintar);
window.addEventListener("storage", pintar); // cambios hechos desde otra pestaña
pintar();