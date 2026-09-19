import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('firebase/auth') || id.includes('@firebase/auth')) {
            return 'firebase-auth'
          }
          if (id.includes('firebase/firestore') || id.includes('@firebase/firestore')) {
            return 'firebase-firestore'
          }
          if (id.includes('firebase') || id.includes('@firebase')) {
            return 'firebase-core'
          }
        },
      },
    },
  },
})
