package edu.cit.canete.laundrylink.features.booking.ui

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import edu.cit.canete.laundrylink.R
import edu.cit.canete.laundrylink.databinding.FragmentMyBookingsBinding
import edu.cit.canete.laundrylink.features.booking.ui.adapter.BookingAdapter
import edu.cit.canete.laundrylink.features.booking.viewmodel.BookingDisplay
import edu.cit.canete.laundrylink.features.booking.viewmodel.MyBookingsViewModel
import kotlinx.coroutines.launch

class MyBookingsFragment : Fragment() {

    private var _binding: FragmentMyBookingsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: MyBookingsViewModel by viewModels()
    private lateinit var adapter: BookingAdapter
    private var firstResume = true

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMyBookingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = BookingAdapter(
            onClick = { display -> openConfirmation(display) },
            onActionClick = { display -> handleAction(display) }
        )
        binding.rvBookings.layoutManager = LinearLayoutManager(requireContext())
        binding.rvBookings.adapter = adapter

        binding.swipeRefresh.setColorSchemeColors(
            ContextCompat.getColor(requireContext(), R.color.ll_primary)
        )
        binding.swipeRefresh.setOnRefreshListener { viewModel.load() }

        binding.chipAll.setOnClickListener { viewModel.filter("ALL") }
        binding.chipPendingPayment.setOnClickListener { viewModel.filter("PENDING_PAYMENT") }
        binding.chipPaid.setOnClickListener { viewModel.filter("PAID") }
        binding.chipCompleted.setOnClickListener { viewModel.filter("COMPLETED") }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                binding.progressBar.isVisible = state.loading
                binding.swipeRefresh.isRefreshing = state.refreshing

                binding.errorBanner.root.isVisible = !state.error.isNullOrBlank()
                binding.errorBanner.tvError.text = state.error ?: ""

                adapter.submitList(state.filtered)

                binding.tvEmpty.isVisible =
                    !state.loading && state.filtered.isEmpty() && state.error.isNullOrBlank()

                val all = state.counts["ALL"] ?: 0
                val pending = state.counts["PENDING_PAYMENT"] ?: 0
                val paid = state.counts["PAID"] ?: 0
                val completed = state.counts["COMPLETED"] ?: 0
                binding.chipAll.text = "All ($all)"
                binding.chipPendingPayment.text = "Pending ($pending)"
                binding.chipPaid.text = "Paid ($paid)"
                binding.chipCompleted.text = "Completed ($completed)"

                when (state.activeFilter) {
                    "ALL" -> binding.chipAll.isChecked = true
                    "PENDING_PAYMENT" -> binding.chipPendingPayment.isChecked = true
                    "PAID" -> binding.chipPaid.isChecked = true
                    "COMPLETED" -> binding.chipCompleted.isChecked = true
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (!firstResume) {
            viewModel.load()
        }
        firstResume = false
    }

    private fun openConfirmation(display: BookingDisplay) {
        try {
            findNavController().navigate(
                R.id.action_myBookings_to_confirmation,
                bundleOf("bookingId" to display.booking.id)
            )
        } catch (e: Exception) {
            Log.e("MyBookings", "Failed to navigate to confirmation", e)
        }
    }

    private fun handleAction(display: BookingDisplay) {
        openConfirmation(display)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
