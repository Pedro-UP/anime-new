<script setup>
// 1. Importamos el archivo
// @ es un alias común para la carpeta 'src', pero también puedes usar './components/Home.vue'
import Home from './components/Home.vue'
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <!-- Logo de la aplicación con enlace a la ruta raíz -->
      <router-link to="/" class="flex items-center group">
        <span
          class="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-600 transition-all duration-300">
          ANIROOM
        </span>
        <span class="h-2 w-2 bg-indigo-600 rounded-full ml-1 self-end mb-2"></span>
      </router-link>
      <!-- Sección de enlaces de navegación -->
      <div class="flex items-center gap-8">
        <!-- Enlace a la sección de Animes -->
        <router-link to="/anime" class="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          active-class="text-indigo-600 border-b-2 border-indigo-600">
          Animes
        </router-link>
        <!-- Enlace a la sección de Personajes -->
        <router-link to="/personajes" class="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          active-class="text-indigo-600 border-b-2 border-indigo-600">
          Personajes
        </router-link>
        <!-- Botón destacado para la sección "Sobre nosotros" Se diferencia con fondo azul, texto blanco y sombra -->
        <router-link to="/acerca-de"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 text-sm font-bold">
          Sobre nosotros
        </router-link>
      </div>
    </nav>

    <main class="flex-1 overflow-y-auto p-8">
      <router-view />
    </main>
  </div>
</template>
