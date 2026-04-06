package edu.cit.canete.laundrylink.service;

import edu.cit.canete.laundrylink.entity.Shop;
import edu.cit.canete.laundrylink.repository.ServiceRepository;
import edu.cit.canete.laundrylink.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    public List<Shop> listShops() {
        return shopRepository.findAll();
    }

    public Shop getShop(UUID shopId) {
        return shopRepository.findById(shopId)
            .orElseThrow(() -> new RuntimeException("Shop not found"));
    }

    public List<edu.cit.canete.laundrylink.entity.Service> listShopServices(UUID shopId) {
        if (!shopRepository.existsById(shopId)) {
            throw new RuntimeException("Shop not found");
        }
        return serviceRepository.findByShop_Id(shopId);
    }
}