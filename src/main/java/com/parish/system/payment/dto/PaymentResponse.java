package com.parish.system.payment.dto;

import com.parish.system.payment.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PaymentResponse(Long id, String receiptNo, Long memberId, String memberName, BigDecimal amount,
                              String currency, PaymentMethod paymentMethod, String paymentReference,
                              LocalDate paymentDate, Long receivedByUserId, String notes, boolean reversed,
                              List<AllocationResponse> allocations) {
    public record AllocationResponse(Long id, Long memberBillId, BigDecimal amountAllocated) {
    }
}
