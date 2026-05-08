package edu.cit.canete.laundrylink.features.auth.data.model

data class AuthResponse(
    val success: Boolean,
    val data: AuthData?,
    val error: edu.cit.canete.laundrylink.shared.network.ApiError?,
    val timestamp: String?
)

data class AuthData(
    val user: UserDto,
    val accessToken: String
)
