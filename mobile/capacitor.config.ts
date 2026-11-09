import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cr.ac.ucr.malpariditos',
  appName: 'Malpariditos Tour',
  webDir: 'dist',
  server: {
    androidScheme: 'http',   // origen http://localhost (lo permite CORS en Laravel)
    cleartext: true,         // API en http:// durante el desarrollo
  },
}

export default config
