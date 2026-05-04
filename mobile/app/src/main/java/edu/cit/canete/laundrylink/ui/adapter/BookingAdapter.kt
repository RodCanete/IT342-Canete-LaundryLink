package edu.cit.canete.laundrylink.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import edu.cit.canete.laundrylink.databinding.ItemBookingBinding
import edu.cit.canete.laundrylink.network.model.Booking

class BookingAdapter(
    private val onClick: (Booking) -> Unit
) : ListAdapter<Booking, BookingAdapter.VH>(DIFF) {

    inner class VH(val binding: ItemBookingBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemBookingBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) {
        val b = getItem(position)
        with(holder.binding) {
            tvBookingCode.text = b.bookingCode
            tvStatus.text = b.status.replace('_', ' ')
            tvServiceType.text = b.serviceId
            tvDateTime.text = "${b.bookingDate}  •  ${b.timeSlot.take(5)}"
            root.setOnClickListener { onClick(b) }
        }
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Booking>() {
            override fun areItemsTheSame(a: Booking, b: Booking) = a.id == b.id
            override fun areContentsTheSame(a: Booking, b: Booking) = a == b
        }
    }
}
