package com.parish.system.billing.dto;

import com.parish.system.billing.MemberBillStatus;
import com.parish.system.billing.Month;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MemberBillResponse(Long id, Long memberId, String memberName, Long billingItemId, String billingItem,
                                 BigDecimal amount, String currency, int year, Month month, LocalDate dueDate,
                                 MemberBillStatus status, BigDecimal amountPaid, BigDecimal balance) {
}
