package edu.cit.canete.laundrylink.service;

import edu.cit.canete.laundrylink.dto.CreateBookingRequest;
import edu.cit.canete.laundrylink.entity.Booking;
import edu.cit.canete.laundrylink.entity.BookingStatus;
import edu.cit.canete.laundrylink.entity.Shop;
import edu.cit.canete.laundrylink.entity.SlotConfig;
import edu.cit.canete.laundrylink.entity.User;
import edu.cit.canete.laundrylink.repository.BookingRepository;
import edu.cit.canete.laundrylink.repository.ServiceRepository;
import edu.cit.canete.laundrylink.repository.ShopRepository;
import edu.cit.canete.laundrylink.repository.SlotConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SlotConfigRepository slotConfigRepository;

    @Autowired
    private AuthenticatedUserService authenticatedUserService;

    @Autowired
    private QrCodeService qrCodeService;

    public Map<String, Object> createBooking(CreateBookingRequest request, String authorizationHeader) {
        User user = authenticatedUserService.requireUser(authorizationHeader);
        Shop shop = shopRepository.findById(request.getShopId())
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Shop not found"));

        var service = serviceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Service not found"));

        if (!service.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("BOOKING-001: Service does not belong to shop");
        }

        SlotConfig matchingConfig = findMatchingSlotConfig(
            shop.getId(),
            service.getId(),
            request.getDate(),
            request.getTimeSlot()
        );

        LocalTime windowStart = matchingConfig.getStartTime() == null ? LocalTime.MIN : matchingConfig.getStartTime();
        LocalTime windowEnd = matchingConfig.getEndTime() == null ? LocalTime.MAX : matchingConfig.getEndTime();
        long reserved = bookingRepository.countForWindow(shop.getId(), service.getId(), request.getDate(), windowStart, windowEnd);
        if (reserved >= matchingConfig.getMaxSlots()) {
            throw new RuntimeException("SLOT-002: Daily Priority slot limit reached");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShop(shop);
        booking.setService(service);
        booking.setBookingDate(request.getDate());
        booking.setTimeSlot(request.getTimeSlot());
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setBookingCode(generateBookingCode());

        if (request.getFileUrl() != null && !request.getFileUrl().isBlank()) {
            booking.setFileUrl(request.getFileUrl().trim());
        }

        Booking saved = bookingRepository.save(booking);
        return toBookingMap(saved);
    }

    public List<Map<String, Object>> listMyBookings(String authorizationHeader) {
        User user = authenticatedUserService.requireUser(authorizationHeader);
        return bookingRepository.findByUser_Id(user.getId()).stream()
            .map(this::toBookingMap)
            .toList();
    }

    public Map<String, Object> getBooking(UUID bookingId, String authorizationHeader) {
        User user = authenticatedUserService.requireUser(authorizationHeader);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("AUTH-003: You can only access your own booking");
        }

        return toBookingMap(booking);
    }

    public Booking markPaid(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Booking not found"));
        booking.setStatus(BookingStatus.PAID);
        if (booking.getQrCodeUrl() == null || booking.getQrCodeUrl().isBlank()) {
            String qr = qrCodeService.generateBase64DataUrl(booking.getBookingCode());
            if (qr != null) {
                booking.setQrCodeUrl(qr);
            }
        }
        return bookingRepository.save(booking);
    }

    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED_TRANSITIONS = Map.of(
        BookingStatus.PENDING_PAYMENT, Set.of(),
        BookingStatus.PAID, Set.of(BookingStatus.DROPPED_OFF),
        BookingStatus.DROPPED_OFF, Set.of(BookingStatus.PROCESSING),
        BookingStatus.PROCESSING, Set.of(BookingStatus.COMPLETED),
        BookingStatus.COMPLETED, Set.of()
    );

    public Booking updateStatus(UUID bookingId, BookingStatus newStatus, User owner) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Booking not found"));

        Shop ownerShop = shopRepository.findFirstByOwner_Id(owner.getId())
            .orElseThrow(() -> new RuntimeException("OWNER-001: No shop linked to this owner"));

        if (!booking.getShop().getId().equals(ownerShop.getId())) {
            throw new RuntimeException("AUTH-003: Booking does not belong to your shop");
        }

        Set<BookingStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(booking.getStatus(), Set.of());
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException(
                "BOOKING-002: Cannot transition from " + booking.getStatus() + " to " + newStatus
            );
        }

        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    public Booking updateStatusAsAdmin(UUID bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Booking not found"));

        Set<BookingStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(booking.getStatus(), Set.of());
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException(
                "BOOKING-002: Cannot transition from " + booking.getStatus() + " to " + newStatus
            );
        }

        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    private SlotConfig findMatchingSlotConfig(UUID shopId, UUID serviceId, java.time.LocalDate date, LocalTime selectedTime) {
        return slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date)
            .stream()
            .filter(config -> {
                LocalTime start = config.getStartTime() == null ? LocalTime.MIN : config.getStartTime();
                LocalTime end = config.getEndTime() == null ? LocalTime.MAX : config.getEndTime();
                return !selectedTime.isBefore(start) && selectedTime.isBefore(end);
            })
            .findFirst()
            .orElseThrow(() -> new RuntimeException("SLOT-001: No available slots for selected date/time"));
    }

    private String generateBookingCode() {
        return "BL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Map<String, Object> toBookingMap(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", booking.getId());
        map.put("bookingCode", booking.getBookingCode());
        map.put("status", booking.getStatus());
        map.put("bookingDate", booking.getBookingDate());
        map.put("timeSlot", booking.getTimeSlot());
        map.put("shopId", booking.getShop().getId());
        map.put("serviceId", booking.getService().getId());
        map.put("fileUrl", booking.getFileUrl());
        map.put("qrCodeUrl", booking.getQrCodeUrl());
        map.put("createdAt", booking.getCreatedAt());
        return map;
    }
}