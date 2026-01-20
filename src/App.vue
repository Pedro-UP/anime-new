<script setup>
// Estado para controlar el menú móvil
import { ref } from 'vue'
const isMenuOpen = ref(false)
// Función para alternar el menú móvil
const toggleMenu = () => {
  // Alternamos el estado del menú
  isMenuOpen.value = !isMenuOpen.value
}
// Cerramos el menú cuando se hace clic en un enlace
const closeMenu = () => {
  // Cerramos el menú
  isMenuOpen.value = false
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50 overflow-hidden">
    <!-- Inicio de la barra de navegación -->
    <nav class="bg-white border-b border-gray-200 px-4 md:px-6 py-4 relative z-50 shadow-sm">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <!-- Logo y nombre del sitio interactivo (HOME) -->
        <router-link to="/" class="flex items-center group" @click="closeMenu">
          <span
            class="text-2xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
            ANIROOM
          </span>
          <span class="h-2 w-2 bg-indigo-600 rounded-full ml-1 self-end mb-1 md:mb-2"></span>
        </router-link>
        <!-- Botón de menú para móviles -->
        <button @click="toggleMenu" class="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <!-- Icono del menú -->
          <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <!-- Icono de cierre del menú -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <!-- Menu de navegación para escritorio -->
        <div class="hidden md:flex items-center gap-8">
          <router-link to="/anime" class="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            active-class="text-indigo-600 border-b-2 border-indigo-600">
            Animes
          </router-link>
          <router-link to="/personajes" class="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            active-class="text-indigo-600 border-b-2 border-indigo-600">
            Personajes
          </router-link>
          <router-link to="/acerca-de"
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 text-sm font-bold">
            Sobre nosotros
          </router-link>
        </div>
      </div>

      <!-- Menu de navegación desplegable para móviles -->
      <transition enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0">
        <!-- Contenido del menú móvil, solo se renderiza cuando isMenuOpen es verdadero -->
        <div v-if="isMenuOpen"
          class="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 p-4 flex flex-col gap-4 shadow-xl">
          <!-- Enlace a la página de animes -->
          <router-link to="/anime" @click="closeMenu"
            class="text-gray-600 font-bold p-2 hover:bg-indigo-50 rounded-lg">Animes</router-link>
          <!-- Enlace a la página de personajes -->
          <router-link to="/personajes" @click="closeMenu"
            class="text-gray-600 font-bold p-2 hover:bg-indigo-50 rounded-lg">Personajes</router-link>
          <!-- Enlace a la página de acerca de -->
          <router-link to="/acerca-de" @click="closeMenu"
            class="bg-indigo-600 text-white p-3 rounded-lg font-bold text-center">Sobre nosotros</router-link>
        </div>
      </transition>
    </nav>

    <!-- Contenedor principal para las vistas renderizadas por el router -->
    <main class="flex-1 overflow-y-auto p-4 md:p-8">
      <router-view />
    </main>
  </div>
</template>
