package edu.cit.canete.laundrylink.features.shop.data.model

data class Shop(
    val id: String,
    val name: String,
    val address: String,
    val city: String,
    val latitude: Double?,
    val longitude: Double?,
    val operatingHours: String?,
    val createdAt: String
)

data class ShopSummaryService(
    val id: String,
    val name: String,
    val serviceType: String,
    val price: Double,
    val createdAt: String
)

data class ShopSummary(
    val id: String,
    val name: String,
    val address: String,
    val city: String,
    val latitude: Double?,
    val longitude: Double?,
    val operatingHours: String?,
    val standardPrice: Double?,
    val priorityPrice: Double?,
    val prioritySlots: Int?,
    val services: List<ShopSummaryService>,
    val createdAt: String
)

data class Service(
    val id: String,
    val name: String,
    val serviceType: String,
    val price: Double,
    val createdAt: String
)

data class Slot(
    val slotConfigId: String,
    val date: String?,
    val startTime: String?,
    val endTime: String?,
    val maxSlots: Int = 0,
    val reserved: Int = 0,
    val available: Int = 0
)
