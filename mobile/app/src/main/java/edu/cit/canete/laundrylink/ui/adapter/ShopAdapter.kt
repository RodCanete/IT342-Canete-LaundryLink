package edu.cit.canete.laundrylink.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import edu.cit.canete.laundrylink.databinding.ItemShopBinding
import edu.cit.canete.laundrylink.network.model.ShopSummary

class ShopAdapter(
    private val onViewShop: (ShopSummary) -> Unit
) : ListAdapter<ShopSummary, ShopAdapter.VH>(DIFF) {

    inner class VH(val binding: ItemShopBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemShopBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) {
        val shop = getItem(position)
        with(holder.binding) {
            tvShopName.text = shop.name
            tvShopAddress.text = shop.address
            tvShopHours.text = shop.operatingHours ?: ""
            tvStandardPrice.text = shop.standardPrice?.let { "Standard: ₱%.0f".format(it) } ?: ""
            tvPriorityPrice.text = shop.priorityPrice?.let { "Priority: ₱%.0f".format(it) } ?: ""
            btnViewShop.setOnClickListener { onViewShop(shop) }
        }
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<ShopSummary>() {
            override fun areItemsTheSame(a: ShopSummary, b: ShopSummary) = a.id == b.id
            override fun areContentsTheSame(a: ShopSummary, b: ShopSummary) = a == b
        }
    }
}
