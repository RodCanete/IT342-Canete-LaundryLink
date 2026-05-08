import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function GoogleOAuthProvider({ children }: Props) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    if (import.meta.env.DEV) {
      console.warn(
        'Google OAuth is disabled: VITE_GOOGLE_CLIENT_ID is missing in web/.env.local.'
      )
    }
    return children
  }

  return <GoogleProvider clientId={clientId}>{children}</GoogleProvider>
}