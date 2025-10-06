import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const process = globalThis.process || { env: {} }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Make environment variables available to the app
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.VITE_API_BASE_URL || ''
    ),
    'import.meta.env.VITE_CUSTOMER_APP_URL': JSON.stringify(
      process.env.VITE_CUSTOMER_APP_URL || ''
    )
  }
})
