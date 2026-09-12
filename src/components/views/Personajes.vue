<script setup>
import { ref, onMounted } from 'vue'
import LoadingST from '@/components/ui/LoadingST.vue'
import Navbar from '@/components/ui/Navbar.vue'
import {
  getPersonajesPopulares,
  buscarPersonajePorTexto
} from '@/service/animeApi'

// 1. ESTADOS REACTIVOS
const personajes = ref([])
const destacados = ref([])
const cargando = ref(true)
const error = ref(null)
const paginaActual = ref(1)
const totalPaginas = ref(1)
const searchQuery = ref('')
const tituloVista = ref("Personajes Populares")

// Modal para vista previa rápida (opcional, como en Anime.vue)
const personajeSeleccionado = ref(null)

// 2. FUNCIONES DE CARGA Y FILTRADO
const cargarPersonajes = async (pagina = 1) => {
  try {
    cargando.value = true
    error.value = null

    // Consumimos el servicio centralizado de animeApi.js
    const res = await getPersonajesPopulares(pagina)
    personajes.value = res.data
    totalPaginas.value = res.pagination.last_visible_page
    paginaActual.value = pagina

    // Guardamos los primeros personajes para el carrusel superior si es la carga inicial
    if (destacados.value.length === 0 && res.data.length > 0) {
      destacados.value = res.data.slice(0, 8)
    }
  } catch (err) {
    error.value = "Ocurrió un error al cargar la lista de personajes."
  } finally {
    cargando.value = false
  }
}

const buscarPersonaje = async (query, pagina = 1) => {
  searchQuery.value = query
  if (!query.trim()) {
    tituloVista.value = "Personajes Populares"
    cargarPersonajes(1)
    return
  }

  try {
    cargando.value = true
    error.value = null
    const res = await buscarPersonajePorTexto(query, pagina)
    personajes.value = res.data
    totalPaginas.value = res.pagination.last_visible_page
    tituloVista.value = `Resultados para: "${query}"`
    paginaActual.value = pagina
  } catch (err) {
    error.value = "Error al buscar el personaje solicitado."
  } finally {
    cargando.value = false
  }
}

// 3. NAVEGACIÓN Y PAGINACIÓN
const ejecutarBusqueda = (query) => {
  buscarPersonaje(query, 1)
}

const cambiarPagina = (nuevaPagina) => {
  if (searchQuery.value) {
    buscarPersonaje(searchQuery.value, nuevaPagina)
  } else {
    cargarPersonajes(nuevaPagina)
  }
}

const abrirModal = (personaje) => {
  personajeSeleccionado.value = personaje
}

const cerrarModal = () => {
  personajeSeleccionado.value = null
}

const reintentarCarga = () => {
  cargarPersonajes(paginaActual.value)
}

onMounted(() => {
  cargarPersonajes(1)
})
</script>

<template>
  <Navbar @search="ejecutarBusqueda" />

  <div class="max-w-6xl mx-auto p-6">
    <LoadingST :cargando="cargando" :error="error" @retry="reintentarCarga">

      <!-- CARRUSEL DE PERSONAJES DESTACADOS -->
      <section v-if="destacados.length && !searchQuery" class="mb-10">
        <h2 class="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
          <span>🔥</span> Personajes Destacados
        </h2>

        <!-- Lista horizontal con scroll suave -->
        <div class="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
          <div v-for="char in destacados" :key="`dest-${char.id}`"
            class="snap-start flex-shrink-0 w-36 md:w-44 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <router-link :to="`/personajes/${char.id}`" class="block">
              <div class="h-48 md:h-56 overflow-hidden relative">
                <img :src="char.image || 'https://via.placeholder.com/200x300?text=Sin+Imagen'" :alt="char.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80">
                </div>
                <h3
                  class="absolute bottom-2 left-2 right-2 text-xs md:text-sm font-bold text-white truncate text-center">
                  {{ char.name }}
                </h3>
              </div>
            </router-link>
          </div>
        </div>
      </section>

      <!-- ENCABEZADO Y BUSCADOR LOCAL -->
      <header
        class="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-black text-gray-900">{{ tituloVista }}</h1>
          <p class="text-gray-500">Explora el catálogo de personajes de tus series preferidas</p>
        </div>
      </header>

      <!-- FILTRO ACTIVO -->
      <div v-if="searchQuery"
        class="mb-6 flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100">
        <span class="text-sm text-indigo-900">Mostrando resultados para: <strong>{{ searchQuery }}</strong></span>
        <button @click="ejecutarBusqueda('')" class="text-xs text-red-600 font-bold hover:underline cursor-pointer">
          Limpiar búsqueda
        </button>
      </div>

      <!-- GRID DE PERSONAJES -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div v-for="char in personajes" :key="char.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
          <!-- Imagen clickeable para abrir vista previa -->
          <div @click="abrirModal(char)" class="relative h-64 overflow-hidden cursor-pointer">
            <img :src="char.image || 'https://via.placeholder.com/200x300?text=Sin+Imagen'" :alt="char.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>

          <!-- Nombre y enlace de detalle -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <router-link :to="`/personajes/${char.id}`"
                class="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1 block">
                {{ char.name }}
              </router-link>
              <p class="text-xs text-gray-500 line-clamp-2 mt-1 italic">
                {{ char.synopsis || 'Sin descripción disponible.' }}
              </p>
            </div>

            <div class="mt-4 pt-2 border-t border-gray-100 flex justify-end">
              <router-link :to="`/personajes/${char.id}`"
                class="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                Ver ficha <span>→</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGINACIÓN -->
      <div v-if="!cargando && !error && totalPaginas > 1" class="mt-10 flex justify-center gap-2">
        <button v-if="paginaActual > 1" @click="cambiarPagina(paginaActual - 1)"
          class="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer">
          ←
        </button>

        <button v-for="pagina in Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(
          Math.max(0, Math.min(paginaActual - 6, totalPaginas - 10)),
          Math.min(totalPaginas, Math.max(10, paginaActual + 4))
        )" :key="pagina" @click="cambiarPagina(pagina)"
          class="px-4 py-2 rounded-full font-bold transition-all duration-300 text-sm cursor-pointer" :class="paginaActual === pagina
            ? 'bg-indigo-600 text-white shadow-lg scale-110'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:scale-105'">
          {{ pagina }}
        </button>

        <button v-if="paginaActual < totalPaginas" @click="cambiarPagina(paginaActual + 1)"
          class="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer">
          →
        </button>
      </div>

    </LoadingST>
  </div>

  <!-- MODAL FLOTANTE DE VISTA PREVIA -->
  <div v-if="personajeSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    @click.self="cerrarModal">
    <div class="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl relative">
      <button @click="cerrarModal"
        class="absolute top-3 right-3 bg-gray-900/70 hover:bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 cursor-pointer">
        ✕
      </button>

      <div class="relative h-64 w-full">
        <img :src="personajeSeleccionado.image || 'https://via.placeholder.com/200x300?text=Sin+Imagen'"
          class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <h3 class="absolute bottom-3 left-4 right-4 text-xl font-bold text-white drop-shadow">
          {{ personajeSeleccionado.name }}
        </h3>
      </div>

      <div class="p-5">
        <p class="text-gray-600 text-sm max-h-40 overflow-y-auto italic mb-4">
          {{ personajeSeleccionado.synopsis || 'Sin descripción disponible.' }}
        </p>
        <router-link :to="`/personajes/${personajeSeleccionado.id}`"
          class="block w-full text-center bg-indigo-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-indigo-700 transition">
          Ver detalles completos
        </router-link>
      </div>
    </div>
  </div>
</template>