package edu.cit.canete.laundrylink.features.booking.dto;

import edu.cit.canete.laundrylink.features.booking.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingStatusRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;
}
