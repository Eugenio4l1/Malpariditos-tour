<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button default-href="/login" /></ion-buttons>
        <ion-title>Crear cuenta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="registrar">
        <ion-input v-model="nombre" type="text" label="Nombre completo" label-placement="floating" fill="outline" autocomplete="name" class="ion-margin-bottom" />
        <ion-input v-model="email" type="email" label="Correo" label-placement="floating" fill="outline" autocomplete="email" class="ion-margin-bottom" />
        <ion-input v-model="password" type="password" label="Contraseña" label-placement="floating" fill="outline" autocomplete="new-password" helper-text="Mínimo 8 caracteres, con mayúsculas, minúsculas, un número y un símbolo." class="ion-margin-bottom" />
        <ion-input v-model="confirmacion" type="password" label="Confirmar contraseña" label-placement="floating" fill="outline" autocomplete="new-password" />
        <ion-text color="danger" v-if="error"><p>{{ error }}</p></ion-text>
        <ion-button expand="block" type="submit" class="ion-margin-top" :disabled="cargando || !nombre || !email || !password || !confirmacion">
          <ion-spinner v-if="cargando" name="dots" />
          <span v-else>Crear cuenta</span>
        </ion-button>
      </form>
      <ion-button expand="block" fill="clear" type="button" class="ion-margin-top" @click="router.replace('/login')">
        ¿Ya tienes cuenta? Iniciar sesión
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonInput, IonButton, IonSpinner, IonText } from '@ionic/vue'
import { useAuth } from '../stores/auth'
import { mensajeError } from '../services/http'

const router = useRouter()
const auth = useAuth()
const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmacion = ref('')
const cargando = ref(false)
const error = ref('')

async function registrar() {
  error.value = ''
  if (password.value !== confirmacion.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  cargando.value = true
  try {
await auth.registrar(nombre.value.trim(), email.value.trim(), password.value, confirmacion.value)
    router.replace('/tours')
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
}
</script>