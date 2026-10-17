const SESSION_KEY = "malpariditos.auth";
const PENDING_KEY = "malpariditos.pending-form";

function readJson(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

export function getAuthSession() {
  return readJson(SESSION_KEY);
}

export function setAuthSession({ token, usuario }) {
  if (!token) throw new Error("La respuesta de autenticación no contiene un token.");
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, usuario }));
}

export function clearAuthSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthSession()?.token);
}

export function hasAdminAccess() {
  const user = getAuthSession()?.usuario;
  const capabilities = Array.isArray(user?.capacidades) ? user.capacidades : [];
  return user?.role === "admin"
    && capabilities.includes("tours:crear")
    && capabilities.includes("tours:editar");
}

export function savePendingForm({ form, returnTo = window.location.href } = {}) {
  const safeForm = { ...(form || {}) };
  delete safeForm.password;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ form: safeForm, returnTo }));
}

export function consumePendingForm() {
  const pending = readJson(PENDING_KEY);
  sessionStorage.removeItem(PENDING_KEY);
  return pending;
}

export function getPendingForm() {
  return readJson(PENDING_KEY);
}

export function redirectToLogin(options = {}) {
  if (window.location.pathname.endsWith("/login.html") || window.location.pathname.endsWith("login.html")) return;
  savePendingForm(options);
  window.location.href = "login.html";
}
