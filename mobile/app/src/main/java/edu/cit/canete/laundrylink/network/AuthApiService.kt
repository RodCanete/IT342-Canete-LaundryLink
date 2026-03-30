package edu.cit.canete.laundrylink.network

import edu.cit.canete.laundrylink.network.model.AuthResponse
import edu.cit.canete.laundrylink.network.model.LoginRequest
import edu.cit.canete.laundrylink.network.model.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
}
