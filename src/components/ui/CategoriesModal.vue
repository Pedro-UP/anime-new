<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['close', 'select'])
const props = defineProps({
    show: { type: Boolean, default: false },
    categories: { type: Array, default: () => [] }
})

const handleSelect = (cat) => {
    emit('select', cat)
    emit('close')
}

const onKeyDown = (e) => {
    if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
    <transition name="fade">
        <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>

            <div class="relative bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 z-10">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold">Selecciona una categoría</h2>
                    <button @click="$emit('close')" class="text-gray-500 hover:text-gray-800">✕</button>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <button v-for="cat in categories" :key="cat" @click="handleSelect(cat)"
                        class="text-sm py-2 px-3 rounded-md bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition">
                        {{ cat }}
                    </button>
                </div>

                <div class="mt-4">
                    <button @click="handleSelect('')" class="text-sm text-red-600">Limpiar filtro</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
