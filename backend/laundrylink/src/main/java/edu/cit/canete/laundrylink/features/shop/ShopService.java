package edu.cit.canete.laundrylink.features.shop;

import edu.cit.canete.laundrylink.features.booking.BookingRepository;
import edu.cit.canete.laundrylink.features.slot.SlotConfig;
import edu.cit.canete.laundrylink.features.slot.SlotConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    @Autowired
    private RestTemplate restTemplate;

    public List<Shop> listShops() {
        return shopRepository.findAll();
    }

    public Shop getShop(UUID shopId) {
        return shopRepository.findById(shopId)
            .orElseThrow(() -> new RuntimeException("Shop not found"));
    }

    public List<edu.cit.canete.laundrylink.features.shop.Service> listShopServices(UUID shopId) {
        if (!shopRepository.existsById(shopId)) {
            throw new RuntimeException("Shop not found");
        }
        return serviceRepository.findByShop_Id(shopId);
    }

    public Map<String, BigDecimal> geocodeAddress(String address, String city) {
        try {
            String query = URLEncoder.encode(address + ", " + city, StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "LaundryLink/1.0 (student-project)");
            var response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), List.class);
            if (response.getBody() != null && !response.getBody().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> first = (Map<String, Object>) response.getBody().get(0);
                BigDecimal lat = new BigDecimal(first.get("lat").toString());
                BigDecimal lon = new BigDecimal(first.get("lon").toString());
                return Map.of("latitude", lat, "longitude", lon);
            }
        } catch (Exception e) {
            System.err.println("Geocoding failed for: " + address + ", " + city + " — " + e.getMessage());
        }
        return Map.of();
    }

    public List<Map<String, Object>> listShopsSummary(LocalDate date) {
        LocalDate targetDate = date == null ? LocalDate.now() : date;
        List<Shop> shops = shopRepository.findAll();

        return shops.stream().map(shop -> {
            List<edu.cit.canete.laundrylink.features.shop.Service> services = serviceRepository.findByShop_Id(shop.getId());
            List<Map<String, Object>> serviceMaps = new ArrayList<>();

            double standardPrice = 0.0;
            double priorityPrice = 0.0;
            int prioritySlots = 0;

            for (edu.cit.canete.laundrylink.features.shop.Service service : services) {
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
