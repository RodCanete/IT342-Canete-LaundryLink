package edu.cit.canete.laundrylink

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.navigation.NavController
import androidx.navigation.NavOptions
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.appbar.MaterialToolbar
import edu.cit.canete.laundrylink.databinding.ActivityMainBinding
import edu.cit.canete.laundrylink.databinding.IncludeTopAppBarBinding
import edu.cit.canete.laundrylink.features.auth.viewmodel.AuthViewModel
import edu.cit.canete.laundrylink.shared.network.RetrofitClient

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var topBarBinding: IncludeTopAppBarBinding
    private lateinit var navController: NavController
    private val authViewModel: AuthViewModel by viewModels()

    private val customerTabDestinations = setOf(
        R.id.homeFragment,
        R.id.shopListFragment,
        R.id.myBookingsFragment,
    )

    private val detailDestinations = setOf(
        R.id.shopDetailFragment,
        R.id.bookingFlowFragment,
        R.id.bookingConfirmationFragment,
    )

    private val authDestinations = setOf(
        R.id.loginFragment,
        R.id.registerFragment,
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        RetrofitClient.init(applicationContext)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        topBarBinding = binding.topAppBarContainer

        val navHostFragment =
            supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        setSupportActionBar(topBarBinding.topAppBar)

        val appBarConfiguration = AppBarConfiguration(
            topLevelDestinationIds = customerTabDestinations + setOf(R.id.customer_main),
        )
        setupActionBarWithNavController(navController, appBarConfiguration)

        binding.bottomNavigation.setupWithNavController(navController)

        topBarBinding.topAppBar.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.action_logout -> {
                    authViewModel.logout()
                    navController.navigate(
                        R.id.loginFragment,
                        null,
                        NavOptions.Builder()
                            .setPopUpTo(navController.graph.id, true)
                            .build(),
                    )
                    true
                }
                else -> false
            }
        }

        navController.addOnDestinationChangedListener { _, destination, _ ->
            updateChromeForDestination(destination.id)
        }

        updateChromeForDestination(navController.currentDestination?.id)
    }

    fun setDetailToolbarTitle(title: String) {
        topBarBinding.brandLayout.isVisible = false
        supportActionBar?.title = title
    }

    fun setCustomerToolbarBrand() {
        topBarBinding.brandLayout.isVisible = true
        supportActionBar?.title = ""
    }

    private fun updateChromeForDestination(destinationId: Int?) {
        val isAuth = destinationId != null && authDestinations.contains(destinationId)
        val isCustomerTab = destinationId != null && customerTabDestinations.contains(destinationId)
        val isDetail = destinationId != null && detailDestinations.contains(destinationId)

        binding.topAppBarContainer.root.isVisible = !isAuth
        binding.bottomNavigation.isVisible = isCustomerTab

        when {
            isAuth -> {
                supportActionBar?.hide()
            }
            isCustomerTab -> {
                supportActionBar?.show()
                setCustomerToolbarBrand()
                topBarBinding.topAppBar.navigationIcon = null
                topBarBinding.topAppBar.setNavigationOnClickListener(null)
            }
            isDetail -> {
                supportActionBar?.show()
                topBarBinding.brandLayout.isVisible = false
                topBarBinding.topAppBar.setNavigationIcon(R.drawable.ic_arrow_back)
                topBarBinding.topAppBar.setNavigationContentDescription(
                    getString(android.R.string.cancel)
                )
                topBarBinding.topAppBar.navigationIcon?.setTint(
                    getColor(R.color.ll_foreground)
                )
                topBarBinding.topAppBar.setNavigationOnClickListener {
                    navController.navigateUp()
                }
            }
            else -> {
                supportActionBar?.show()
                topBarBinding.topAppBar.navigationIcon = null
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp() || super.onSupportNavigateUp()
    }
}
