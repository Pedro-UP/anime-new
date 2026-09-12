<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingST from '@/components/ui/LoadingST.vue'
import { getPersonajeById } from '@/service/animeApi'

// Instancias del router
const route = useRoute()
const router = useRouter()

// Estados reactivos
const personaje = ref(null)
const cargando = ref(true)
const error = ref(null)

// Carga los detalles del personaje usando la función centralizada en animeApi.js
const cargarDetallePersonaje = async () => {
    const personajeId = route.params.id
    if (!personajeId) {
        error.value = 'ID de personaje no válido'
        return
    }

    cargando.value = true
    error.value = null

    try {
        const data = await getPersonajeById(personajeId)
        personaje.value = data
    } catch (err) {
        error.value = err.message || 'No fue posible cargar el detalle del personaje'
    } finally {
        cargando.value = false
    }
}

// Navegación hacia la página previa
const volverAtras = () => {
    router.back()
}

onMounted(() => {
    cargarDetallePersonaje()
})
</script>

<template>
    <div class="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">

            <!-- Botón para regresar -->
            <button @click="volverAtras"
                class="mb-6 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md cursor-pointer">
                <span>←</span> Regresar
            </button>

            <!-- Gestor de estado de carga y errores -->
            <LoadingST :cargando="cargando" :error="error" @retry="cargarDetallePersonaje">
                <article v-if="personaje"
                    class="bg-gray-800/60 rounded-3xl p-6 md:p-10 border border-gray-700/50 shadow-2xl flex flex-col md:flex-row gap-8 items-start">

                    <!-- Poster / Imagen del Personaje -->
                    <div
                        class="w-full md:w-72 flex-shrink-0 mx-auto rounded-2xl overflow-hidden border-4 border-gray-700 shadow-xl">
                        <img :src="personaje.image || 'https://via.placeholder.com/300x400?text=Sin+Imagen'"
                            :alt="personaje.name" class="w-full h-auto object-cover" />
                    </div>

                    <!-- Información Principal -->
                    <div class="flex-1 space-y-6">
                        <div>
                            <span class="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                Personaje
                            </span>

                            <h1 class="text-3xl md:text-5xl font-black text-white mt-3 leading-tight">
                                {{ personaje.name }}
                            </h1>

                            <!-- Nombres alternativos o apodos -->
                            <div v-if="personaje.otherNames && personaje.otherNames.length"
                                class="flex flex-wrap gap-2 mt-4">
                                <span v-for="(name, index) in personaje.otherNames" :key="index"
                                    class="bg-gray-700/80 text-indigo-300 text-xs px-3 py-1 rounded-lg border border-gray-600/50">
                                    {{ name }}
                                </span>
                            </div>
                        </div>

                        <!-- Biografía o descripción -->
                        <div class="border-t border-gray-700/60 pt-6">
                            <h2 class="text-xl font-bold text-white border-l-4 border-indigo-500 pl-3 mb-3">
                                Biografía / Descripción
                            </h2>
                            <div class="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line max-h-96 overflow-y-auto pr-2 scrollbar-thin"
                                v-html="personaje.description"></div>
                        </div>
                    </div>

                </article>
            </LoadingST>
        </div>
    </div>
</template>