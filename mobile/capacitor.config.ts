import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cr.ac.ucr.malpariditos',
  appName: 'Malpariditos Tour',
  webDir: 'dist',
  server: {
    androidScheme: 'https',   // origen https://localhost (debe estar en CORS_ALLOWED_ORIGINS)
  },
}

export default config