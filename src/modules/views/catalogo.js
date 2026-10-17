import { apiClient } from "../api/ApiClient.js";
import { setTourState, subscribeToTourState } from "../state/tourState.js";

const elements = {
  count: document.querySelector("[data-catalog-count]"),
  search: document.getElementById("catalog-search"),
  searchInput: document.getElementById("catalog-search-input"),
  list: document.querySelector(".card-grid"),
  pagination: document.querySelector(".pagination"),
  empty: document.getElementById("sin-resultados"),
};

let currentController = null;
let searchTimer = null;
let requestSequence = 0;
const fallbackImages = [
  "https://images.pexels.com/photos/39402239/pexels-photo-39402239.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/11032583/pexels-photo-11032583.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/14624137/pexels-photo-14624137.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/30603643/pexels-photo-30603643.jpeg?auto=compress&cs=tinysrgb&w=600",
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function getCategoryName(tour) {
  return tour.categoria?.nombre || (tour.categoria_id ? `Categoría ${tour.categoria_id}` : "Tour");
}

function renderCard(tour, index) {
  const name = escapeHtml(tour.nombre || "Tour sin nombre");
  const category = escapeHtml(getCategoryName(tour));
  const description = tour.descripcion ? escapeHtml(tour.descripcion) : "Experiencia turística en Costa Rica.";
  return `<li>
    <article class="card">
      <div class="card__media">
        <span class="badge">${category}</span>
        <img class="card__img" src="${fallbackImages[index % fallbackImages.length]}" alt="" width="600" height="450" loading="lazy" decoding="async">
      </div>
      <div class="card__body">
        <h3>${name}</h3>
        <p class="card__place">${description}</p>
        <p class="text-small text-muted">${escapeHtml(tour.duracion_horas)} horas · ${escapeHtml(tour.estado)}</p>
        <div class="card__footer">
          <p class="price"><span class="price__from">Desde</span> ₡${formatPrice(tour.precio)}</p>
          <a class="btn btn--primary" href="paquete.html?tour=${encodeURIComponent(tour.id)}">Ver paquete<span class="visually-hidden">: ${name}</span></a>
        </div>
      </div>
    </article>
  </li>`;
}

function renderPagination(page, lastPage) {
  const links = [];
  links.push(`<li><button class="pagination__link" type="button" data-page="${page - 1}" aria-label="Página anterior" ${page <= 1 ? "disabled" : ""}>‹</button></li>`);
  for (let pageNumber = 1; pageNumber <= lastPage; pageNumber += 1) {
    links.push(`<li><button class="pagination__link" type="button" data-page="${pageNumber}" ${pageNumber === page ? 'aria-current="page"' : ""}>${pageNumber}</button></li>`);
  }
  links.push(`<li><button class="pagination__link" type="button" data-page="${page + 1}" aria-label="Página siguiente" ${page >= lastPage ? "disabled" : ""}>›</button></li>`);
  elements.pagination.innerHTML = links.join("");
}

function renderError(error) {
  const message = error.isUnauthorized
    ? "Necesitas iniciar sesión para consultar este catálogo."
    : error.isValidationError
      ? "Los parámetros de consulta no son válidos."
      : error.isConnectionError
        ? "No se pudo conectar con Laravel."
        : "No se pudo cargar el catálogo.";
  elements.list.innerHTML = `<li class="catalog-message"><p>${message}</p><button class="btn btn--primary" type="button" data-retry>Reintentar</button></li>`;
  elements.pagination.innerHTML = "";
}

function render(state) {
  elements.empty.hidden = state.status !== "empty";
  elements.list.hidden = state.status === "empty";
  elements.pagination.hidden = state.status !== "success";
  if (elements.count) {
    elements.count.textContent = state.status === "loading"
      ? "Cargando paquetes…"
      : state.status === "error"
        ? "No se pudo cargar el catálogo."
        : `${state.total} paquetes encontrados`;
  }

  if (state.status === "loading") {
    elements.list.innerHTML = '<li class="catalog-message" aria-live="polite"><p>Cargando paquetes…</p></li>';
  } else if (state.status === "empty") {
    elements.list.innerHTML = "";
    elements.pagination.innerHTML = "";
  } else if (state.status === "error") {
    renderError(state.error);
  } else if (state.status === "success") {
    elements.list.innerHTML = state.tours.map(renderCard).join("");
    renderPagination(state.page, state.lastPage);
  }
}

async function loadTours(page = 1, search = elements.searchInput?.value.trim() || "") {
  const sequence = ++requestSequence;
  currentController?.abort();
  currentController = new AbortController();
  setTourState({ status: "loading", error: null, page });
  try {
    const payload = await apiClient.get("tours", {
      signal: currentController.signal,
      query: { page, per_page: 6, sort_by: "created_at", sort_dir: "desc", buscar: search },
    });
    const meta = payload?.meta || {};
    const tours = Array.isArray(payload?.data) ? payload.data : [];
    if (sequence !== requestSequence) return;
    setTourState({
      status: tours.length ? "success" : "empty",
      tours,
      page: Number(meta.current_page || page),
      lastPage: Number(meta.last_page || 1),
      total: Number(meta.total || tours.length),
    });
  } catch (error) {
    if (!error.isCancelled && sequence === requestSequence) setTourState({ status: "error", error });
  }
}

export function initCatalogo() {
  if (!elements.list || !elements.pagination || !elements.empty) return;
  const initialSearch = new URLSearchParams(window.location.search).get("buscar") || "";
  if (elements.searchInput) elements.searchInput.value = initialSearch;
  subscribeToTourState(render);
  elements.search?.addEventListener("submit", (event) => event.preventDefault());
  elements.searchInput?.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => loadTours(1), 300);
  });
  elements.pagination.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (button && !button.disabled) loadTours(Number(button.dataset.page));
  });
  elements.list.addEventListener("click", (event) => {
    if (event.target.matches("[data-retry]")) loadTours();
  });
  loadTours();
}
