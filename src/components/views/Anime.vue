<script setup>
import { ref, onMounted, watch } from 'vue'
import LoadingST from '@/components/ui/LoadingST.vue'
import Navbar from '@/components/ui/Navbar.vue'
import CategoriesModal from '@/components/ui/CategoriesModal.vue' // <-- importar modal

// Servicio API centralizado de Kitsu
import {
  getAnimesRecientes,
  buscarAnimePorTexto,
  buscarAnimePorCategoria
} from '@/service/animeApi'

// 1. ESTADOS REACTIVOS PARA LA INTERFAZ
// Todas las variables reactivas para que la UI se actualice automáticamente
const animesRecientes = ref([])
const cargando = ref(true)
const error = ref(null)
const paginaActual = ref(1)
const totalPaginas = ref(1)
const tituloVista = ref("Novedades en Emisión")

// Estado para rastrear qué filtro/búsqueda está activo en la paginación
const searchQuery = ref('')
const selectedCategory = ref('') // cadena vacía = sin filtro
const showCategories = ref(false)

// Lista de categorías (ajusta a tus categorías reales)
const categories = ref(['Shonen', 'Seinen', 'Shojo', 'Romcom', 'Drama', 'Isekai'])

// 2. FUNCIONES DE CARGA Y FILTRADO DE DATOS
// Carga principal: Animes en emisión / populares actuales
const obtenerAnimesRecientes = async (pagina = 1) => {
  try {
    cargando.value = true
    error.value = null // Limpiamos errores previos
    // Llamada al servicio API para obtener animes recientes
    const res = await getAnimesRecientes(pagina)
    animesRecientes.value = res.data // Guardamos los animes recientes
    totalPaginas.value = res.pagination.last_visible_page // Actualizamos el total de páginas según la respuesta
    tituloVista.value = "Novedades en Emisión"
    paginaActual.value = pagina
  } catch (err) {
    error.value = "No pudimos conectar con el servidor de anime."
  } finally {
    cargando.value = false
  }
}

// Búsqueda por palabra clave (emitida desde el Navbar)
const buscarAnime = async (query, pagina = 1) => {
  searchQuery.value = query // Guardamos la búsqueda actual para la paginación
  // Si la búsqueda está vacía, regresamos al filtro de categoría o a los recientes
  if (!query.trim()) {
    if (selectedCategory.value) {
      buscarPorCategoria(selectedCategory.value, 1)
      return
    }
    obtenerAnimesRecientes(1)
    return
  }

  // Si busca por texto, limpiamos la categoría seleccionada
  selectedCategory.value = ''

  try {
    cargando.value = true
    error.value = null
    const res = await buscarAnimePorTexto(query, pagina)

    animesRecientes.value = res.data
    totalPaginas.value = res.pagination.last_visible_page
    tituloVista.value = `Resultados para: ${query}`
    paginaActual.value = pagina
  } catch (err) {
    error.value = "Ocurrió un error al buscar el anime."
  } finally {
    cargando.value = false
  }
}

// Filtrado por categoría / género
const buscarPorCategoria = async (cat, pagina = 1) => {
  if (!cat) {
    obtenerAnimesRecientes(1)
    return
  }
  // Limpiamos el texto de búsqueda cuando se filtra por categoría
  searchQuery.value = ''
  try {
    cargando.value = true
    error.value = null
    const res = await buscarAnimePorCategoria(cat, pagina)
    // Llamada al servicio API para buscar por categoría
    animesRecientes.value = res.data
    totalPaginas.value = res.pagination.last_visible_page
    tituloVista.value = `Resultados para categoría: ${cat}`
    paginaActual.value = pagina
  } catch (err) {
    error.value = "No pudimos cargar los animes de esta categoría."
  } finally {
    cargando.value = false
  }
}

// 3. NAVEGACIÓN Y CICLO DE VIDA

// Función unificada de paginación que detecta qué tipo de contenido estamos viendo
const cambiarPagina = (nuevaPagina) => {
  if (selectedCategory.value) {
    buscarPorCategoria(selectedCategory.value, nuevaPagina)
  } else if (searchQuery.value) {
    buscarAnime(searchQuery.value, nuevaPagina)
  } else {
    obtenerAnimesRecientes(nuevaPagina)
  }
}

// Variable para guardar el anime que se mostrará en la ventana flotante
const animeSeleccionado = ref(null)
const abrirVistaPrevia = (anime) => {
  animeSeleccionado.value = anime
}
const cerrarVistaPrevia = () => {
  animeSeleccionado.value = null
}

// Función para reintentar la carga (se conecta con LoadingST)
const reintentarCarga = () => obtenerAnimesRecientes(paginaActual.value)
// Se inicia la carga de datos al cargar la vista para que el usuario no vea la pantalla vacía.
onMounted(() => obtenerAnimesRecientes())

// Cuando cambie la categoría seleccionada, reiniciamos paginación y pedimos datos
watch(selectedCategory, (nueva) => {
  paginaActual.value = 1
  if (!nueva) {
    obtenerAnimesRecientes(1)
  } else {
    buscarPorCategoria(nueva, 1)
  }
})
</script>

<template>
  <Navbar @search="buscarAnime" @open-categories="showCategories = true" />
  <div class="max-w-5xl mx-auto p-6">
    <LoadingST :cargando="cargando" :error="error" @retry="reintentarCarga">
      <header class="mb-10 border-b border-gray-200 pb-4">
        <h1 class="text-4xl font-black text-gray-900">{{ tituloVista }}</h1>
        <p class="text-gray-500">Los últimos episodios que están saliendo ahora mismo</p>
      </header>

      <!-- Indicador de categoría activa -->
      <div class="mb-6">
        <template v-if="selectedCategory">
          <span class="text-sm text-gray-600">Filtrando por: <strong class="text-indigo-600">{{
            selectedCategory }}</strong></span>
          <button @click="selectedCategory = ''" class="ml-3 text-sm text-red-600">Limpiar</button>
        </template>
      </div>

      <!-- Muestra los animes recientes en una lista y la paginación al final -->
      <div class="space-y-6">
        <!-- Tarjeta de anime vinculada dinámicamente a su detalle -->
        <div v-for="anime in animesRecientes" :key="anime.mal_id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 group">
          <!-- Enlace en la imagen del anime -->
          <div @click="abrirVistaPrevia(anime)" class="relative w-full md:w-48 h-64 md:h-auto overflow-hidden cursor-pointer">
  <img :src="anime.images.jpg.large_image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
  <div class="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
    {{ anime.status }}
  </div>
</div>

          <!-- Contenido del anime -->
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <!-- Título clickeable hacia el detalle -->
                <router-link :to="`/anime/${anime.mal_id}`"
                  class="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  <h2>{{ anime.title }}</h2>
                </router-link>

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
              <router-link :to="`/anime/${anime.mal_id}`"
                class="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
                Ver detalles completos <span>→</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación que solo se muestra cuando esta la lista de animes -->
      <div v-if="!cargando && !error" class="mt-10 flex justify-center gap-2">
        <!-- Botones de paginación solo aparecen si hay más de una página -->
        <button v-if="paginaActual > 1" @click="obtenerAnimesRecientes(paginaActual - 1)"
          class="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
          ←
        </button>

        <button v-for="pagina in Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(
          Math.max(0, Math.min(paginaActual - 6, totalPaginas - 10)),
          Math.min(totalPaginas, Math.max(10, paginaActual + 4))
        )" :key="pagina" @click="obtenerAnimesRecientes(pagina)"
          class="px-4 py-2 rounded-full font-bold transition-all duration-300" :class="paginaActual === pagina
            ? 'bg-indigo-600 text-white shadow-lg scale-110'
            : 'bg-pink-100 text-pink-700 hover:bg-pink-200 hover:scale-105'">
          {{ pagina }}
        </button>

        <button v-if="paginaActual < totalPaginas" @click="obtenerAnimesRecientes(paginaActual + 1)"
          class="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
          →
        </button>
      </div>
    </LoadingST>
  </div>

  <!-- Ventana Flotante / Modal -->
<div v-if="animeSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="cerrarVistaPrevia">
  <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative">
    
    <!-- Botón X para cerrar sin recargar la página -->
    <button @click="cerrarVistaPrevia" class="absolute top-3 right-3 bg-gray-900/70 hover:bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10">
      ✕
    </button>

    <!-- Imagen y Título -->
    <div class="relative h-56 w-full">
      <img :src="animeSeleccionado.images.jpg.large_image_url" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      <h3 class="absolute bottom-3 left-4 right-4 text-xl font-bold text-white drop-shadow">
        {{ animeSeleccionado.title }}
      </h3>
    </div>

    <!-- Sinopsis simple -->
    <div class="p-5">
      <p class="text-gray-600 text-sm max-h-40 overflow-y-auto italic">
        {{ animeSeleccionado.synopsis || 'Sin descripción disponible.' }}
      </p>
    </div>

  </div>
</div>
  <!-- Modal de categorías -->
  <CategoriesModal :show="showCategories" :categories="categories" @close="showCategories = false"
    @select="(cat) => { selectedCategory = cat || ''; showCategories = false }" />
</template>