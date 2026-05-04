package edu.cit.canete.laundrylink.ui.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import edu.cit.canete.laundrylink.R
import edu.cit.canete.laundrylink.databinding.FragmentHomeBinding
import edu.cit.canete.laundrylink.storage.TokenManager
import edu.cit.canete.laundrylink.viewmodel.AuthViewModel
import kotlinx.coroutines.launch

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AuthViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val tokenManager = TokenManager(requireContext())

        binding.toolbar.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.action_logout -> {
                    viewModel.logout()
                    findNavController().navigate(R.id.action_home_to_login)
                    true
                }
                else -> false
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            tokenManager.getUserName().collect { name ->
                if (!name.isNullOrBlank()) binding.tvWelcome.text = "Hello, $name!"
            }
        }

        binding.btnBookNow.setOnClickListener {
            findNavController().navigate(R.id.action_home_to_shopList)
        }

        binding.btnMyBookings.setOnClickListener {
            findNavController().navigate(R.id.action_home_to_myBookings)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
