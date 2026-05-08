package edu.cit.canete.laundrylink.features.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByUser_Id(UUID userId);

    List<Booking> findByShop_IdOrderByBookingDateDescTimeSlotDesc(UUID shopId);

    List<Booking> findByShop_IdAndBookingDate(UUID shopId, LocalDate bookingDate);

    List<Booking> findByShop_IdAndStatus(UUID shopId, BookingStatus status);

    List<Booking> findByShop_IdAndBookingDateAndStatus(UUID shopId, LocalDate bookingDate, BookingStatus status);

    long countByShop_IdAndBookingDate(UUID shopId, LocalDate bookingDate);

    @Query("select count(distinct b.user.id) from Booking b where b.shop.id = :shopId")
    long countDistinctCustomersByShop(@Param("shopId") UUID shopId);

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

    List<Booking> findAllByOrderByBookingDateDescTimeSlotDesc();

    @Query("""
        select b
        from Booking b
        where (:date is null or b.bookingDate = :date)
          and (:status is null or b.status = :status)
          and (:shopId is null or b.shop.id = :shopId)
          and (
            :search is null
            or lower(b.bookingCode) like lower(concat('%', :search, '%'))
            or lower(b.user.email) like lower(concat('%', :search, '%'))
            or lower(concat(b.user.firstName, ' ', b.user.lastName))
                 like lower(concat('%', :search, '%'))
          )
        order by b.bookingDate desc, b.timeSlot desc
    """)
    List<Booking> searchAdminBookings(
        @Param("date") LocalDate date,
        @Param("status") BookingStatus status,
        @Param("shopId") UUID shopId,
        @Param("search") String search
    );

    @Query("""
        select count(b)
        from Booking b
        where b.shop.id = :shopId
          and b.service.serviceType = edu.cit.canete.laundrylink.features.shop.ServiceType.PRIORITY
          and b.bookingDate = :bookingDate
    """)
    long countPriorityBookingsForShopAndDate(
        @Param("shopId") UUID shopId,
        @Param("bookingDate") LocalDate bookingDate
    );
}
