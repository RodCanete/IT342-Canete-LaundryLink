package edu.cit.canete.laundrylink.features.booking.data

import edu.cit.canete.laundrylink.features.booking.data.model.Booking
import edu.cit.canete.laundrylink.features.booking.data.model.CreateBookingRequest
import edu.cit.canete.laundrylink.features.booking.data.model.CreatePaymentIntentRequest
import edu.cit.canete.laundrylink.features.booking.data.model.PaymentIntentResponse
import edu.cit.canete.laundrylink.features.booking.data.model.PaymentStatus
import edu.cit.canete.laundrylink.shared.network.ApiResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface BookingApiService {

    @POST("bookings")
    suspend fun createBooking(
        @Body request: CreateBookingRequest
    ): Response<ApiResponse<Booking>>

    @GET("bookings/my")
    suspend fun getMyBookings(): Response<ApiResponse<List<Booking>>>

    @GET("bookings/{id}")
    suspend fun getBooking(
        @Path("id") bookingId: String
    ): Response<ApiResponse<Booking>>

    @POST("payments/create-intent")
    suspend fun createPaymentIntent(
        @Body request: CreatePaymentIntentRequest
    ): Response<ApiResponse<PaymentIntentResponse>>

    @GET("payments/booking/{bookingId}")
    suspend fun getPaymentStatus(
        @Path("bookingId") bookingId: String
    ): Response<ApiResponse<PaymentStatus>>
}
