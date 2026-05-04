package edu.cit.canete.laundrylink.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.network.model.Booking
import edu.cit.canete.laundrylink.repository.BookingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class MyBookingsUiState(
    val loading: Boolean = true,
    val all: List<Booking> = emptyList(),
    val filtered: List<Booking> = emptyList(),
    val activeFilter: String = "ALL",
    val error: String? = null
)

class MyBookingsViewModel : ViewModel() {

    private val repo = BookingRepository()

    private val _state = MutableStateFlow(MyBookingsUiState())
    val state: StateFlow<MyBookingsUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = MyBookingsUiState(loading = true)
            repo.getMyBookings().fold(
                onSuccess = { bookings ->
                    _state.value = MyBookingsUiState(
                        loading = false,
                        all = bookings,
                        filtered = bookings,
                        activeFilter = "ALL"
                    )
                },
                onFailure = { _state.value = MyBookingsUiState(loading = false, error = it.message) }
            )
        }
    }

    fun filter(status: String) {
        val filtered = if (status == "ALL") _state.value.all
        else _state.value.all.filter { it.status == status }
        _state.value = _state.value.copy(filtered = filtered, activeFilter = status)
    }
}
