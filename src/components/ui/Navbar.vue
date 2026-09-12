<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search', 'open-categories'])
const searchQuery = ref('')

const handleSearch = () => {
    // Emitimos el término de búsqueda al padre (Anime.vue)
    emit('search', searchQuery.value)
}
const openCategories = (e) => {
    e.preventDefault()
    emit('open-categories')
}
</script>

<template>
    <div class="fixed inset-x-0 top-16 z-40">
        <nav class="bg-white shadow-md border-b border-gray-100 sticky top-0">
            <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <div class="flex items-center gap-8">
                    <h1 class="text-xl font-black text-indigo-600 tracking-tighter cursor-pointer">
                        ANIME<span class="text-gray-900">ST</span>
                    </h1>

                    <div class="hidden md:flex items-center gap-6">
                        <a href="#" @click="openCategories"
                            class="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">
                            Categorías
                        </a>
                    </div>
                </div>

                <div class="flex-1 max-w-sm ml-4">
                    <form @submit.prevent="handleSearch" class="relative">
                        <input v-model="searchQuery" type="text" placeholder="Buscar anime..."
                            class="w-full bg-gray-100 border-none rounded-full py-2 px-4 pl-10 focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                        <span class="absolute left-3 top-2.5 text-gray-400">
                            🔍
                        </span>
                    </form>
                </div>
            </div>
        </nav>
    </div>
</template>