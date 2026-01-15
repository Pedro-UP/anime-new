import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Anime from './components/Anime.vue'
import Personajes from './components/Personajes.vue'    

// Aquí definimos las rutas
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/anime', name: 'Anime', component: () => import('./components/Anime.vue') },
  { path: '/personajes', name: 'Personajes', component: () => import('./components/Personajes.vue') },
//   { path: '/acerca-de', name: 'AcercaDe', component: () => import('./components/AcercaDe.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// --- AQUÍ ESTÁ EL TRUCO DEL TÍTULO ---
router.afterEach((to) => {
  document.title = `${to.name} | AniRoom`
})

export default router