import { Preferences } from '@capacitor/preferences';
export async function guardarCache(clave, datos) {
    const valor = { datos, guardadoEn: Date.now() };
    await Preferences.set({ key: clave, value: JSON.stringify(valor) });
}
export async function leerCache(clave) {
    const { value } = await Preferences.get({ key: clave });
    if (!value)
        return null;
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
}
