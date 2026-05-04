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
import androidx.recyclerview.widget.LinearLayoutManager
import edu.cit.canete.laundrylink.R
import edu.cit.canete.laundrylink.databinding.FragmentMyBookingsBinding
import edu.cit.canete.laundrylink.ui.adapter.BookingAdapter
import edu.cit.canete.laundrylink.viewmodel.MyBookingsViewModel
import kotlinx.coroutines.launch

class MyBookingsFragment : Fragment() {

    private var _binding: FragmentMyBookingsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: MyBookingsViewModel by viewModels()
    private lateinit var adapter: BookingAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMyBookingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }

        adapter = BookingAdapter { booking ->
            findNavController().navigate(
                R.id.action_myBookings_to_confirmation,
                bundleOf("bookingId" to booking.id)
            )
        }
        binding.rvBookings.layoutManager = LinearLayoutManager(requireContext())
        binding.rvBookings.adapter = adapter

        binding.chipAll.setOnClickListener { viewModel.filter("ALL") }
        binding.chipPendingPayment.setOnClickListener { viewModel.filter("PENDING_PAYMENT") }
        binding.chipPaid.setOnClickListener { viewModel.filter("PAID") }
        binding.chipCompleted.setOnClickListener { viewModel.filter("COMPLETED") }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                binding.progressBar.isVisible = state.loading
                binding.tvError.isVisible = state.error != null
                binding.tvError.text = state.error ?: ""
                adapter.submitList(state.filtered)
                binding.tvEmpty.isVisible =
                    !state.loading && state.filtered.isEmpty() && state.error == null
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
