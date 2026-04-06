package edu.cit.canete.laundrylink.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CreatePaymentIntentRequest {

    @NotNull
    private UUID bookingId;

    public UUID getBookingId() {
        return bookingId;
    }

    public void setBookingId(UUID bookingId) {
        this.bookingId = bookingId;
    }
}