
import { useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser, getDashboardPath, isAuthenticated, type AuthRole } from "@/lib/auth"

type DashboardGuardProps = {
  allowedRole: AuthRole
  children: ReactNode
}

export function DashboardGuard({ allowedRole, children }: DashboardGuardProps) {
  const navigate = useNavigate()
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    const user = getCurrentUser()

    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== allowedRole) {
      navigate(getDashboardPath(user.role))
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