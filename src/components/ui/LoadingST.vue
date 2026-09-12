<script setup>
// Se importan las funciones necesarias para definir props y emitir eventos
import { defineProps, defineEmits } from 'vue'

// Props que recibirá el componente
const props = defineProps({
    cargando: { type: Boolean, default: false },
    error: { type: String, default: null }
})

// Emitimos eventos para que el padre pueda manejar acciones
const emit = defineEmits(['retry'])

</script>

<template>
    <div class="w-full">
        <!-- Estado de error -->
        <div v-if="error" class="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <div class="text-9xl mb-4">🏮</div>
            <h1 class="text-6xl font-black text-indigo-900 mb-2">404</h1>
            <p class="text-xl text-gray-600 mb-6">
                ¡Oye! Parece que los ninjas de la red se llevaron la información.
            </p>

            <!-- Mostrar detalle técnico del error -->
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 max-w-md">
                <p class="text-red-700 text-sm font-mono italic">
                    Detalle técnico: {{ error }}
                </p>
            </div>

            <!-- Botón para reintentar la carga -->
            <button @click="emit('retry')"
                class="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg">
                Intentar invocar de nuevo
            </button>
        </div>

        <!-- Estado de carga -->
        <div v-else-if="cargando" class="flex flex-col items-center justify-center min-h-[50vh]">
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <p class="mt-4 text-indigo-900 font-medium animate-pulse">
                Buscando en los archivos de AniRoom...
            </p>
        </div>

        <!-- Contenido principal: se renderiza solo si no hay error ni carga -->
        <div v-else>
            <slot />
        </div>
    </div>
</template>