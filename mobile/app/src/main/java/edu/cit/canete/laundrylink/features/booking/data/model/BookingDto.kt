package edu.cit.canete.laundrylink.features.booking.data.model

data class Booking(
    val id: String,
    val bookingCode: String,
    val status: String,
    val bookingDate: String,
    val timeSlot: String,
    val shopId: String,
    val serviceId: String,
    val fileUrl: String?,
    val qrCodeUrl: String?,
    val createdAt: String
)

data class CreateBookingRequest(
    val shopId: String,
    val serviceId: String,
    val date: String,
    val timeSlot: String,
    val fileUrl: String?
)

data class CreatePaymentIntentRequest(
    val bookingId: String
)

data class PaymentIntentResponse(
    val paymentIntentId: String?,
    val checkoutSessionId: String?,
    val bookingId: String,
    val amount: Double,
    val currency: String,
    val status: String,
    val checkoutUrl: String?
)

data class PaymentStatus(
    val paymentIntentId: String?,
    val checkoutSessionId: String?,
    val status: String,
    val paidAt: String?,
    val bookingId: String,
    val bookingStatus: String,
    val amount: Double,
    val currency: String
)
