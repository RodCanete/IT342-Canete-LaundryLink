import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, WashingMachine, ChevronDown } from "lucide-react"
import { getCurrentUser, getDashboardPath, logout, type User as AuthUser } from "@/lib/auth"

const navLinks = [
  { label: "Find Shops", href: "/shops" },
  { label: "How It Works", href: "/#how-it-works" },
]

const customerLinks = [
  { label: "Dashboard", href: "/customer/dashboard" },
  { label: "My Bookings", href: "/bookings" },
]

const shopOwnerLinks = [
  { label: "Dashboard", href: "/shop-owner/dashboard" },
  { label: "Find Shops", href: "/shops" },
]

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Slot Management", href: "/admin/slots" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const dashboardHref = user ? getDashboardPath(user.role) : "/login"
  const dashboardLabel = user
    ? user.role === "SHOP_OWNER"
      ? "Shop Owner Dashboard"
      : user.role === "ADMIN"
        ? "Admin Dashboard"
        : "Customer Dashboard"
    : "My Dashboard"

  const navigationLinks = user
    ? user.role === "CUSTOMER"
      ? customerLinks
      : user.role === "SHOP_OWNER"
        ? shopOwnerLinks
        : user.role === "ADMIN"
          ? adminLinks
          : navLinks
    : navLinks

  const handleLogout = () => {
    logout()
    setUser(null)
    setOpen(false)
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <WashingMachine className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            LaundryLink
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Account
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to={dashboardHref}>{dashboardLabel}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login">Log In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register">Create Account</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild size="sm">
            <Link to="/shops">Book Now</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-6 pt-6">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <WashingMachine className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">LaundryLink</span>
              </Link>
              <nav className="flex flex-col gap-1">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                {user ? (
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Log Out
                  </Button>
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
