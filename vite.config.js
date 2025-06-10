import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'classic' }]
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'auth': ['./src/contexts/AuthContext.jsx'],
          'tasks': ['./src/contexts/TasksContext.jsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true
    }
  },
  define: {
    'process.env.NODE_ENV': '"development"'
  }
})
