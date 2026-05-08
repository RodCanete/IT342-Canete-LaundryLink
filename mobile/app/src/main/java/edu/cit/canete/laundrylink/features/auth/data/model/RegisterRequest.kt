package edu.cit.canete.laundrylink.features.auth.data.model

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String
)
