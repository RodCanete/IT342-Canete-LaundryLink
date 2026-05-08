import apiRequest from "@/shared/lib/api"
import type { BookingStatusApi, ServiceType } from "@/features/booking/api/booking-api"

export type AdminBookingApi = {
  id: string
  bookingCode: string
  status: BookingStatusApi
  bookingDate: string
  timeSlot: string
  shopId: string
  shopName: string
  serviceId: string
  serviceName: string
  serviceType: ServiceType
  servicePrice: number
  customerId: string
  customerName: string
  customerEmail: string
  fileUrl: string | null
  qrCodeUrl: string | null
  createdAt: string
}

export type AdminShopUsageApi = {
  id: string
  name: string
  address: string
  city: string
  currentLimit: number
  usedToday: number
  date: string
}

export type AdminSlotConfigResponse = {
  id: string
  shopId: string
  shopName: string
  serviceId: string
  date: string
  maxSlots: number
  reserved: number
}

export type SetDailyPriorityLimitPayload = {
  shopId: string
  date: string
  maxSlots: number
}

export async function listAdminBookings(params?: {
  date?: string
  status?: BookingStatusApi
  shopId?: string
  q?: string
}): Promise<AdminBookingApi[]> {
  const search = new URLSearchParams()
  if (params?.date) search.set("date", params.date)
  if (params?.status) search.set("status", params.status)
  if (params?.shopId) search.set("shopId", params.shopId)
  if (params?.q && params.q.trim()) search.set("q", params.q.trim())
  const qs = search.toString()
  return apiRequest<AdminBookingApi[]>(`/admin/bookings${qs ? `?${qs}` : ""}`)
}

export async function updateAdminBookingStatus(
  id: string,
  status: BookingStatusApi
): Promise<AdminBookingApi> {
  return apiRequest<AdminBookingApi>(`/admin/bookings/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}

export async function listAdminShops(): Promise<AdminShopUsageApi[]> {
  return apiRequest<AdminShopUsageApi[]>("/admin/shops")
}

export async function setShopDailyPriorityLimit(
  payload: SetDailyPriorityLimitPayload
): Promise<AdminSlotConfigResponse> {
  return apiRequest<AdminSlotConfigResponse>("/admin/slots", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}
