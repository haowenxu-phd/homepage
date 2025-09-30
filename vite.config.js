import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/homepage/',   // must be this
  plugins: [react()],
})