<template>
  <ion-page>
    <ion-header><ion-toolbar color="primary"><ion-title>Malpariditos Tour</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="entrar">
        <ion-input v-model="email" type="email" label="Correo" label-placement="floating" fill="outline" autocomplete="email" class="ion-margin-bottom" />
        <ion-input v-model="password" type="password" label="Contraseña" label-placement="floating" fill="outline" autocomplete="current-password" />
        <ion-text color="danger" v-if="error"><p>{{ error }}</p></ion-text>
        <ion-button expand="block" type="submit" class="ion-margin-top" :disabled="cargando || !email || !password">
          <ion-spinner v-if="cargando" name="dots" />
          <span v-else>Iniciar sesión</span>
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonSpinner, IonText } from '@ionic/vue'
import { useAuth } from '../stores/auth'
import { mensajeError } from '../services/http'

const router = useRouter()
const auth = useAuth()
const email = ref('')
const password = ref('')
const cargando = ref(false)
const error = ref('')

async function entrar() {
  error.value = ''
  cargando.value = true
  try {
    await auth.login(email.value, password.value)
    router.replace('/tours')          // replace: atrás no regresa al login
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
}
</script>
