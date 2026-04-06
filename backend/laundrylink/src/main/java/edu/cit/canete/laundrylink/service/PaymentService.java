package edu.cit.canete.laundrylink.service;

import edu.cit.canete.laundrylink.dto.CreatePaymentIntentRequest;
import edu.cit.canete.laundrylink.entity.Booking;
import edu.cit.canete.laundrylink.entity.BookingStatus;
import edu.cit.canete.laundrylink.entity.Payment;
import edu.cit.canete.laundrylink.entity.PaymentStatus;
import edu.cit.canete.laundrylink.entity.User;
import edu.cit.canete.laundrylink.repository.BookingRepository;
import edu.cit.canete.laundrylink.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AuthenticatedUserService authenticatedUserService;

    public Map<String, Object> createIntent(CreatePaymentIntentRequest request, String authorizationHeader) {
        User user = authenticatedUserService.requireUser(authorizationHeader);
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("AUTH-003: You can only pay your own booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new RuntimeException("PAYMENT-001: Booking is not pending payment");
        }

        Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElseGet(Payment::new);
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency().toUpperCase());
        payment.setStatus(PaymentStatus.PENDING);
        if (payment.getPaymentIntentId() == null || payment.getPaymentIntentId().isBlank()) {
            payment.setPaymentIntentId("pi_" + UUID.randomUUID().toString().replace("-", ""));
        }

        Payment saved = paymentRepository.save(payment);
        return Map.of(
            "paymentIntentId", saved.getPaymentIntentId(),
            "bookingId", booking.getId(),
            "amount", saved.getAmount(),
            "currency", saved.getCurrency(),
            "status", saved.getStatus(),
            "checkoutUrl", "https://checkout.paymongo.com/mock/" + saved.getPaymentIntentId()
        );
    }

    public Map<String, Object> handleWebhook(String paymentIntentId) {
        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
            .orElseThrow(() -> new RuntimeException("PAYMENT-001: Payment intent not found"));

        payment.setStatus(PaymentStatus.SUCCEEDED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
        bookingService.markPaid(payment.getBooking().getId());

        Map<String, Object> response = new HashMap<>();
        response.put("paymentIntentId", payment.getPaymentIntentId());
        response.put("status", payment.getStatus());
        response.put("paidAt", payment.getPaidAt());
        response.put("bookingId", payment.getBooking().getId());
        response.put("bookingStatus", BookingStatus.PAID);
        return response;
    }
}