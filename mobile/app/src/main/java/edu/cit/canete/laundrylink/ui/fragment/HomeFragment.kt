package edu.cit.canete.laundrylink.ui.fragment

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import edu.cit.canete.laundrylink.R
import edu.cit.canete.laundrylink.databinding.FragmentHomeBinding
import edu.cit.canete.laundrylink.storage.TokenManager
import edu.cit.canete.laundrylink.ui.adapter.ShopAdapter
import edu.cit.canete.laundrylink.viewmodel.AuthViewModel
import edu.cit.canete.laundrylink.viewmodel.ShopListState
import edu.cit.canete.laundrylink.viewmodel.ShopListViewModel
import kotlinx.coroutines.launch

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private val authViewModel: AuthViewModel by viewModels()
    private val shopViewModel: ShopListViewModel by viewModels()
    private lateinit var shopAdapter: ShopAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        try {
            val tokenManager = TokenManager(requireContext())

            binding.toolbar.setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    R.id.action_logout -> {
                        authViewModel.logout()
                        findNavController().navigate(R.id.action_home_to_login)
                        true
                    }
                    else -> false
                }
            }

            viewLifecycleOwner.lifecycleScope.launch {
                tokenManager.getUserName().collect { name ->
                    if (!name.isNullOrBlank()) binding.tvWelcome.text = "Hello, $name!"
                }
            }

            binding.btnBookNow.setOnClickListener {
                try {
                    findNavController().navigate(R.id.action_home_to_shopList)
                } catch (e: Exception) {
                    Log.e("HomeFragment", "Navigation failed", e)
                }
            }

            binding.btnMyBookings.setOnClickListener {
                try {
                    findNavController().navigate(R.id.action_home_to_myBookings)
                } catch (e: Exception) {
                    Log.e("HomeFragment", "Navigation to My Bookings failed", e)
                }
            }

            setupNearbyShops()
        } catch (e: Exception) {
            Log.e("HomeFragment", "Error in onViewCreated", e)
        }
    }

    private fun setupNearbyShops() {
        shopAdapter = ShopAdapter { _ ->
            try {
                findNavController().navigate(
                    R.id.action_home_to_shopList,
                    bundleOf()
                )
            } catch (e: Exception) {
                Log.e("HomeFragment", "Failed to navigate to shop details", e)
            }
        }

        binding.rvNearbyShops.layoutManager = LinearLayoutManager(requireContext())
        binding.rvNearbyShops.adapter = shopAdapter

        viewLifecycleOwner.lifecycleScope.launch {
            shopViewModel.state.collect { state ->
                binding.nearbyShopsLoading.isVisible = state is ShopListState.Loading
                binding.nearbyShopsError.isVisible = state is ShopListState.Error
                if (state is ShopListState.Error) {
                    binding.nearbyShopsError.text = state.message
                }
                if (state is ShopListState.Success) {
                    shopAdapter.submitList(state.shops.take(5))
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
