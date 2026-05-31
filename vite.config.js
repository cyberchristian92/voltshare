import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// base: '/' funciona para Vercel/Netlify e `npm run preview`.
// Para GitHub Pages em https://usuario.github.io/REPO/, troque para base: '/REPO/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
