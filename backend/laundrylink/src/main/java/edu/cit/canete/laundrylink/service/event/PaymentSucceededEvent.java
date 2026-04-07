package edu.cit.canete.laundrylink.service.event;

import java.util.UUID;

public record PaymentSucceededEvent(UUID bookingId) {
}
