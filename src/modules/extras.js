/* Datos propios de cada paquete: fotos, itinerario, qué incluye, guía y punto de encuentro.
 *
 * La llave es el id del tour (el número que aparece en la URL: paquete.html?tour=3).
 * Todo es opcional: lo que no pongas se queda como está en paquete.html.
 * Las fotos pueden ser links (https://...) o archivos tuyos en src/img (img/tour3-1.jpg).
 */
export const EXTRAS = {
  // ----- Ejemplo: cambia el 1 por el id real de tu tour -----
  1: {
    fotos: [
      { src: "https://images.pexels.com/photos/6656141/pexels-photo-6656141.jpeg", alt: "Vista del volcán Arenal" },
      { src: "https://images.pexels.com/photos/10832933/pexels-photo-10832933.jpeg", alt: "Grupo en el sendero" },
      { src: "https://images.pexels.com/photos/30658685/pexels-photo-30658685.jpeg", alt: "Aguas termales" },
      { src: "https://images.pexels.com/photos/16728513/pexels-photo-16728513.jpeg", alt: "Comunidad rural" },
    ],
    itinerario: [
      ["Día 1 · Llegada y volcán", "Recepción en el punto de encuentro y caminata guiada."],
      ["Día 2 · Aguas termales", "Mañana libre y tarde de descanso."],
      ["Día 3 · Comunidad rural", "Visita a una familia local, almuerzo típico y regreso."],
    ],
    incluye: ["Guía local bilingüe", "Transporte durante el tour", "Entrada a las aguas termales"],
    guia: {
      nombre: "Timmy",
      foto: "https://media.tenor.com/cmnOLYxGICYAAAAe/timmy-mcdoodle.png",
      detalle: "Español, English · 8 años de experiencia",
    },
    encuentro: {
      texto: "Parque Central de La Fortuna",
      mapa: "https://media.es.wired.com/photos/6480bc33e1c13787dd8e3393/16:9/w_1280,c_limit/Kilauea.png",
    },
    llevar: "Ropa cómoda, calzado cerrado, traje de baño y bloqueador.",
  },

  // ----- Copia el bloque de arriba para cada tour -----
  // 2: { fotos: [...], itinerario: [...], incluye: [...], guia: {...}, encuentro: {...}, llevar: "..." },
};

const crear = (etiqueta, texto, clase) => {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  el.textContent = texto;
  return el;
};

const textoDetalle = (resumen) =>
  [...document.querySelectorAll(".info details")]
    .find((d) => d.querySelector("summary")?.textContent.trim() === resumen)
    ?.querySelector("p");

export function aplicarExtras(tourId) {
  const extra = EXTRAS[tourId];
  if (!extra) return; // sin datos propios se deja la página tal cual

  /* Galería */
  if (extra.fotos?.length) {
    const principal = document.querySelector("[data-gallery-main]");
    const lista = document.querySelector(".gallery__thumbs");
    if (principal && lista) {
      principal.src = extra.fotos[0].src;
      principal.alt = extra.fotos[0].alt || "";
      lista.replaceChildren(
        ...extra.fotos.map((foto, i) => {
          const li = document.createElement("li");
          const boton = document.createElement("button");
          boton.type = "button";
          boton.className = "gallery__thumb";
          boton.setAttribute("aria-pressed", String(i === 0));
          boton.setAttribute("aria-label", `Ver foto ${i + 1}: ${foto.alt || ""}`);
          boton.dataset.src = foto.src;
          boton.dataset.alt = foto.alt || "";
          const img = document.createElement("img");
          img.src = foto.src;
          img.alt = "";
          img.width = 200;
          img.height = 125;
          img.loading = "lazy";
          boton.append(img);
          li.append(boton);
          return li;
        }),
      );
    }
  }

  /* Itinerario */
  const pasos = document.querySelector("#tab-itinerario .steps");
  if (pasos && extra.itinerario?.length) {
    pasos.replaceChildren(
      ...extra.itinerario.map(([titulo, detalle]) => {
        const li = document.createElement("li");
        const div = document.createElement("div");
        const p1 = document.createElement("p");
        p1.append(crear("strong", titulo));
        div.append(p1, crear("p", detalle, "text-muted"));
        li.append(div);
        return li;
      }),
    );
  }

  /* Qué incluye */
  const incluye = document.querySelector("#tab-incluye .includes");
  if (incluye && extra.incluye?.length) {
    incluye.replaceChildren(...extra.incluye.map((t) => crear("li", t)));
  }

  /* Guía */
  if (extra.guia) {
    const foto = document.querySelector(".guide-card__photo");
    if (foto && extra.guia.foto) foto.src = extra.guia.foto;
    const texto = document.querySelector(".guide-card__text");
    if (texto) {
      const p1 = document.createElement("p");
      p1.append(crear("strong", `Su guía: ${extra.guia.nombre}`));
      texto.replaceChildren(p1, crear("p", extra.guia.detalle || "", "text-small text-muted"));
    }
    const oculto = document.querySelector(".guide-card .btn .visually-hidden");
    if (oculto) oculto.textContent = ` de ${extra.guia.nombre}`;
  }

  /* Punto de encuentro (mapa y texto de Información útil) */
  if (extra.encuentro) {
    const direccion = document.querySelector(".map__address");
    if (direccion) direccion.textContent = `Punto de encuentro: ${extra.encuentro.texto}`;
    const mapa = document.querySelector(".map__img");
    if (mapa && extra.encuentro.mapa) {
      mapa.src = extra.encuentro.mapa;
      mapa.alt = `Mapa del punto de encuentro: ${extra.encuentro.texto}`;
    }
    const encuentro = textoDetalle("Punto de encuentro");
    if (encuentro) encuentro.textContent = extra.encuentro.texto;
  }

  /* Qué llevar */
  if (extra.llevar) {
    const llevar = textoDetalle("Qué llevar");
    if (llevar) llevar.textContent = extra.llevar;
  }
}
