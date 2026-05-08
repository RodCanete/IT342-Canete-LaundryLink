package edu.cit.canete.laundrylink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShopRequest {

    @NotBlank(message = "Shop name is required")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 255)
    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @Size(max = 255)
    private String operatingHours;
}
