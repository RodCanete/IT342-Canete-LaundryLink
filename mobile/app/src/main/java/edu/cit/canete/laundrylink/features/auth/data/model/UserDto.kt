package edu.cit.canete.laundrylink.features.auth.data.model

data class UserDto(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String
)
