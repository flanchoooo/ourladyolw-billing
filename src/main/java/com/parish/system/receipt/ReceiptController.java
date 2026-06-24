package com.parish.system.receipt;

import com.parish.system.common.ApiResponse;
import com.parish.system.payment.PaymentService;
import com.parish.system.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {
    private final PaymentService paymentService;

    @GetMapping("/{receiptNo}")
    public ApiResponse<PaymentResponse> receipt(@PathVariable String receiptNo) {
        return ApiResponse.ok("Receipt fetched", paymentService.byReceiptNo(receiptNo));
    }
}
