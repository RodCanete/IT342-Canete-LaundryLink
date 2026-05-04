package edu.cit.canete.laundrylink.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.network.model.Booking
import edu.cit.canete.laundrylink.network.model.PaymentIntentResponse
import edu.cit.canete.laundrylink.network.model.PaymentStatus
import edu.cit.canete.laundrylink.repository.BookingRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ConfirmationUiState(
    val loading: Boolean = true,
    val booking: Booking? = null,
    val paymentIntent: PaymentIntentResponse? = null,
    val paymentStatus: PaymentStatus? = null,
    val error: String? = null,
    val initiatingPayment: Boolean = false
)

class BookingConfirmationViewModel : ViewModel() {

    private val repo = BookingRepository()

    private val _state = MutableStateFlow(ConfirmationUiState())
    val state: StateFlow<ConfirmationUiState> = _state

    fun load(bookingId: String) {
        viewModelScope.launch {
            _state.value = ConfirmationUiState(loading = true)
            repo.getBooking(bookingId).fold(
                onSuccess = { booking ->
                    _state.value = ConfirmationUiState(loading = false, booking = booking)
                    if (booking.status == "PENDING_PAYMENT") {
                        createPaymentIntent(bookingId)
                    }
                },
                onFailure = { _state.value = ConfirmationUiState(loading = false, error = it.message) }
            )
        }
    }

    fun createPaymentIntent(bookingId: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(initiatingPayment = true, error = null)
            repo.createPaymentIntent(bookingId).fold(
                onSuccess = { intent ->
                    _state.value = _state.value.copy(initiatingPayment = false, paymentIntent = intent)
                },
                onFailure = {
                    _state.value = _state.value.copy(initiatingPayment = false, error = it.message)
                }
            )
        }
    }

    fun pollPaymentStatus(bookingId: String) {
        viewModelScope.launch {
            repeat(8) {
                delay(4000L)
                repo.getPaymentStatus(bookingId).onSuccess { status ->
                    _state.value = _state.value.copy(paymentStatus = status)
                    if (status.bookingStatus == "PAID") return@launch
                }
            }
        }
    }
}
