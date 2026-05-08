package edu.cit.canete.laundrylink

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import edu.cit.canete.laundrylink.databinding.ActivityMainBinding
import edu.cit.canete.laundrylink.shared.network.RetrofitClient

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        RetrofitClient.init(applicationContext)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}
