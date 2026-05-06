package edu.cit.canete.laundrylink.ui.fragment

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import edu.cit.canete.laundrylink.R
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

        val shopId = arguments?.getString("shopId")
        if (shopId.isNullOrBlank()) {
            findNavController().navigateUp()
            return
        }

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }
        viewModel.load(shopId)

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                binding.progressBar.isVisible = state.loading
                binding.tvError.isVisible = !state.error.isNullOrBlank()
                binding.tvError.text = state.error ?: ""

                state.shop?.let { shop ->
                    binding.toolbar.title = shop.name
                    binding.tvShopName.text = shop.name
                    binding.tvAddress.text = shop.address
                    binding.tvHours.text = shop.operatingHours ?: ""
                    binding.tvHours.isVisible = !shop.operatingHours.isNullOrBlank()
                }

                if (!state.loading) {
                    binding.llServices.removeAllViews()
                    state.services.forEach { service ->
                        binding.llServices.addView(buildServiceCard(service, shopId))
                    }
                }
            }
        }
    }

    private fun buildServiceCard(service: Service, shopId: String): View {
        val ctx = requireContext()
        val card = MaterialCardView(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dp(8)
                bottomMargin = dp(0)
            }
            radius = dp(14).toFloat()
            cardElevation = dp(2).toFloat()
            setCardBackgroundColor(Color.WHITE)
        }

        val column = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }

        val nameRow = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL }
        val nameView = TextView(ctx).apply {
            text = service.name
            setTextColor(Color.parseColor("#1F2937"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }
        val typeBadge = TextView(ctx).apply {
            text = service.serviceType
            setTextColor(
                if (service.serviceType == "PRIORITY") Color.parseColor("#1E40AF")
                else Color.parseColor("#374151")
            )
            setBackgroundColor(
                if (service.serviceType == "PRIORITY") Color.parseColor("#DBEAFE")
                else Color.parseColor("#F3F4F6")
            )
            setPadding(dp(8), dp(2), dp(8), dp(2))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 10f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
        nameRow.addView(nameView)
        nameRow.addView(typeBadge)

        val priceView = TextView(ctx).apply {
            text = "PHP %.2f".format(service.price)
            setTextColor(Color.parseColor("#1E40AF"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            (layoutParams as? LinearLayout.LayoutParams)?.topMargin = dp(8)
        }
        val priceParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = dp(8) }

        val bookBtn = MaterialButton(ctx).apply {
            text = "Book This Service"
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#1E40AF"))
            setOnClickListener {
                try {
                    findNavController().navigate(
                        R.id.action_shopDetail_to_bookingFlow,
                        bundleOf("shopId" to shopId, "serviceId" to service.id)
                    )
                } catch (e: Exception) {
                    Log.e("ShopDetail", "Navigate to booking flow failed", e)
                }
            }
        }
        val bookParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dp(44)
        ).apply { topMargin = dp(12) }

        column.addView(nameRow)
        column.addView(priceView, priceParams)
        column.addView(bookBtn, bookParams)
        card.addView(column)
        return card
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
