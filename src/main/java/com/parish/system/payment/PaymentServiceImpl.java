package com.parish.system.payment;

import com.parish.system.billing.MemberBill;
import com.parish.system.billing.MemberBillRepository;
import com.parish.system.billing.MemberBillStatus;
import com.parish.system.exception.BadRequestException;
import com.parish.system.exception.NotFoundException;
import com.parish.system.member.Member;
import com.parish.system.member.MemberRepository;
import com.parish.system.payment.dto.PaymentRequest;
import com.parish.system.payment.dto.PaymentResponse;
import com.parish.system.user.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final MemberBillRepository memberBillRepository;

    @Override
    @Transactional
    public PaymentResponse create(PaymentRequest request) {
        BigDecimal allocated = request.allocations().stream()
                .map(allocation -> allocation.amountAllocated())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (allocated.compareTo(request.amount()) != 0) {
            throw new BadRequestException("Payment amount must equal total allocations");
        }
        Member member = memberRepository.findById(request.memberId()).orElseThrow(() -> new NotFoundException("Member not found"));
        Payment payment = new Payment();
        payment.setReceiptNo(nextReceiptNo(request.paymentDate()));
        payment.setMember(member);
        payment.setAmount(request.amount());
        payment.setCurrency(request.currency() == null ? "USD" : request.currency());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setPaymentReference(request.paymentReference());
        payment.setPaymentDate(request.paymentDate());
        payment.setNotes(request.notes());
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            payment.setReceivedBy(user);
        }
        request.allocations().forEach(allocationRequest -> {
            MemberBill bill = memberBillRepository.findById(allocationRequest.memberBillId())
                    .orElseThrow(() -> new NotFoundException("Member bill not found"));
            if (!bill.getMember().getId().equals(member.getId())) {
                throw new BadRequestException("All allocated bills must belong to the payment member");
            }
            if (allocationRequest.amountAllocated().compareTo(bill.getBalance()) > 0) {
                throw new BadRequestException("Payment allocation cannot exceed bill balance");
            }
            bill.setAmountPaid(bill.getAmountPaid().add(allocationRequest.amountAllocated()));
            bill.setBalance(bill.getAmount().subtract(bill.getAmountPaid()));
            updateStatus(bill);
            PaymentAllocation allocation = new PaymentAllocation();
            allocation.setPayment(payment);
            allocation.setMemberBill(bill);
            allocation.setAmountAllocated(allocationRequest.amountAllocated());
            payment.getAllocations().add(allocation);
        });
        return toResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findAll() {
        return paymentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse findById(Long id) {
        return toResponse(findPayment(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> byMember(Long memberId) {
        return paymentRepository.findByMemberId(memberId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse byReceiptNo(String receiptNo) {
        return toResponse(paymentRepository.findByReceiptNo(receiptNo).orElseThrow(() -> new NotFoundException("Receipt not found")));
    }

    @Override
    @Transactional
    public PaymentResponse reverse(Long paymentId) {
        Payment payment = findPayment(paymentId);
        if (payment.isReversed()) {
            throw new BadRequestException("Payment is already reversed");
        }
        payment.getAllocations().forEach(allocation -> {
            MemberBill bill = allocation.getMemberBill();
            bill.setAmountPaid(bill.getAmountPaid().subtract(allocation.getAmountAllocated()));
            bill.setBalance(bill.getAmount().subtract(bill.getAmountPaid()));
            updateStatus(bill);
        });
        payment.setReversed(true);
        return toResponse(payment);
    }

    @Override
    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(payment.getId(), payment.getReceiptNo(), payment.getMember().getId(),
                payment.getMember().getFirstNames() + " " + payment.getMember().getSurname(), payment.getAmount(),
                payment.getCurrency(), payment.getPaymentMethod(), payment.getPaymentReference(), payment.getPaymentDate(),
                payment.getReceivedBy() == null ? null : payment.getReceivedBy().getId(), payment.getNotes(), payment.isReversed(),
                payment.getAllocations().stream()
                        .map(allocation -> new PaymentResponse.AllocationResponse(allocation.getId(),
                                allocation.getMemberBill().getId(), allocation.getAmountAllocated()))
                        .toList());
    }

    private Payment findPayment(Long id) {
        return paymentRepository.findById(id).orElseThrow(() -> new NotFoundException("Payment not found"));
    }

    private void updateStatus(MemberBill bill) {
        if (bill.getAmountPaid().compareTo(BigDecimal.ZERO) == 0) {
            bill.setStatus(MemberBillStatus.PENDING);
        } else if (bill.getBalance().compareTo(BigDecimal.ZERO) == 0) {
            bill.setStatus(MemberBillStatus.PAID);
        } else {
            bill.setStatus(MemberBillStatus.PARTIALLY_PAID);
        }
    }

    private String nextReceiptNo(LocalDate date) {
        return "RCP-" + date.toString().replace("-", "") + "-" + String.format("%06d", paymentRepository.countByPaymentDate(date) + 1);
    }
}
