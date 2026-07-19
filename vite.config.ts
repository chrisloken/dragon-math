import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Required for project-site URL: https://<user>.github.io/dragon-math/
  base: '/dragon-math/',
})
