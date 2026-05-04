package edu.cit.canete.laundrylink.ui.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.google.android.material.button.MaterialButton
import edu.cit.canete.laundrylink.databinding.FragmentShopDetailBinding
import edu.cit.canete.laundrylink.network.model.Service
import edu.cit.canete.laundrylink.viewmodel.ShopDetailViewModel
import kotlinx.coroutines.launch

class ShopDetailFragment : Fragment() {

    private var _binding: FragmentShopDetailBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ShopDetailViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentShopDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val shopId = arguments?.getString("shopId") ?: run {
            findNavController().navigateUp()
            return
        }

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }
        viewModel.load(shopId)

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                binding.progressBar.isVisible = state.loading
                binding.tvError.isVisible = state.error != null
                binding.tvError.text = state.error ?: ""

                state.shop?.let { shop ->
                    binding.toolbar.title = shop.name
                    binding.tvShopName.text = shop.name
                    binding.tvAddress.text = shop.address
                    binding.tvHours.text = shop.operatingHours ?: ""
                }

                if (!state.loading) {
                    binding.llServices.removeAllViews()
                    state.services.forEach { service -> addServiceButton(service, shopId) }
                }
            }
        }
    }

    private fun addServiceButton(service: Service, shopId: String) {
        val btn = MaterialButton(requireContext()).apply {
            text = "${service.name}  —  ₱%.0f".format(service.price)
            setOnClickListener {
                // Navigation to BookingFlow — wired in Task 12
                parentFragmentManager.setFragmentResult(
                    "navigate_to_booking",
                    bundleOf("shopId" to shopId, "serviceId" to service.id)
                )
            }
        }
        val params = ViewGroup.MarginLayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = 8 }
        binding.llServices.addView(btn, params)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
