package edu.cit.canete.laundrylink.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.network.model.Booking
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
    val serviceName: String = "",
    val servicePrice: Double = 0.0,
    val selectedDate: String = "",
    val slots: List<Slot> = emptyList(),
    val selectedSlot: Slot? = null,
    val fileUrl: String? = null,
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
        viewModelScope.launch {
            val servicesResult = shopRepo.getShopServices(shopId)
            val shopResult = shopRepo.getShop(shopId)
            val service = servicesResult.getOrNull()?.find { it.id == serviceId }
            val shop = shopResult.getOrNull()
            _state.value = _state.value.copy(
                shopId = shopId,
                serviceId = serviceId,
                shopName = shop?.name ?: "",
                serviceName = service?.name ?: "",
                servicePrice = service?.price ?: 0.0
            )
        }
    }

    fun selectDate(date: String) {
        _state.value = _state.value.copy(selectedDate = date, slots = emptyList(), selectedSlot = null)
        loadSlots(date)
    }

    private fun loadSlots(date: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(loadingSlots = true)
            val result = shopRepo.getSlots(_state.value.shopId, _state.value.serviceId, date)
            _state.value = _state.value.copy(
                loadingSlots = false,
                slots = result.getOrNull() ?: emptyList(),
                error = result.exceptionOrNull()?.message
            )
        }
    }

    fun selectSlot(slot: Slot) {
        _state.value = _state.value.copy(selectedSlot = slot)
    }

    fun proceedToStep(step: Int) {
        _state.value = _state.value.copy(step = step, error = null)
    }

    fun setFileUrl(url: String?) {
        _state.value = _state.value.copy(fileUrl = url)
    }

    fun submitBooking() {
        val s = _state.value
        val slot = s.selectedSlot ?: return
        viewModelScope.launch {
            _state.value = s.copy(submitting = true, error = null)
            val result = bookingRepo.createBooking(
                shopId = s.shopId,
                serviceId = s.serviceId,
                date = s.selectedDate,
                timeSlot = slot.startTime,
                fileUrl = s.fileUrl
            )
            if (result.isSuccess) {
                _state.value = _state.value.copy(submitting = false, createdBooking = result.getOrNull())
            } else {
                _state.value = _state.value.copy(submitting = false, error = result.exceptionOrNull()?.message)
            }
        }
    }
}
