package edu.cit.canete.laundrylink.features.shop.data

import edu.cit.canete.laundrylink.features.shop.data.model.Service
import edu.cit.canete.laundrylink.features.shop.data.model.Shop
import edu.cit.canete.laundrylink.features.shop.data.model.ShopSummary
import edu.cit.canete.laundrylink.features.shop.data.model.Slot
import edu.cit.canete.laundrylink.shared.network.ApiResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface ShopApiService {

    @GET("shops/summary")
    suspend fun getShopsSummary(
        @Query("date") date: String? = null,
        @Query("includeSlotAvailability") includeSlotAvailability: Boolean = false
    ): Response<ApiResponse<List<ShopSummary>>>

    @GET("shops/{id}")
    suspend fun getShop(
        @Path("id") shopId: String
    ): Response<ApiResponse<Shop>>

    @GET("shops/{id}/services")
    suspend fun getShopServices(
        @Path("id") shopId: String
    ): Response<ApiResponse<List<Service>>>

    @GET("slots")
    suspend fun getSlots(
        @Query("shopId") shopId: String,
        @Query("serviceId") serviceId: String,
        @Query("date") date: String
    ): Response<ApiResponse<List<Slot>>>
}
