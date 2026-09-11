<script setup>
// Usamos script setup que simplifica la sintaxis en Vue 3 con Composition API
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoadingST from '@/components/ui/LoadingST.vue'

// Importamos las funciones de la capa de servicio (conector Kitsu API)
import { getAnimesRecientes, getAnimesPopulares } from '@/service/animeApi'
// Estado reactivo
// Los estados reactivos son para que la interfaz de usuario se actualice automáticamente cuando los datos cambian.
const listaAnimes = ref([])
const cargando = ref(true)
const error = ref(null)
const novedades = ref([]) // Lista para novedades
const animeDestacado = ref(null) // El anime grande de arriba
// Estados para paginación y mostrar más animes
const paginaActual = ref(1)
const mostrarExtra = ref(false)
const mostrarBotonAnimes = ref(false)

// Router para navegación programática
const router = useRouter()

// Función para obtener los datos iniciales de la vista
const obtenerAnime = async () => {
  cargando.value = true
  error.value = null // Limpiamos error anterior antes de empezar
  try {
    // 1. Obtenemos las novedades en emisión (recientes)
    const resNov = await getAnimesRecientes(1)
    // Tomamos hasta 6 elementos para el carrusel/lista de novedades
    novedades.value = resNov.data.slice(0, 6)
    // El primer anime de las novedades será el destacado superior
    animeDestacado.value = novedades.value[0] || null
    // 2. Obtenemos el top de animes populares
    const resTop = await getAnimesPopulares(paginaActual.value)
    listaAnimes.value = resTop.data
  } catch (err) {
    console.error("Error al obtener datos:", err)
    // Mostramos un mensaje de error amigable que explique el problema
    error.value = err.message || 'Ocurrió un error al cargar la información'
  } finally {
    cargando.value = false
  }
}

// Función para cargar más animes (paginación incremental)
const cargarMasAnimes = async () => {
  try {
    // Incrementamos la página actual de forma secuencial
    paginaActual.value++
    // Solicitamos a animeApi la siguiente página del listado popular
    const res = await getAnimesPopulares(paginaActual.value)
    // Agregamos los nuevos animes recibidos a la lista existente
    listaAnimes.value.push(...res.data)
    mostrarExtra.value = true
    mostrarBotonAnimes.value = true

  } catch (err) {
    console.error("Error al cargar más animes:", err)
  }
}
// Función para reintentar la carga
const reintentarCarga = () => {
  paginaActual.value = 1
  obtenerAnime()
}
// Función para ir a la página de animes
const irAAnimes = () => {
  router.push('/anime')
}
// Llamamos la función al montar el componente
onMounted(() => {
  obtenerAnime()
})
</script>

<template>
  <div class="container mx-auto">
    <!-- Estado de error -->
    <LoadingST :cargando="cargando" :error="error" @retry="reintentarCarga">
      <!-- Anime Destacado en la parte superior -->
      <section v-if="animeDestacado"
        class="relative min-h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-12 mx-4 md:mx-0"> <img
          :src="animeDestacado.images.jpg.large_image_url"
          class="absolute w-full h-full object-cover opacity-40 blur-sm" />
        <div class="relative z-10 flex h-full items-center p-8 bg-gradient-to-r from-black/80 to-transparent">
          <img :src="animeDestacado.images.jpg.large_image_url"
            class="w-48 h-72 rounded-lg shadow-2xl mr-8 hidden md:block" />
          <div class="max-w-2xl">
            <span
              class="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Destacado
              de hoy</span>
            <h1 class="text-5xl font-black text-white mt-4 mb-4 leading-tight">{{ animeDestacado.title }}</h1>
            <p class="text-gray-300 line-clamp-3 mb-6">{{ animeDestacado.synopsis }}</p>
            <button
              class="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 hover:text-white transition-all">
              Ver detalles ahora
            </button>
          </div>
        </div>
      </section>

      <!-- Seccion de novedades anime debajo del destacado -->
      <section class="mb-12 bg-blue-900 w-screen -ml-[calc(50vw-50%)] p-6 min-h-screen">
        <div class="max-w-screen-xl mx-auto">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-3xl font-black text-white border-l-8 border-white pl-4">
              Animes Destacados
            </h2>
            <router-link to="/anime" class="text-white font-bold hover:underline">
              Ver todo
            </router-link>
          </div>
          <!-- Grid mejorado -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
            <div v-for="anime in novedades.slice(0, 6)" :key="anime.mal_id"
              class="group cursor-pointer relative overflow-hidden rounded-xl border-2 border-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-500">
              <!-- Imagen -->
              <img :src="anime.images.jpg.large_image_url"
                class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
              <!-- Overlay con degradado y blur -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-4 flex flex-col justify-end backdrop-blur-sm">
                <h3 class="text-lg font-bold text-white mb-2 truncate">
                  {{ anime.title }}
                </h3>
                <p class="text-sm text-gray-200 line-clamp-2">
                  {{ anime.synopsis }}
                </p>
                <!-- Badges -->
                <div class="flex gap-2 mt-3">
                  <span class="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    {{ anime.status }}
                  </span>
                  <span class="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                    {{ anime.episodes }} eps
                  </span>
                </div>
                <!-- Botón de acción -->
                <router-link :to="`/anime/${anime.mal_id}`"
                  class="mt-3 inline-block bg-white text-blue-900 font-bold text-xs px-4 py-2 rounded-full hover:bg-gray-200 transition">
                  Ver más
                </router-link>
              </div>
              <!-- Título debajo (visible siempre) -->
              <h3 class="mt-2 text-sm font-bold text-white text-center truncate">
                {{ anime.title }}
              </h3>
            </div>
          </div>
        </div>

      </section>

      <!-- Lista de animes -->
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Animes más Populares</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div v-for="anime in listaAnimes" :key="anime.mal_id"
          class="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300 border border-gray-100">
          <img :src="anime.images.jpg.large_image_url" :alt="anime.title" class="w-full h-64 object-cover" />

          <!-- Información del anime como título, puntuación y tipo -->
          <div class="p-4">
            <h3 class="font-bold text-sm line-clamp-2 h-10 text-gray-800">{{ anime.title }}</h3>
            <div class="flex items-center mt-2 justify-between">
              <span class="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                ⭐ {{ anime.score }}
              </span>
              <span class="text-xs text-gray-500">{{ anime.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción para mostrar más animes o ir a la página de animes -->
      <div class="flex justify-center mt-8">
        <button v-if="!mostrarExtra" @click="cargarMasAnimes"
          class="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg">
          Mostrar más
        </button>
        <button v-else-if="mostrarBotonAnimes" @click="irAAnimes"
          class="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg">
          Mostrar Animes
        </button>
      </div>
    </LoadingST>
  </div>
</template>