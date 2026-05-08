package edu.cit.canete.laundrylink.features.auth.data

import edu.cit.canete.laundrylink.features.auth.data.model.AuthResponse
import edu.cit.canete.laundrylink.features.auth.data.model.LoginRequest
import edu.cit.canete.laundrylink.features.auth.data.model.RegisterRequest
import edu.cit.canete.laundrylink.shared.network.RetrofitClient

class AuthRepository {

    private val api = RetrofitClient.authApiService

    suspend fun register(
        firstName: String,
        lastName: String,
        email: String,
        password: String
    ): Result<AuthResponse> {
        return try {
            val response = api.register(
                RegisterRequest(firstName, lastName, email, password)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else if (response.code() == 409) {
                Result.failure(Exception("Email already registered"))
            } else {
                Result.failure(Exception("Registration failed. Please try again."))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Network error. Check your connection."))
        }
    }

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else if (response.code() == 401) {
                Result.failure(Exception("Invalid email or password"))
            } else {
                Result.failure(Exception("Login failed. Please try again."))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Network error. Check your connection."))
        }
    }
}
