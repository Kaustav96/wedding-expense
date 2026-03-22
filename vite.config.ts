import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use /wedding-expense/ for GitHub Pages, / for native mobile builds
  base: mode === 'mobile' ? '/' : '/wedding-expense/',
}))
