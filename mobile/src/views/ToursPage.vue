<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Tours</ion-title>
        <ion-buttons slot="end"><ion-button @click="salir">Salir</ion-button></ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="refrescar($event)"><ion-refresher-content /></ion-refresher>

      <ion-chip v-if="desdeCache" color="warning" class="ion-margin">
        <ion-label>Sin conexión · datos del {{ fechaCache }}</ion-label>
      </ion-chip>

      <!-- Cargando -->
      <ion-list v-if="cargando && !tours.length">
        <ion-item v-for="n in 5" :key="n"><ion-label><ion-skeleton-text animated style="width:70%" /><ion-skeleton-text animated style="width:40%" /></ion-label></ion-item>
      </ion-list>

      <!-- Error -->
      <div v-else-if="error && !tours.length" class="centrado">
        <ion-text color="danger"><p>{{ error }}</p></ion-text>
        <ion-button @click="cargar(true)">Reintentar</ion-button>
      </div>

      <!-- Vacío -->
      <div v-else-if="!tours.length" class="centrado"><ion-text>No hay tours disponibles.</ion-text></div>

      <!-- Datos -->
      <ion-list v-else>
        <ion-item v-for="t in tours" :key="t.id" button :detail="true" @click="router.push(`/tours/${t.id}`)">
          <ion-label>
            <h2>{{ t.nombre }}</h2>
            <p>₡{{ t.precio.toLocaleString('es-CR') }} · {{ t.duracion_horas }} h</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll :disabled="pagina >= ultimaPagina || desdeCache" @ionInfinite="masPaginas($event)">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonLabel,
  IonSkeletonText, IonText, IonChip, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent,
} from '@ionic/vue'
import { http, mensajeError } from '../services/http'
import { guardarCache, leerCache } from '../services/cache'
import { useAuth } from '../stores/auth'
import type { Paginado, Tour } from '../types/api'

const router = useRouter()
const auth = useAuth()
const tours = ref<Tour[]>([])
const pagina = ref(1)
const ultimaPagina = ref(1)
const cargando = ref(false)
const error = ref('')
const desdeCache = ref(false)
const guardadoEn = ref(0)
const fechaCache = computed(() => new Date(guardadoEn.value).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' }))

async function cargar(reiniciar = false) {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await http.get<Paginado<Tour>>('tours', { params: { page: 1, per_page: 10, estado: 'activo' } })
    tours.value = data.data
    pagina.value = data.meta.current_page
    ultimaPagina.value = data.meta.last_page
    desdeCache.value = false
    await guardarCache('tours_p1', data.data)        // última lectura buena
  } catch (e) {
    const guardado = await leerCache<Tour[]>('tours_p1')
    if (guardado) {                                    // sin red: mostrar la caché
      tours.value = guardado.datos
      guardadoEn.value = guardado.guardadoEn
      desdeCache.value = true
    } else {
      error.value = mensajeError(e)
    }
  } finally {
    cargando.value = false
  }
}

async function masPaginas(ev: CustomEvent) {
  try {
    const { data } = await http.get<Paginado<Tour>>('tours', { params: { page: pagina.value + 1, per_page: 10, estado: 'activo' } })
    tours.value.push(...data.data)
    pagina.value = data.meta.current_page
    ultimaPagina.value = data.meta.last_page
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    (ev.target as HTMLIonInfiniteScrollElement).complete()
  }
}

async function refrescar(ev: CustomEvent) {
  await cargar(true)
  ;(ev.target as HTMLIonRefresherElement).complete()
}

async function salir() {
  await auth.logout()
  router.replace('/login')
}

onMounted(() => cargar())
</script>
