package com.parish.system.billing;

import com.parish.system.billing.dto.BillingItemRequest;
import com.parish.system.billing.dto.BillingItemResponse;
import com.parish.system.billing.dto.BillingRunRequest;
import com.parish.system.billing.dto.MemberBillResponse;
import java.util.List;

public interface BillingService {
    BillingItemResponse createItem(BillingItemRequest request);
    List<BillingItemResponse> items();
    BillingItemResponse item(Long id);
    BillingItemResponse updateItem(Long id, BillingItemRequest request);
    void deleteItem(Long id);
    List<MemberBillResponse> run(BillingRunRequest request);
    List<MemberBillResponse> bills();
    List<MemberBillResponse> memberBills(Long memberId);
    List<MemberBillResponse> outstanding();
    List<MemberBillResponse> byPeriod(int year, Month month);
}
