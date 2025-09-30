import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/homepage/',   // ✅ repo name goes here
  plugins: [react()],
})
