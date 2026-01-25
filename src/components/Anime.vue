<script setup>
import { ref, onMounted } from 'vue'
import LoadingST from '@/components/LoadingST.vue'

// Todas las variables reactivas para que la UI se actualice automáticamente
const animesRecientes = ref([])
const cargando = ref(true)
const error = ref(null)
const paginaActual = ref(1)
const totalPaginas = ref(1)
const limite = 10

// Función para obtener animes recientes con paginación es una función asíncrona
const obtenerAnimesRecientes = async (pagina = 1) => {
  try {
    cargando.value = true
    error.value = null // Limpiamos errores previos
    // La URL dinamica el page=${pagina} le indica a la API exactamente qué página queremos
    const respuesta = await fetch(`https://api.jikan.moe/v4/seasons/now?page=${pagina}&limit=${limite}`)
    const datos = await respuesta.json()
    animesRecientes.value = datos.data // Guardamos los animes recientes
    // La API de Jikan nos da dos partes principales data y pagination
    totalPaginas.value = datos.pagination.last_visible_page  // Last visible page nos dice el total de páginas disponibles
    paginaActual.value = pagina
  } catch (err) {
    error.value = "No pudimos conectar con el servidor de anime."
  } finally {
    cargando.value = false
  }
}
// Función para reintentar la carga (se conecta con LoadingST)
const reintentarCarga = () => {
  obtenerAnimesRecientes(paginaActual.value)
}

// Se inicia la carga de datos al cargar la vista para que el usuario no vea la pantalla vacía.
onMounted(() => obtenerAnimesRecientes())
</script>

<template>
  <div class="max-w-5xl mx-auto p-6">
    <LoadingST :cargando="cargando" :error="error" @retry="reintentarCarga">
      <header class="mb-10 border-b border-gray-200 pb-4">
        <h1 class="text-4xl font-black text-gray-900">Novedades en Emisión</h1>
        <p class="text-gray-500">Los últimos episodios que están saliendo ahora mismo</p>
      </header>
      <!-- Muestra los animes recientes en una lista y la paginación al final -->
      <div class="space-y-6">
        <!-- El V-for esta haciendo un renderizado dinámico de la lista de los animes -->
        <div v-for="anime in animesRecientes" :key="anime.mal_id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 group">
          <div class="relative w-full md:w-48 h-64 md:h-auto overflow-hidden">
            <img :src="anime.images.jpg.large_image_url"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <!-- Estado del anime -->
            <div
              class="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
              {{ anime.status }}
            </div>
          </div>
          <!-- Contenido del anime -->
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <h2 class="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {{ anime.title }}
                </h2>
                <span class="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-lg text-sm">
                  ⭐ {{ anime.score || 'N/A' }}
                </span>
              </div>
              <div class="flex gap-3 text-sm text-gray-500 mb-4">
                <span>📅 {{ anime.year || '2024' }}</span>
                <span>•</span>
                <span>📺 {{ anime.episodes || '?' }} Episodios</span>
                <span>•</span>
                <span class="font-medium text-indigo-500">{{ anime.type }}</span>
              </div>
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="genre in anime.genres" :key="genre.mal_id"
                  class="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-1 rounded-md">
                  {{ genre.name }}
                </span>
              </div>
              <p class="text-gray-600 text-sm line-clamp-2 italic">
                {{ anime.synopsis }}
              </p>
            </div>
            <!-- Botón para ver detalles completos -->
            <div class="mt-4 flex justify-end">
              <button class="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
                Ver detalles completos <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación que solo se muestra cuando esta la lista de animes -->
      <div v-if="!cargando && !error" class="mt-10 flex justify-center gap-2">
        <!-- Botones de paginación solo aparecen si hay más de una página -->
        <button v-for="pagina in totalPaginas" :key="pagina" @click="obtenerAnimesRecientes(pagina)"
          class="px-4 py-2 rounded-full font-bold transition-all duration-300" :class="paginaActual === pagina
            ? 'bg-indigo-600 text-white shadow-lg scale-110'
            : 'bg-pink-100 text-pink-700 hover:bg-pink-200 hover:scale-105'">
          {{ pagina }}
        </button>
      </div>
    </LoadingST>
  </div>
</template>