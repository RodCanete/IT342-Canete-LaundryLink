package edu.cit.canete.laundrylink.features.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSetDailyPriorityLimitRequest {

    @NotNull(message = "Shop ID is required")
    private UUID shopId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Max slots is required")
    @Min(value = 1, message = "Max slots must be at least 1")
    @Max(value = 999, message = "Max slots is too large")
    private Integer maxSlots;
}
