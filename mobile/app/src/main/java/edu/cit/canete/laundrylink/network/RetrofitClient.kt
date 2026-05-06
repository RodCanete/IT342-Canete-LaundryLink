package edu.cit.canete.laundrylink.network

import android.content.Context
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    private const val BASE_URL = "http://10.0.2.2:8080/api/"

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    // Unauthenticated — used for /auth/login and /auth/register
    private val publicClient = OkHttpClient.Builder()
        .addInterceptor(logging)
        .build()

    // Authenticated — lazily initialized once Context is available
    private var _authenticatedClient: OkHttpClient? = null

    fun init(context: Context) {
        val tokenManager = edu.cit.canete.laundrylink.storage.TokenManager(context)
        _authenticatedClient = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenManager))
            .addInterceptor(logging)
            .build()
    }

    private val authenticatedClient: OkHttpClient
        get() = _authenticatedClient
            ?: error("RetrofitClient.init(context) must be called before using authenticated services")

    private fun buildRetrofit(client: OkHttpClient) = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val authApiService: AuthApiService by lazy {
        buildRetrofit(publicClient).create(AuthApiService::class.java)
    }

    val shopApiService: ShopApiService by lazy {
        buildRetrofit(authenticatedClient).create(ShopApiService::class.java)
    }

    val bookingApiService: BookingApiService by lazy {
        buildRetrofit(authenticatedClient).create(BookingApiService::class.java)
    }
}
