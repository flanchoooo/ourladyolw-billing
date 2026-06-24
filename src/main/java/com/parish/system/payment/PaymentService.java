package com.parish.system.payment;

import com.parish.system.payment.dto.PaymentRequest;
import com.parish.system.payment.dto.PaymentResponse;
import java.util.List;

public interface PaymentService {
    PaymentResponse create(PaymentRequest request);
    List<PaymentResponse> findAll();
    PaymentResponse findById(Long id);
    List<PaymentResponse> byMember(Long memberId);
    PaymentResponse byReceiptNo(String receiptNo);
    PaymentResponse reverse(Long paymentId);
    PaymentResponse toResponse(Payment payment);
}
