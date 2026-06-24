package com.parish.system.member.dto;

import com.parish.system.billing.MemberBillStatus;
import com.parish.system.billing.Month;
import java.math.BigDecimal;
import java.util.List;

public record ContributionSummaryResponse(Long memberId, int year, List<MonthContribution> months) {
    public record MonthContribution(Month month, BigDecimal billed, BigDecimal paid, BigDecimal balance,
                                    MemberBillStatus status, String receiptNo) {
    }
}
