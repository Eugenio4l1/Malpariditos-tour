import { SecureStorage } from '@aparajita/capacitor-secure-storage';
// El token vive en el almacenamiento seguro del sistema (Keystore en Android),
// nunca en localStorage.
const TOKEN = 'token';
const USER = 'usuario';
export async function guardarSesion(token, usuario) {
    await SecureStorage.set(TOKEN, token);
    await SecureStorage.set(USER, usuario);
}
export async function leerSesion() {
    try {
        const token = (await SecureStorage.get(TOKEN));
        const usuario = (await SecureStorage.get(USER));
        return token && usuario ? { token, usuario } : null;
    }
    catch {
        return null;
    }
}
export async function borrarSesion() {
    await SecureStorage.remove(TOKEN).catch(() => { });
    await SecureStorage.remove(USER).catch(() => { });
}
