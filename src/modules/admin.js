import { apiClient, ApiError } from "./api/ApiClient.js";
import { consumePendingForm, getAuthSession, hasAdminAccess, redirectToLogin } from "./auth/authState.js";

const form = document.getElementById("tour-form");
const status = document.querySelector("[data-admin-status]");
const title = document.querySelector("[data-admin-title]");
const description = document.querySelector("[data-admin-description]");
const submit = document.querySelector("[data-tour-submit]");
const tourSelect = document.querySelector("[data-existing-tour]");
const refreshTours = document.querySelector("[data-refresh-tours]");
const cancelEdit = document.querySelector("[data-cancel-edit]");
const listError = document.querySelector("[data-tour-list-error]");
const tourPicker = document.querySelector(".tour-picker");
const session = getAuthSession();
let selectedTourId = new URLSearchParams(window.location.search).get("tour") || "";

function showStatus(message, isError = false) {
  status.hidden = !message;
  status.textContent = message;
  status.dataset.error = String(isError);
}

function showListError(message) {
  listError.hidden = !message;
  listError.textContent = message;
}

function clearErrors() {
  form.querySelectorAll("[data-error-for]").forEach((element) => {
    element.hidden = true;
    element.textContent = "";
  });
  form.querySelectorAll("[aria-invalid]").forEach((element) => element.removeAttribute("aria-invalid"));
}

function showFieldErrors(errors = {}) {
  Object.entries(errors).forEach(([field, messages]) => {
    const element = form.querySelector(`[data-error-for="${field}"]`);
    if (!element) return;
    element.hidden = false;
    element.textContent = Array.isArray(messages) ? messages[0] : messages;
    form.elements[field]?.setAttribute("aria-invalid", "true");
  });
}

function fillForm(tour) {
  Object.entries(tour).forEach(([field, value]) => {
    if (form.elements[field]) form.elements[field].value = value ?? "";
  });
}

function formValues() {
  return Object.fromEntries(new FormData(form));
}

function updateUrl(tourId = "") {
  const url = new URL(window.location.href);
  if (tourId) url.searchParams.set("tour", tourId);
  else url.searchParams.delete("tour");
  window.history.replaceState(null, "", url);
}

function setCreateMode({ clear = true } = {}) {
  selectedTourId = "";
  tourSelect.value = "";
  updateUrl();
  title.textContent = "Crear tour";
  description.textContent = "Gestiona los datos del tour con los permisos de administraciÃ³n.";
  submit.textContent = "Guardar tour";
  cancelEdit.hidden = true;
  clearErrors();
  if (clear) form.reset();
}

function setEditMode(tourId) {
  selectedTourId = String(tourId);
  tourSelect.value = selectedTourId;
  updateUrl(selectedTourId);
  title.textContent = "Editar tour";
  description.textContent = "Actualiza los datos del tour existente.";
  submit.textContent = "Actualizar tour";
  cancelEdit.hidden = false;
}

function addOrUpdateOption(tour) {
  const value = String(tour.id);
  let option = [...tourSelect.options].find((item) => item.value === value);
  if (!option) {
    option = document.createElement("option");
    option.value = value;
    tourSelect.append(option);
  }
  option.textContent = `${tour.nombre} (#${tour.id})`;
}

async function loadTours() {
  refreshTours.disabled = true;
  showListError("");
  try {
    const payload = await apiClient.get("tours", {
      query: { per_page: 50, sort_by: "nombre", sort_dir: "asc" },
    });
    const tours = Array.isArray(payload?.data) ? payload.data : [];
    tourSelect.innerHTML = '<option value="">Crear un tour nuevo</option>';
    tours.forEach(addOrUpdateOption);
    if (selectedTourId && tours.some((tour) => String(tour.id) === selectedTourId)) {
      tourSelect.value = selectedTourId;
    }
    if (!tours.length) showListError("No hay tours disponibles para editar.");
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      redirectToLogin({ form: formValues(), returnTo: window.location.href });
    } else if (error instanceof ApiError && error.status === 403) {
      showListError("No tienes permisos para consultar los tours.");
    } else {
      showListError("No se pudo cargar la lista de tours.");
    }
  } finally {
    refreshTours.disabled = false;
  }
}

async function selectTour(tourId) {
  if (!tourId) {
    setCreateMode();
    return;
  }

  setEditMode(tourId);
  clearErrors();
  showStatus("Cargando datos del tour…");
  try {
    const payload = await apiClient.get(`tours/${encodeURIComponent(tourId)}`);
    fillForm(payload.data || payload);
    showStatus("");
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      redirectToLogin({ form: formValues(), returnTo: window.location.href });
    } else {
      showStatus("No se pudo cargar el tour seleccionado.", true);
    }
  }
}

async function saveTour(event) {
  event.preventDefault();
  clearErrors();
  showStatus("");
  submit.disabled = true;
  submit.textContent = selectedTourId ? "Actualizando…" : "Guardando…";
  const values = formValues();
  values.categoria_id = Number(values.categoria_id);
  values.precio = Number(values.precio);
  values.duracion_horas = Number(values.duracion_horas);

  try {
    const payload = selectedTourId
      ? await apiClient.patch(`tours/${encodeURIComponent(selectedTourId)}`, values)
      : await apiClient.post("tours", values);
    const savedTour = payload.data || payload;
    fillForm(savedTour);
    addOrUpdateOption(savedTour);
    showStatus(selectedTourId ? "Tour actualizado correctamente." : "Tour creado correctamente.");
    window.dispatchEvent(new CustomEvent("tour:saved", { detail: savedTour }));
    if (!selectedTourId) setCreateMode({ clear: true });
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      redirectToLogin({ form: values, returnTo: window.location.href });
      return;
    }
    if (error instanceof ApiError && error.status === 403) {
      showStatus("No tienes permisos para administrar tours.", true);
    } else if (error instanceof ApiError && error.isValidationError) {
      showFieldErrors(error.details);
      showStatus("Revisa los errores del formulario.", true);
    } else {
      showStatus("No se pudo guardar el tour.", true);
    }
  } finally {
    submit.disabled = false;
    submit.textContent = selectedTourId ? "Actualizar tour" : "Guardar tour";
  }
}

async function init() {
  if (!session?.token) {
    redirectToLogin({ returnTo: window.location.href });
    return;
  }
  apiClient.setToken(session.token);
  if (!hasAdminAccess()) {
    showStatus("La sesiÃ³n no tiene permisos administrativos para tours.", true);
    description.textContent = "La administraciÃ³n estÃ¡ restringida por las capacidades reales de Laravel.";
    return;
  }

  tourPicker.hidden = false;
  form.hidden = false;
  const pending = consumePendingForm();
  await loadTours();
  if (selectedTourId) {
    await selectTour(selectedTourId);
  } else {
    setCreateMode({ clear: !pending?.form });
    if (pending?.form) {
      fillForm(pending.form);
      showStatus("Se recuperaron los datos del formulario.");
    }
  }
}

tourSelect.addEventListener("change", () => selectTour(tourSelect.value));
refreshTours.addEventListener("click", loadTours);
cancelEdit.addEventListener("click", () => setCreateMode());
form.addEventListener("submit", saveTour);
init();
