package edu.cit.canete.laundrylink.network.model

data class AuthResponse(
    val success: Boolean,
    val data: AuthData?,
    val error: ApiError?,
    val timestamp: String?
)

data class AuthData(
    val user: UserDto,
    val accessToken: String
)

data class ApiError(
    val code: String,
    val message: String
)
