package edu.cit.canete.laundrylink.features.auth.data

import edu.cit.canete.laundrylink.features.auth.data.model.AuthResponse
import edu.cit.canete.laundrylink.features.auth.data.model.LoginRequest
import edu.cit.canete.laundrylink.features.auth.data.model.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
}
