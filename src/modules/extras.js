/* Datos propios de cada paquete: fotos, itinerario, qué incluye, guía y punto de encuentro.
 *
 * La llave de EXTRAS es el id del tour (el número de la URL: paquete.html?tour=3).
 * Todo es opcional: lo que no pongas se queda como está en paquete.html.
 *
 * FOTOS: guarda tus imágenes en src/img/ con los nombres que se indican abajo
 * (por ejemplo img/tirolesa-1.jpg ... img/tirolesa-4.jpg) y cambia
 * USAR_FOTOS_PROPIAS a true. Mientras esté en false se ven las fotos de paquete.html.
 */
const USAR_FOTOS_PROPIAS = false;

const fotos = (slug, ...alts) =>
  USAR_FOTOS_PROPIAS
    ? alts.map((alt, i) => ({ src: `img/${slug}-${i + 1}.jpg`, alt }))
    : undefined;

const TIMMY = "https://media.tenor.com/cmnOLYxGICYAAAAe/timmy-mcdoodle.png";

/* ---------- Una plantilla por actividad ---------- */
const PLANTILLAS = {
  tirolesa: {
    fotos: fotos("tirolesa", "Cables de tirolesa sobre el bosque nuboso", "Bosque nuboso entre la neblina", "Grupo con arneses antes de salir", "Vista desde la plataforma"),
    itinerario: [
      ["Recepción y equipo", "Llegada al punto de encuentro, entrega de arnés y casco."],
      ["Charla de seguridad", "El guía explica la técnica y los cables a recorrer."],
      ["Circuito de tirolesas", "Recorrido por los cables entre las copas de los árboles."],
      ["Caminata y regreso", "Paseo corto por el bosque y retorno al punto de salida."],
    ],
    incluye: ["Guía certificado", "Arnés, casco y guantes", "Seguro de actividad", "Fotos del grupo"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Seguridad en alturas" },
    encuentro: { texto: "Parque Central de Santa Elena, Monteverde" },
    llevar: "Ropa cómoda, calzado cerrado, chaqueta ligera por la neblina y cámara con correa.",
  },

  rafting: {
    fotos: fotos("rafting", "Balsa bajando los rápidos", "Grupo remando en el río", "Tramo tranquilo entre la selva", "Equipo de rafting listo"),
    itinerario: [
      ["Recepción y equipo", "Entrega de chaleco, casco y remo."],
      ["Instrucciones en la orilla", "Técnica de remado y qué hacer si alguien cae al agua."],
      ["Descenso por el río", "Rápidos y tramos tranquilos para ver la selva."],
      ["Refrigerio y regreso", "Descanso, algo de comer y transporte de vuelta."],
    ],
    incluye: ["Guía de río certificado", "Chaleco, casco y remo", "Transporte al punto de salida", "Refrigerio"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Rescate en aguas rápidas" },
    encuentro: { texto: "Plaza de Puerto Viejo de Sarapiquí" },
    llevar: "Traje de baño, sandalias sujetas al pie, ropa de cambio, bloqueador y toalla.",
  },

  arenal: {
    fotos: fotos("arenal", "Vista del volcán Arenal", "Sendero entre la vegetación", "Grupo caminando con el guía", "Paisaje desde el mirador"),
    itinerario: [
      ["Recepción", "Encuentro en el punto de salida y repaso de la ruta."],
      ["Caminata al volcán", "Ascenso guiado por el sendero, con paradas para fotos."],
      ["Mirador", "Descanso y explicación de la historia del volcán."],
      ["Regreso", "Descenso por la misma ruta y transporte de vuelta."],
    ],
    incluye: ["Guía local bilingüe", "Transporte durante el tour", "Agua y snack", "Entrada al parque"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Senderismo de montaña" },
    encuentro: { texto: "Parque Central de La Fortuna" },
    llevar: "Calzado de caminata, ropa cómoda, impermeable, gorra, bloqueador y agua.",
  },

  aves: {
    fotos: fotos("aves", "Ave posada en una rama al amanecer", "Grupo observando con binoculares", "Sendero del bosque temprano", "Colibrí en pleno vuelo"),
    itinerario: [
      ["Salida antes del amanecer", "Encuentro con el guía y café para despertar."],
      ["Caminata de observación", "Recorrido en silencio para escuchar e identificar aves."],
      ["Identificación con el guía", "Uso de binoculares y guía de campo."],
      ["Desayuno y regreso", "Desayuno típico y cierre de la jornada."],
    ],
    incluye: ["Guía especializado en aves", "Binoculares compartidos", "Café y desayuno", "Lista de especies vistas"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Observación de aves" },
    encuentro: { texto: "Entrada principal de la reserva (se confirma al reservar)" },
    llevar: "Ropa de colores neutros, calzado cerrado, repelente, gorra y binoculares propios si tiene.",
  },

  cascadas: {
    fotos: fotos("cascadas", "Cascada entre la vegetación", "Sendero hacia las cascadas", "Poza natural de agua clara", "Grupo junto a la caída de agua"),
    itinerario: [
      ["Recepción y ruta", "Encuentro y explicación del recorrido y las precauciones."],
      ["Caminata por el sendero", "Trayecto entre el bosque hasta las primeras cascadas."],
      ["Tiempo en las pozas", "Fotos y tiempo libre para refrescarse donde sea seguro."],
      ["Regreso", "Retorno al punto de salida."],
    ],
    incluye: ["Guía local", "Transporte durante el tour", "Agua", "Seguro de actividad"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Rutas de naturaleza" },
    encuentro: { texto: "Entrada del sendero (se confirma al reservar)" },
    llevar: "Traje de baño, calzado antideslizante, ropa de cambio, toalla y bolsa para cosas mojadas.",
  },

  kayak: {
    fotos: fotos("kayak", "Kayaks entre los manglares", "Canal de agua rodeado de raíces", "Pareja remando al atardecer", "Aves sobre los manglares"),
    itinerario: [
      ["Recepción y equipo", "Entrega de chaleco y remos, y práctica en la orilla."],
      ["Remo por los canales", "Recorrido tranquilo entre raíces de mangle."],
      ["Observación de fauna", "Pausas para ver aves, cangrejos y otros animales."],
      ["Regreso al muelle", "Retorno y cierre de la actividad."],
    ],
    incluye: ["Guía naturalista", "Kayak, remo y chaleco", "Agua", "Seguro de actividad"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Kayak y manglares" },
    encuentro: { texto: "Muelle principal (se confirma al reservar)" },
    llevar: "Ropa que se pueda mojar, sandalias sujetas, bloqueador, repelente, gorra y cámara resistente al agua.",
  },

  snorkel: {
    fotos: fotos("snorkel", "Playa de arena clara", "Peces de colores bajo el agua", "Embarcación hacia la isla", "Grupo con equipo de snorkel"),
    itinerario: [
      ["Salida en embarcación", "Encuentro en el muelle y traslado hacia la isla."],
      ["Instrucciones de snorkel", "Uso de máscara y tubo, y normas de seguridad."],
      ["Snorkel en la isla", "Exploración de los arrecifes con el guía."],
      ["Almuerzo y playa", "Tiempo libre en la playa y regreso en lancha."],
    ],
    incluye: ["Guía de snorkel", "Transporte en lancha", "Máscara, tubo y chaleco", "Almuerzo"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Buceo y snorkel" },
    encuentro: { texto: "Muelle de Puntarenas" },
    llevar: "Traje de baño, toalla, bloqueador biodegradable, sombrero y ropa de cambio.",
  },

  gastronomica: {
    fotos: fotos("gastronomica", "Platillos típicos costarricenses", "Mercado local con productos frescos", "Café recién servido", "Grupo degustando en un restaurante"),
    itinerario: [
      ["Recepción", "Encuentro con el guía y presentación de la ruta."],
      ["Mercado local", "Recorrido por puestos con productos y sabores del país."],
      ["Degustaciones", "Paradas para probar platillos típicos y café."],
      ["Cierre dulce", "Postre y despedida."],
    ],
    incluye: ["Guía local", "Degustaciones en cada parada", "Bebidas", "Mapa de la ruta"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Gastronomía local" },
    encuentro: { texto: "Parque Central, San José" },
    llevar: "Calzado cómodo para caminar, ganas de probar de todo y aviso previo de alergias o dietas.",
  },

  nocturno: {
    fotos: fotos("nocturno", "Sendero iluminado por linterna", "Rana de ojos rojos sobre una hoja", "Grupo en el bosque de noche", "Insectos nocturnos en una rama"),
    itinerario: [
      ["Recepción al anochecer", "Charla de seguridad y entrega de linternas."],
      ["Caminata nocturna", "Recorrido guiado en busca de animales nocturnos."],
      ["Observación", "Paradas para ver ranas, insectos y otros animales."],
      ["Regreso", "Retorno al punto de salida."],
    ],
    incluye: ["Guía naturalista", "Linterna", "Agua", "Seguro de actividad"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Fauna nocturna" },
    encuentro: { texto: "Entrada del refugio (se confirma al reservar)" },
    llevar: "Calzado cerrado, pantalón largo, repelente, chaqueta ligera y linterna de repuesto.",
  },

  caballo: {
    fotos: fotos("caballo", "Jinetes cabalgando por la playa", "Caballos en la orilla del mar", "Atardecer sobre la costa", "Sendero costero a caballo"),
    itinerario: [
      ["Recepción y caballos", "Presentación de los caballos y asignación según experiencia."],
      ["Instrucciones básicas", "Cómo montar, guiar y detenerse con seguridad."],
      ["Cabalgata por la costa", "Recorrido al paso por la playa y senderos cercanos."],
      ["Pausa y regreso", "Descanso con vista al mar y vuelta al punto de partida."],
    ],
    incluye: ["Guía a caballo", "Caballo y equipo de montar", "Casco", "Agua"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Cabalgatas" },
    encuentro: { texto: "Entrada de la playa (se confirma al reservar)" },
    llevar: "Pantalón largo, calzado cerrado, bloqueador, sombrero y ropa de cambio.",
  },

  historico: {
    fotos: fotos("historico", "Fachadas coloniales del casco antiguo", "Plaza con edificios históricos", "Guía explicando frente a un monumento", "Calle empedrada del centro"),
    itinerario: [
      ["Recepción", "Encuentro con el guía y presentación del recorrido."],
      ["Plazas y edificios", "Visita a los puntos históricos más importantes."],
      ["Historias del lugar", "Relatos y curiosidades de cada parada."],
      ["Cierre", "Pausa para café y despedida."],
    ],
    incluye: ["Guía historiador local", "Transporte durante el tour", "Entradas a los sitios del recorrido", "Mapa histórico"],
    guia: { nombre: "Timmy", foto: TIMMY, detalle: "Español, English · Historia y patrimonio" },
    encuentro: { texto: "Teatro Nacional, San José" },
    llevar: "Calzado cómodo, ropa fresca, gorra, bloqueador y agua.",
  },
};

/* ---------- Cada id de la base de datos apunta a su plantilla ---------- */
export const EXTRAS = {
  1: PLANTILLAS.tirolesa,     // Aventura en Tirolesa por el Bosque Nuboso
  2: PLANTILLAS.tirolesa,     // Aventura en Tirolesa por el Bosque Nuboso
  3: PLANTILLAS.rafting,      // Rafting en Río Sarapiquí
  4: PLANTILLAS.arenal,       // Caminata al Volcán Arenal
  5: PLANTILLAS.aves,         // Avistamiento de Aves al Amanecer
  6: PLANTILLAS.cascadas,     // Excursión a Cascadas Escondidas
  7: PLANTILLAS.kayak,        // Paseo en Kayak por Manglares
  8: PLANTILLAS.rafting,      // Rafting en Río Sarapiquí
  9: PLANTILLAS.snorkel,      // Tour de Snorkel en Isla Tortuga
  10: PLANTILLAS.rafting,     // Rafting en Río Sarapiquí
  11: PLANTILLAS.gastronomica, // Ruta Gastronómica Local
  12: PLANTILLAS.cascadas,    // Excursión a Cascadas Escondidas
  13: PLANTILLAS.nocturno,    // Tour Nocturno de Vida Silvestre
  14: PLANTILLAS.caballo,     // Paseo a Caballo por la Costa
  15: PLANTILLAS.gastronomica, // Ruta Gastronómica Local
  16: PLANTILLAS.snorkel,     // Tour de Snorkel en Isla Tortuga
  17: PLANTILLAS.arenal,      // Caminata al Volcán Arenal
  18: PLANTILLAS.snorkel,     // Tour de Snorkel en Isla Tortuga
  19: PLANTILLAS.caballo,     // Paseo a Caballo por la Costa
  20: PLANTILLAS.historico,   // Recorrido Histórico por el Casco Antiguo
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
