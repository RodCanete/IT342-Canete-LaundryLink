package edu.cit.canete.laundrylink.features.owner;

import edu.cit.canete.laundrylink.features.booking.Booking;
import edu.cit.canete.laundrylink.features.booking.BookingRepository;
import edu.cit.canete.laundrylink.features.booking.BookingStatus;
import edu.cit.canete.laundrylink.features.shop.ServiceRepository;
import edu.cit.canete.laundrylink.features.shop.ServiceType;
import edu.cit.canete.laundrylink.features.shop.Shop;
import edu.cit.canete.laundrylink.features.shop.ShopRepository;
import edu.cit.canete.laundrylink.features.shop.dto.CreateServiceRequest;
import edu.cit.canete.laundrylink.features.shop.dto.UpdateServiceRequest;
import edu.cit.canete.laundrylink.features.shop.dto.UpdateShopRequest;
import edu.cit.canete.laundrylink.features.slot.SlotConfig;
import edu.cit.canete.laundrylink.features.slot.SlotConfigRepository;
import edu.cit.canete.laundrylink.features.slot.dto.CreateSlotConfigRequest;
import edu.cit.canete.laundrylink.features.slot.dto.UpdateSlotConfigRequest;
import edu.cit.canete.laundrylink.shared.user.User;
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
public class OwnerService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SlotConfigRepository slotConfigRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Shop requireOwnedShop(User owner) {
        return shopRepository.findFirstByOwner_Id(owner.getId())
            .orElseThrow(() -> new RuntimeException("OWNER-001: No shop linked to this owner"));
    }

    public Map<String, Object> getMyShop(User owner) {
        Shop shop = requireOwnedShop(owner);
        return shopToMap(shop);
    }

    public Map<String, Object> updateMyShop(User owner, UpdateShopRequest req) {
        Shop shop = requireOwnedShop(owner);
        shop.setName(req.getName());
        shop.setAddress(req.getAddress());
        shop.setCity(req.getCity());
        shop.setLatitude(req.getLatitude());
        shop.setLongitude(req.getLongitude());
        shop.setOperatingHours(req.getOperatingHours());
        Shop saved = shopRepository.save(shop);
        return shopToMap(saved);
    }

    public List<Map<String, Object>> listMyServices(User owner) {
        Shop shop = requireOwnedShop(owner);
        return serviceRepository.findByShop_Id(shop.getId()).stream()
            .map(this::serviceToMap)
            .toList();
    }

    public Map<String, Object> createService(User owner, CreateServiceRequest req) {
        Shop shop = requireOwnedShop(owner);
        edu.cit.canete.laundrylink.features.shop.Service service = new edu.cit.canete.laundrylink.features.shop.Service();
        service.setShop(shop);
        service.setName(req.getName());
        service.setServiceType(req.getServiceType());
        service.setPrice(req.getPrice());
        edu.cit.canete.laundrylink.features.shop.Service saved = serviceRepository.save(service);
        return serviceToMap(saved);
    }

    public Map<String, Object> updateService(User owner, UUID serviceId, UpdateServiceRequest req) {
        Shop shop = requireOwnedShop(owner);
        edu.cit.canete.laundrylink.features.shop.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("SERVICE-001: Service not found"));
        if (!service.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("AUTH-003: Service does not belong to your shop");
        }
        service.setName(req.getName());
        service.setServiceType(req.getServiceType());
        service.setPrice(req.getPrice());
        edu.cit.canete.laundrylink.features.shop.Service saved = serviceRepository.save(service);
        return serviceToMap(saved);
    }

    public void deleteService(User owner, UUID serviceId) {
        Shop shop = requireOwnedShop(owner);
        edu.cit.canete.laundrylink.features.shop.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("SERVICE-001: Service not found"));
        if (!service.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("AUTH-003: Service does not belong to your shop");
        }
        serviceRepository.delete(service);
    }

    public List<Map<String, Object>> listMySlots(User owner, LocalDate date, UUID serviceId) {
        Shop shop = requireOwnedShop(owner);

        List<SlotConfig> configs;
        if (serviceId != null && date != null) {
            configs = slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shop.getId(), serviceId, date);
        } else if (date != null) {
            configs = slotConfigRepository.findByConfigDate(date).stream()
                .filter(c -> c.getShop().getId().equals(shop.getId()))
                .toList();
        } else {
            configs = slotConfigRepository.findAll().stream()
                .filter(c -> c.getShop().getId().equals(shop.getId()))
                .toList();
        }

        return configs.stream().map(c -> slotToMap(c, shop)).toList();
    }

    public Map<String, Object> createSlot(User owner, CreateSlotConfigRequest req) {
        Shop shop = requireOwnedShop(owner);
        edu.cit.canete.laundrylink.features.shop.Service service = serviceRepository.findById(req.getServiceId())
            .orElseThrow(() -> new RuntimeException("SERVICE-001: Service not found"));
        if (!service.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("AUTH-003: Service does not belong to your shop");
        }
        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new RuntimeException("SLOT-003: End time must be after start time");
        }

        SlotConfig config = new SlotConfig();
        config.setShop(shop);
        config.setService(service);
        config.setConfigDate(req.getDate());
        config.setStartTime(req.getStartTime());
        config.setEndTime(req.getEndTime());
        config.setMaxSlots(req.getMaxSlots());
        SlotConfig saved = slotConfigRepository.save(config);
        return slotToMap(saved, shop);
    }

    public Map<String, Object> updateSlot(User owner, UUID slotId, UpdateSlotConfigRequest req) {
        Shop shop = requireOwnedShop(owner);
        SlotConfig config = slotConfigRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("SLOT-004: Slot config not found"));
        if (!config.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("AUTH-003: Slot config does not belong to your shop");
        }
        edu.cit.canete.laundrylink.features.shop.Service service = serviceRepository.findById(req.getServiceId())
            .orElseThrow(() -> new RuntimeException("SERVICE-001: Service not found"));
        if (!service.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("AUTH-003: Service does not belong to your shop");
        }
        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new RuntimeException("SLOT-003: End time must be after start time");
        }

        config.setService(service);
        config.setConfigDate(req.getDate());
        config.setStartTime(req.getStartTime());
        config.setEndTime(req.getEndTime());
        config.setMaxSlots(req.getMaxSlots());
        SlotConfig saved = slotConfigRepository.save(config);
        return slotToMap(saved, shop);
    }

    public void deleteSlot(User owner, UUID slotId) {
        Shop shop = requireOwnedShop(owner);
        SlotConfig config = slotConfigRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("SLOT-004: Slot config not found"));
        if (!config.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("AUTH-003: Slot config does not belong to your shop");
        }
        slotConfigRepository.delete(config);
    }

    public List<Map<String, Object>> listMyBookings(User owner, LocalDate date, BookingStatus status) {
        Shop shop = requireOwnedShop(owner);
        List<Booking> bookings;
        if (date != null && status != null) {
            bookings = bookingRepository.findByShop_IdAndBookingDateAndStatus(shop.getId(), date, status);
        } else if (date != null) {
            bookings = bookingRepository.findByShop_IdAndBookingDate(shop.getId(), date);
        } else if (status != null) {
            bookings = bookingRepository.findByShop_IdAndStatus(shop.getId(), status);
        } else {
            bookings = bookingRepository.findByShop_IdOrderByBookingDateDescTimeSlotDesc(shop.getId());
        }
        return bookings.stream().map(this::bookingToMap).toList();
    }

    public Map<String, Object> getDashboard(User owner) {
        Shop shop = requireOwnedShop(owner);
        LocalDate today = LocalDate.now();

        long todaysBookings = bookingRepository.countByShop_IdAndBookingDate(shop.getId(), today);
        long activeCustomers = bookingRepository.countDistinctCustomersByShop(shop.getId());

        int prioritySlotsUsed = 0;
        int prioritySlotsCapacity = 0;
        List<edu.cit.canete.laundrylink.features.shop.Service> services = serviceRepository.findByShop_Id(shop.getId());
        for (edu.cit.canete.laundrylink.features.shop.Service service : services) {
            if (service.getServiceType() != ServiceType.PRIORITY) continue;
            for (SlotConfig config : slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(
                shop.getId(), service.getId(), today
            )) {
                LocalTime start = config.getStartTime() == null ? LocalTime.MIN : config.getStartTime();
                LocalTime end = config.getEndTime() == null ? LocalTime.MAX : config.getEndTime();
                long reserved = bookingRepository.countForWindow(
                    shop.getId(), service.getId(), today, start, end
                );
                prioritySlotsCapacity += config.getMaxSlots();
                prioritySlotsUsed += Math.min(config.getMaxSlots(), (int) reserved);
            }
        }

        List<Booking> recent = bookingRepository
            .findByShop_IdOrderByBookingDateDescTimeSlotDesc(shop.getId())
            .stream()
            .limit(5)
            .toList();

        List<Map<String, Object>> slotSummary = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            LocalDate date = today.plusDays(i);
            int dayUsed = 0;
            int dayCapacity = 0;
            for (edu.cit.canete.laundrylink.features.shop.Service service : services) {
                if (service.getServiceType() != ServiceType.PRIORITY) continue;
                for (SlotConfig config : slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(
                    shop.getId(), service.getId(), date
                )) {
                    LocalTime start = config.getStartTime() == null ? LocalTime.MIN : config.getStartTime();
                    LocalTime end = config.getEndTime() == null ? LocalTime.MAX : config.getEndTime();
                    long reserved = bookingRepository.countForWindow(
                        shop.getId(), service.getId(), date, start, end
                    );
                    dayCapacity += config.getMaxSlots();
                    dayUsed += Math.min(config.getMaxSlots(), (int) reserved);
                }
            }
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date);
            entry.put("used", dayUsed);
            entry.put("limit", dayCapacity);
            slotSummary.add(entry);
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("shop", shopToMap(shop));
        dashboard.put("todaysBookings", todaysBookings);
        dashboard.put("activeCustomers", activeCustomers);
        dashboard.put("prioritySlotsUsed", prioritySlotsUsed);
        dashboard.put("prioritySlotsCapacity", prioritySlotsCapacity);
        dashboard.put("recentBookings", recent.stream().map(this::bookingToMap).toList());
        dashboard.put("slotSummary", slotSummary);
        return dashboard;
    }

    private Map<String, Object> shopToMap(Shop shop) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", shop.getId());
        map.put("name", shop.getName());
        map.put("address", shop.getAddress());
        map.put("city", shop.getCity());
        map.put("latitude", shop.getLatitude());
        map.put("longitude", shop.getLongitude());
        map.put("operatingHours", shop.getOperatingHours());
        map.put("createdAt", shop.getCreatedAt());
        return map;
    }

    private Map<String, Object> serviceToMap(edu.cit.canete.laundrylink.features.shop.Service service) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", service.getId());
        map.put("name", service.getName());
        map.put("serviceType", service.getServiceType());
        map.put("price", service.getPrice());
        map.put("createdAt", service.getCreatedAt());
        return map;
    }

    private Map<String, Object> slotToMap(SlotConfig config, Shop shop) {
        LocalTime start = config.getStartTime() == null ? LocalTime.MIN : config.getStartTime();
        LocalTime end = config.getEndTime() == null ? LocalTime.MAX : config.getEndTime();
        long reserved = bookingRepository.countForWindow(
            shop.getId(),
            config.getService().getId(),
            config.getConfigDate(),
            start,
            end
        );

        Map<String, Object> map = new HashMap<>();
        map.put("id", config.getId());
        map.put("serviceId", config.getService().getId());
        map.put("serviceName", config.getService().getName());
        map.put("date", config.getConfigDate());
        map.put("startTime", start);
        map.put("endTime", end);
        map.put("maxSlots", config.getMaxSlots());
        map.put("reserved", reserved);
        map.put("available", Math.max(0, config.getMaxSlots() - (int) reserved));
        return map;
    }

    public Map<String, Object> toOwnerBookingResponse(Booking booking) {
        return bookingToMap(booking);
    }

    private Map<String, Object> bookingToMap(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", booking.getId());
        map.put("bookingCode", booking.getBookingCode());
        map.put("status", booking.getStatus());
        map.put("bookingDate", booking.getBookingDate());
        map.put("timeSlot", booking.getTimeSlot());
        map.put("shopId", booking.getShop().getId());
        map.put("serviceId", booking.getService().getId());
        map.put("serviceName", booking.getService().getName());
        map.put("serviceType", booking.getService().getServiceType());
        map.put("servicePrice", booking.getService().getPrice());
        map.put("customerId", booking.getUser().getId());
        map.put("customerName", booking.getUser().getFirstName() + " " + booking.getUser().getLastName());
        map.put("customerEmail", booking.getUser().getEmail());
        map.put("fileUrl", booking.getFileUrl());
        map.put("qrCodeUrl", booking.getQrCodeUrl());
        map.put("createdAt", booking.getCreatedAt());
        return map;
    }
}
