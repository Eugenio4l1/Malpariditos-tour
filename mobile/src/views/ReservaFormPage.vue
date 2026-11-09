<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button :default-href="`/tours/${route.params.id}`" /></ion-buttons>
        <ion-title>Reservar</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="auth.usuario?.role !== 'cliente'" class="centrado">
        <ion-text color="medium"><p>Solo las cuentas de cliente pueden crear reservas.</p></ion-text>
      </div>

      <form v-else @submit.prevent="reservar">
        <ion-input v-model.number="cantidad" type="number" inputmode="numeric" min="1" max="20" label="Cantidad de personas (1 a 20)" label-placement="floating" fill="outline" />
        <ion-text color="danger" v-if="error"><p>{{ error }}</p></ion-text>
        <ion-text color="success" v-if="exito"><p>{{ exito }}</p></ion-text>

        <ion-button expand="block" type="submit" class="ion-margin-top" :disabled="enviando">
          <ion-spinner v-if="enviando" name="dots" /><span v-else>Confirmar reserva</span>
        </ion-button>

        <!-- Permiso de notificaciones denegado -->
        <ion-note v-if="permiso === 'denied'" color="warning" class="ion-margin-top" style="display:block">
          Las notificaciones están desactivadas, así que no recibirás el recordatorio.
          <ion-button size="small" fill="outline" @click="abrirAjustesApp()">Abrir ajustes</ion-button>
        </ion-note>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonContent, IonInput, IonSpinner, IonText, IonNote } from '@ionic/vue'
import { http, mensajeError } from '../services/http'
import { useAuth } from '../stores/auth'
import { abrirAjustesApp, estadoPermiso, pedirPermiso, programarRecordatorio, type EstadoPermiso } from '../services/notifications'
import type { Salida } from '../types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const cantidad = ref(1)
const enviando = ref(false)
const error = ref('')
const exito = ref('')
const permiso = ref<EstadoPermiso>('prompt')

onMounted(async () => { permiso.value = await estadoPermiso() })

async function reservar() {
  error.value = ''
  exito.value = ''
  if (!Number.isInteger(cantidad.value) || cantidad.value < 1 || cantidad.value > 20) {
    error.value = 'La cantidad debe ser un número entero entre 1 y 20.'
    return
  }
  enviando.value = true
  try {
    const salidaId = Number(route.params.salidaId)
    const { data } = await http.post('reservas', {
      cliente_id: auth.usuario?.cliente_id,
      salida_tour_id: salidaId,
      cantidad_personas: cantidad.value,
      fecha_reserva: new Date().toISOString().slice(0, 10),
    })
    exito.value = `Reserva #${data.data.id} creada. Total: ₡${data.data.total.toLocaleString('es-CR')}`

    // Componente nativo: recordatorio local (pide permiso solo si hace falta).
    if (permiso.value === 'prompt') permiso.value = await pedirPermiso()
    if (permiso.value === 'granted') {
      const { data: s } = await http.get(`tours/${route.params.id}/salidas`, { params: { per_page: 50 } })
      const salida = (s.data as Salida[]).find((x) => x.id === salidaId)
      const { data: t } = await http.get(`tours/${route.params.id}`)
      if (salida) await programarRecordatorio(data.data.id, t.data.nombre, salida.fecha, salida.hora)
    }
    setTimeout(() => router.replace('/tours'), 1500)
  } catch (e) {
    error.value = mensajeError(e)     // 409 (sin cupo/vencida) y 422 llegan en español desde la API
  } finally {
    enviando.value = false
  }
}
</script>
