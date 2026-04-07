package edu.cit.canete.laundrylink.service.event;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import edu.cit.canete.laundrylink.service.BookingService;

@Component
public class PaymentSucceededListener {

    private final BookingService bookingService;

    public PaymentSucceededListener(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @EventListener
    public void onPaymentSucceeded(PaymentSucceededEvent event) {
        bookingService.markPaid(event.bookingId());
    }
}
