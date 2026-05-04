package edu.cit.canete.laundrylink.config;

import edu.cit.canete.laundrylink.entity.Service;
import edu.cit.canete.laundrylink.entity.ServiceType;
import edu.cit.canete.laundrylink.entity.Shop;
import edu.cit.canete.laundrylink.entity.SlotConfig;
import edu.cit.canete.laundrylink.repository.ServiceRepository;
import edu.cit.canete.laundrylink.repository.ShopRepository;
import edu.cit.canete.laundrylink.repository.SlotConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.AbstractMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SlotConfigRepository slotConfigRepository;

    private static final int SEED_DAYS_AHEAD = 7;

    private record Window(LocalTime start, LocalTime end, int maxSlots) {}

    private static final Map<String, List<Window>> SHOP_WINDOWS = Map.of(
        "GF22 Laundry Hub", List.of(
            new Window(LocalTime.of(7, 0),  LocalTime.of(10, 0), 3),
            new Window(LocalTime.of(10, 0), LocalTime.of(13, 0), 3),
            new Window(LocalTime.of(13, 0), LocalTime.of(16, 0), 3),
            new Window(LocalTime.of(16, 0), LocalTime.of(19, 0), 3),
            new Window(LocalTime.of(19, 0), LocalTime.of(21, 0), 2)
        ),
        "Wash 'n Spin Laundromat", List.of(
            new Window(LocalTime.of(6, 0),  LocalTime.of(9, 0),  3),
            new Window(LocalTime.of(9, 0),  LocalTime.of(12, 0), 3),
            new Window(LocalTime.of(12, 0), LocalTime.of(15, 0), 3),
            new Window(LocalTime.of(15, 0), LocalTime.of(18, 0), 3),
            new Window(LocalTime.of(18, 0), LocalTime.of(22, 0), 3)
        ),
        "Isa's Laundry", List.of(
            new Window(LocalTime.of(8, 0),  LocalTime.of(11, 0), 2),
            new Window(LocalTime.of(11, 0), LocalTime.of(14, 0), 2),
            new Window(LocalTime.of(14, 0), LocalTime.of(17, 0), 2),
            new Window(LocalTime.of(17, 0), LocalTime.of(20, 0), 2)
        ),
        "Wash Me Clean Laundry", List.of(
            new Window(LocalTime.of(6, 30),  LocalTime.of(9, 30),  3),
            new Window(LocalTime.of(9, 30),  LocalTime.of(12, 30), 3),
            new Window(LocalTime.of(12, 30), LocalTime.of(15, 30), 3),
            new Window(LocalTime.of(15, 30), LocalTime.of(18, 30), 3),
            new Window(LocalTime.of(18, 30), LocalTime.of(21, 30), 2)
        ),
        "B&J Laundry", List.of(
            new Window(LocalTime.of(7, 0),  LocalTime.of(10, 0), 3),
            new Window(LocalTime.of(10, 0), LocalTime.of(13, 0), 3),
            new Window(LocalTime.of(13, 0), LocalTime.of(16, 0), 3),
            new Window(LocalTime.of(16, 0), LocalTime.of(19, 0), 2),
            new Window(LocalTime.of(19, 0), LocalTime.of(22, 0), 2)
        )
    );

    private static final List<Window> DEFAULT_WINDOWS = List.of(
        new Window(LocalTime.of(9, 0),  LocalTime.of(12, 0), 3),
        new Window(LocalTime.of(12, 0), LocalTime.of(15, 0), 3),
        new Window(LocalTime.of(15, 0), LocalTime.of(18, 0), 3),
        new Window(LocalTime.of(18, 0), LocalTime.of(21, 0), 3)
    );

    private final Set<String> warnedShopNames = new HashSet<>();

    @Override
    public void run(ApplicationArguments args) {
        LocalDate today = LocalDate.now();

        for (Shop shop : shopRepository.findAll()) {
            List<Window> windows = windowsForShop(shop);
            List<Service> priorityServices = serviceRepository.findByShop_Id(shop.getId())
                    .stream()
                    .filter(s -> s.getServiceType() == ServiceType.PRIORITY)
                    .toList();

            for (Service service : priorityServices) {
                for (int i = 0; i < SEED_DAYS_AHEAD; i++) {
                    LocalDate date = today.plusDays(i);

                    Set<Map.Entry<LocalTime, LocalTime>> existingKeys = new HashSet<>();
                    for (SlotConfig existing : slotConfigRepository
                            .findByShop_IdAndService_IdAndConfigDate(shop.getId(), service.getId(), date)) {
                        existingKeys.add(new AbstractMap.SimpleEntry<>(existing.getStartTime(), existing.getEndTime()));
                    }

                    for (Window w : windows) {
                        if (existingKeys.contains(new AbstractMap.SimpleEntry<>(w.start(), w.end()))) {
                            continue;
                        }
                        SlotConfig config = new SlotConfig();
                        config.setShop(shop);
                        config.setService(service);
                        config.setConfigDate(date);
                        config.setStartTime(w.start());
                        config.setEndTime(w.end());
                        config.setMaxSlots(w.maxSlots());
                        slotConfigRepository.save(config);
                    }
                }
            }
        }
    }

    private List<Window> windowsForShop(Shop shop) {
        String name = shop.getName() == null ? "" : shop.getName().trim();
        List<Window> windows = SHOP_WINDOWS.get(name);
        if (windows == null) {
            if (warnedShopNames.add(name)) {
                log.warn("DataSeeder: no window map for shop '{}', falling back to DEFAULT_WINDOWS", name);
            }
            return DEFAULT_WINDOWS;
        }
        return windows;
    }
}
