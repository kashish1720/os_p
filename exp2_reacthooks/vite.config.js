import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default {
  server: {
    strictPort: true,
    hmr: { overlay: false }, // Disable overlay messages
  },
}
