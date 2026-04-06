"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getDashboardPath, type AuthRole } from "@/lib/auth"

type DashboardGuardProps = {
  allowedRole: AuthRole
  children: ReactNode
}

export function DashboardGuard({ allowedRole, children }: DashboardGuardProps) {
  const router = useRouter()
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()

    if (!user) {
      router.replace("/login")
      return
    }

    if (user.role !== allowedRole) {
      router.replace(getDashboardPath(user.role))
      return
    }

    setResolved(true)
  }, [allowedRole, router])

  if (!resolved) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}