package edu.cit.canete.laundrylink.features.payment.event;

import java.util.UUID;

public record PaymentSucceededEvent(UUID bookingId) {
}
