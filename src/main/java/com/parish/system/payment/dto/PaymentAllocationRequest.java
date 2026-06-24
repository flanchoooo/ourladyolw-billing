package com.parish.system.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PaymentAllocationRequest(@NotNull Long memberBillId, @NotNull @DecimalMin("0.01") BigDecimal amountAllocated) {
}
