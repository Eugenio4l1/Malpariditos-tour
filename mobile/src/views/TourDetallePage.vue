<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button default-href="/tours" /></ion-buttons>
        <ion-title>{{ tour?.nombre ?? 'Detalle' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div v-if="cargando" class="centrado"><ion-spinner /></div>

      <div v-else-if="error" class="centrado">
        <ion-text color="danger"><p>{{ error }}</p></ion-text>
        <ion-button @click="cargar">Reintentar</ion-button>
      </div>

      <template v-else-if="tour">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ tour.nombre }}</ion-card-title>
            <ion-card-subtitle>₡{{ tour.precio.toLocaleString('es-CR') }} por persona · {{ tour.duracion_horas }} h</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>{{ tour.descripcion ?? 'Sin descripción.' }}</ion-card-content>
        </ion-card>

        <ion-list-header><ion-label>Salidas disponibles</ion-label></ion-list-header>
        <div v-if="!salidas.length" class="centrado"><ion-text>Este tour no tiene salidas programadas.</ion-text></div>
        <ion-list v-else>
          <ion-item v-for="s in salidas" :key="s.id" button :detail="true" @click="router.push(`/tours/${tour.id}/reservar/${s.id}`)">
            <ion-label><h3>{{ s.fecha }} · {{ s.hora }}</h3><p>Cupo: {{ s.cupo_disponible }}</p></ion-label>
          </ion-item>
        </ion-list>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonContent, IonSpinner, IonText,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonListHeader, IonItem, IonLabel,
} from '@ionic/vue'
import { http, mensajeError } from '../services/http'
import type { Salida, Tour } from '../types/api'
import { onIonViewWillEnter } from '@ionic/vue';

const route = useRoute()
const router = useRouter()
const tour = ref<Tour | null>(null)
const salidas = ref<Salida[]>([])
const cargando = ref(true)
const error = ref('')

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const id = route.params.id
    const [t, s] = await Promise.all([http.get(`tours/${id}`), http.get(`tours/${id}/salidas`, { params: { per_page: 50 } })])
    tour.value = t.data.data
    const hoy = new Date().toISOString().slice(0, 10)
    salidas.value = (s.data.data as Salida[]).filter((x) => x.fecha >= hoy)
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
onIonViewWillEnter(cargar);
</script>
