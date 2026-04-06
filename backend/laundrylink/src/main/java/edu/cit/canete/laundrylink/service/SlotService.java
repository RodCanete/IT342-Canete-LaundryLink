package edu.cit.canete.laundrylink.service;

import edu.cit.canete.laundrylink.entity.SlotConfig;
import edu.cit.canete.laundrylink.repository.BookingRepository;
import edu.cit.canete.laundrylink.repository.SlotConfigRepository;
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
public class SlotService {

    @Autowired
    private SlotConfigRepository slotConfigRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<Map<String, Object>> getSlots(UUID shopId, UUID serviceId, LocalDate date) {
        List<SlotConfig> configs = slotConfigRepository.findByShop_IdAndService_IdAndConfigDate(shopId, serviceId, date);
        List<Map<String, Object>> slots = new ArrayList<>();

        for (SlotConfig config : configs) {
            LocalTime startTime = config.getStartTime() == null ? LocalTime.MIN : config.getStartTime();
            LocalTime endTime = config.getEndTime() == null ? LocalTime.MAX : config.getEndTime();

            long reserved = bookingRepository.countForWindow(shopId, serviceId, date, startTime, endTime);
            int available = Math.max(0, config.getMaxSlots() - (int) reserved);

            Map<String, Object> entry = new HashMap<>();
            entry.put("slotConfigId", config.getId());
            entry.put("date", config.getConfigDate());
            entry.put("startTime", config.getStartTime());
            entry.put("endTime", config.getEndTime());
            entry.put("maxSlots", config.getMaxSlots());
            entry.put("reserved", reserved);
            entry.put("available", available);
            slots.add(entry);
        }

        return slots;
    }
}