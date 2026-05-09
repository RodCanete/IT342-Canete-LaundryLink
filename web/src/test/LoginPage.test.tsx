/**
 * LoginPage tests
 *
 * Covers:
 *   TC-02-01  Login form renders correctly (email, password, submit button)
 *   TC-02-02  Submitting valid credentials calls the auth API
 *   TC-01-03  "Create one" link points to /register (registration entry point)
 *   TC-02-03  API error is surfaced as an error message in the UI
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@/src/pages/LoginPage'
import * as authApi from '@/features/auth/api/auth-api'

// ── Module-level mocks (hoisted by Vitest) ────────────────────────────────────

vi.mock('@/features/auth/api/auth-api', () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  getDashboardPath: vi.fn(() => '/customer/dashboard'),
  getCurrentUser: vi.fn(),
}))

vi.mock('@/shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button type="button">Sign in with Google</button>,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )

const fakeUser = {
  id: 'u-1',
  email: 'user@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'CUSTOMER' as const,
}

// ── TC-02-01: Form renders correctly ─────────────────────────────────────────

describe('TC-02-01 — LoginPage renders the login form', () => {
  it('shows the email input field', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('shows the password input field', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('shows the Log In submit button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('does not show an error alert on initial render', () => {
    renderLoginPage()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

// ── TC-01-03: Registration link is present ────────────────────────────────────

describe('TC-01-03 — Registration link navigates to /register', () => {
  it('renders a "Create one" link to /register', () => {
    renderLoginPage()
    const link = screen.getByRole('link', { name: /create one/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/register')
  })
})

// ── TC-02-02: Login with valid credentials ────────────────────────────────────

describe('TC-02-02 — Submitting valid credentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls login() with the entered email and password', async () => {
    const mockLogin = vi.mocked(authApi.login)
    mockLogin.mockResolvedValueOnce({ user: fakeUser, accessToken: 'tok-abc' })

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'securePass123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'securePass123',
      })
    })
  })

  it('disables the Log In button while the request is in flight', async () => {
    const mockLogin = vi.mocked(authApi.login)
    // Never resolves during the test — keeps the button in loading state
    mockLogin.mockReturnValue(new Promise(() => {}))

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
    })
  })
})

// ── TC-02-03: API error surfaces as UI error message ─────────────────────────

describe('TC-02-03 — Login failure shows an error', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays the error message when login() rejects', async () => {
    const mockLogin = vi.mocked(authApi.login)
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'bad@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('re-enables the Log In button after an error', async () => {
    const mockLogin = vi.mocked(authApi.login)
    mockLogin.mockRejectedValueOnce(new Error('Server error'))

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })
  })
})
