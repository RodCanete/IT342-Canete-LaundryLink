package edu.cit.canete.laundrylink.network.model

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String
)
