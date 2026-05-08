import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@/features/auth/components/google-oauth-provider'
import { Toaster } from '@/shared/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/shared/components/ui/sonner'
import App from './App'
import '../styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider>
        <App />
        <Toaster />
        <SonnerToaster position="bottom-right" richColors />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
