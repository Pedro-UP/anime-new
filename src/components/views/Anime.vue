<script setup>
import { ref, onMounted, watch } from 'vue'
import LoadingST from '@/components/ui/LoadingST.vue'
import Navbar from '@/components/ui/Navbar.vue'
import CategoriesModal from '@/components/ui/CategoriesModal.vue' // <-- importar modal

// Todas las variables reactivas para que la UI se actualice automáticamente
const animesRecientes = ref([])
const cargando = ref(true)
const error = ref(null)
const paginaActual = ref(1)
const totalPaginas = ref(1)
const limite = 10
const tituloVista = ref("Novedades en Emisión")

// Nuevo: estado para controlar modal y categoría seleccionada
const showCategories = ref(false)
const selectedCategory = ref('') // cadena vacía = sin filtro

// Lista de categorías (ajusta a tus categorías reales)
const categories = ref(['Shonen', 'Seinen', 'Shojo', 'Romcom', 'Drama', 'Isekai'])

// Función para obtener animes (General para temporada o búsqueda)
const fetchAnimes = async (url, titulo) => {
  try {
    cargando.value = true
    error.value = null // Limpiamos errores previos
    // La URL dinamica el page=${pagina} le indica a la API exactamente qué página queremos
    const respuesta = await fetch(url)
    const datos = await respuesta.json()
    animesRecientes.value = datos.data // Guardamos los animes recientes
    // La API de Jikan nos da dos partes principales data y pagination
    totalPaginas.value = datos.pagination?.last_visible_page || 1 // Last visible page nos dice el total de páginas disponibles
    tituloVista.value = titulo
  } catch (err) {
    error.value = "No pudimos conectar con el servidor de anime."
  } finally {
    cargando.value = false
  }
}
// Función para obtener animes recientes con paginación es una función asíncrona
const obtenerAnimesRecientes = (pagina = 1) => {
  const url = `https://api.jikan.moe/v4/seasons/now?page=${pagina}&limit=${limite}`
  fetchAnimes(url, "Novedades en Emisión")
  paginaActual.value = pagina
}
// Función que se ejecuta cuando el Navbar emite 'search'
const buscarAnime = (query) => {
  if (!query.trim()) {
    // Si no hay búsqueda por texto, pero hay categoría seleccionada, puedes buscar por categoría
    if (selectedCategory.value) {
      buscarPorCategoria(selectedCategory.value, 1)
      return
    }
    obtenerAnimesRecientes(1)
    return
  }
  // Ejemplo simple: búsqueda por texto (si quieres combinar con categoría, añade lógica aquí)
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limite}`
  fetchAnimes(url, `Resultados para: ${query}`)
  paginaActual.value = 1
}

//Creacion de Objeto para buscar por categoría a traves de mapeo
const genreMap = {
  Shonen: 27,
  Shojo: 25,
  Seinen: 42,
  Drama: 8,
  Romcom: 22, // puedes usar Romance (22) + Comedy (4) si quieres combinar
  Isekai: 62 // ejemplo, revisa el ID real en la lista
}

// Nueva función: buscar por categoría
// Nota: si tu API soporta filtrar por género/categoría en servidor, reemplaza la URL por la correcta.
// Aquí dejo un ejemplo genérico que puedes adaptar.
const buscarPorCategoria = (cat, pagina = 1) => {
  if (!cat) {
    obtenerAnimesRecientes(1)
    return
  }

  const genreId = genreMap[cat]
  if (!genreId) {
    // Si no existe el ID, mostramos recientes
    obtenerAnimesRecientes(1)
    return
  }

  const url = `https://api.jikan.moe/v4/anime?genres=${genreId}&page=${pagina}&limit=${limite}`
  fetchAnimes(url, `Resultados para categoría: ${cat}`)
  paginaActual.value = pagina
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
  <!-- Modal de categorías -->
  <CategoriesModal :show="showCategories" :categories="categories" @close="showCategories = false"
    @select="(cat) => { selectedCategory = cat || ''; showCategories = false }" />
</template>