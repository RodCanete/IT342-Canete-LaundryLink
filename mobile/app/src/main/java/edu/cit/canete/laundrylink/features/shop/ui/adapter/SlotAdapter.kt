package edu.cit.canete.laundrylink.features.shop.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import edu.cit.canete.laundrylink.R
import edu.cit.canete.laundrylink.databinding.ItemSlotBinding
import edu.cit.canete.laundrylink.features.shop.data.model.Slot

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
            tvSlotAvailable.text = if (isAvailable) "${slot.available} available" else "Full"
            cardSlot.alpha = if (isAvailable) 1f else 0.5f
            cardSlot.isEnabled = isAvailable
            cardSlot.isClickable = isAvailable

            val context = holder.itemView.context
            if (isSelected) {
                cardSlot.strokeColor = ContextCompat.getColor(context, R.color.ll_primary)
                cardSlot.strokeWidth = (3 * context.resources.displayMetrics.density).toInt()
                cardSlot.setCardBackgroundColor(ContextCompat.getColor(context, R.color.ll_primary))
                tvSlotTime.setTextColor(ContextCompat.getColor(context, R.color.ll_primary_foreground))
                tvSlotAvailable.setTextColor(ContextCompat.getColor(context, R.color.ll_primary_muted))
            } else {
                cardSlot.strokeColor = ContextCompat.getColor(context, R.color.ll_border)
                cardSlot.strokeWidth = (1 * context.resources.displayMetrics.density).toInt()
                cardSlot.setCardBackgroundColor(ContextCompat.getColor(context, R.color.ll_card))
                tvSlotTime.setTextColor(ContextCompat.getColor(context, R.color.ll_foreground))
                tvSlotAvailable.setTextColor(ContextCompat.getColor(context, R.color.ll_muted_foreground))
            }

            cardSlot.setOnClickListener {
                if (!isAvailable) return@setOnClickListener
                val previousId = selectedId
                selectedId = slot.slotConfigId
                refreshSelection(previousId, slot.slotConfigId)
                onSlotSelected(slot)
            }
        }
    }

    fun setSelected(slotId: String?) {
        val previous = selectedId
        if (previous == slotId) return
        selectedId = slotId
        refreshSelection(previous, slotId)
    }

    private fun refreshSelection(previousId: String?, newId: String?) {
        val list = currentList
        if (previousId != null) {
            val prevIdx = list.indexOfFirst { it.slotConfigId == previousId }
            if (prevIdx >= 0) notifyItemChanged(prevIdx)
        }
        if (newId != null) {
            val newIdx = list.indexOfFirst { it.slotConfigId == newId }
            if (newIdx >= 0) notifyItemChanged(newIdx)
        }
    }

    private fun formatTime(time: String?): String {
        if (time.isNullOrBlank()) return "—"
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
        val DIFF = object : DiffUtil.ItemCallback<Slot>() {
            override fun areItemsTheSame(a: Slot, b: Slot) = a.slotConfigId == b.slotConfigId
            override fun areContentsTheSame(a: Slot, b: Slot) = a == b
        }
    }
}
