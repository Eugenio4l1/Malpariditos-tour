/* Pantalla de detalle: galería, pestañas, hoja de reserva (móvil) y formulario de reserva. */

const desktop = window.matchMedia("(min-width: 64em)");

/* ---------- Galería ---------- */
/* ---------- Galería ---------- */
const galleryMain = document.querySelector("[data-gallery-main]");
const thumbs = document.querySelectorAll(".gallery__thumb");

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    thumbs.forEach((t) => t.setAttribute("aria-pressed", String(t === thumb)));
    galleryMain.src = thumb.dataset.src;
    galleryMain.alt = thumb.dataset.alt;
  });
});
/* ---------- Pestañas (patrón WAI-ARIA: flechas, Inicio y Fin) ---------- */
const tabsBox = document.querySelector("[data-tabs]");

if (tabsBox) {
  const list = tabsBox.querySelector(".tabs__list");
  const links = [...list.querySelectorAll("a")];
  const panels = links.map((a) => document.getElementById(a.hash.slice(1)));
  const tabs = [];

  list.setAttribute("role", "tablist");

  links.forEach((link, i) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "tabs__tab";
    tab.id = `pestana-${i}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[i].id);
    tab.textContent = link.textContent;
    link.parentElement.setAttribute("role", "presentation");
    link.replaceWith(tab);
    tabs.push(tab);

    panels[i].setAttribute("role", "tabpanel");
    panels[i].setAttribute("aria-labelledby", tab.id);
    panels[i].tabIndex = 0;
    panels[i].querySelector("h2").classList.add("visually-hidden");
  });

  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (ev) => {
      const last = tabs.length - 1;
      const moves = {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowLeft: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      };
      if (ev.key in moves) {
        ev.preventDefault();
        select(moves[ev.key], true);
      }
    });
  });

  select(0);
}

/* ---------- Hoja de reserva (solo móvil y tableta) ---------- */
const booking = document.getElementById("reserva");
const openBtn = document.querySelector("[data-booking-open]");
const closeBtn = document.querySelector("[data-booking-close]");
const backdrop = document.querySelector("[data-booking-backdrop]");

const focusables = () =>
  [...booking.querySelectorAll("button, input, a[href], summary")].filter(
    (el) => !el.disabled && el.offsetParent !== null
  );

const openSheet = () => {
  if (desktop.matches) return;
  booking.classList.add("is-open");
  booking.setAttribute("role", "dialog");
  booking.setAttribute("aria-modal", "true");
  backdrop.hidden = false;
  document.body.classList.add("sheet-open");
  openBtn.setAttribute("aria-expanded", "true");
  booking.focus();
};

const closeSheet = (returnFocus = true) => {
  booking.classList.remove("is-open");
  booking.removeAttribute("role");
  booking.removeAttribute("aria-modal");
  backdrop.hidden = true;
  document.body.classList.remove("sheet-open");
  openBtn.setAttribute("aria-expanded", "false");
  if (returnFocus) openBtn.focus();
};

if (booking && openBtn) {
  openBtn.addEventListener("click", openSheet);
  closeBtn.addEventListener("click", () => closeSheet());
  backdrop.addEventListener("click", () => closeSheet());

  document.addEventListener("keydown", (ev) => {
    if (!booking.classList.contains("is-open")) return;

    if (ev.key === "Escape") {
      closeSheet();
      return;
    }

    if (ev.key === "Tab") {
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (ev.shiftKey && (document.activeElement === first || document.activeElement === booking)) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    }
  });

  desktop.addEventListener("change", () => {
    if (desktop.matches) closeSheet(false);
  });

  if (location.hash === "#reserva") openSheet();
}

/* ---------- Formulario de reserva ---------- */
const form = document.getElementById("form-reserva");

if (form) {
  const date = form.elements.fecha;
  const people = form.elements.personas;
  const price = Number(form.dataset.price);
  const taxRate = Number(form.dataset.tax);
  const status = form.querySelector(".booking__status");
  const money = (n) => `$${n.toLocaleString("en-US")}`;

  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  date.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const messages = {
    fecha: {
      valueMissing: "Seleccione una fecha disponible.",
      badInput: "Escriba una fecha válida, por ejemplo 15/11/2026.",
      rangeUnderflow: "La fecha debe ser hoy o posterior.",
    },
    personas: {
      valueMissing: "Indique cuántas personas viajan.",
      badInput: "Escriba un número de personas.",
      rangeUnderflow: "Debe viajar al menos 1 persona.",
      rangeOverflow: "El máximo es de 10 personas por reserva.",
    },
  };

  const showError = (input) => {
    const box = document.getElementById(`${input.name}-error`);
    const text = box.querySelector("[data-error-text]");
    const v = input.validity;
    const key = Object.keys(messages[input.name]).find((k) => v[k]);

    if (key) {
      text.textContent = messages[input.name][key];
      box.hidden = false;
      input.setAttribute("aria-invalid", "true");
    } else {
      text.textContent = "";
      box.hidden = true;
      input.removeAttribute("aria-invalid");
    }
  };

  const updateTotal = () => {
    const n = Math.min(10, Math.max(0, Math.floor(people.valueAsNumber) || 0));
    const subtotal = n * price;
    const taxes = Math.round(subtotal * taxRate);
    form.querySelector("[data-people-label]").textContent =
      `${n} ${n === 1 ? "persona" : "personas"} × ${money(price)}`;
    form.querySelector("[data-subtotal]").textContent = money(subtotal);
    form.querySelector("[data-taxes]").textContent = money(taxes);
    form.querySelector("[data-total]").textContent = money(subtotal + taxes);
  };

  /* El evento "invalid" lo dispara la validación nativa; mostramos nuestro mensaje en lugar del globo del navegador. */
  let focusedOnce = false;
  form.addEventListener("invalid", (ev) => {
    ev.preventDefault();
    showError(ev.target);
    if (!focusedOnce) {
      focusedOnce = true;
      ev.target.focus();
      setTimeout(() => { focusedOnce = false; });
    }
  }, true);

  [date, people].forEach((input) => {
    input.addEventListener("input", () => {
      status.hidden = true;
      if (input.hasAttribute("aria-invalid")) showError(input);
      if (input === people) updateTotal();
    });
    input.addEventListener("change", () => showError(input));
  });

  form.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (Number.isNaN(people.valueAsNumber)) people.value = "1";
      else if (btn.dataset.step === "1") people.stepUp();
      else people.stepDown();
      people.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    status.textContent = "Todo listo. Para confirmar la reserva se le pedirá ingresar o crear su usuario.";
    status.hidden = false;
  });

  /* Para la captura del estado de error: paquete.html#error-fecha */
  if (location.hash === "#error-fecha") {
    form.requestSubmit();
  }

  updateTotal();
}

/* ---------- Guardar y Compartir ---------- */
const saveBtn = document.querySelector("[data-save]");
const shareBtn = document.querySelector("[data-share]");

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const on = saveBtn.getAttribute("aria-pressed") !== "true";
    saveBtn.setAttribute("aria-pressed", String(on));
    saveBtn.textContent = on ? "Guardado" : "Guardar";
  });
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(location.href);
      shareBtn.textContent = navigator.share ? "Compartir" : "Enlace copiado";
    } catch {
      /* La persona canceló o el navegador no lo permite: no pasa nada. */
    }
  });
}