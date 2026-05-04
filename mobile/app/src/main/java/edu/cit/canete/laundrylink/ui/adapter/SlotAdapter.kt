package edu.cit.canete.laundrylink.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import edu.cit.canete.laundrylink.databinding.ItemSlotBinding
import edu.cit.canete.laundrylink.network.model.Slot

class SlotAdapter(
    private val onSlotSelected: (Slot) -> Unit
) : ListAdapter<Slot, SlotAdapter.VH>(DIFF) {

    private var selectedId: String? = null

    inner class VH(val binding: ItemSlotBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemSlotBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) {
        val slot = getItem(position)
        val isAvailable = slot.available > 0
        val isSelected = slot.slotConfigId == selectedId
        with(holder.binding) {
            tvSlotTime.text = formatTime(slot.startTime)
            tvSlotAvailable.text = if (isAvailable) "${slot.available} left" else "Full"
            cardSlot.alpha = if (isAvailable) 1f else 0.4f
            cardSlot.isEnabled = isAvailable
            cardSlot.strokeColor = if (isSelected)
                holder.itemView.context.getColor(android.R.color.holo_blue_dark)
            else
                holder.itemView.context.getColor(android.R.color.darker_gray)
            cardSlot.setOnClickListener {
                if (isAvailable) {
                    selectedId = slot.slotConfigId
                    notifyDataSetChanged()
                    onSlotSelected(slot)
                }
            }
        }
    }

    fun setSelected(slotId: String?) {
        selectedId = slotId
        notifyDataSetChanged()
    }

    private fun formatTime(time: String): String {
        val parts = time.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: return time
        val m = parts.getOrNull(1) ?: "00"
        val ampm = if (h < 12) "AM" else "PM"
        val h12 = when {
            h == 0 -> 12
            h > 12 -> h - 12
            else -> h
        }
        return "$h12:$m $ampm"
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Slot>() {
            override fun areItemsTheSame(a: Slot, b: Slot) = a.slotConfigId == b.slotConfigId
            override fun areContentsTheSame(a: Slot, b: Slot) = a == b
        }
    }
}
