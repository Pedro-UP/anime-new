<script setup>
// Usamos script setup que simplifica la sintaxis en Vue 3 con Composition API
import { ref, onMounted } from 'vue'

// Estado reactivo
// Los estados reactivos son para que la interfaz de usuario se actualice automáticamente cuando los datos cambian.  
const listaAnimes = ref([])
const cargando = ref(true)
const error = ref(null)

// Función para obtener los datos de la API
const obtenerAnime = async () => {
  cargando.value = true
  error.value = null // <-- Limpiamos error anterior antes de empezar

  try {
    const respuesta = await fetch('https://api.jikan.moe/v4/top/anime?limit=10')
    // Aquí verificamos si la respuesta no fue exitosa ok es false
    if (!respuesta.ok) {
      throw new Error(`Error del servidor: ${respuesta.status}`)
    }

    const datos = await respuesta.json()
    listaAnimes.value = datos.data // Guardamos solo el array de animes
  } catch (err) {
    console.error("Error al obtener datos:", err)
    // Mostramos un mensaje de error amigable que explique el problema
    error.value = err.message || 'Error desconocido'
  } finally {
    cargando.value = false
  }
}

// Función para reintentar la carga
const reintentarCarga = () => {
  obtenerAnime()
}
// Llamamos la función al montar el componente
onMounted(() => {
  obtenerAnime()
})
</script>

<template>
  <div class="container mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Animes más Populares</h2>

    <!-- Estado de error -->
    <div v-if="error" class="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div class="text-9xl mb-4">🏮</div>
      <h1 class="text-6xl font-black text-indigo-900 mb-2">404</h1>
      <p class="text-xl text-gray-600 mb-6">¡Oye! Parece que los ninjas de la red se llevaron la información.</p>
      <!-- Mostrar detalle técnico del error -->
      <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 max-w-md">
        <p class="text-red-700 text-sm font-mono italic">
          Detalle técnico: {{ error }}
        </p>
      </div>
      <!-- Botón para reintentar la carga -->
      <button @click="reintentarCarga"
        class="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg">
        Intentar invocar de nuevo
      </button>
    </div>
    <!-- Estado de carga -->
    <div v-else-if="cargando" class="flex flex-col items-center justify-center min-h-[50vh]">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      <p class="mt-4 text-indigo-900 font-medium animate-pulse">Buscando en los archivos de AniRoom...</p>
    </div>

    <!-- Lista de animes -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
  </div>
</template>
