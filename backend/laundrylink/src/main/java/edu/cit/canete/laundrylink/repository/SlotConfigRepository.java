package edu.cit.canete.laundrylink.repository;

import edu.cit.canete.laundrylink.entity.SlotConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SlotConfigRepository extends JpaRepository<SlotConfig, UUID> {
    List<SlotConfig> findByShop_IdAndService_IdAndConfigDate(UUID shopId, UUID serviceId, LocalDate configDate);
}