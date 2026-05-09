/**
 * BookingFlow tests
 *
 * Covers:
 *   TC-08-01  Booking flow renders step indicators and shop/service info
 *   TC-08-02  Loading state is shown while shop details are being fetched
 *   TC-08-03  Error message shown when API returns an error (no available slots)
 *   TC-08-04  Back-to-shop link is rendered after loading
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingFlow } from '@/features/booking/components/booking-flow'
import * as bookingApi from '@/features/booking/api/booking-api'
import * as authApi from '@/features/auth/api/auth-api'
import * as attachments from '@/shared/lib/attachments'

// ── Module-level mocks ────────────────────────────────────────────────────────

vi.mock('@/features/booking/api/booking-api', () => ({
  getShop: vi.fn(),
  listShopServices: vi.fn(),
  getSlots: vi.fn(),
  createBooking: vi.fn(),
  createPaymentIntent: vi.fn(),
  formatBackendTime: vi.fn((t: string) => t),
  toIsoDateOnly: vi.fn(() => '2025-05-10'),
  isUuid: vi.fn(() => true),
  listShopsSummary: vi.fn(),
}))

vi.mock('@/features/auth/api/auth-api', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  getDashboardPath: vi.fn(),
}))

vi.mock('@/shared/lib/attachments', () => ({
  uploadAttachment: vi.fn(),
  validateAttachment: vi.fn(),
}))

vi.mock('@/shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

// ── Fake data ─────────────────────────────────────────────────────────────────

const SHOP_ID = '123e4567-e89b-12d3-a456-426614174000'

const fakeShop = {
  id: SHOP_ID,
  name: 'Clean & Fresh Laundry',
  address: '123 Main St, Cebu City',
  city: 'Cebu City',
  latitude: null,
  longitude: null,
  operatingHours: '8AM–6PM',
  createdAt: '2024-01-01T00:00:00Z',
}

const fakeService = {
  id: 'svc-1',
  name: 'Priority Wash',
  serviceType: 'PRIORITY' as const,
  price: 250,
  createdAt: '2024-01-01T00:00:00Z',
}

// ── Helper ────────────────────────────────────────────────────────────────────

const renderFlow = (shopId = SHOP_ID) =>
  render(
    <MemoryRouter>
      <BookingFlow shopId={shopId} />
    </MemoryRouter>
  )

// ── TC-08-02: Loading state ───────────────────────────────────────────────────

describe('TC-08-02 — BookingFlow shows loading state', () => {
  it('renders "Loading booking details..." while fetching shop info', () => {
    vi.mocked(bookingApi.getShop).mockReturnValue(new Promise(() => {}))
    vi.mocked(bookingApi.listShopServices).mockReturnValue(new Promise(() => {}))

    renderFlow()

    expect(screen.getByText(/loading booking details/i)).toBeInTheDocument()
  })
})

// ── TC-08-01: Booking flow renders step indicators ────────────────────────────

describe('TC-08-01 — BookingFlow renders step indicators after loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(bookingApi.getShop).mockResolvedValue(fakeShop)
    vi.mocked(bookingApi.listShopServices).mockResolvedValue([fakeService])
  })

  it('shows the "Book a Slot" heading', async () => {
    renderFlow()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /book a slot/i })).toBeInTheDocument()
    })
  })

  it('shows all 4 step labels: Date, Time, Upload, Summary', async () => {
    renderFlow()
    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Time')).toBeInTheDocument()
      expect(screen.getByText('Upload')).toBeInTheDocument()
      expect(screen.getByText('Summary')).toBeInTheDocument()
    })
  })

  it('shows the shop name and service name in the subtitle', async () => {
    renderFlow()
    await waitFor(() => {
      expect(screen.getByText(/clean & fresh laundry/i)).toBeInTheDocument()
      expect(screen.getByText(/priority wash/i)).toBeInTheDocument()
    })
  })
})

// ── TC-08-04: Back link ───────────────────────────────────────────────────────

describe('TC-08-04 — Back to Shop link is rendered', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(bookingApi.getShop).mockResolvedValue(fakeShop)
    vi.mocked(bookingApi.listShopServices).mockResolvedValue([fakeService])
  })

  it('renders a "Back to Shop" navigation link', async () => {
    renderFlow()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /back to shop/i })).toBeInTheDocument()
    })
  })

  it('Back to Shop link points to the correct shop URL', async () => {
    renderFlow()
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /back to shop/i })
      expect(link).toHaveAttribute('href', `/shops/${SHOP_ID}`)
    })
  })
})

// ── TC-08-03: Error state when shop/service unavailable ───────────────────────

describe('TC-08-03 — BookingFlow shows error when shop data fails to load', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays error message when getShop rejects', async () => {
    vi.mocked(bookingApi.getShop).mockRejectedValue(new Error('Shop not found'))
    vi.mocked(bookingApi.listShopServices).mockResolvedValue([fakeService])

    renderFlow()

    await waitFor(() => {
      expect(screen.getByText(/shop not found/i)).toBeInTheDocument()
    })
  })

  it('displays fallback message when service list is empty', async () => {
    vi.mocked(bookingApi.getShop).mockResolvedValue(fakeShop)
    vi.mocked(bookingApi.listShopServices).mockResolvedValue([])

    renderFlow()

    await waitFor(() => {
      // When no service is selected, the error/unavailable panel is shown
      expect(
        screen.getByText(/booking details are unavailable for this shop/i)
      ).toBeInTheDocument()
    })
  })

  it('does not render step indicators when there is an error', async () => {
    vi.mocked(bookingApi.getShop).mockRejectedValue(new Error('Network error'))
    vi.mocked(bookingApi.listShopServices).mockRejectedValue(new Error('Network error'))

    renderFlow()

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /book a slot/i })).not.toBeInTheDocument()
    })
  })
})
