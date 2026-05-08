package edu.cit.canete.laundrylink.features.shop.data

import edu.cit.canete.laundrylink.features.shop.data.model.Service
import edu.cit.canete.laundrylink.features.shop.data.model.Shop
import edu.cit.canete.laundrylink.features.shop.data.model.ShopSummary
import edu.cit.canete.laundrylink.features.shop.data.model.Slot
import edu.cit.canete.laundrylink.shared.network.RetrofitClient

class ShopRepository {

    private val api = RetrofitClient.shopApiService

    suspend fun getShopsSummary(date: String? = null): Result<List<ShopSummary>> =
        runCatching {
            val response = api.getShopsSummary(date)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.data ?: emptyList()
            } else {
                val msg = response.body()?.error?.message ?: "Failed to load shops"
                throw Exception(msg)
            }
        }

    suspend fun getShop(shopId: String): Result<Shop> =
        runCatching {
            val response = api.getShop(shopId)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.data ?: throw Exception("Shop not found")
            } else {
                throw Exception(response.body()?.error?.message ?: "Failed to load shop")
            }
        }

    suspend fun getShopServices(shopId: String): Result<List<Service>> =
        runCatching {
            val response = api.getShopServices(shopId)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.data ?: emptyList()
            } else {
                throw Exception(response.body()?.error?.message ?: "Failed to load services")
            }
        }

    suspend fun getSlots(shopId: String, serviceId: String, date: String): Result<List<Slot>> =
        runCatching {
            val response = api.getSlots(shopId, serviceId, date)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.data ?: emptyList()
            } else {
                throw Exception(response.body()?.error?.message ?: "Failed to load slots")
            }
        }
}
