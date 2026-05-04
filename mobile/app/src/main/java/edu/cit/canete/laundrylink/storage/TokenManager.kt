package edu.cit.canete.laundrylink.storage

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

val Context.dataStore by preferencesDataStore(name = "laundrylink_prefs")

class TokenManager(private val context: Context) {

    companion object {
        val ACCESS_TOKEN_KEY = stringPreferencesKey("access_token")
        val USER_EMAIL_KEY   = stringPreferencesKey("user_email")
        val USER_NAME_KEY    = stringPreferencesKey("user_name")
        val USER_ROLE_KEY    = stringPreferencesKey("user_role")
        val USER_ID_KEY      = stringPreferencesKey("user_id")
    }

    suspend fun saveToken(token: String) {
        context.dataStore.edit { prefs -> prefs[ACCESS_TOKEN_KEY] = token }
    }

    suspend fun saveUser(id: String, email: String, name: String, role: String) {
        context.dataStore.edit { prefs ->
            prefs[USER_ID_KEY]    = id
            prefs[USER_EMAIL_KEY] = email
            prefs[USER_NAME_KEY]  = name
            prefs[USER_ROLE_KEY]  = role
        }
    }

    fun getToken(): Flow<String?> =
        context.dataStore.data.map { it[ACCESS_TOKEN_KEY] }

    // Safe to call from OkHttp thread (never from main thread)
    fun getTokenBlocking(): String? = runBlocking {
        context.dataStore.data.firstOrNull()?.get(ACCESS_TOKEN_KEY)
    }

    fun getUserEmail(): Flow<String?> =
        context.dataStore.data.map { it[USER_EMAIL_KEY] }

    fun getUserName(): Flow<String?> =
        context.dataStore.data.map { it[USER_NAME_KEY] }

    fun getUserId(): Flow<String?> =
        context.dataStore.data.map { it[USER_ID_KEY] }

    fun getUserIdBlocking(): String? = runBlocking {
        context.dataStore.data.firstOrNull()?.get(USER_ID_KEY)
    }

    suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }
}
