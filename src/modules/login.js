import { apiClient, ApiError } from "./api/ApiClient.js";
import { getPendingForm, setAuthSession } from "./auth/authState.js";

const form = document.getElementById("login-form");
const status = document.querySelector("[data-login-status]");
const submit = document.querySelector("[data-login-submit]");
const pending = getPendingForm();

function clearErrors() {
  form.querySelectorAll("[data-error-for]").forEach((element) => {
    element.hidden = true;
    element.textContent = "";
  });
}

function showStatus(message, isError = false) {
  status.hidden = !message;
  status.textContent = message;
  status.dataset.error = String(isError);
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();
  showStatus("");
  submit.disabled = true;
  submit.textContent = "Ingresando…";

  const credentials = Object.fromEntries(new FormData(form));
  try {
    const payload = await apiClient.post("login", credentials);
    setAuthSession(payload.data);
    showStatus("Inicio de sesión exitoso.");
    window.location.href = pending?.returnTo || "catalogo.html";
  } catch (error) {
    if (error instanceof ApiError && error.isValidationError) {
      showFieldErrors(error.details);
    } else if (error instanceof ApiError && error.status === 401) {
      showStatus(error.message || "Las credenciales no son válidas.", true);
    } else {
      showStatus("No se pudo iniciar sesión. Intenta nuevamente.", true);
    }
    submit.disabled = false;
    submit.textContent = "Ingresar";
  }
});
