import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: [
        'erimuga-frontend.onrender.com',
        'www.erindmuga.in',
        'erindmuga.in',
        'localhost'
      ], 
      host: '0.0.0.0',
      port: parseInt(process.env.PORT) || 5173, // 👈 important for Render
    },
    preview: {
      allowedHosts: [
        'erimuga-frontend.onrender.com',
        'www.erindmuga.in',
        'erindmuga.in',
        'localhost'
      ],
      host: '0.0.0.0',
      port: parseInt(process.env.PORT) || 4173, // for `vite preview`
    },
  }
})
