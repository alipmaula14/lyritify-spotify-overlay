import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'lyritify/main/index.ts')
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'lyritify/preload/index.ts')
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'lyritify/renderer'),
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'lyritify/renderer/index.html'),
          settings: resolve(__dirname, 'lyritify/renderer/setting.html')
        }
      }
    },
    plugins: [react()]
  }
})