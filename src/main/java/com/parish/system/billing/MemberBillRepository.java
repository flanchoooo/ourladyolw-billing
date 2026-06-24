package com.parish.system.billing;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MemberBillRepository extends JpaRepository<MemberBill, Long> {
    boolean existsByMemberIdAndBillingItemIdAndYearAndMonth(Long memberId, Long billingItemId, int year, Month month);

    @Override
    @EntityGraph(attributePaths = {"member", "billingItem"})
    List<MemberBill> findAll();

    @EntityGraph(attributePaths = {"member", "billingItem"})
    List<MemberBill> findByMemberId(Long memberId);

    @EntityGraph(attributePaths = {"member", "billingItem"})
    List<MemberBill> findByStatusIn(List<MemberBillStatus> statuses);

    @EntityGraph(attributePaths = {"member", "billingItem"})
    List<MemberBill> findByYearAndMonth(int year, Month month);

    @Query("select coalesce(sum(b.amount), 0) from MemberBill b where b.year = :year and b.month = :month")
    BigDecimal sumBilledForPeriod(int year, Month month);

    @Query("select coalesce(sum(b.balance), 0) from MemberBill b")
    BigDecimal sumOutstanding();

    @Query("select b.currency, coalesce(sum(b.balance), 0) from MemberBill b group by b.currency")
    List<Object[]> sumOutstandingByCurrency();

    @Query("select coalesce(sum(b.balance), 0) from MemberBill b where b.member.zone.id = :zoneId")
    BigDecimal sumOutstandingByZone(Long zoneId);

    @Query("select b.currency, coalesce(sum(b.balance), 0) from MemberBill b where b.member.zone.id = :zoneId group by b.currency")
    List<Object[]> sumOutstandingByZoneAndCurrency(Long zoneId);
}
