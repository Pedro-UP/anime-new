<template>
  <div class="container mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Animes más Populares</h2>

    <div v-if="cargando" class="text-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-gray-500">Cargando catálogo...</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      <div v-for="anime in listaAnimes" :key="anime.mal_id"
        class="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300 border border-gray-100">
        <img :src="anime.images.jpg.large_image_url" :alt="anime.title" class="w-full h-64 object-cover" />

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

<script setup>
import { ref, onMounted } from 'vue'

// Creamos una variable reactiva para guardar la lista de animes
const listaAnimes = ref([])
const cargando = ref(true)

// Función para obtener los datos de la API
const obtenerAnime = async () => {
  try {
    const respuesta = await fetch('https://api.jikan.moe/v4/top/anime?limit=10')
    const datos = await respuesta.json()
    listaAnimes.ref = datos.data // Guardamos solo el array de animes
    listaAnimes.value = datos.data
    cargando.value = false
  } catch (error) {
    console.error("Error al obtener datos:", error)
    cargando.value = false
  }
}
// Llamamos a la función cuando el componente se carga
onMounted(() => {
  obtenerAnime()
})</script>
