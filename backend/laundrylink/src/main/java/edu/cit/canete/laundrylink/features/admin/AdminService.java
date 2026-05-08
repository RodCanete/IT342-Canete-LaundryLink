package edu.cit.canete.laundrylink.features.admin;

import edu.cit.canete.laundrylink.features.admin.dto.AdminSetDailyPriorityLimitRequest;
import edu.cit.canete.laundrylink.features.booking.Booking;
import edu.cit.canete.laundrylink.features.booking.BookingRepository;
import edu.cit.canete.laundrylink.features.booking.BookingService;
import edu.cit.canete.laundrylink.features.booking.BookingStatus;
import edu.cit.canete.laundrylink.features.shop.ServiceRepository;
import edu.cit.canete.laundrylink.features.shop.ServiceType;
import edu.cit.canete.laundrylink.features.shop.Shop;
import edu.cit.canete.laundrylink.features.shop.ShopRepository;
import edu.cit.canete.laundrylink.features.slot.SlotConfig;
import edu.cit.canete.laundrylink.features.slot.SlotConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {

    private static final LocalTime DAY_START = LocalTime.of(0, 0);
    private static final LocalTime DAY_END = LocalTime.of(23, 59);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SlotConfigRepository slotConfigRepository;

    public List<Map<String, Object>> listAllBookings(
        LocalDate date,
        BookingStatus status,
        UUID shopId,
        String search
    ) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        boolean noFilters = date == null && status == null && shopId == null && normalizedSearch == null;
        List<Booking> bookings = noFilters
            ? bookingRepository.findAllByOrderByBookingDateDescTimeSlotDesc()
            : bookingRepository.searchAdminBookings(date, status, shopId, normalizedSearch);
        return bookings.stream().map(this::bookingToMap).toList();
    }

    public Map<String, Object> updateBookingStatus(UUID bookingId, BookingStatus newStatus, BookingService bookingService) {
        Booking saved = bookingService.updateStatusAsAdmin(bookingId, newStatus);
        return bookingToMap(saved);
    }

    public List<Map<String, Object>> listShopsWithPriorityUsage() {
        LocalDate today = LocalDate.now();
        return shopRepository.findAll().stream()
            .map(shop -> shopUsageToMap(shop, today))
            .toList();
    }

    @Transactional
    public Map<String, Object> setDailyPriorityLimit(AdminSetDailyPriorityLimitRequest req) {
        Shop shop = shopRepository.findById(req.getShopId())
            .orElseThrow(() -> new RuntimeException("ADMIN-001: Shop not found"));

        edu.cit.canete.laundrylink.features.shop.Service priorityService = serviceRepository
            .findByShop_Id(shop.getId()).stream()
            .filter(s -> s.getServiceType() == ServiceType.PRIORITY)
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                "ADMIN-002: Shop does not offer a Priority service"
            ));

        long alreadyReserved = bookingRepository.countPriorityBookingsForShopAndDate(
            shop.getId(), req.getDate()
        );
        if (req.getMaxSlots() < alreadyReserved) {
            throw new RuntimeException(
                "ADMIN-003: New limit (" + req.getMaxSlots() + ") is below existing reservations ("
                + alreadyReserved + ")"
            );
        }

        slotConfigRepository.deleteByShop_IdAndService_IdAndConfigDate(
            shop.getId(), priorityService.getId(), req.getDate()
        );

        SlotConfig config = new SlotConfig();
        config.setShop(shop);
        config.setService(priorityService);
        config.setConfigDate(req.getDate());
        config.setStartTime(DAY_START);
        config.setEndTime(DAY_END);
        config.setMaxSlots(req.getMaxSlots());
        SlotConfig saved = slotConfigRepository.save(config);

        return Map.of(
            "id", saved.getId(),
            "shopId", shop.getId(),
            "shopName", shop.getName(),
            "serviceId", priorityService.getId(),
            "date", saved.getConfigDate(),
            "maxSlots", saved.getMaxSlots(),
            "reserved", alreadyReserved
        );
    }

    private Map<String, Object> shopUsageToMap(Shop shop, LocalDate date) {
        int currentLimit = 0;
        for (edu.cit.canete.laundrylink.features.shop.Service service : serviceRepository.findByShop_Id(shop.getId())) {
            if (service.getServiceType() != ServiceType.PRIORITY) continue;
            for (SlotConfig config : slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(
                shop.getId(), service.getId(), date
            )) {
                currentLimit += config.getMaxSlots();
            }
        }
        long usedToday = bookingRepository.countPriorityBookingsForShopAndDate(shop.getId(), date);

        Map<String, Object> map = new HashMap<>();
        map.put("id", shop.getId());
        map.put("name", shop.getName());
        map.put("address", shop.getAddress());
        map.put("city", shop.getCity());
        map.put("currentLimit", currentLimit);
        map.put("usedToday", (int) Math.min(usedToday, Integer.MAX_VALUE));
        map.put("date", date);
        return map;
    }

    private Map<String, Object> bookingToMap(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", booking.getId());
        map.put("bookingCode", booking.getBookingCode());
        map.put("status", booking.getStatus());
        map.put("bookingDate", booking.getBookingDate());
        map.put("timeSlot", booking.getTimeSlot());
        map.put("shopId", booking.getShop().getId());
        map.put("shopName", booking.getShop().getName());
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
