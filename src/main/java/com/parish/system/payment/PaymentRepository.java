package com.parish.system.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Override
    @EntityGraph(attributePaths = {"member", "receivedBy", "allocations", "allocations.memberBill"})
    List<Payment> findAll();

    @Override
    @EntityGraph(attributePaths = {"member", "receivedBy", "allocations", "allocations.memberBill"})
    Optional<Payment> findById(Long id);

    @EntityGraph(attributePaths = {"member", "receivedBy", "allocations", "allocations.memberBill"})
    Optional<Payment> findByReceiptNo(String receiptNo);

    @EntityGraph(attributePaths = {"member", "receivedBy", "allocations", "allocations.memberBill"})
    List<Payment> findByMemberId(Long memberId);

    long countByPaymentDate(LocalDate paymentDate);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.paymentDate = :date and p.reversed = false")
    BigDecimal sumByPaymentDate(LocalDate date);

    @Query("select p.currency, coalesce(sum(p.amount), 0) from Payment p where p.paymentDate = :date and p.reversed = false group by p.currency")
    List<Object[]> sumByPaymentDateAndCurrency(LocalDate date);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where year(p.paymentDate) = :year and month(p.paymentDate) = :month and p.reversed = false")
    BigDecimal sumByYearAndMonth(int year, int month);

    @Query("select p.currency, coalesce(sum(p.amount), 0) from Payment p where year(p.paymentDate) = :year and month(p.paymentDate) = :month and p.reversed = false group by p.currency")
    List<Object[]> sumByYearAndMonthAndCurrency(int year, int month);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where year(p.paymentDate) = :year and p.reversed = false")
    BigDecimal sumByYear(int year);

    @Query("select p.currency, coalesce(sum(p.amount), 0) from Payment p where year(p.paymentDate) = :year and p.reversed = false group by p.currency")
    List<Object[]> sumByYearAndCurrency(int year);

    @Query("select p.paymentMethod, p.currency, coalesce(sum(p.amount), 0) from Payment p where p.paymentDate between :from and :to and p.reversed = false group by p.paymentMethod, p.currency")
    List<Object[]> paymentMethodSummary(LocalDate from, LocalDate to);

    @Query("select p.currency, coalesce(sum(p.amount), 0) from Payment p where p.paymentDate between :from and :to and p.reversed = false group by p.currency")
    List<Object[]> sumByDateRangeAndCurrency(LocalDate from, LocalDate to);
}
