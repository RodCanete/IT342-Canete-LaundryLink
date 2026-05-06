package edu.cit.canete.laundrylink.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.network.model.Booking
import edu.cit.canete.laundrylink.repository.BookingRepository
import edu.cit.canete.laundrylink.repository.ShopRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class BookingDisplay(
    val booking: Booking,
    val shopName: String,
    val serviceName: String,
    val servicePrice: Double
)

data class MyBookingsUiState(
    val loading: Boolean = true,
    val refreshing: Boolean = false,
    val all: List<BookingDisplay> = emptyList(),
    val filtered: List<BookingDisplay> = emptyList(),
    val activeFilter: String = "ALL",
    val counts: Map<String, Int> = emptyMap(),
    val error: String? = null
)

class MyBookingsViewModel : ViewModel() {

    private val bookingRepo = BookingRepository()
    private val shopRepo = ShopRepository()

    private val _state = MutableStateFlow(MyBookingsUiState())
    val state: StateFlow<MyBookingsUiState> = _state

    init { load(initial = true) }

    fun load(initial: Boolean = false) {
        viewModelScope.launch {
            _state.value = _state.value.copy(
                loading = initial,
                refreshing = !initial,
                error = null
            )
            val bookingsResult = bookingRepo.getMyBookings()
            if (bookingsResult.isFailure) {
                _state.value = _state.value.copy(
                    loading = false,
                    refreshing = false,
                    error = bookingsResult.exceptionOrNull()?.message
                )
                return@launch
            }

            val bookings = bookingsResult.getOrNull().orEmpty()
            val shopsResult = shopRepo.getShopsSummary()
            val shopSummaries = shopsResult.getOrNull().orEmpty()
            val shopNames = shopSummaries.associate { it.id to it.name }
            val serviceMap = shopSummaries.flatMap { it.services }
                .associateBy { it.id }

            val displays = bookings.map { booking ->
                val service = serviceMap[booking.serviceId]
                BookingDisplay(
                    booking = booking,
                    shopName = shopNames[booking.shopId] ?: "Unknown Shop",
                    serviceName = service?.name ?: "Unknown Service",
                    servicePrice = service?.price ?: 0.0
                )
            }

            val counts = mutableMapOf("ALL" to displays.size)
            displays.groupingBy { it.booking.status }.eachCount().forEach { (k, v) ->
                counts[k] = v
            }

            val activeFilter = _state.value.activeFilter
            val filtered = applyFilter(displays, activeFilter)

            _state.value = MyBookingsUiState(
                loading = false,
                refreshing = false,
                all = displays,
                filtered = filtered,
                activeFilter = activeFilter,
                counts = counts
            )
        }
    }

    fun filter(status: String) {
        val all = _state.value.all
        _state.value = _state.value.copy(
            filtered = applyFilter(all, status),
            activeFilter = status
        )
    }

    private fun applyFilter(all: List<BookingDisplay>, status: String): List<BookingDisplay> =
        if (status == "ALL") all else all.filter { it.booking.status == status }
}
