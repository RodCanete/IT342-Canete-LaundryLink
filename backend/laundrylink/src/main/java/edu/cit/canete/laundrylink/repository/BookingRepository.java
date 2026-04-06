package edu.cit.canete.laundrylink.repository;

import edu.cit.canete.laundrylink.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByUser_Id(UUID userId);

    @Query("""
        select count(b)
        from Booking b
        where b.shop.id = :shopId
          and b.service.id = :serviceId
          and b.bookingDate = :bookingDate
          and b.timeSlot >= :startTime
          and b.timeSlot < :endTime
    """)
    long countForWindow(
        @Param("shopId") UUID shopId,
        @Param("serviceId") UUID serviceId,
        @Param("bookingDate") java.time.LocalDate bookingDate,
        @Param("startTime") java.time.LocalTime startTime,
        @Param("endTime") java.time.LocalTime endTime
    );
}