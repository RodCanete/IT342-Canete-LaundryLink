import apiRequest from "@/lib/api"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function assertUuid(value: string, fieldName: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`Invalid ${fieldName}: ${value}`)
  }
}

export function isUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value)
}

export type ServiceType = "STANDARD" | "PRIORITY"

export type ShopApi = {
  id: string
  name: string
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  operatingHours: string | null
  createdAt: string
}

export type ServiceApi = {
  id: string
  name: string
  serviceType: ServiceType
  price: number
  createdAt: string
}

export type SlotApi = {
  slotConfigId: string
  date: string
  startTime: string
  endTime: string
  maxSlots: number
  reserved: number
  available: number
}

export type BookingStatusApi =
  | "PENDING_PAYMENT"
  | "PAID"
  | "DROPPED_OFF"
  | "PROCESSING"
  | "COMPLETED"

export type BookingApi = {
  id: string
  bookingCode: string
  status: BookingStatusApi
  bookingDate: string
  timeSlot: string
  shopId: string
  serviceId: string
  fileUrl: string | null
  qrCodeUrl: string | null
  createdAt: string
}

export type ShopSummaryApi = {
  id: string
  name: string
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  operatingHours: string | null
  createdAt: string
  standardPrice: number
  priorityPrice: number
  prioritySlots: number
  services: ServiceApi[]
}

export type CreateBookingPayload = {
  shopId: string
  serviceId: string
  date: string
  timeSlot: string
}

export type CreatePaymentIntentPayload = {
  bookingId: string
}

export type PaymentStatusApi = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED"

export type PaymentIntentApi = {
  paymentIntentId: string
  checkoutSessionId: string | null
  bookingId: string
  amount: number
  currency: string
  status: PaymentStatusApi
  checkoutUrl: string
}

export type PaymentApi = {
  paymentIntentId: string
  checkoutSessionId: string | null
  bookingId: string
  bookingStatus: BookingStatusApi
  amount: number
  currency: string
  status: PaymentStatusApi
  paidAt: string | null
  eventType?: string
}

export async function listShops(): Promise<ShopApi[]> {
  return apiRequest<ShopApi[]>("/shops")
}

export async function listShopsSummary(date?: string): Promise<ShopSummaryApi[]> {
  if (date) {
    return apiRequest<ShopSummaryApi[]>(`/shops/summary?date=${encodeURIComponent(date)}`)
  }

  return apiRequest<ShopSummaryApi[]>("/shops/summary")
}

export async function getShop(shopId: string): Promise<ShopApi> {
  assertUuid(shopId, "shopId")
  return apiRequest<ShopApi>(`/shops/${shopId}`)
}

export async function listShopServices(shopId: string): Promise<ServiceApi[]> {
  if (!isUuid(shopId)) {
    return []
  }
  const services = await apiRequest<Array<ServiceApi & { shop?: unknown }>>(`/shops/${shopId}/services`)
  return services.map(({ shop, ...service }) => service)
}

export async function getSlots(params: {
  shopId: string
  serviceId: string
  date: string
}): Promise<SlotApi[]> {
  if (!isUuid(params.shopId) || !isUuid(params.serviceId)) {
    return []
  }
  const query = new URLSearchParams({
    shopId: params.shopId,
    serviceId: params.serviceId,
    date: params.date,
  })

  return apiRequest<SlotApi[]>(`/slots?${query.toString()}`)
}

export async function listMyBookings(): Promise<BookingApi[]> {
  return apiRequest<BookingApi[]>("/bookings/my")
}

export async function getBooking(bookingId: string): Promise<BookingApi> {
  assertUuid(bookingId, "bookingId")
  return apiRequest<BookingApi>(`/bookings/${bookingId}`)
}

export async function createBooking(payload: CreateBookingPayload): Promise<BookingApi> {
  assertUuid(payload.shopId, "shopId")
  assertUuid(payload.serviceId, "serviceId")
  return apiRequest<BookingApi>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function createPaymentIntent(payload: CreatePaymentIntentPayload): Promise<PaymentIntentApi> {
  assertUuid(payload.bookingId, "bookingId")
  return apiRequest<PaymentIntentApi>("/payments/create-intent", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getPaymentByBooking(bookingId: string): Promise<PaymentApi> {
  assertUuid(bookingId, "bookingId")
  return apiRequest<PaymentApi>(`/payments/booking/${bookingId}`)
}

export function toIsoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function formatBackendTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(":")
  const hours = Number(hoursStr)
  const minutes = Number(minutesStr)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time
  }

  const period = hours >= 12 ? "PM" : "AM"
  const normalizedHours = hours % 12 || 12
  return `${normalizedHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`
}

export function toBackendTime(displayTime: string): string {
  const match = displayTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (!match) {
    return displayTime
  }

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()

  if (period === "PM" && hours < 12) {
    hours += 12
  }

  if (period === "AM" && hours === 12) {
    hours = 0
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`
}

export function formatBookingDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function statusToLabel(status: BookingStatusApi): string {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Pending Payment"
    case "DROPPED_OFF":
      return "Dropped Off"
    case "PAID":
      return "Paid"
    case "PROCESSING":
      return "Processing"
    case "COMPLETED":
      return "Completed"
    default:
      return status
  }
}
