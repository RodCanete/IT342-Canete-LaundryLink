/**
 * ShopListPage tests
 *
 * Covers:
 *   TC-05-01  Shop list renders partner shops returned by the API
 *   TC-05-02  Shop card shows name, address, and pricing details
 *   TC-05-03  API failure surfaces an error message
 *   TC-05-04  Search input is present and accepts text
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ShopListPage } from '@/features/shops/components/shop-list-page'
import * as bookingApi from '@/features/booking/api/booking-api'

// ── Module-level mocks ────────────────────────────────────────────────────────

vi.mock('@/features/booking/api/booking-api', () => ({
  listShopsSummary: vi.fn(),
  // isUuid is a pure helper — keep real behaviour so UUID filtering works
  isUuid: (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),
  toIsoDateOnly: vi.fn(() => '2025-05-09'),
  // other exports used elsewhere
  createBooking: vi.fn(),
  createPaymentIntent: vi.fn(),
  formatBackendTime: vi.fn(),
  getShop: vi.fn(),
  getSlots: vi.fn(),
  listShopServices: vi.fn(),
}))

// ── Fake data ─────────────────────────────────────────────────────────────────

const fakeShops = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Clean & Fresh Laundry',
    address: '123 Main St, Cebu City',
    operatingHours: '8AM–6PM',
    standardPrice: 150,
    priorityPrice: 250,
    prioritySlots: 5,
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    name: 'Sunshine Wash Hub',
    address: '456 Oak Ave, Mandaue',
    operatingHours: '9AM–5PM',
    standardPrice: 120,
    priorityPrice: 200,
    prioritySlots: 2,
  },
]

// ── Helper ────────────────────────────────────────────────────────────────────

const renderShopList = () =>
  render(
    <MemoryRouter>
      <ShopListPage />
    </MemoryRouter>
  )

// ── TC-05-01: Shop list renders partner shops ─────────────────────────────────

describe('TC-05-01 — ShopListPage renders shops from API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading indicator while fetching', () => {
    vi.mocked(bookingApi.listShopsSummary).mockReturnValue(new Promise(() => {}))
    renderShopList()
    expect(screen.getByText(/loading available shops/i)).toBeInTheDocument()
  })

  it('renders all shop names after loading', async () => {
    vi.mocked(bookingApi.listShopsSummary).mockResolvedValue(fakeShops)
    renderShopList()

    await waitFor(() => {
      expect(screen.getByText('Clean & Fresh Laundry')).toBeInTheDocument()
      expect(screen.getByText('Sunshine Wash Hub')).toBeInTheDocument()
    })
  })

  it('removes the loading text once shops are loaded', async () => {
    vi.mocked(bookingApi.listShopsSummary).mockResolvedValue(fakeShops)
    renderShopList()

    await waitFor(() => {
      expect(screen.queryByText(/loading available shops/i)).not.toBeInTheDocument()
    })
  })
})

// ── TC-05-02: Shop card details ───────────────────────────────────────────────

describe('TC-05-02 — Each shop card shows required information', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(bookingApi.listShopsSummary).mockResolvedValue(fakeShops)
  })

  it('shows the shop address', async () => {
    renderShopList()
    await waitFor(() => {
      expect(screen.getByText('123 Main St, Cebu City')).toBeInTheDocument()
    })
  })

  it('shows standard and priority prices', async () => {
    renderShopList()
    await waitFor(() => {
      // Prices rendered as "PHP 150" and "PHP 250"
      expect(screen.getByText(/150/)).toBeInTheDocument()
      expect(screen.getByText(/250/)).toBeInTheDocument()
    })
  })

  it('renders a "View Shop & Book" button for each shop', async () => {
    renderShopList()
    await waitFor(() => {
      const bookLinks = screen.getAllByRole('link', { name: /view shop & book/i })
      expect(bookLinks).toHaveLength(fakeShops.length)
    })
  })

  it('filters out shops with non-UUID ids', async () => {
    const mixedShops = [
      ...fakeShops,
      { ...fakeShops[0], id: 'not-a-uuid', name: 'Invalid Shop' },
    ]
    vi.mocked(bookingApi.listShopsSummary).mockResolvedValue(mixedShops)
    renderShopList()

    await waitFor(() => {
      expect(screen.queryByText('Invalid Shop')).not.toBeInTheDocument()
      expect(screen.getByText('Clean & Fresh Laundry')).toBeInTheDocument()
    })
  })
})

// ── TC-05-03: API error message ───────────────────────────────────────────────

describe('TC-05-03 — ShopListPage shows error when API fails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays the error message when listShopsSummary rejects', async () => {
    vi.mocked(bookingApi.listShopsSummary).mockRejectedValue(
      new Error('Failed to load partner shops')
    )
    renderShopList()

    await waitFor(() => {
      expect(screen.getByText(/failed to load partner shops/i)).toBeInTheDocument()
    })
  })

  it('does not render shop cards when there is an error', async () => {
    vi.mocked(bookingApi.listShopsSummary).mockRejectedValue(new Error('Network error'))
    renderShopList()

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /view shop & book/i })).not.toBeInTheDocument()
    })
  })
})

// ── TC-05-04: Search input ────────────────────────────────────────────────────

describe('TC-05-04 — Search input is present', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(bookingApi.listShopsSummary).mockResolvedValue(fakeShops)
  })

  it('renders the search input placeholder', () => {
    renderShopList()
    expect(
      screen.getByPlaceholderText(/search shops by name or location/i)
    ).toBeInTheDocument()
  })
})
