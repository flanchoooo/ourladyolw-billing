package com.parish.system.billing.dto;

import com.parish.system.billing.BillingAppliesTo;
import com.parish.system.billing.BillingFrequency;
import com.parish.system.billing.BillingItemStatus;
import com.parish.system.billing.Month;
import java.math.BigDecimal;

public record BillingItemResponse(Long id, String name, String description, BigDecimal amount, String currency,
                                  BillingFrequency frequency, BillingAppliesTo appliesTo, Integer year, Month month,
                                  BillingItemStatus status) {
}
