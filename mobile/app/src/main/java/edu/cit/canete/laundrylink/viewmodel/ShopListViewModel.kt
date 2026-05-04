package edu.cit.canete.laundrylink.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.network.model.ShopSummary
import edu.cit.canete.laundrylink.repository.ShopRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class ShopListState {
    object Loading : ShopListState()
    data class Success(val shops: List<ShopSummary>, val filtered: List<ShopSummary>) : ShopListState()
    data class Error(val message: String) : ShopListState()
}

class ShopListViewModel : ViewModel() {

    private val repository = ShopRepository()

    private val _state = MutableStateFlow<ShopListState>(ShopListState.Loading)
    val state: StateFlow<ShopListState> = _state

    private var allShops: List<ShopSummary> = emptyList()

    init { loadShops() }

    fun loadShops() {
        viewModelScope.launch {
            _state.value = ShopListState.Loading
            repository.getShopsSummary().fold(
                onSuccess = { shops ->
                    allShops = shops
                    _state.value = ShopListState.Success(shops, shops)
                },
                onFailure = { _state.value = ShopListState.Error(it.message ?: "Unknown error") }
            )
        }
    }

    fun filter(query: String) {
        val filtered = if (query.isBlank()) allShops
        else allShops.filter {
            it.name.contains(query, ignoreCase = true) ||
            it.address.contains(query, ignoreCase = true)
        }
        _state.value = ShopListState.Success(allShops, filtered)
    }
}
