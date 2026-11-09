import { Preferences } from '@capacitor/preferences'

// Caché de lectura: datos no sensibles (catálogo) con marca de tiempo.
export interface Cacheado<T> { datos: T; guardadoEn: number }

export async function guardarCache<T>(clave: string, datos: T) {
  const valor: Cacheado<T> = { datos, guardadoEn: Date.now() }
  await Preferences.set({ key: clave, value: JSON.stringify(valor) })
}

export async function leerCache<T>(clave: string): Promise<Cacheado<T> | null> {
  const { value } = await Preferences.get({ key: clave })
  if (!value) return null
  try { return JSON.parse(value) as Cacheado<T> } catch { return null }
}
