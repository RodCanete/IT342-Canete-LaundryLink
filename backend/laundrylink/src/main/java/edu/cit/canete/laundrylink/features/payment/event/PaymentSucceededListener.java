package edu.cit.canete.laundrylink.features.payment.event;

import edu.cit.canete.laundrylink.features.booking.Booking;
import edu.cit.canete.laundrylink.features.booking.BookingService;
import edu.cit.canete.laundrylink.shared.notification.EmailService;
import edu.cit.canete.laundrylink.shared.user.User;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentSucceededListener {

    private final BookingService bookingService;
    private final EmailService emailService;

    public PaymentSucceededListener(BookingService bookingService, EmailService emailService) {
        this.bookingService = bookingService;
        this.emailService = emailService;
    }

    @EventListener
    public void onPaymentSucceeded(PaymentSucceededEvent event) {
        Booking booking = bookingService.markPaid(event.bookingId());
        User customer = booking.getUser();
        emailService.sendBookingConfirmationEmail(
            customer.getEmail(),
            customer.getFirstName() + " " + customer.getLastName(),
            booking.getBookingCode(),
            booking.getShop().getName(),
            booking.getService().getName(),
            booking.getBookingDate().toString(),
            booking.getTimeSlot().toString(),
            booking.getService().getPrice().toPlainString()
        );
    }
}
