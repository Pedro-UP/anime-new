<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingST from '@/components/ui/LoadingST.vue'
import { getAnimeById } from '@/service/animeApi'

const route = useRoute()
const router = useRouter()

const anime = ref(null)
const cargando = ref(true)
const error = ref(null)

const cargarDetalleAnime = async () => {
  const animeId = route.params.id
  if (!animeId) {
    error.value = 'ID de anime no válido'
    return
  }

  cargando.value = true
  error.value = null

  try {
    const data = await getAnimeById(animeId)
    anime.value = data
  } catch (err) {
    error.value = err.message || 'No fue posible cargar el detalle del anime'
  } finally {
    cargando.value = false
  }
}

const volverAtras = () => {
  router.back()
}

onMounted(() => {
  cargarDetalleAnime()
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      
      <!-- Botón para regresar -->
      <button 
        @click="volverAtras"
        class="mb-6 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md"
      >
        <span>←</span> Regresar
      </button>

      <!-- Manejador de estado de carga y error -->
      <LoadingST :cargando="cargando" :error="error" @retry="cargarDetalleAnime">
        <article v-if="anime" class="space-y-8">
          
          <!-- Banner Superior / Cover Image (si existe) -->
          <div 
            class="relative w-full h-48 md:h-72 rounded-3xl overflow-hidden bg-gray-800 shadow-2xl border border-gray-800"
          >
            <img 
              v-if="anime.coverImage"
              :src="anime.coverImage" 
              :alt="`Banner de ${anime.title}`"
              class="w-full h-full object-cover opacity-60 blur-xs"
            />
            <div v-else class="w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900 opacity-60"></div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          </div>

          <!-- Cabecera e Información Principal -->
          <div class="relative z-10 -mt-24 md:-mt-32 flex flex-col md:flex-row gap-8 items-start px-4">
            
            <!-- Poster -->
            <div class="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0 shadow-2xl rounded-2xl overflow-hidden border-4 border-gray-800">
              <img 
                :src="anime.images.jpg.large_image_url" 
                :alt="anime.title" 
                class="w-full h-auto object-cover"
              />
            </div>

            <!-- Metadatos Básicos -->
            <div class="flex-1 space-y-4">
              <div class="flex flex-wrap items-center gap-3">
                <span class="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {{ anime.type }}
                </span>
                <span class="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {{ anime.status }}
                </span>
                <span v-if="anime.score !== 'N/A'" class="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ {{ anime.score }} / 10
                </span>
              </div>

              <h1 class="text-3xl md:text-5xl font-black text-white leading-tight">
                {{ anime.title }}
              </h1>

              <!-- Badges de Géneros -->
              <div v-if="anime.genres && anime.genres.length" class="flex flex-wrap gap-2">
                <span 
                  v-for="genre in anime.genres" 
                  :key="genre.mal_id" 
                  class="bg-gray-800 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-lg border border-gray-700"
                >
                  {{ genre.name }}
                </span>
              </div>

              <!-- Estadísticas rápidas -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-800 text-sm">
                <div>
                  <p class="text-gray-400 text-xs">Episodios</p>
                  <p class="font-bold text-white">{{ anime.episodes }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Año de Estreno</p>
                  <p class="font-bold text-white">{{ anime.year }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Clasificación</p>
                  <p class="font-bold text-white">{{ anime.ageRating }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Rango Popularidad</p>
                  <p class="font-bold text-white">#{{ anime.popularityRank }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sinopsis -->
          <section class="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-800 space-y-3">
            <h2 class="text-xl font-bold text-white border-l-4 border-indigo-500 pl-3">
              Sinopsis
            </h2>
            <p class="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {{ anime.synopsis }}
            </p>
          </section>

          <!-- Tráiler de YouTube -->
          <section v-if="anime.youtubeVideoId" class="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-800 space-y-4">
            <h2 class="text-xl font-bold text-white border-l-4 border-red-500 pl-3">
              Tráiler Oficial
            </h2>
            <div class="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
              <iframe 
                :src="`https://www.youtube.com/embed/${anime.youtubeVideoId}`" 
                title="YouTube video player"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </section>

        </article>
      </LoadingST>
    </div>
  </div>
</template>