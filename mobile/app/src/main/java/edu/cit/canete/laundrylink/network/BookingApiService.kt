package edu.cit.canete.laundrylink.network

import edu.cit.canete.laundrylink.network.model.*
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
