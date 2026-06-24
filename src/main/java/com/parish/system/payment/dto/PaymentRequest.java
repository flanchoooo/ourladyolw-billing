package com.parish.system.payment.dto;

import com.parish.system.payment.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PaymentRequest(
        @NotNull Long memberId,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        String currency,
        @NotNull PaymentMethod paymentMethod,
        String paymentReference,
        @NotNull LocalDate paymentDate,
        String notes,
        @NotEmpty List<@Valid PaymentAllocationRequest> allocations
) {
}
