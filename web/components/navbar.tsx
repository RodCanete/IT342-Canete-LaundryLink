"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  WashingMachine,
  ChevronDown,
  LayoutDashboard,
  CalendarCheck2,
  Settings2,
  ShieldCheck,
  BookOpen,
} from "lucide-react"
import { getCurrentUser, getDashboardPath, logout, type User as AuthUser } from "@/lib/auth"

function getInitials(user: AuthUser): string {
  return ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase()
}

type NavLink = { label: string; href: string; icon?: React.ElementType }

const publicLinks: NavLink[] = [
  { label: "Find Shops", href: "/shops", icon: BookOpen },
  { label: "How It Works", href: "/#how-it-works" },
]

const customerLinks: NavLink[] = [
  { label: "Find Shops", href: "/shops", icon: BookOpen },
  { label: "My Bookings", href: "/bookings", icon: CalendarCheck2 },
]

const shopOwnerLinks: NavLink[] = [
  { label: "Dashboard", href: "/shop-owner/dashboard", icon: LayoutDashboard },
  { label: "Slot Config", href: "/admin/slots", icon: Settings2 },
]

const adminLinks: NavLink[] = [
  { label: "All Bookings", href: "/admin", icon: CalendarCheck2 },
  { label: "Slot Management", href: "/admin/slots", icon: Settings2 },
]

function getNavLinks(user: AuthUser | null): NavLink[] {
  if (!user) return publicLinks
  if (user.role === "CUSTOMER") return customerLinks
  if (user.role === "SHOP_OWNER") return shopOwnerLinks
  if (user.role === "ADMIN") return adminLinks
  return publicLinks
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const dashboardHref = user ? getDashboardPath(user.role) : "/login"
  const navigationLinks = getNavLinks(user)
  const initials = user ? getInitials(user) : ""
  const showBookNow = !user || user.role === "CUSTOMER"

  const handleLogout = () => {
    logout()
    setUser(null)
    setOpen(false)
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-lg shadow-sm">
      {/* Blue → cyan gradient bottom border — laundry water line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-accent to-primary opacity-90" />

      <div className="mx-auto flex h-15 max-w-7xl items-center justify-between px-4 py-3 lg:px-8">

        {/* ── Logo ── */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
            <WashingMachine className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            LaundryLink
          </span>
          {/* Role badge beside logo name */}
          {user?.role === "SHOP_OWNER" && (
            <span className="hidden rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent sm:inline-block">
              Shop Owner
            </span>
          )}
          {user?.role === "ADMIN" && (
            <span className="hidden rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning sm:inline-block">
              Admin
            </span>
          )}
        </Link>

        {/* ── Desktop nav links ── */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {link.icon && <link.icon className="h-3.5 w-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right side ── */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            /* Logged-in: avatar + name dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/60 px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                    {initials}
                  </span>
                  <span className="max-w-[90px] truncate">{user.firstName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* User info header */}
                <div className="border-b border-border px-3 py-2.5">
                  <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to={dashboardHref} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.role === "CUSTOMER" && (
                  <DropdownMenuItem asChild>
                    <Link to="/bookings" className="flex items-center gap-2">
                      <CalendarCheck2 className="h-4 w-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "SHOP_OWNER" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/slots" className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      Slot Config
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/slots" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Slot Management
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log In</Link>
            </Button>
          )}

          {showBookNow && (
            <Button
              asChild
              size="sm"
              style={{ animation: "pulse-glow 2.8s ease-in-out infinite" }}
            >
              <Link to="/shops">Book Now</Link>
            </Button>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-card">
            <div className="flex flex-col gap-5 pt-4">
              {/* Brand */}
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <WashingMachine className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">LaundryLink</span>
              </Link>

              {/* User identity pill */}
              {user && (
                <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-0.5 border-none bg-primary/10 px-1.5 py-0 text-[10px] text-primary"
                    >
                      {user.role === "SHOP_OWNER"
                        ? "Shop Owner"
                        : user.role === "ADMIN"
                        ? "Admin"
                        : "Customer"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex flex-col gap-1">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {link.icon && <link.icon className="h-4 w-4" />}
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Auth actions */}
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                {user ? (
                  <>
                    <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                      <Link to={dashboardHref}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                      <Link to="/login">Log In</Link>
                    </Button>
                    <Button asChild size="sm" onClick={() => setOpen(false)}>
                      <Link to="/register">Create Account</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
