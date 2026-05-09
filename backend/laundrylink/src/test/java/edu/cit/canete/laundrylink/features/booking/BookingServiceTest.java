package edu.cit.canete.laundrylink.features.booking;

import edu.cit.canete.laundrylink.features.booking.dto.CreateBookingRequest;
import edu.cit.canete.laundrylink.features.shop.Service;
import edu.cit.canete.laundrylink.features.shop.ServiceRepository;
import edu.cit.canete.laundrylink.features.shop.Shop;
import edu.cit.canete.laundrylink.features.shop.ShopRepository;
import edu.cit.canete.laundrylink.features.slot.SlotConfig;
import edu.cit.canete.laundrylink.features.slot.SlotConfigRepository;
import edu.cit.canete.laundrylink.shared.user.AuthenticatedUserService;
import edu.cit.canete.laundrylink.shared.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ShopRepository shopRepository;
    @Mock private ServiceRepository serviceRepository;
    @Mock private SlotConfigRepository slotConfigRepository;
    @Mock private AuthenticatedUserService authenticatedUserService;
    @Mock private QrCodeService qrCodeService;

    @InjectMocks
    private BookingService bookingService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private User makeUser() {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setFirstName("Test"); u.setLastName("User");
        u.setEmail("test@example.com"); u.setRole("CUSTOMER");
        return u;
    }

    private Shop makeShop(UUID shopId) {
        Shop s = new Shop();
        s.setId(shopId);
        return s;
    }

    private Service makeService(UUID serviceId, Shop shop) {
        Service svc = new Service();
        svc.setId(serviceId);
        svc.setShop(shop);
        return svc;
    }

    private SlotConfig makeSlotConfig(Shop shop, Service service, LocalDate date, int maxSlots) {
        SlotConfig cfg = new SlotConfig();
        cfg.setId(UUID.randomUUID());
        cfg.setShop(shop); cfg.setService(service);
        cfg.setConfigDate(date);
        cfg.setStartTime(LocalTime.of(8, 0));
        cfg.setEndTime(LocalTime.of(18, 0));
        cfg.setMaxSlots(maxSlots);
        return cfg;
    }

    private CreateBookingRequest makeRequest(UUID shopId, UUID serviceId, LocalDate date, LocalTime timeSlot) {
        CreateBookingRequest req = new CreateBookingRequest();
        req.setShopId(shopId); req.setServiceId(serviceId);
        req.setDate(date); req.setTimeSlot(timeSlot);
        return req;
    }

    // ── TC-08-01: valid input → booking saved with BL- code ──────────────────

    @Test
    void createBooking_validInput_returnsBookingWithCode() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);
        LocalTime timeSlot = LocalTime.of(10, 0);

        User user = makeUser();
        Shop shop = makeShop(shopId);
        Service service = makeService(serviceId, shop);
        SlotConfig slotConfig = makeSlotConfig(shop, service, date, 5);

        when(authenticatedUserService.requireUser(anyString())).thenReturn(user);
        when(shopRepository.findById(shopId)).thenReturn(Optional.of(shop));
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date))
                .thenReturn(List.of(slotConfig));
        when(bookingRepository.countForWindow(any(), any(), any(), any(), any())).thenReturn(2L);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(UUID.randomUUID());
            return b;
        });

        Map<String, Object> result = bookingService.createBooking(
                makeRequest(shopId, serviceId, date, timeSlot), "Bearer token");

        assertNotNull(result);
        String code = (String) result.get("bookingCode");
        assertNotNull(code, "bookingCode must not be null");
        assertTrue(code.startsWith("BL-"), "Code should start with BL-, was: " + code);
        assertEquals(BookingStatus.PENDING_PAYMENT, result.get("status"));
    }

    // ── TC-08-03: reserved >= maxSlots → SLOT-002 ────────────────────────────

    @Test
    void createBooking_noSlotsAvailable_throwsException() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);
        LocalTime timeSlot = LocalTime.of(10, 0);

        User user = makeUser();
        Shop shop = makeShop(shopId);
        Service service = makeService(serviceId, shop);
        SlotConfig slotConfig = makeSlotConfig(shop, service, date, 3);

        when(authenticatedUserService.requireUser(anyString())).thenReturn(user);
        when(shopRepository.findById(shopId)).thenReturn(Optional.of(shop));
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date))
                .thenReturn(List.of(slotConfig));
        when(bookingRepository.countForWindow(any(), any(), any(), any(), any())).thenReturn(3L);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> bookingService.createBooking(
                        makeRequest(shopId, serviceId, date, timeSlot), "Bearer token"));
        assertTrue(ex.getMessage().contains("SLOT-002"),
                "Expected SLOT-002 in message but got: " + ex.getMessage());
    }

    // ── TC-08-01b: shop not found → BOOKING-001 ──────────────────────────────

    @Test
    void createBooking_shopNotFound_throwsException() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();

        when(authenticatedUserService.requireUser(anyString())).thenReturn(makeUser());
        when(shopRepository.findById(shopId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> bookingService.createBooking(
                        makeRequest(shopId, serviceId, LocalDate.now().plusDays(1), LocalTime.of(10, 0)),
                        "Bearer token"));
        assertTrue(ex.getMessage().contains("BOOKING-001"),
                "Expected BOOKING-001 in message but got: " + ex.getMessage());
    }

    // ── TC-11-01: PAID → DROPPED_OFF ─────────────────────────────────────────

    @Test
    void updateStatus_paidToDroppedOff_succeeds() {
        UUID bookingId = UUID.randomUUID(), shopId = UUID.randomUUID();
        User owner = makeUser(); owner.setRole("SHOP_OWNER");
        Shop shop = makeShop(shopId);

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setShop(shop);
        booking.setStatus(BookingStatus.PAID);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(shopRepository.findFirstByOwner_Id(owner.getId())).thenReturn(Optional.of(shop));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.updateStatus(bookingId, BookingStatus.DROPPED_OFF, owner);
        assertEquals(BookingStatus.DROPPED_OFF, result.getStatus());
    }

    // ── TC-11-02: DROPPED_OFF → PROCESSING ───────────────────────────────────

    @Test
    void updateStatus_droppedOffToProcessing_succeeds() {
        UUID bookingId = UUID.randomUUID(), shopId = UUID.randomUUID();
        User owner = makeUser(); owner.setRole("SHOP_OWNER");
        Shop shop = makeShop(shopId);

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setShop(shop);
        booking.setStatus(BookingStatus.DROPPED_OFF);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(shopRepository.findFirstByOwner_Id(owner.getId())).thenReturn(Optional.of(shop));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.updateStatus(bookingId, BookingStatus.PROCESSING, owner);
        assertEquals(BookingStatus.PROCESSING, result.getStatus());
    }

    // ── TC-11-03: PROCESSING → COMPLETED ─────────────────────────────────────

    @Test
    void updateStatus_processingToCompleted_succeeds() {
        UUID bookingId = UUID.randomUUID(), shopId = UUID.randomUUID();
        User owner = makeUser(); owner.setRole("SHOP_OWNER");
        Shop shop = makeShop(shopId);

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setShop(shop);
        booking.setStatus(BookingStatus.PROCESSING);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(shopRepository.findFirstByOwner_Id(owner.getId())).thenReturn(Optional.of(shop));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.updateStatus(bookingId, BookingStatus.COMPLETED, owner);
        assertEquals(BookingStatus.COMPLETED, result.getStatus());
    }

    // ── TC-11-04: invalid transition PAID → COMPLETED → BOOKING-002 ──────────

    @Test
    void updateStatus_invalidTransition_throwsException() {
        UUID bookingId = UUID.randomUUID(), shopId = UUID.randomUUID();
        User owner = makeUser(); owner.setRole("SHOP_OWNER");
        Shop shop = makeShop(shopId);

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setShop(shop);
        booking.setStatus(BookingStatus.PAID);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(shopRepository.findFirstByOwner_Id(owner.getId())).thenReturn(Optional.of(shop));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> bookingService.updateStatus(bookingId, BookingStatus.COMPLETED, owner));
        assertTrue(ex.getMessage().contains("BOOKING-002"),
                "Expected BOOKING-002 in message but got: " + ex.getMessage());
    }

    // ── TC-11-05: booking not found → BOOKING-001 ────────────────────────────

    @Test
    void updateStatus_bookingNotFound_throwsException() {
        UUID bookingId = UUID.randomUUID();
        User owner = makeUser();
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> bookingService.updateStatus(bookingId, BookingStatus.DROPPED_OFF, owner));
        assertTrue(ex.getMessage().contains("BOOKING-001"),
                "Expected BOOKING-001 in message but got: " + ex.getMessage());
    }

    // ── markPaid: sets PAID and generates QR code ─────────────────────────────

    @Test
    void markPaid_setsStatusPaid_andGeneratesQrCode() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setBookingCode("BL-ABCD1234");
        booking.setQrCodeUrl(null);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(qrCodeService.generateBase64DataUrl("BL-ABCD1234"))
                .thenReturn("data:image/png;base64,FAKEQR");
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.markPaid(bookingId);

        assertEquals(BookingStatus.PAID, result.getStatus());
        assertNotNull(result.getQrCodeUrl());
        assertTrue(result.getQrCodeUrl().startsWith("data:image/png;base64,"));
    }

    // ── Admin updateStatusAsAdmin: PAID → COMPLETED blocked ──────────────────

    @Test
    void updateStatusAsAdmin_invalidTransition_throwsException() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(BookingStatus.PAID);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> bookingService.updateStatusAsAdmin(bookingId, BookingStatus.COMPLETED));
        assertTrue(ex.getMessage().contains("BOOKING-002"),
                "Expected BOOKING-002 in message but got: " + ex.getMessage());
    }
}
