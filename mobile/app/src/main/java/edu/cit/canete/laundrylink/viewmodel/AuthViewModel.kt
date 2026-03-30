package edu.cit.canete.laundrylink.viewmodel


import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.canete.laundrylink.repository.AuthRepository
import edu.cit.canete.laundrylink.storage.TokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle    : AuthState()
    object Loading : AuthState()
    data class Success(val message: String) : AuthState()
    data class Error(val message: String)   : AuthState()
}

class AuthViewModel(application: Application) : AndroidViewModel(application) {

    private val repository   = AuthRepository()
    private val tokenManager = TokenManager(application)

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState

    fun register(firstName: String, lastName: String, email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = repository.register(firstName, lastName, email, password)
            result.fold(
                onSuccess = { response ->
                    val token = response.data?.accessToken ?: ""
                    val user  = response.data?.user
                    tokenManager.saveToken(token)
                    if (user != null) {
                        tokenManager.saveUser(
                            email = user.email,
                            name  = "${user.firstName} ${user.lastName}",
                            role  = user.role
                        )
                    }
                    _authState.value = AuthState.Success("Account created successfully!")
                },
                onFailure = { e ->
                    _authState.value = AuthState.Error(e.message ?: "Registration failed")
                }
            )
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = repository.login(email, password)
            result.fold(
                onSuccess = { response ->
                    val token = response.data?.accessToken ?: ""
                    val user  = response.data?.user
                    tokenManager.saveToken(token)
                    if (user != null) {
                        tokenManager.saveUser(
                            email = user.email,
                            name  = "${user.firstName} ${user.lastName}",
                            role  = user.role
                        )
                    }
                    _authState.value = AuthState.Success("Welcome back!")
                },
                onFailure = { e ->
                    _authState.value = AuthState.Error(e.message ?: "Login failed")
                }
            )
        }
    }

    fun logout() {
        viewModelScope.launch {
            tokenManager.clearAll()
            _authState.value = AuthState.Idle
        }
    }

    fun resetState() { _authState.value = AuthState.Idle }
}
