package edu.cit.canete.laundrylink

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import edu.cit.canete.laundrylink.ui.navigation.AppNavigation
import edu.cit.canete.laundrylink.ui.theme.LaundryLinkTheme


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LaundryLinkTheme {
                AppNavigation()
            }
        }
    }
}
