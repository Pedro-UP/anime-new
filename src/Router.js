import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/views/Home.vue'
import Anime from './components/views/Anime.vue'
import Personajes from './components/views/Personajes.vue'

// Aquí definimos las rutas
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/anime', name: 'Anime', component: () => import('./components/views/Anime.vue') },
  { path: '/personajes', name: 'Personajes', component: () => import('./components/views/Personajes.vue') },
  //   { path: '/acerca-de', name: 'AcercaDe', component: () => import('./components/AcercaDe.vue') },
]

const router = createRouter({
  // Usamos el historial basado en la web
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Middleware para cambiar el título de la página dinámicamente
router.afterEach((to) => {
  // Cambiamos el título de la página según la ruta
  const nombrePagina = to.name || 'Inicio';
  // Establecemos el título de la página
  document.title = `${nombrePagina} | AniRoom`
})

export default router