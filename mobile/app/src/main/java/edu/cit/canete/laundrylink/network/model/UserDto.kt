package edu.cit.canete.laundrylink.network.model

data class UserDto(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String
)
