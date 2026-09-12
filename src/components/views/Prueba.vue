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
        error.value = null
        const respuesta = await fetch(url)
        const datos = await respuesta.json()
        animesRecientes.value = datos.data
        totalPaginas.value = datos.pagination?.last_visible_page || 1
        tituloVista.value = titulo
    } catch (err) {
        error.value = "No pudimos conectar con el servidor de anime."
    } finally {
        cargando.value = false
    }
}

// Función para obtener animes recientes con paginación
const obtenerAnimesRecientes = (pagina = 1) => {
    const url = `https://api.jikan.moe/v4/seasons/now?page=${pagina}&limit=${limite}`
    fetchAnimes(url, "Novedades en Emisión")
    paginaActual.value = pagina
}

// Función que se ejecuta cuando el Navbar emite 'search'
const buscarAnime = (query) => {
    // Si hay query, hacemos búsqueda por texto (y respetamos categoría si quieres combinar)
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

// Nueva función: buscar por categoría
// Nota: si tu API soporta filtrar por género/categoría en servidor, reemplaza la URL por la correcta.
// Aquí dejo un ejemplo genérico que puedes adaptar.
const buscarPorCategoria = (cat, pagina = 1) => {
    if (!cat) {
        obtenerAnimesRecientes(1)
        return
    }

    // Opción A: si tu backend/API acepta un parámetro por nombre de categoría, úsalo aquí.
    // Ejemplo genérico (ajusta según tu API real):
    const url = `https://api.jikan.moe/v4/anime?limit=${limite}&page=${pagina}&genres=${encodeURIComponent(cat)}`
    fetchAnimes(url, `Resultados para categoría: ${cat}`)
    paginaActual.value = pagina
}

// Reintentar carga
const reintentarCarga = () => obtenerAnimesRecientes(paginaActual.value)

// Se inicia la carga de datos al montar
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

            <!-- Lista de animes -->
            <div class="space-y-6">
                <div v-for="anime in animesRecientes" :key="anime.mal_id"
                    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 group">
                    <div class="relative w-full md:w-48 h-64 md:h-auto overflow-hidden">
                        <img :src="anime.images.jpg.large_image_url"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div
                            class="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                            {{ anime.status }}
                        </div>
                    </div>

                    <div class="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <h2
                                    class="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
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

                        <div class="mt-4 flex justify-end">
                            <button class="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
                                Ver detalles completos <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Paginación -->
            <div v-if="!cargando && !error" class="mt-10 flex justify-center gap-2">
                <button v-for="pagina in totalPaginas" :key="pagina" @click="obtenerAnimesRecientes(pagina)"
                    class="px-4 py-2 rounded-full font-bold transition-all duration-300" :class="paginaActual === pagina
                        ? 'bg-indigo-600 text-white shadow-lg scale-110'
                        : 'bg-pink-100 text-pink-700 hover:bg-pink-200 hover:scale-105'">
                    {{ pagina }}
                </button>
            </div>
        </LoadingST>
    </div>

    <!-- Modal de categorías -->
    <CategoriesModal :show="showCategories" :categories="categories" @close="showCategories = false"
        @select="(cat) => { selectedCategory = cat || ''; showCategories = false }" />
</template>