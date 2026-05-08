package edu.cit.canete.laundrylink.features.shop.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.features.shop.data.ShopRepository
import edu.cit.canete.laundrylink.features.shop.data.model.Service
import edu.cit.canete.laundrylink.features.shop.data.model.Shop
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ShopDetailUiState(
    val loading: Boolean = true,
    val shop: Shop? = null,
    val services: List<Service> = emptyList(),
    val error: String? = null
)

class ShopDetailViewModel : ViewModel() {

    private val repository = ShopRepository()

    private val _state = MutableStateFlow(ShopDetailUiState())
    val state: StateFlow<ShopDetailUiState> = _state

    fun load(shopId: String) {
        viewModelScope.launch {
            _state.value = ShopDetailUiState(loading = true)
            val shopResult = repository.getShop(shopId)
            val servicesResult = repository.getShopServices(shopId)
            if (shopResult.isSuccess && servicesResult.isSuccess) {
                _state.value = ShopDetailUiState(
                    loading = false,
                    shop = shopResult.getOrNull(),
                    services = servicesResult.getOrNull() ?: emptyList()
                )
            } else {
                val msg = (shopResult.exceptionOrNull() ?: servicesResult.exceptionOrNull())?.message
                _state.value = ShopDetailUiState(loading = false, error = msg ?: "Failed to load")
            }
        }
    }
}
