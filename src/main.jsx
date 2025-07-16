import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/style.css'
import App from './App.jsx'
import { QueryProvider } from './lib/react-query/QueryProvider'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  // </StrictMode>,
)
