package com.parish.system.billing.dto;

import com.parish.system.billing.BillingAppliesTo;
import com.parish.system.billing.BillingFrequency;
import com.parish.system.billing.BillingItemStatus;
import com.parish.system.billing.Month;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BillingItemRequest(
        @NotBlank String name,
        String description,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotBlank String currency,
        @NotNull BillingFrequency frequency,
        @NotNull BillingAppliesTo appliesTo,
        Integer year,
        Month month,
        BillingItemStatus status
) {
}
