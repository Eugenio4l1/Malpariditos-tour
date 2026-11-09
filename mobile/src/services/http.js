import axios from 'axios';
// Una única instancia para toda la app.
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15000,
    headers: { Accept: 'application/json' },
});
let token = null;
let onUnauthorized = () => { };
export const setToken = (t) => { token = t; };
export const setOnUnauthorized = (fn) => { onUnauthorized = fn; };
http.interceptors.request.use((config) => {
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
http.interceptors.response.use((r) => r, (error) => {
    // 401 con sesión activa = token vencido/revocado: cerrar sesión y volver al login.
    if (error.response?.status === 401 && token)
        onUnauthorized();
    return Promise.reject(error);
});
// Mensaje legible en español a partir de cualquier error de la API.
export function mensajeError(e) {
    const err = e;
    if (!err.response)
        return 'Sin conexión con el servidor. Revisa tu red e inténtalo de nuevo.';
    const errores = err.response.data?.errores;
    if (errores)
        return Object.values(errores).flat().join(' ');
    return err.response.data?.mensaje ?? 'Ocurrió un error inesperado.';
}
