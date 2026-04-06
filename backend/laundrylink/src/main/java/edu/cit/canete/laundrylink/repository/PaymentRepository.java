package edu.cit.canete.laundrylink.repository;

import edu.cit.canete.laundrylink.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByPaymentIntentId(String paymentIntentId);

    Optional<Payment> findByBooking_Id(UUID bookingId);
}