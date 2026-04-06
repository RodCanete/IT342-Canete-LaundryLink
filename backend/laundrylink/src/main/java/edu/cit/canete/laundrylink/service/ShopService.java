package edu.cit.canete.laundrylink.service;

import edu.cit.canete.laundrylink.entity.Shop;
import edu.cit.canete.laundrylink.entity.SlotConfig;
import edu.cit.canete.laundrylink.entity.ServiceType;
import edu.cit.canete.laundrylink.repository.BookingRepository;
import edu.cit.canete.laundrylink.repository.ServiceRepository;
import edu.cit.canete.laundrylink.repository.SlotConfigRepository;
import edu.cit.canete.laundrylink.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SlotConfigRepository slotConfigRepository;

    @Autowired
    private BookingRepository bookingRepository;

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

    public List<Map<String, Object>> listShopsSummary(LocalDate date) {
        LocalDate targetDate = date == null ? LocalDate.now() : date;
        List<Shop> shops = shopRepository.findAll();

        return shops.stream().map(shop -> {
            List<edu.cit.canete.laundrylink.entity.Service> services = serviceRepository.findByShop_Id(shop.getId());
            List<Map<String, Object>> serviceMaps = new ArrayList<>();

            double standardPrice = 0.0;
            double priorityPrice = 0.0;
            int prioritySlots = 0;

            for (edu.cit.canete.laundrylink.entity.Service service : services) {
                Map<String, Object> serviceMap = new HashMap<>();
                serviceMap.put("id", service.getId());
                serviceMap.put("name", service.getName());
                serviceMap.put("serviceType", service.getServiceType());
                serviceMap.put("price", service.getPrice());
                serviceMap.put("createdAt", service.getCreatedAt());
                serviceMaps.add(serviceMap);

                if (service.getServiceType() == ServiceType.STANDARD && standardPrice == 0.0) {
                    standardPrice = service.getPrice().doubleValue();
                }

                if (service.getServiceType() == ServiceType.PRIORITY) {
                    if (priorityPrice == 0.0) {
                        priorityPrice = service.getPrice().doubleValue();
                    }

                    List<SlotConfig> slotConfigs = slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(
                        shop.getId(),
                        service.getId(),
                        targetDate
                    );

                    for (SlotConfig config : slotConfigs) {
                        LocalTime start = config.getStartTime() == null ? LocalTime.MIN : config.getStartTime();
                        LocalTime end = config.getEndTime() == null ? LocalTime.MAX : config.getEndTime();
                        long reserved = bookingRepository.countForWindow(shop.getId(), service.getId(), targetDate, start, end);
                        prioritySlots += Math.max(0, config.getMaxSlots() - (int) reserved);
                    }
                }
            }

            if (priorityPrice == 0.0) {
                priorityPrice = standardPrice;
            }

            Map<String, Object> shopMap = new HashMap<>();
            shopMap.put("id", shop.getId());
            shopMap.put("name", shop.getName());
            shopMap.put("address", shop.getAddress());
            shopMap.put("city", shop.getCity());
            shopMap.put("latitude", shop.getLatitude());
            shopMap.put("longitude", shop.getLongitude());
            shopMap.put("operatingHours", shop.getOperatingHours());
            shopMap.put("createdAt", shop.getCreatedAt());
            shopMap.put("standardPrice", standardPrice);
            shopMap.put("priorityPrice", priorityPrice);
            shopMap.put("prioritySlots", prioritySlots);
            shopMap.put("services", serviceMaps);
            return shopMap;
        }).toList();
    }
}