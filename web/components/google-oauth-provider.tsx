'use client'

import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function GoogleOAuthProvider({ children }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    return children
  }

  return <GoogleProvider clientId={clientId}>{children}</GoogleProvider>
}