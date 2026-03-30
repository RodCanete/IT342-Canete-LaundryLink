package edu.cit.canete.laundrylink.ui.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import edu.cit.canete.laundrylink.R
import edu.cit.canete.laundrylink.databinding.FragmentHomeBinding
import edu.cit.canete.laundrylink.viewmodel.AuthViewModel

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

        binding.btnBookNow.setOnClickListener {
            // TODO: Navigate to shops in next phase.
        }

        binding.btnMyBookings.setOnClickListener {
            // TODO: Navigate to bookings in next phase.
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
