package edu.cit.canete.laundrylink.ui.fragment

import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import edu.cit.canete.laundrylink.databinding.FragmentBookingConfirmationBinding
import edu.cit.canete.laundrylink.viewmodel.BookingConfirmationViewModel
import kotlinx.coroutines.launch

class BookingConfirmationFragment : Fragment() {

    private var _binding: FragmentBookingConfirmationBinding? = null
    private val binding get() = _binding!!
    private val viewModel: BookingConfirmationViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBookingConfirmationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val bookingId = arguments?.getString("bookingId") ?: run {
            findNavController().navigateUp(); return
        }

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }

        viewModel.load(bookingId)
        viewModel.pollPaymentStatus(bookingId)

        binding.btnMyBookings.setOnClickListener {
            // Navigation wired in Task 12
            findNavController().navigateUp()
        }

        binding.btnPay.setOnClickListener {
            val url = viewModel.state.value.paymentIntent?.checkoutUrl ?: return@setOnClickListener
            CustomTabsIntent.Builder().build().launchUrl(requireContext(), Uri.parse(url))
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                binding.progressBar.isVisible = state.loading
                binding.tvError.isVisible = state.error != null
                binding.tvError.text = state.error ?: ""

                state.booking?.let { booking ->
                    binding.tvBookingCode.text = booking.bookingCode
                    binding.tvStatus.text = booking.status.replace('_', ' ')
                    binding.tvBookingDate.text = "Date: ${booking.bookingDate}"
                    binding.tvBookingTime.text = "Time: ${booking.timeSlot}"
                }

                val isPaid = state.paymentStatus?.bookingStatus == "PAID" ||
                        state.booking?.status == "PAID"
                binding.btnPay.isVisible = !isPaid && state.paymentIntent?.checkoutUrl != null
                binding.btnPay.isEnabled = !state.initiatingPayment
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
