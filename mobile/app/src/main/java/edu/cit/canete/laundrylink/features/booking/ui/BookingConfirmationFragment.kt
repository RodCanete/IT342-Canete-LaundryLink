package edu.cit.canete.laundrylink.features.booking.ui

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import edu.cit.canete.laundrylink.R
import edu.cit.canete.laundrylink.databinding.FragmentBookingConfirmationBinding
import edu.cit.canete.laundrylink.features.booking.viewmodel.BookingConfirmationViewModel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale

class BookingConfirmationFragment : Fragment() {

    private var _binding: FragmentBookingConfirmationBinding? = null
    private val binding get() = _binding!!
    private val viewModel: BookingConfirmationViewModel by viewModels()
    private var bookingId: String? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBookingConfirmationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val id = arguments?.getString("bookingId")
        if (id.isNullOrBlank()) {
            findNavController().navigateUp(); return
        }
        bookingId = id

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }

        viewModel.load(id)
        viewModel.startPaymentStatusPolling(id)

        binding.btnMyBookings.setOnClickListener {
            try {
                findNavController().navigate(R.id.action_confirmation_to_myBookings)
            } catch (e: Exception) {
                Log.e("BookingConfirmation", "Navigate to my bookings failed", e)
            }
        }

        binding.btnPay.setOnClickListener {
            val url = viewModel.state.value.paymentIntent?.checkoutUrl ?: return@setOnClickListener
            try {
                CustomTabsIntent.Builder().build()
                    .launchUrl(requireContext(), Uri.parse(url))
            } catch (e: Exception) {
                Log.e("BookingConfirmation", "Failed to launch checkout", e)
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                binding.progressBar.isVisible = state.loading
                binding.tvError.isVisible = !state.error.isNullOrBlank()
                binding.tvError.text = state.error ?: ""

                state.booking?.let { booking ->
                    binding.tvBookingCode.text = booking.bookingCode
                    binding.tvStatus.text = formatStatus(booking.status)
                    applyStatusStyle(binding.tvStatus, booking.status)
                    binding.tvBookingDate.text = formatDate(booking.bookingDate)
                    binding.tvBookingTime.text = formatTime(booking.timeSlot)
                }

                val isPaid = state.paymentStatus?.bookingStatus == "PAID" ||
                        state.booking?.status == "PAID"

                binding.btnPay.isVisible = !isPaid && state.paymentIntent?.checkoutUrl != null
                binding.btnPay.isEnabled = !state.initiatingPayment && !isPaid
                binding.btnPay.text = if (state.initiatingPayment) "Preparing..." else "Pay with PayMongo"

                binding.tvWaitingForPayment.isVisible =
                    !isPaid && state.paymentIntent?.checkoutUrl != null && !state.initiatingPayment
                binding.tvPaidSuccess.isVisible = isPaid

                val qrUrl = state.booking?.qrCodeUrl
                if (isPaid && !qrUrl.isNullOrBlank()) {
                    val bitmap = decodeDataUrl(qrUrl)
                    if (bitmap != null) {
                        binding.ivQrCode.setImageBitmap(bitmap)
                        binding.ivQrCode.isVisible = true
                    } else {
                        binding.ivQrCode.isVisible = false
                    }
                } else {
                    binding.ivQrCode.isVisible = false
                }
            }
        }
    }

    private fun decodeDataUrl(dataUrl: String): Bitmap? = try {
        val base64 = dataUrl.substringAfter("base64,", dataUrl)
        val bytes = Base64.decode(base64, Base64.DEFAULT)
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
    } catch (e: Exception) {
        Log.w("BookingConfirmation", "Failed to decode QR data URL", e)
        null
    }

    override fun onResume() {
        super.onResume()
        bookingId?.let { viewModel.onScreenResumed(it) }
    }

    override fun onPause() {
        super.onPause()
    }

    private fun applyStatusStyle(view: TextView, status: String) {
        when (status) {
            "PAID" -> {
                view.setBackgroundColor(Color.parseColor("#DCFCE7"))
                view.setTextColor(Color.parseColor("#166534"))
            }
            "PENDING_PAYMENT" -> {
                view.setBackgroundColor(Color.parseColor("#FEF3C7"))
                view.setTextColor(Color.parseColor("#92400E"))
            }
            "DROPPED_OFF" -> {
                view.setBackgroundColor(Color.parseColor("#DBEAFE"))
                view.setTextColor(Color.parseColor("#1E3A8A"))
            }
            "PROCESSING" -> {
                view.setBackgroundColor(Color.parseColor("#E0E7FF"))
                view.setTextColor(Color.parseColor("#3730A3"))
            }
            "COMPLETED" -> {
                view.setBackgroundColor(Color.parseColor("#F3F4F6"))
                view.setTextColor(Color.parseColor("#4B5563"))
            }
            else -> {
                view.setBackgroundColor(Color.parseColor("#F3F4F6"))
                view.setTextColor(Color.parseColor("#4B5563"))
            }
        }
    }

    private fun formatStatus(s: String): String =
        s.replace('_', ' ').split(" ").joinToString(" ") { word ->
            word.lowercase(Locale.US).replaceFirstChar { c -> c.titlecase(Locale.US) }
        }

    private fun formatDate(iso: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val display = SimpleDateFormat("EEE, MMM d, yyyy", Locale.US)
            parser.parse(iso)?.let { display.format(it) } ?: iso
        } catch (e: Exception) {
            iso
        }
    }

    private fun formatTime(time: String): String {
        if (time.isBlank()) return ""
        val parts = time.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: return time
        val m = parts.getOrNull(1) ?: "00"
        val ampm = if (h < 12) "AM" else "PM"
        val h12 = when {
            h == 0 -> 12
            h > 12 -> h - 12
            else -> h
        }
        return "%02d:%s %s".format(h12, m, ampm)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
