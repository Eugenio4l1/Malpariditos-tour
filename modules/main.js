import { initCatalogo } from "./views/catalogo.js";

const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("menu-principal");

const setMenu = (open) => {
  menu.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
};

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });
}

const filterToggle = document.querySelector(".filter-toggle");
const filtersForm = document.getElementById("filtros");

if (filterToggle && filtersForm) {
  filterToggle.addEventListener("click", () => {
    const open = filtersForm.classList.toggle("is-open");
    filterToggle.setAttribute("aria-expanded", String(open));
  });
}

const rangeBox = document.querySelector(".range");
const rangeMin = document.getElementById("precio-min");
const rangeMax = document.getElementById("precio-max");

const paintRange = () => {
  const start = Number(rangeMax.min);
  const total = Number(rangeMax.max) - start;
  const from = ((Number(rangeMin.value) - start) / total) * 100;
  const to = ((Number(rangeMax.value) - start) / total) * 100;
  rangeBox.style.setProperty("--range-from", `${from}%`);
  rangeBox.style.setProperty("--range-to", `${to}%`);
  rangeMin.style.zIndex = Number(rangeMin.value) > total / 2 ? "2" : "1";
};

if (rangeBox && rangeMin && rangeMax) {
  rangeMin.addEventListener("input", () => {
    if (Number(rangeMin.value) > Number(rangeMax.value)) rangeMin.value = rangeMax.value;
    paintRange();
  });

  rangeMax.addEventListener("input", () => {
    if (Number(rangeMax.value) < Number(rangeMin.value)) rangeMax.value = rangeMin.value;
    paintRange();
  });

  paintRange();
}

const clearButton = document.querySelector("[data-clear-filters]");

if (clearButton && filtersForm) {
  clearButton.addEventListener("click", (ev) => {
    ev.preventDefault();
    filtersForm.querySelectorAll('input[type="checkbox"]').forEach((box) => { box.checked = false; });
    filtersForm.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; });
    filtersForm.querySelectorAll('input[type="date"]').forEach((input) => { input.value = ""; });
    if (rangeMin && rangeMax) {
      rangeMin.value = rangeMin.min;
      rangeMax.value = rangeMax.max;
      paintRange();
    }
  });
}

const sortSelect = document.getElementById("orden");

if (sortSelect) {
  sortSelect.addEventListener("change", () => sortSelect.form.requestSubmit());
}

initCatalogo();
