import apiRequest from "@/shared/lib/api"
import type {
  BookingApi,
  BookingStatusApi,
  ServiceApi,
  ServiceType,
  ShopApi,
  SlotApi,
} from "@/features/booking/api/booking-api"

export type OwnerShopApi = ShopApi

export type OwnerServiceApi = ServiceApi

export type OwnerSlotApi = {
  id: string
  serviceId: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  maxSlots: number
  reserved: number
  available: number
}

export type OwnerBookingApi = BookingApi & {
  serviceName: string
  serviceType: ServiceType
  servicePrice: number
  customerId: string
  customerName: string
  customerEmail: string
}

export type OwnerDashboardSlotSummary = {
  date: string
  used: number
  limit: number
}

export type OwnerDashboardApi = {
  shop: OwnerShopApi
  todaysBookings: number
  activeCustomers: number
  prioritySlotsUsed: number
  prioritySlotsCapacity: number
  recentBookings: OwnerBookingApi[]
  slotSummary: OwnerDashboardSlotSummary[]
}

export type UpdateShopPayload = {
  name: string
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  operatingHours: string | null
}

export type ServicePayload = {
  name: string
  serviceType: ServiceType
  price: number
}

export type SlotConfigPayload = {
  serviceId: string
  date: string
  startTime: string
  endTime: string
  maxSlots: number
}

export async function getMyShop(): Promise<OwnerShopApi> {
  return apiRequest<OwnerShopApi>("/owner/shop")
}

export async function updateMyShop(payload: UpdateShopPayload): Promise<OwnerShopApi> {
  return apiRequest<OwnerShopApi>("/owner/shop", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function listMyServices(): Promise<OwnerServiceApi[]> {
  return apiRequest<OwnerServiceApi[]>("/owner/services")
}

export async function createService(payload: ServicePayload): Promise<OwnerServiceApi> {
  return apiRequest<OwnerServiceApi>("/owner/services", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateService(id: string, payload: ServicePayload): Promise<OwnerServiceApi> {
  return apiRequest<OwnerServiceApi>(`/owner/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deleteService(id: string): Promise<void> {
  await apiRequest<unknown>(`/owner/services/${id}`, {
    method: "DELETE",
  })
}

export async function listMySlots(params?: { date?: string; serviceId?: string }): Promise<OwnerSlotApi[]> {
  const search = new URLSearchParams()
  if (params?.date) search.set("date", params.date)
  if (params?.serviceId) search.set("serviceId", params.serviceId)
  const qs = search.toString()
  return apiRequest<OwnerSlotApi[]>(`/owner/slots${qs ? `?${qs}` : ""}`)
}

export async function createSlot(payload: SlotConfigPayload): Promise<OwnerSlotApi> {
  return apiRequest<OwnerSlotApi>("/owner/slots", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateSlot(id: string, payload: SlotConfigPayload): Promise<OwnerSlotApi> {
  return apiRequest<OwnerSlotApi>(`/owner/slots/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deleteSlot(id: string): Promise<void> {
  await apiRequest<unknown>(`/owner/slots/${id}`, {
    method: "DELETE",
  })
}

export async function listMyOwnerBookings(params?: {
  date?: string
  status?: BookingStatusApi
}): Promise<OwnerBookingApi[]> {
  const search = new URLSearchParams()
  if (params?.date) search.set("date", params.date)
  if (params?.status) search.set("status", params.status)
  const qs = search.toString()
  return apiRequest<OwnerBookingApi[]>(`/owner/bookings${qs ? `?${qs}` : ""}`)
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatusApi
): Promise<OwnerBookingApi> {
  return apiRequest<OwnerBookingApi>(`/owner/bookings/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}

export async function getOwnerDashboard(): Promise<OwnerDashboardApi> {
  return apiRequest<OwnerDashboardApi>("/owner/dashboard")
}
