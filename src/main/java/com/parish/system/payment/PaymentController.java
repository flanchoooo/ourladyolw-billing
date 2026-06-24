package com.parish.system.payment;

import com.parish.system.common.ApiResponse;
import com.parish.system.payment.dto.PaymentRequest;
import com.parish.system.payment.dto.PaymentResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN','CASHIER')")
    public ApiResponse<PaymentResponse> create(@Valid @RequestBody PaymentRequest request) {
        return ApiResponse.ok("Payment captured successfully", paymentService.create(request));
    }

    @GetMapping
    public ApiResponse<List<PaymentResponse>> all() {
        return ApiResponse.ok("Payments fetched", paymentService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok("Payment fetched", paymentService.findById(id));
    }

    @GetMapping("/member/{memberId}")
    public ApiResponse<List<PaymentResponse>> byMember(@PathVariable Long memberId) {
        return ApiResponse.ok("Payments fetched", paymentService.byMember(memberId));
    }

    @GetMapping("/receipt/{receiptNo}")
    public ApiResponse<PaymentResponse> byReceipt(@PathVariable String receiptNo) {
        return ApiResponse.ok("Receipt fetched", paymentService.byReceiptNo(receiptNo));
    }

    @PostMapping("/{paymentId}/reverse")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<PaymentResponse> reverse(@PathVariable Long paymentId) {
        return ApiResponse.ok("Payment reversed", paymentService.reverse(paymentId));
    }
}
