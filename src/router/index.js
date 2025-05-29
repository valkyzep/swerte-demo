import { createRouter, createWebHistory } from 'vue-router'

// Import components with explicit .vue extension
import Home from '../pages/Home.vue'
import ApiKeyAdmin from '../pages/ApiKeyAdmin.vue'
import Admin from '../pages/Admin.vue'  // If you have a separate Admin page

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/api-keys', name: 'ApiKeyAdmin', component: ApiKeyAdmin },
  { path: '/admin', name: 'Admin', component: Admin }  // Add Admin route if needed
]

// Create router with proper base URL
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || ''),
  routes
})

// Add navigation error handling
router.onError((error) => {
  console.error('Router error:', error)
})

export default router