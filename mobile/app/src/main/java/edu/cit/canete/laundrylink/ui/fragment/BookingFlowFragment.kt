package edu.cit.canete.laundrylink.ui.fragment

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import edu.cit.canete.laundrylink.R
import edu.cit.canete.laundrylink.databinding.FragmentBookingFlowBinding
import edu.cit.canete.laundrylink.ui.adapter.SlotAdapter
import edu.cit.canete.laundrylink.viewmodel.BookingFlowUiState
import edu.cit.canete.laundrylink.viewmodel.BookingViewModel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale

class BookingFlowFragment : Fragment() {

    private var _binding: FragmentBookingFlowBinding? = null
    private val binding get() = _binding!!
    private val viewModel: BookingViewModel by viewModels()
    private lateinit var slotAdapter: SlotAdapter
    private val FILE_PICK_REQUEST = 1001
    private var hasNavigatedToConfirmation = false

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBookingFlowBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val shopId = arguments?.getString("shopId")
        val serviceId = arguments?.getString("serviceId")

        if (shopId.isNullOrBlank() || serviceId.isNullOrBlank()) {
            Log.w("BookingFlow", "Missing shopId/serviceId args; popping back")
            findNavController().navigateUp()
            return
        }

        viewModel.init(shopId, serviceId)

        slotAdapter = SlotAdapter { slot -> viewModel.selectSlot(slot) }
        binding.rvSlots.layoutManager = GridLayoutManager(requireContext(), 3)
        binding.rvSlots.adapter = slotAdapter

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }

        binding.calendarView.minDate = System.currentTimeMillis() - 1_000
        binding.calendarView.setOnDateChangeListener { _, year, month, day ->
            val date = "%04d-%02d-%02d".format(year, month + 1, day)
            viewModel.selectDate(date)
        }

        binding.btnBack.setOnClickListener {
            val current = viewModel.state.value.step
            if (current <= 1) findNavController().navigateUp()
            else viewModel.proceedToStep(current - 1)
        }

        binding.btnNext.setOnClickListener {
            val state = viewModel.state.value
            when (state.step) {
                1 -> if (state.selectedDate.isNotEmpty()) viewModel.proceedToStep(2)
                2 -> if (state.selectedSlot != null) viewModel.proceedToStep(3)
                3 -> viewModel.proceedToStep(4)
                4 -> viewModel.submitBooking()
            }
        }

        binding.btnPickFile.setOnClickListener {
            try {
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    putExtra(
                        Intent.EXTRA_MIME_TYPES,
                        arrayOf("image/jpeg", "image/png", "application/pdf")
                    )
                }
                @Suppress("DEPRECATION")
                startActivityForResult(intent, FILE_PICK_REQUEST)
            } catch (e: Exception) {
                Log.e("BookingFlow", "File picker failed", e)
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state -> renderState(state) }
        }
    }

    private fun renderState(state: BookingFlowUiState) {
        binding.tvHeaderTitle.text = "Book a Slot"
        binding.tvHeaderSubtitle.text = buildString {
            if (state.shopName.isNotBlank()) append(state.shopName)
            if (state.serviceName.isNotBlank()) {
                if (isNotEmpty()) append(" · ")
                append(state.serviceName)
            }
        }

        binding.pbDetails.isVisible = state.loadingDetails

        binding.layoutStep1.isVisible = state.step == 1
        binding.layoutStep2.isVisible = state.step == 2
        binding.layoutStep3.isVisible = state.step == 3
        binding.layoutStep4.isVisible = state.step == 4

        renderStepIndicator(state.step)

        if (state.selectedDate.isNotBlank()) {
            binding.tvSelectedDate.isVisible = true
            binding.tvSelectedDate.text = "Selected: ${formatDateLong(state.selectedDate)}"
        } else {
            binding.tvSelectedDate.isVisible = false
        }

        binding.pbSlots.isVisible = state.loadingSlots
        binding.tvSlotsEmpty.isVisible =
            state.step == 2 && !state.loadingSlots && state.slots.isEmpty()
        binding.rvSlots.isVisible = !state.loadingSlots && state.slots.isNotEmpty()
        slotAdapter.submitList(state.slots)
        slotAdapter.setSelected(state.selectedSlot?.slotConfigId)

        binding.tvFileName.isVisible = !state.fileName.isNullOrBlank()
        binding.tvFileName.text = state.fileName?.let { "Attached: $it" } ?: ""

        binding.tvSummaryShop.text = state.shopName.ifBlank { "—" }
        binding.tvSummaryShopAddress.text = state.shopAddress
        binding.tvSummaryShopAddress.isVisible = state.shopAddress.isNotBlank()
        binding.tvSummaryService.text = state.serviceName.ifBlank { "—" }
        binding.tvSummaryDate.text = formatDateLong(state.selectedDate).ifBlank { "—" }
        binding.tvSummaryTime.text = formatTime(state.selectedSlot?.startTime) ?: "—"
        binding.tvSummaryFile.text = state.fileName ?: "None"
        binding.tvSummaryPrice.text = "PHP %.2f".format(state.servicePrice)

        binding.tvBookingError.isVisible = !state.error.isNullOrBlank()
        binding.tvBookingError.text = state.error ?: ""
        binding.pbSubmit.isVisible = state.submitting

        // Bottom buttons
        binding.btnBack.isEnabled = !state.submitting
        binding.btnNext.isEnabled = canProceed(state) && !state.submitting
        binding.btnNext.text = when (state.step) {
            4 -> if (state.submitting) "Creating..." else "Confirm & Pay"
            else -> "Next"
        }
        binding.btnBack.text = if (state.step <= 1) "Cancel" else "Back"

        if (state.createdBooking != null && !hasNavigatedToConfirmation) {
            hasNavigatedToConfirmation = true
            val booking = state.createdBooking
            viewModel.onNavigatedToConfirmation()
            try {
                findNavController().navigate(
                    R.id.action_bookingFlow_to_confirmation,
                    bundleOf("bookingId" to booking.id)
                )
            } catch (e: Exception) {
                Log.e("BookingFlow", "Navigate to confirmation failed", e)
                hasNavigatedToConfirmation = false
            }
        }
    }

    private fun canProceed(state: BookingFlowUiState): Boolean {
        if (state.loadingDetails) return false
        return when (state.step) {
            1 -> state.selectedDate.isNotEmpty()
            2 -> state.selectedSlot != null && !state.loadingSlots
            3 -> true
            4 -> !state.submitting && state.selectedSlot != null
            else -> false
        }
    }

    private fun renderStepIndicator(currentStep: Int) {
        val circles = arrayOf(
            binding.stepCircle1, binding.stepCircle2, binding.stepCircle3, binding.stepCircle4
        )
        val labels = arrayOf(
            binding.stepLabel1, binding.stepLabel2, binding.stepLabel3, binding.stepLabel4
        )
        val connectors = arrayOf(
            binding.stepConnector1, binding.stepConnector2, binding.stepConnector3
        )

        for (i in circles.indices) {
            val stepNum = i + 1
            val circle = circles[i]
            val label = labels[i]
            when {
                stepNum < currentStep -> {
                    circle.setBackgroundResource(R.drawable.step_circle_completed)
                    circle.setTextColor(Color.WHITE)
                    circle.text = "✓"
                    label.setTextColor(Color.parseColor("#10B981"))
                }
                stepNum == currentStep -> {
                    circle.setBackgroundResource(R.drawable.step_circle_active)
                    circle.setTextColor(Color.WHITE)
                    circle.text = stepNum.toString()
                    label.setTextColor(Color.parseColor("#1F2937"))
                }
                else -> {
                    circle.setBackgroundResource(R.drawable.step_circle_inactive)
                    circle.setTextColor(Color.parseColor("#9CA3AF"))
                    circle.text = stepNum.toString()
                    label.setTextColor(Color.parseColor("#9CA3AF"))
                }
            }
        }

        connectors.forEachIndexed { idx, view ->
            view.setBackgroundColor(
                if (idx + 1 < currentStep) Color.parseColor("#10B981")
                else Color.parseColor("#E5E7EB")
            )
        }
    }

    private fun formatDateLong(isoDate: String): String {
        if (isoDate.isBlank()) return ""
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val display = SimpleDateFormat("EEE, MMM d, yyyy", Locale.US)
            parser.parse(isoDate)?.let { display.format(it) } ?: isoDate
        } catch (e: Exception) {
            isoDate
        }
    }

    private fun formatTime(time: String?): String? {
        if (time.isNullOrBlank()) return null
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

    @Suppress("DEPRECATION")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_PICK_REQUEST && resultCode == Activity.RESULT_OK) {
            val uri = data?.data ?: return
            val name = getFileName(uri)
            viewModel.setFileName(name)
        }
    }

    private fun getFileName(uri: Uri): String {
        return try {
            val cursor = requireContext().contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                val idx = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (it.moveToFirst() && idx >= 0) it.getString(idx)
                else uri.lastPathSegment ?: "file"
            } ?: uri.lastPathSegment ?: "file"
        } catch (e: Exception) {
            uri.lastPathSegment ?: "file"
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
