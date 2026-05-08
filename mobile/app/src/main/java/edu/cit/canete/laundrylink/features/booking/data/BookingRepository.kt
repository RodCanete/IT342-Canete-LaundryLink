package edu.cit.canete.laundrylink.features.booking.data

import edu.cit.canete.laundrylink.features.booking.data.model.Booking
import edu.cit.canete.laundrylink.features.booking.data.model.CreateBookingRequest
import edu.cit.canete.laundrylink.features.booking.data.model.CreatePaymentIntentRequest
import edu.cit.canete.laundrylink.features.booking.data.model.PaymentIntentResponse
import edu.cit.canete.laundrylink.features.booking.data.model.PaymentStatus
import edu.cit.canete.laundrylink.shared.network.RetrofitClient

class BookingRepository {

    private val api = RetrofitClient.bookingApiService

    suspend fun createBooking(
        shopId: String,
        serviceId: String,
        date: String,
        timeSlot: String,
        fileUrl: String?
    ): Result<Booking> = runCatching {
        val response = api.createBooking(
            CreateBookingRequest(shopId, serviceId, date, timeSlot, fileUrl)
        )
        if (response.isSuccessful && response.body() != null) {
            response.body()!!.data ?: throw Exception("No booking data returned")
        } else {
            throw Exception(response.body()?.error?.message ?: "Failed to create booking")
        }
    }

    suspend fun getMyBookings(): Result<List<Booking>> = runCatching {
        val response = api.getMyBookings()
        if (response.isSuccessful && response.body() != null) {
            response.body()!!.data ?: emptyList()
        } else {
            throw Exception(response.body()?.error?.message ?: "Failed to load bookings")
        }
    }

    suspend fun getBooking(bookingId: String): Result<Booking> = runCatching {
        val response = api.getBooking(bookingId)
        if (response.isSuccessful && response.body() != null) {
            response.body()!!.data ?: throw Exception("Booking not found")
        } else {
            throw Exception(response.body()?.error?.message ?: "Failed to load booking")
        }
    }

    suspend fun createPaymentIntent(bookingId: String): Result<PaymentIntentResponse> =
        runCatching {
            val response = api.createPaymentIntent(CreatePaymentIntentRequest(bookingId))
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.data ?: throw Exception("No payment data returned")
            } else {
                throw Exception(response.body()?.error?.message ?: "Failed to create payment")
            }
        }

    suspend fun getPaymentStatus(bookingId: String): Result<PaymentStatus> = runCatching {
        val response = api.getPaymentStatus(bookingId)
        if (response.isSuccessful && response.body() != null) {
            response.body()!!.data ?: throw Exception("Payment not found")
        } else {
            throw Exception(response.body()?.error?.message ?: "Failed to get payment status")
        }
    }
}
