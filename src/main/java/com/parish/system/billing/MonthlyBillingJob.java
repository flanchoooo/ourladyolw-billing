package com.parish.system.billing;

import com.parish.system.billing.dto.BillingRunRequest;
import com.parish.system.billing.dto.MemberBillResponse;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MonthlyBillingJob {
    private final BillingItemRepository billingItemRepository;
    private final BillingService billingService;

    @Value("${app.billing.time-zone:Africa/Harare}")
    private String billingTimeZone;

    @Scheduled(cron = "${app.billing.monthly-cron:0 0 0 1 * *}", zone = "${app.billing.time-zone:Africa/Harare}")
    public void runMonthlyBilling() {
        LocalDate billingDate = LocalDate.now(ZoneId.of(billingTimeZone));
        Month billingMonth = Month.values()[billingDate.getMonthValue() - 1];
        int billingYear = billingDate.getYear();

        List<BillingItem> items = billingItemRepository.findByStatusAndFrequencyAndAppliesTo(
                BillingItemStatus.ACTIVE,
                BillingFrequency.MONTHLY,
                BillingAppliesTo.ALL_MEMBERS);

        if (items.isEmpty()) {
            log.info("Monthly billing job found no active all-member monthly billing items for {} {}", billingMonth, billingYear);
            return;
        }

        int createdBills = 0;
        for (BillingItem item : items) {
            BillingRunRequest request = new BillingRunRequest(item.getId(), billingYear, billingMonth, null, null, null);
            List<MemberBillResponse> bills = billingService.run(request);
            createdBills += bills.size();
            log.info("Monthly billing job created {} bill(s) for item '{}' in {} {}", bills.size(), item.getName(), billingMonth, billingYear);
        }

        log.info("Monthly billing job completed for {} {} with {} new bill(s)", billingMonth, billingYear, createdBills);
    }
}
