
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Tours</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="salir">Salir</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="refrescar($event)">
        <ion-refresher-content />
      </ion-refresher>

      <main class="catalogo">
        <section class="intro">
          <div>
            <p class="marca">MALPARIDITOS TOUR</p>
            <h1>Explorá Costa Rica</h1>
            <p>Encontrá tu próxima aventura.</p>
          </div>
          <span class="intro-icono">⌖</span>
        </section>

        <section v-if="esAdmin" class="admin-acciones">
          <div>
            <strong>Administración</strong>
            <p>Gestioná las experiencias del catálogo.</p>
          </div>
          <ion-button class="boton-agregar" @click="abrirFormulario">
            <ion-icon slot="start" :icon="addCircleOutline" />
            Agregar tour
          </ion-button>
        </section>

        <ion-chip v-if="desdeCache" color="warning" class="cache-chip">
          <ion-label>Sin conexión · datos del {{ fechaCache }}</ion-label>
        </ion-chip>

        <div class="cabecera-lista">
          <div>
            <h2>Tours disponibles</h2>
            <p>{{ toursFiltrados.length }} experiencias</p>
          </div>
          <span class="contador">{{ toursFiltrados.length }}</span>
        </div>

        <label class="buscador">
          <span>⌕</span>
          <input
            v-model="busqueda"
            type="search"
            placeholder="Buscar un tour..."
            aria-label="Buscar un tour"
          />
        </label>

        <div v-if="cargando && !tours.length" class="rejilla">
          <div v-for="n in 4" :key="n" class="esqueleto">
            <ion-skeleton-text animated class="imagen-esqueleto" />
            <div class="esqueleto-texto">
              <ion-skeleton-text animated style="width:75%;height:18px" />
              <ion-skeleton-text animated style="width:45%;height:14px" />
              <ion-skeleton-text animated style="width:55%;height:22px" />
            </div>
          </div>
        </div>

        <div v-else-if="error && !tours.length" class="estado">
          <p>{{ error }}</p>
          <ion-button @click="cargar(true)">Reintentar</ion-button>
        </div>

        <div v-else-if="!toursFiltrados.length" class="estado">
          <div class="estado-icono">⌕</div>
          <h3>{{ tours.length ? 'No encontramos ese tour' : 'Todavía no hay tours' }}</h3>
          <p>
            {{ tours.length
              ? 'Probá con otro nombre.'
              : 'Pronto tendremos nuevas experiencias para vos.' }}
          </p>
        </div>

        <div v-else class="rejilla">
          <article
            v-for="t in toursFiltrados"
            :key="t.id"
            class="tarjeta"
            role="button"
            tabindex="0"
            @click="verDetalle(t.id)"
            @keydown.enter="verDetalle(t.id)"
            @keydown.space.prevent="verDetalle(t.id)"
          >
            <div class="foto">
              <img
                :src="imagenTour(t.id)"
                :alt="`Imagen de ${t.nombre}`"
                loading="lazy"
                @error="imagenError"
              />
              <span class="categoria">
                {{ t.categoria?.nombre || 'Experiencia' }}
              </span>
            </div>

            <div class="contenido">
              <h3>{{ t.nombre }}</h3>
              <p class="duracion">
                ◷ {{ t.duracion_horas }}
                {{ t.duracion_horas === 1 ? 'hora' : 'horas' }}
              </p>

              <div class="pie-tarjeta">
                <div>
                  <span class="desde">Desde</span>
                  <strong>₡{{ Number(t.precio).toLocaleString('es-CR') }}</strong>
                </div>
                <span class="flecha">›</span>
              </div>
            </div>
          </article>
        </div>

        <ion-infinite-scroll
          :disabled="pagina >= ultimaPagina || desdeCache"
          @ionInfinite="masPaginas($event)"
        >
          <ion-infinite-scroll-content loading-text="Cargando más tours..." />
        </ion-infinite-scroll>
      </main>

      <ion-modal :is-open="modalAbierto" @didDismiss="cerrarModal">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Agregar tour</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="cerrarModal">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-contenido">
          <form class="formulario" @submit.prevent="crearTour">
            <p class="ayuda-formulario">
              Completá los datos para registrar una nueva experiencia en el catálogo.
            </p>

            <ion-item>
              <ion-label position="stacked">Nombre del tour *</ion-label>
              <ion-input
                v-model="form.nombre"
                required
                placeholder="Ej. Caminata al Volcán Arenal"
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Categoría *</ion-label>
              <ion-select
                v-model="form.categoria_id"
                interface="popover"
                placeholder="Seleccioná una categoría"
                :disabled="!categorias.length"
              >
                <ion-select-option
                  v-for="categoria in categorias"
                  :key="categoria.id"
                  :value="categoria.id"
                >
                  {{ categoria.nombre }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <p v-if="!categorias.length" class="aviso-categorias">
              No se encontraron categorías en los tours cargados.
              Actualizá el catálogo e intentá de nuevo.
            </p>

            <ion-item>
              <ion-label position="stacked">Descripción</ion-label>
              <ion-textarea
                v-model="form.descripcion"
                :auto-grow="true"
                placeholder="Contá brevemente en qué consiste el tour."
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Precio por persona (₡) *</ion-label>
              <ion-input
                v-model.number="form.precio"
                type="number"
                min="0"
                max="999999.99"
                step="0.01"
                required
                placeholder="Ej. 25000"
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Duración en horas *</ion-label>
              <ion-input
                v-model.number="form.duracion_horas"
                type="number"
                min="1"
                max="24"
                step="1"
                required
                placeholder="Ej. 4"
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Estado *</ion-label>
              <ion-select v-model="form.estado" interface="popover">
                <ion-select-option value="activo">Activo</ion-select-option>
                <ion-select-option value="inactivo">Inactivo</ion-select-option>
              </ion-select>
            </ion-item>

            <p v-if="errorFormulario" class="error-formulario">
              {{ errorFormulario }}
            </p>

            <ion-button
              class="guardar-tour"
              type="submit"
              expand="block"
              :disabled="guardando || !categorias.length"
            >
              {{ guardando ? 'Guardando...' : 'Guardar tour' }}
            </ion-button>
          </form>
        </ion-content>
      </ion-modal>

      <ion-toast
        :is-open="toastAbierto"
        :message="mensajeToast"
        :duration="2600"
        color="success"
        @didDismiss="toastAbierto = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonSkeletonText, IonChip, IonLabel, IonRefresher,
  IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent,
  IonIcon, IonModal, IonItem, IonInput, IonTextarea, IonSelect,
  IonSelectOption, IonToast,
} from '@ionic/vue'

import { addCircleOutline } from 'ionicons/icons'
import { http, mensajeError } from '../services/http'
import { guardarCache, leerCache } from '../services/cache'
import { useAuth } from '../stores/auth'
import type { Paginado, Tour } from '../types/api'

interface CategoriaTour {
  id: number
  nombre: string
}

const router = useRouter()
const auth = useAuth()

const tours = ref<Tour[]>([])
const busqueda = ref('')
const pagina = ref(1)
const ultimaPagina = ref(1)
const cargando = ref(false)
const error = ref('')
const desdeCache = ref(false)
const guardadoEn = ref(0)

const modalAbierto = ref(false)
const guardando = ref(false)
const errorFormulario = ref('')
const toastAbierto = ref(false)
const mensajeToast = ref('')

const form = reactive({
  nombre: '',
  categoria_id: null as number | null,
  descripcion: '',
  precio: null as number | null,
  duracion_horas: null as number | null,
  estado: 'activo' as 'activo' | 'inactivo',
})

const esAdmin = computed(() => auth.usuario?.role === 'admin')

const fechaCache = computed(() =>
  new Date(guardadoEn.value).toLocaleString('es-CR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
)

const categorias = computed<CategoriaTour[]>(() => {
  const unicas = new Map<number, CategoriaTour>()

  for (const tour of tours.value) {
    if (tour.categoria?.id && tour.categoria.nombre) {
      unicas.set(tour.categoria.id, tour.categoria)
    }
  }

  return [...unicas.values()].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es')
  )
})

const imagenesTours = [
  'https://images.pexels.com/photos/39402239/pexels-photo-39402239.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/11032583/pexels-photo-11032583.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/14624137/pexels-photo-14624137.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/30603643/pexels-photo-30603643.jpeg?auto=compress&cs=tinysrgb&w=600',
]

const toursFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLocaleLowerCase('es-CR')

  if (!termino) return tours.value

  return tours.value.filter(t =>
    `${t.nombre} ${t.categoria?.nombre || ''} ${t.descripcion || ''}`
      .toLocaleLowerCase('es-CR')
      .includes(termino)
  )
})

function imagenTour(id: number) {
  return imagenesTours[(Math.max(1, Number(id)) - 1) % imagenesTours.length]
}

function imagenError(event: Event) {
  (event.target as HTMLImageElement).style.visibility = 'hidden'
}

function verDetalle(id: number) {
  router.push(`/tours/${id}`)
}

function limpiarFormulario() {
  form.nombre = ''
  form.categoria_id = null
  form.descripcion = ''
  form.precio = null
  form.duracion_horas = null
  form.estado = 'activo'
  errorFormulario.value = ''
}

function abrirFormulario() {
  limpiarFormulario()
  modalAbierto.value = true
}

function cerrarModal() {
  if (guardando.value) return

  modalAbierto.value = false
  limpiarFormulario()
}

async function crearTour() {
  if (!esAdmin.value) {
    errorFormulario.value = 'Tu cuenta no tiene permisos para crear tours.'
    return
  }

  const nombre = form.nombre.trim()
  const descripcion = form.descripcion.trim()

  if (!form.categoria_id) {
    errorFormulario.value = 'Seleccioná una categoría.'
    return
  }

  if (nombre.length < 3 || nombre.length > 150) {
    errorFormulario.value = 'El nombre debe tener entre 3 y 150 caracteres.'
    return
  }

  if (descripcion.length > 2000) {
    errorFormulario.value = 'La descripción no puede superar los 2000 caracteres.'
    return
  }

  const precio = Number(form.precio)
  const duracion = Number(form.duracion_horas)

  if (
    form.precio === null ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    precio > 999999.99
  ) {
    errorFormulario.value = 'Ingresá un precio válido.'
    return
  }

  if (
    form.duracion_horas === null ||
    !Number.isInteger(duracion) ||
    duracion < 1 ||
    duracion > 24
  ) {
    errorFormulario.value = 'La duración debe estar entre 1 y 24 horas.'
    return
  }

  guardando.value = true
  errorFormulario.value = ''

  try {
    await http.post('tours', {
      categoria_id: Number(form.categoria_id),
      nombre,
      descripcion: descripcion || null,
      precio,
      duracion_horas: duracion,
      estado: form.estado,
    })

    modalAbierto.value = false
    limpiarFormulario()

    await cargar(true)

    mensajeToast.value = 'El tour se guardó correctamente.'
    toastAbierto.value = true
  } catch (e) {
    errorFormulario.value = mensajeError(e)
  } finally {
    guardando.value = false
  }
}

async function cargar(_reiniciar = false) {
  cargando.value = true
  error.value = ''

  try {
    const { data } = await http.get<Paginado<Tour>>('tours', {
      params: {
        page: 1,
        per_page: 50,
        estado: 'activo',
      },
    })

    tours.value = data.data
    pagina.value = data.meta.current_page
    ultimaPagina.value = data.meta.last_page
    desdeCache.value = false

    await guardarCache('tours_p1', data.data)
  } catch (e) {
    if ((e as any).response?.status === 401) return

    const guardado = await leerCache<Tour[]>('tours_p1')

    if (guardado) {
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
    const { data } = await http.get<Paginado<Tour>>('tours', {
      params: {
        page: pagina.value + 1,
        per_page: 50,
        estado: 'activo',
      },
    })

    tours.value.push(...data.data)
    pagina.value = data.meta.current_page
    ultimaPagina.value = data.meta.last_page
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    (ev.target as HTMLIonInfiniteScrollElement).complete()
  }
}

// CORREGIDO: se agrega punto y coma después de cargar(true).
async function refrescar(ev: CustomEvent) {
  await cargar(true);
  (ev.target as HTMLIonRefresherElement).complete();
}

async function salir() {
  await auth.logout()
  router.replace('/login')
}

onMounted(() => cargar())
</script>

<style scoped>
.catalogo {
  --texto: #252b32;
  --azul: #24609c;
  min-height: 100%;
  padding: 18px 16px 28px;
  background: #f5f2e6;
}

.intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 23px 20px;
  margin-bottom: 18px;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(130deg, #24609c, #397bb3);
  box-shadow: 0 7px 18px #173f6426;
}

.marca {
  margin: 0 0 7px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
  opacity: .8;
}

.intro h1 {
  margin: 0;
  font-size: 25px;
  line-height: 1.2;
  font-weight: 750;
}

.intro p:last-child {
  margin: 7px 0 0;
  font-size: 13px;
  opacity: .9;
}

.intro-icono {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border: 1px solid #ffffff55;
  border-radius: 15px;
  font-size: 34px;
}

.admin-acciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 14px;
  margin-bottom: 20px;
  border: 1px solid #dce5ed;
  border-radius: 14px;
  background: #fffefa;
}

.admin-acciones strong {
  color: #252b32;
  font-size: 14px;
}

.admin-acciones p {
  margin: 4px 0 0;
  color: #77766f;
  font-size: 11px;
}

.boton-agregar {
  --background: #24609c;
  --background-activated: #194b7c;
  --border-radius: 10px;
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.cache-chip {
  margin: 0 0 15px;
}

.cabecera-lista {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 2px 13px;
}

.cabecera-lista h2 {
  margin: 0;
  color: var(--texto);
  font-size: 19px;
  font-weight: 750;
}

.cabecera-lista p {
  margin: 4px 0 0;
  color: #77766f;
  font-size: 12px;
}

.contador {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--azul);
  background: #24609c18;
  font-size: 13px;
  font-weight: 700;
}

.buscador {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  padding: 0 14px;
  margin-bottom: 18px;
  border: 1px solid #e1dece;
  border-radius: 12px;
  background: #fffefa;
  color: #85847d;
}

.buscador span {
  font-size: 25px;
  line-height: 1;
}

.buscador input {
  width: 100%;
  border: 0;
  outline: 0;
  color: var(--texto);
  background: transparent;
  font: inherit;
  font-size: 14px;
}

.rejilla {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.tarjeta,
.esqueleto {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e8e3d5;
  border-radius: 15px;
  background: #fffefa;
  box-shadow: 0 3px 12px #28251a0d;
}

.tarjeta {
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
}

.tarjeta:active {
  transform: scale(.98);
}

.foto {
  position: relative;
  height: 125px;
  overflow: hidden;
  background: #d8dfdc;
}

.foto img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.categoria {
  position: absolute;
  left: 9px;
  bottom: 9px;
  max-width: calc(100% - 18px);
  overflow: hidden;
  padding: 5px 8px;
  border-radius: 20px;
  color: #fff;
  background: #172b3dcc;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contenido {
  padding: 11px 11px 12px;
}

.contenido h3 {
  display: -webkit-box;
  min-height: 38px;
  overflow: hidden;
  margin: 0 0 8px;
  color: var(--texto);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.duracion {
  margin: 0;
  color: #77766f;
  font-size: 11px;
}

.pie-tarjeta {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 5px;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid #eeeade;
}

.pie-tarjeta div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.desde {
  color: #85847d;
  font-size: 10px;
}

.pie-tarjeta strong {
  color: var(--azul);
  font-size: 16px;
}

.flecha {
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  color: #fff;
  background: var(--azul);
  font-size: 23px;
  line-height: 1;
}

.estado {
  padding: 42px 15px;
  text-align: center;
  color: #666;
}

.estado h3 {
  margin: 12px 0 5px;
  color: var(--texto);
  font-size: 17px;
}

.estado p {
  font-size: 13px;
}

.estado-icono {
  font-size: 36px;
  color: var(--azul);
}

.esqueleto {
  padding-bottom: 12px;
}

.imagen-esqueleto {
  width: 100%;
  height: 125px;
  margin: 0;
}

.esqueleto-texto {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.modal-contenido {
  --background: #f5f2e6;
}

.formulario {
  display: grid;
  gap: 12px;
  padding: 18px 16px 28px;
}

.ayuda-formulario {
  margin: 0 2px 4px;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

.formulario ion-item {
  --background: #fffefa;
  --border-color: #e1dece;
  --border-radius: 10px;
  --padding-start: 12px;
  border: 1px solid #e1dece;
  border-radius: 10px;
}

.formulario ion-label {
  color: #555;
  font-size: 13px;
}

.formulario ion-input,
.formulario ion-textarea,
.formulario ion-select {
  color: #252b32;
  font-size: 14px;
}

.aviso-categorias,
.error-formulario {
  margin: 0 3px;
  color: #b42318;
  font-size: 12px;
  line-height: 1.4;
}

.guardar-tour {
  --background: #24609c;
  --border-radius: 10px;
  margin-top: 8px;
  font-weight: 700;
}

@media (min-width: 600px) {
  .catalogo {
    max-width: 900px;
    margin: 0 auto;
  }

  .rejilla {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .foto {
    height: 155px;
  }
}

@media (max-width: 360px) {
  .catalogo {
    padding-right: 12px;
    padding-left: 12px;
  }

  .rejilla {
    gap: 10px;
  }

  .foto {
    height: 108px;
  }

  .contenido {
    padding: 9px;
  }

  .pie-tarjeta strong {
    font-size: 14px;
  }

  .admin-acciones {
    align-items: flex-start;
    flex-direction: column;
  }

  .boton-agregar {
    width: 100%;
  }
}
</style>
