package edu.cit.canete.laundrylink.ui.adapter

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import edu.cit.canete.laundrylink.databinding.ItemBookingBinding
import edu.cit.canete.laundrylink.viewmodel.BookingDisplay
import java.text.SimpleDateFormat
import java.util.Locale

class BookingAdapter(
    private val onClick: (BookingDisplay) -> Unit,
    private val onActionClick: (BookingDisplay) -> Unit
) : ListAdapter<BookingDisplay, BookingAdapter.VH>(DIFF) {

    inner class VH(val binding: ItemBookingBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemBookingBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = getItem(position)
        val b = item.booking
        with(holder.binding) {
            tvShopName.text = item.shopName
            tvStatus.text = formatStatus(b.status)
            applyStatusStyle(tvStatus, b.status)
            tvServiceType.text = item.serviceName
            tvBookingCode.text = b.bookingCode
            tvDateTime.text = "${formatDate(b.bookingDate)}  •  ${formatTime(b.timeSlot)}"
            tvPrice.text = "PHP %.2f".format(item.servicePrice)

            btnDetails.setOnClickListener { onClick(item) }
            root.setOnClickListener { onClick(item) }

            val (actionLabel, actionVisible) = when (b.status) {
                "PENDING_PAYMENT" -> "Pay Now" to true
                "PAID", "DROPPED_OFF", "PROCESSING" -> "Show Code" to true
                "COMPLETED" -> "Receipt" to true
                else -> "View" to true
            }
            btnAction.text = actionLabel
            btnAction.isVisible = actionVisible
            btnAction.setOnClickListener { onActionClick(item) }
        }
    }

    private fun applyStatusStyle(view: android.widget.TextView, status: String) {
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
            val display = SimpleDateFormat("MMM d, yyyy", Locale.US)
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

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<BookingDisplay>() {
            override fun areItemsTheSame(a: BookingDisplay, b: BookingDisplay) =
                a.booking.id == b.booking.id
            override fun areContentsTheSame(a: BookingDisplay, b: BookingDisplay) = a == b
        }
    }
}
