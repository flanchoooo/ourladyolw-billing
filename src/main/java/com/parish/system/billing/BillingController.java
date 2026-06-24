package com.parish.system.billing;

import com.parish.system.billing.dto.BillingItemRequest;
import com.parish.system.billing.dto.BillingItemResponse;
import com.parish.system.billing.dto.BillingRunRequest;
import com.parish.system.billing.dto.MemberBillResponse;
import com.parish.system.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class BillingController {
    private final BillingService billingService;

    @PostMapping("/api/billing-items")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<BillingItemResponse> createItem(@Valid @RequestBody BillingItemRequest request) {
        return ApiResponse.ok("Billing item created", billingService.createItem(request));
    }

    @GetMapping("/api/billing-items")
    public ApiResponse<List<BillingItemResponse>> items() {
        return ApiResponse.ok("Billing items fetched", billingService.items());
    }

    @GetMapping("/api/billing-items/{id}")
    public ApiResponse<BillingItemResponse> item(@PathVariable Long id) {
        return ApiResponse.ok("Billing item fetched", billingService.item(id));
    }

    @PutMapping("/api/billing-items/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<BillingItemResponse> updateItem(@PathVariable Long id, @Valid @RequestBody BillingItemRequest request) {
        return ApiResponse.ok("Billing item updated", billingService.updateItem(id, request));
    }

    @DeleteMapping("/api/billing-items/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> deleteItem(@PathVariable Long id) {
        billingService.deleteItem(id);
        return ApiResponse.ok("Billing item deleted");
    }

    @PostMapping("/api/billing/run")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<List<MemberBillResponse>> run(@Valid @RequestBody BillingRunRequest request) {
        return ApiResponse.ok("Billing run completed", billingService.run(request));
    }

    @GetMapping("/api/member-bills")
    public ApiResponse<List<MemberBillResponse>> bills() {
        return ApiResponse.ok("Member bills fetched", billingService.bills());
    }

    @GetMapping("/api/member-bills/member/{memberId}")
    public ApiResponse<List<MemberBillResponse>> memberBills(@PathVariable Long memberId) {
        return ApiResponse.ok("Member bills fetched", billingService.memberBills(memberId));
    }

    @GetMapping("/api/member-bills/outstanding")
    public ApiResponse<List<MemberBillResponse>> outstanding() {
        return ApiResponse.ok("Outstanding bills fetched", billingService.outstanding());
    }

    @GetMapping("/api/member-bills/year/{year}/month/{month}")
    public ApiResponse<List<MemberBillResponse>> byPeriod(@PathVariable int year, @PathVariable Month month) {
        return ApiResponse.ok("Member bills fetched", billingService.byPeriod(year, month));
    }
}
