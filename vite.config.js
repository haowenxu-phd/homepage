import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/haowen_xu_phd/',   // ✅ repo name goes here
  plugins: [react()],
})
