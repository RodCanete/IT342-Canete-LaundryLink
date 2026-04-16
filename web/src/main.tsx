import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@/components/google-oauth-provider'
import { Toaster } from '@/components/ui/toaster'
import App from './App'
import '../styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider>
        <App />
        <Toaster />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
