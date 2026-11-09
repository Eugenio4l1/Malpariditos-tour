import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import { App as CapApp } from '@capacitor/app'
import App from './App.vue'
import router from './router'
import { useAuth } from './stores/auth'
import { setOnUnauthorized } from './services/http'
import { iniciarRed } from './services/network'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import './theme/variables.css'

const pinia = createPinia()
const app = createApp(App).use(IonicVue).use(pinia).use(router)

async function arrancar() {
  const auth = useAuth(pinia)
  await auth.restaurar()          // 1) sesión desde almacenamiento seguro
  await iniciarRed()
  setOnUnauthorized(async () => { // 2) 401 => limpiar y volver al login
    await auth.limpiar()
    router.replace('/login')
  })

  // 3) Botón atrás: en pantallas raíz cierra la app, no vuelve al login.
  CapApp.addListener('backButton', ({ canGoBack }) => {
    const raiz = ['/tours', '/login'].includes(router.currentRoute.value.path)
    if (raiz || !canGoBack) CapApp.exitApp()
    else router.back()
  })

  await router.isReady()
  app.mount('#app')
}

arrancar()
