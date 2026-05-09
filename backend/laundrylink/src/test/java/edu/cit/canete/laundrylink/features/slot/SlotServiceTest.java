package edu.cit.canete.laundrylink.features.slot;

import edu.cit.canete.laundrylink.features.booking.BookingRepository;
import edu.cit.canete.laundrylink.features.shop.Service;
import edu.cit.canete.laundrylink.features.shop.Shop;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SlotServiceTest {

    @Mock private SlotConfigRepository slotConfigRepository;
    @Mock private BookingRepository bookingRepository;

    @InjectMocks
    private SlotService slotService;

    // ── helper ────────────────────────────────────────────────────────────────

    private SlotConfig makeConfig(UUID shopId, UUID serviceId, LocalDate date, int maxSlots) {
        Shop shop = new Shop();
        shop.setId(shopId);

        Service service = new Service();
        service.setId(serviceId);

        SlotConfig cfg = new SlotConfig();
        cfg.setId(UUID.randomUUID());
        cfg.setShop(shop);
        cfg.setService(service);
        cfg.setConfigDate(date);
        cfg.setStartTime(LocalTime.of(8, 0));
        cfg.setEndTime(LocalTime.of(18, 0));
        cfg.setMaxSlots(maxSlots);
        return cfg;
    }

    // ── TC-07-01: maxSlots=5, reserved=2 → available=3 ───────────────────────

    @Test
    void getSlots_returnsCorrectAvailableCount() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);
        SlotConfig cfg = makeConfig(shopId, serviceId, date, 5);

        when(slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date))
                .thenReturn(List.of(cfg));
        when(bookingRepository.countForWindow(eq(shopId), eq(serviceId), eq(date), any(), any()))
                .thenReturn(2L);

        List<Map<String, Object>> slots = slotService.getSlots(shopId, serviceId, date);

        assertEquals(1, slots.size());
        Map<String, Object> slot = slots.get(0);
        assertEquals(5, slot.get("maxSlots"));
        assertEquals(2L, slot.get("reserved"));
        assertEquals(3, slot.get("available"));
    }

    // ── TC-07-02: maxSlots=3, reserved=3 → available=0 ───────────────────────

    @Test
    void getSlots_fullyBooked_returnsZeroAvailable() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);
        SlotConfig cfg = makeConfig(shopId, serviceId, date, 3);

        when(slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date))
                .thenReturn(List.of(cfg));
        when(bookingRepository.countForWindow(eq(shopId), eq(serviceId), eq(date), any(), any()))
                .thenReturn(3L);

        List<Map<String, Object>> slots = slotService.getSlots(shopId, serviceId, date);

        assertEquals(1, slots.size());
        assertEquals(0, slots.get(0).get("available"));
    }

    // ── TC-15-03: maxSlots=0, reserved=0 → available=0 ──────────────────────

    @Test
    void getSlots_zeroMaxSlots_returnsZeroAvailable() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);
        SlotConfig cfg = makeConfig(shopId, serviceId, date, 0);

        when(slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date))
                .thenReturn(List.of(cfg));
        when(bookingRepository.countForWindow(eq(shopId), eq(serviceId), eq(date), any(), any()))
                .thenReturn(0L);

        List<Map<String, Object>> slots = slotService.getSlots(shopId, serviceId, date);

        assertEquals(1, slots.size());
        assertEquals(0, slots.get(0).get("available"));
    }

    // ── no configs for that date → empty list ────────────────────────────────

    @Test
    void getSlots_noConfigs_returnsEmptyList() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);

        when(slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date))
                .thenReturn(Collections.emptyList());

        List<Map<String, Object>> slots = slotService.getSlots(shopId, serviceId, date);

        assertNotNull(slots);
        assertTrue(slots.isEmpty());
    }

    // ── reserved > max → available clamped to 0 (Math.max guard) ─────────────

    @Test
    void getSlots_reservedExceedsMax_returnsZeroNotNegative() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);
        SlotConfig cfg = makeConfig(shopId, serviceId, date, 3);

        when(slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date))
                .thenReturn(List.of(cfg));
        when(bookingRepository.countForWindow(eq(shopId), eq(serviceId), eq(date), any(), any()))
                .thenReturn(5L);

        List<Map<String, Object>> slots = slotService.getSlots(shopId, serviceId, date);

        assertEquals(1, slots.size());
        int available = (int) slots.get(0).get("available");
        assertTrue(available >= 0, "Available must not be negative, got: " + available);
        assertEquals(0, available);
    }

    // ── result map contains all expected keys ─────────────────────────────────

    @Test
    void getSlots_resultMapContainsAllExpectedKeys() {
        UUID shopId = UUID.randomUUID(), serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);
        SlotConfig cfg = makeConfig(shopId, serviceId, date, 5);

        when(slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date))
                .thenReturn(List.of(cfg));
        when(bookingRepository.countForWindow(eq(shopId), eq(serviceId), eq(date), any(), any()))
                .thenReturn(1L);

        List<Map<String, Object>> slots = slotService.getSlots(shopId, serviceId, date);
        Map<String, Object> slot = slots.get(0);

        assertTrue(slot.containsKey("slotConfigId"));
        assertTrue(slot.containsKey("date"));
        assertTrue(slot.containsKey("startTime"));
        assertTrue(slot.containsKey("endTime"));
        assertTrue(slot.containsKey("maxSlots"));
        assertTrue(slot.containsKey("reserved"));
        assertTrue(slot.containsKey("available"));
    }
}
