import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Create the app with error handling
try {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
  console.log('Vue app mounted successfully')
} catch (error) {
  console.error('Failed to mount Vue app:', error)
}
