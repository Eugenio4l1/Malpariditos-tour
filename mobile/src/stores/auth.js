import { defineStore } from 'pinia';
import { http, setToken } from '../services/http';
import { borrarSesion, guardarSesion, leerSesion } from '../services/secureStorage';
export const useAuth = defineStore('auth', {
    state: () => ({ token: null, usuario: null }),
    getters: {
        autenticado: (s) => !!s.token,
    },
    actions: {
        // Se llama ANTES de montar la app para que el guardián ya conozca la sesión.
        async restaurar() {
            const sesion = await leerSesion();
            if (sesion) {
                this.token = sesion.token;
                this.usuario = sesion.usuario;
                setToken(sesion.token);
            }
        },
        async login(email, password) {
            const { data } = await http.post('login', { email, password });
            this.token = data.data.token;
            this.usuario = data.data.usuario;
            setToken(this.token);
            await guardarSesion(this.token, this.usuario);
        },
        async logout() {
            try {
                await http.post('logout');
            }
            catch { /* sin red: igual se cierra localmente */ }
            await this.limpiar();
        },
        async limpiar() {
            this.token = null;
            this.usuario = null;
            setToken(null);
            await borrarSesion();
        },
    },
});
