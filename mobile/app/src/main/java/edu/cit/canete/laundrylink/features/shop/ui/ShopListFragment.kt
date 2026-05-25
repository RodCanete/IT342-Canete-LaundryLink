package edu.cit.canete.laundrylink.features.shop.ui

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
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
import edu.cit.canete.laundrylink.databinding.FragmentShopListBinding
import edu.cit.canete.laundrylink.features.shop.ui.adapter.ShopAdapter
import edu.cit.canete.laundrylink.features.shop.viewmodel.ShopListState
import edu.cit.canete.laundrylink.features.shop.viewmodel.ShopListViewModel
import kotlinx.coroutines.launch

class ShopListFragment : Fragment() {

    private var _binding: FragmentShopListBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ShopListViewModel by viewModels()
    private lateinit var adapter: ShopAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentShopListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = ShopAdapter { shop ->
            findNavController().navigate(
                R.id.action_shopList_to_shopDetail,
                bundleOf("shopId" to shop.id)
            )
        }

        binding.rvShops.layoutManager = LinearLayoutManager(requireContext())
        binding.rvShops.adapter = adapter

        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { viewModel.filter(s.toString()) }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                binding.progressBar.isVisible = state is ShopListState.Loading
                binding.errorBanner.root.isVisible = state is ShopListState.Error
                if (state is ShopListState.Error) binding.errorBanner.tvError.text = state.message
                if (state is ShopListState.Success) adapter.submitList(state.filtered)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
