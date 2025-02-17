import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Configurar la ruta base si es necesario
  base: process.env.NODE_ENV === 'production'
      ? '/DAR-Actividad03/'
      : '/',
  build: {
    // Establece el directorio de salida a "docs"
    outDir: 'docs'
  }
})
