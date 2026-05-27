package edu.cit.canete.laundrylink.features.slot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.transaction.Transactional;

@Repository
public interface SlotConfigRepository extends JpaRepository<SlotConfig, UUID> {
    List<SlotConfig> findByShop_IdAndService_IdAndConfigDate(UUID shopId, UUID serviceId, LocalDate configDate);

    List<SlotConfig> findByConfigDate(LocalDate configDate);

    @Query("""
        select sc from SlotConfig sc
        join fetch sc.shop
        join fetch sc.service
        where sc.configDate = :configDate
    """)
    List<SlotConfig> findByConfigDateWithShopAndService(@Param("configDate") LocalDate configDate);

    List<SlotConfig> findByShop_IdAndConfigDate(UUID shopId, LocalDate configDate);

    @Transactional
    void deleteByShop_IdAndService_IdAndConfigDate(UUID shopId, UUID serviceId, LocalDate configDate);
}
