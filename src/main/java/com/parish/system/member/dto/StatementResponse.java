package com.parish.system.member.dto;

import com.parish.system.billing.dto.MemberBillResponse;
import com.parish.system.payment.dto.PaymentResponse;
import java.math.BigDecimal;
import java.util.List;

public record StatementResponse(MemberResponse member, BigDecimal openingBalance, List<MemberBillResponse> bills,
                                List<PaymentResponse> payments, BigDecimal currentBalance) {
}
