import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: [
        'erimuga-frontend.onrender.com',
        'www.erindmuga.com',
        'erindmuga.com',
        'www.erindmuga.in',
        'erindmuga.in',
        'localhost'
      ],
      host: '0.0.0.0',
      port: parseInt(process.env.PORT) || 5173,
    },
    preview: {
      allowedHosts: [
        'erimuga-frontend.onrender.com',
        'www.erindmuga.com',
        'erindmuga.com',
        'www.erindmuga.in',
        'erindmuga.in',
        'localhost'
      ],
      host: '0.0.0.0',
      port: parseInt(process.env.PORT) || 4173,
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['lucide-react', 'react-hot-toast', 'framer-motion'],
            'vendor-charts': ['recharts', 'date-fns'],
            'vendor-http': ['axios'],
          },
        },
      },
    },
  }
})
