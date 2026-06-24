package com.parish.system.billing.dto;

import com.parish.system.billing.Month;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BillingRunRequest(@NotNull Long billingItemId, @Positive int year, @NotNull Month month,
                                Long zoneId, Long guildId, Long memberId) {
}
