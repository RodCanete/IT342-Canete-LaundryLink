package edu.cit.canete.laundrylink.network

import edu.cit.canete.laundrylink.network.model.*
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface ShopApiService {

    @GET("shops/summary")
    suspend fun getShopsSummary(
        @Query("date") date: String? = null
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
