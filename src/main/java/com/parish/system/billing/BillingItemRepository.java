package com.parish.system.billing;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingItemRepository extends JpaRepository<BillingItem, Long> {
    List<BillingItem> findByStatusAndFrequencyAndAppliesTo(
            BillingItemStatus status,
            BillingFrequency frequency,
            BillingAppliesTo appliesTo);
}
