package edu.cit.canete.laundrylink.features.booking.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.features.booking.data.BookingRepository
import edu.cit.canete.laundrylink.features.booking.data.model.Booking
import edu.cit.canete.laundrylink.features.booking.data.model.PaymentIntentResponse
import edu.cit.canete.laundrylink.features.booking.data.model.PaymentStatus
import kotlinx.coroutines.Job
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

    private var pollingJob: Job? = null

    fun load(bookingId: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            repo.getBooking(bookingId).fold(
                onSuccess = { booking ->
                    _state.value = _state.value.copy(loading = false, booking = booking)
                    if (booking.status == "PENDING_PAYMENT" && _state.value.paymentIntent == null) {
                        createPaymentIntent(bookingId)
                    }
                },
                onFailure = {
                    _state.value = _state.value.copy(loading = false, error = it.message)
                }
            )
        }
    }

    private fun createPaymentIntent(bookingId: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(initiatingPayment = true, error = null)
            repo.createPaymentIntent(bookingId).fold(
                onSuccess = { intent ->
                    _state.value = _state.value.copy(
                        initiatingPayment = false,
                        paymentIntent = intent
                    )
                },
                onFailure = {
                    _state.value = _state.value.copy(
                        initiatingPayment = false,
                        error = it.message
                    )
                }
            )
        }
    }

    fun startPaymentStatusPolling(bookingId: String) {
        if (pollingJob?.isActive == true) return
        if (isAlreadyPaid()) return

        pollingJob = viewModelScope.launch {
            var attempt = 0
            while (true) {
                val delayMs = when {
                    attempt < 5 -> 2_000L
                    attempt < 15 -> 4_000L
                    else -> 8_000L
                }
                delay(delayMs)
                attempt++

                val statusResult = repo.getPaymentStatus(bookingId)
                statusResult.onSuccess { status ->
                    _state.value = _state.value.copy(paymentStatus = status)
                    if (status.bookingStatus == "PAID") {
                        repo.getBooking(bookingId).onSuccess { booking ->
                            _state.value = _state.value.copy(booking = booking)
                        }
                        return@launch
                    }
                }
            }
        }
    }

    fun stopPaymentStatusPolling() {
        pollingJob?.cancel()
        pollingJob = null
    }

    fun onScreenResumed(bookingId: String) {
        if (isAlreadyPaid()) return
        viewModelScope.launch {
            repo.getBooking(bookingId).onSuccess { booking ->
                _state.value = _state.value.copy(booking = booking)
            }
        }
        startPaymentStatusPolling(bookingId)
    }

    private fun isAlreadyPaid(): Boolean {
        val s = _state.value
        return s.booking?.status == "PAID" || s.paymentStatus?.bookingStatus == "PAID"
    }

    override fun onCleared() {
        super.onCleared()
        pollingJob?.cancel()
    }
}
