import { SecureStorage } from '@aparajita/capacitor-secure-storage'
import type { Usuario } from '../types/api'

// El token vive en el almacenamiento seguro del sistema (Keystore en Android),
// nunca en localStorage.
const TOKEN = 'token'
const USER = 'usuario'

export async function guardarSesion(token: string, usuario: Usuario) {
  await SecureStorage.set(TOKEN, token)
  await SecureStorage.set(USER, usuario as unknown as Record<string, unknown>)
}

export async function leerSesion(): Promise<{ token: string; usuario: Usuario } | null> {
  try {
    const token = (await SecureStorage.get(TOKEN)) as string | null
    const usuario = (await SecureStorage.get(USER)) as Usuario | null
    return token && usuario ? { token, usuario } : null
  } catch {
    return null
  }
}

export async function borrarSesion() {
  await SecureStorage.remove(TOKEN).catch(() => {})
  await SecureStorage.remove(USER).catch(() => {})
}
