import { apiClient, ApiError } from "./api/ApiClient.js";
import { getPendingForm, setAuthSession } from "./auth/authState.js";

const form = document.getElementById("register-form");
const status = document.querySelector("[data-register-status]");
const submit = document.querySelector("[data-register-submit]");
const pending = getPendingForm();

function clearErrors() {
  form.querySelectorAll("[data-error-for]").forEach((element) => {
    element.hidden = true;
    element.textContent = "";
  });
  form.querySelectorAll("[aria-invalid]").forEach((control) => control.removeAttribute("aria-invalid"));
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
    element.textContent = Array.isArray(messages) ? messages.join(" ") : messages;
    form.elements[field]?.setAttribute("aria-invalid", "true");
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();
  showStatus("");

  const data = Object.fromEntries(new FormData(form));
  data.name = data.name.trim();
  data.email = data.email.trim();

  if (data.password !== data.password_confirmation) {
    showFieldErrors({ password_confirmation: "Las contraseñas no coinciden." });
    return;
  }

  submit.disabled = true;
  submit.textContent = "Creando cuenta…";

  try {
    const payload = await apiClient.post("register", data);
    setAuthSession(payload.data);
    showStatus("Cuenta creada correctamente. Redirigiendo…");
    window.location.href = pending?.returnTo || "catalogo.html";
  } catch (error) {
    if (error instanceof ApiError && error.isValidationError) {
      showFieldErrors(error.details);
      showStatus("Revisa los campos marcados.", true);
    } else if (error instanceof ApiError && error.isConnectionError) {
      showStatus(error.message, true);
    } else {
      showStatus("No se pudo crear la cuenta. Intenta nuevamente.", true);
    }
    submit.disabled = false;
    submit.textContent = "Crear cuenta";
  }
});