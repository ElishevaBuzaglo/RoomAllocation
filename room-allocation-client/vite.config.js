import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // כל קריאה שמתחילה ב-api/ תופנה לשרת ה-Backend
      '/api': {
        target: 'http://localhost:5000', // כתובת השרת שלך
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
