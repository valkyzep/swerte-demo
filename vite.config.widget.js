import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Example widget config
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173
  },
  build: {
    lib: {
      entry: 'src/widget-main.js', // CHANGED THIS LINE from widget.js
      name: 'SwerteMeter',
      fileName: 'swerte-meter-widget'
    },
    outDir: 'dist'
  }
})