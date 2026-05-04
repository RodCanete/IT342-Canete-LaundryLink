package edu.cit.canete.laundrylink.ui.fragment

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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
import edu.cit.canete.laundrylink.viewmodel.BookingViewModel
import kotlinx.coroutines.launch

class BookingFlowFragment : Fragment() {

    private var _binding: FragmentBookingFlowBinding? = null
    private val binding get() = _binding!!
    private val viewModel: BookingViewModel by viewModels()
    private lateinit var slotAdapter: SlotAdapter
    private val FILE_PICK_REQUEST = 1001

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBookingFlowBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val shopId = arguments?.getString("shopId") ?: run {
            findNavController().navigateUp(); return
        }
        val serviceId = arguments?.getString("serviceId") ?: run {
            findNavController().navigateUp(); return
        }

        viewModel.init(shopId, serviceId)

        slotAdapter = SlotAdapter { slot -> viewModel.selectSlot(slot) }
        binding.rvSlots.layoutManager = GridLayoutManager(requireContext(), 2)
        binding.rvSlots.adapter = slotAdapter

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }

        // Disable past dates on CalendarView
        binding.calendarView.minDate = System.currentTimeMillis() - 1000
        binding.calendarView.setOnDateChangeListener { _, year, month, day ->
            val date = "%04d-%02d-%02d".format(year, month + 1, day)
            viewModel.selectDate(date)
        }

        binding.btnStep1Next.setOnClickListener {
            if (viewModel.state.value.selectedDate.isNotEmpty()) viewModel.proceedToStep(2)
        }
        binding.btnStep2Back.setOnClickListener { viewModel.proceedToStep(1) }
        binding.btnStep2Next.setOnClickListener {
            if (viewModel.state.value.selectedSlot != null) viewModel.proceedToStep(3)
        }
        binding.btnStep3Back.setOnClickListener { viewModel.proceedToStep(2) }
        binding.btnStep3Next.setOnClickListener { viewModel.proceedToStep(4) }
        binding.btnStep4Back.setOnClickListener { viewModel.proceedToStep(3) }
        binding.btnPickFile.setOnClickListener {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "*/*"
                putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/jpeg", "image/png", "application/pdf"))
            }
            @Suppress("DEPRECATION")
            startActivityForResult(intent, FILE_PICK_REQUEST)
        }
        binding.btnConfirmBooking.setOnClickListener { viewModel.submitBooking() }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                // Step visibility
                binding.layoutStep1.isVisible = state.step == 1
                binding.layoutStep2.isVisible = state.step == 2
                binding.layoutStep3.isVisible = state.step == 3
                binding.layoutStep4.isVisible = state.step == 4

                binding.stepProgress.progress = state.step * 25
                binding.tvStepLabel.text = "Step ${state.step} of 4"

                // Step 2
                binding.pbSlots.isVisible = state.loadingSlots
                slotAdapter.submitList(state.slots)
                state.selectedSlot?.let { slotAdapter.setSelected(it.slotConfigId) }

                // Step 4 summary
                binding.tvSummaryShop.text = "Shop: ${state.shopName}"
                binding.tvSummaryService.text = "Service: ${state.serviceName}"
                binding.tvSummaryDate.text = "Date: ${state.selectedDate}"
                binding.tvSummaryTime.text = "Time: ${state.selectedSlot?.startTime ?: "-"}"
                binding.tvSummaryPrice.text = "Total: ₱%.0f".format(state.servicePrice)
                binding.pbSubmit.isVisible = state.submitting
                binding.btnConfirmBooking.isEnabled = !state.submitting
                binding.tvBookingError.isVisible = state.error != null
                binding.tvBookingError.text = state.error ?: ""

                // Navigate to confirmation on booking created (one-shot)
                state.createdBooking?.let { booking ->
                    viewModel.onNavigatedToConfirmation()
                    findNavController().navigate(
                        R.id.action_bookingFlow_to_confirmation,
                        bundleOf("bookingId" to booking.id)
                    )
                }
            }
        }
    }

    @Suppress("DEPRECATION")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_PICK_REQUEST && resultCode == Activity.RESULT_OK) {
            val uri = data?.data ?: return
            val name = getFileName(uri)
            binding.tvFileName.text = "Attached: $name"
            binding.tvFileName.isVisible = true
            viewModel.setFileUrl(uri.toString())
        }
    }

    private fun getFileName(uri: Uri): String {
        val cursor = requireContext().contentResolver.query(uri, null, null, null, null)
        return cursor?.use {
            val idx = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            it.moveToFirst()
            if (idx >= 0) it.getString(idx) else uri.lastPathSegment ?: "file"
        } ?: uri.lastPathSegment ?: "file"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
