package edu.cit.canete.laundrylink.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.network.model.Booking
import edu.cit.canete.laundrylink.network.model.Service
import edu.cit.canete.laundrylink.network.model.Slot
import edu.cit.canete.laundrylink.repository.BookingRepository
import edu.cit.canete.laundrylink.repository.ShopRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class BookingFlowUiState(
    val step: Int = 1,
    val shopId: String = "",
    val serviceId: String = "",
    val shopName: String = "",
    val shopAddress: String = "",
    val serviceName: String = "",
    val servicePrice: Double = 0.0,
    val selectedDate: String = "",
    val slots: List<Slot> = emptyList(),
    val selectedSlot: Slot? = null,
    val fileName: String? = null,
    val loadingDetails: Boolean = true,
    val loadingSlots: Boolean = false,
    val submitting: Boolean = false,
    val error: String? = null,
    val createdBooking: Booking? = null
)

class BookingViewModel : ViewModel() {

    private val shopRepo = ShopRepository()
    private val bookingRepo = BookingRepository()

    private val _state = MutableStateFlow(BookingFlowUiState())
    val state: StateFlow<BookingFlowUiState> = _state

    fun init(shopId: String, serviceId: String) {
        if (_state.value.shopId == shopId && _state.value.serviceId.isNotEmpty()) return
        viewModelScope.launch {
            _state.value = _state.value.copy(
                shopId = shopId,
                serviceId = serviceId,
                loadingDetails = true,
                error = null
            )
            val servicesResult = shopRepo.getShopServices(shopId)
            val shopResult = shopRepo.getShop(shopId)

            val services: List<Service> = servicesResult.getOrNull().orEmpty()
            val resolvedService = pickService(services, serviceId)
            val shop = shopResult.getOrNull()

            val errorMsg = when {
                shopResult.isFailure -> shopResult.exceptionOrNull()?.message
                servicesResult.isFailure -> servicesResult.exceptionOrNull()?.message
                resolvedService == null && services.isEmpty() -> "This shop has no services available."
                else -> null
            }

            _state.value = _state.value.copy(
                shopName = shop?.name ?: "",
                shopAddress = shop?.address ?: "",
                serviceId = resolvedService?.id ?: serviceId,
                serviceName = resolvedService?.name ?: "",
                servicePrice = resolvedService?.price ?: 0.0,
                loadingDetails = false,
                error = errorMsg
            )
        }
    }

    private fun pickService(services: List<Service>, preferredId: String): Service? {
        if (services.isEmpty()) return null
        services.firstOrNull { it.id == preferredId }?.let { return it }
        services.firstOrNull { it.serviceType == "PRIORITY" }?.let { return it }
        return services.firstOrNull()
    }

    fun selectDate(date: String) {
        _state.value = _state.value.copy(
            selectedDate = date,
            slots = emptyList(),
            selectedSlot = null,
            error = null
        )
        loadSlots(date)
    }

    private fun loadSlots(date: String) {
        viewModelScope.launch {
            val s = _state.value
            if (s.shopId.isBlank() || s.serviceId.isBlank()) return@launch
            _state.value = _state.value.copy(loadingSlots = true)
            val result = shopRepo.getSlots(s.shopId, s.serviceId, date)
            _state.value = _state.value.copy(
                loadingSlots = false,
                slots = result.getOrNull().orEmpty(),
                error = result.exceptionOrNull()?.message
            )
        }
    }

    fun selectSlot(slot: Slot) {
        _state.value = _state.value.copy(selectedSlot = slot)
    }

    fun proceedToStep(step: Int) {
        _state.value = _state.value.copy(step = step.coerceIn(1, 4), error = null)
    }

    fun setFileName(name: String?) {
        _state.value = _state.value.copy(fileName = name)
    }

    fun onNavigatedToConfirmation() {
        _state.value = _state.value.copy(createdBooking = null)
    }

    fun submitBooking() {
        val s = _state.value
        val slot = s.selectedSlot ?: return
        val startTime = slot.startTime
        if (startTime.isNullOrBlank() || s.selectedDate.isBlank() ||
            s.shopId.isBlank() || s.serviceId.isBlank()
        ) {
            _state.value = s.copy(error = "Please complete all booking steps before confirming.")
            return
        }
        viewModelScope.launch {
            _state.value = _state.value.copy(submitting = true, error = null)
            val result = bookingRepo.createBooking(
                shopId = s.shopId,
                serviceId = s.serviceId,
                date = s.selectedDate,
                timeSlot = startTime,
                fileUrl = null
            )
            _state.value = if (result.isSuccess) {
                _state.value.copy(submitting = false, createdBooking = result.getOrNull())
            } else {
                _state.value.copy(
                    submitting = false,
                    error = result.exceptionOrNull()?.message ?: "Failed to create booking"
                )
            }
        }
    }
}
