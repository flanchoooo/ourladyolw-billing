package com.parish.system.billing;

import com.parish.system.common.BaseAuditableEntity;
import com.parish.system.member.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "member_bills",
        indexes = {
                @Index(name = "idx_member_bills_member_id", columnList = "member_id"),
                @Index(name = "idx_member_bills_year_month", columnList = "bill_year,bill_month")
        },
        uniqueConstraints = @UniqueConstraint(name = "uk_member_bill_period", columnNames = {
                "member_id", "billing_item_id", "bill_year", "bill_month"
        }))
public class MemberBill extends BaseAuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_item_id", nullable = false)
    private BillingItem billingItem;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "bill_year", nullable = false)
    private int year;

    @Enumerated(EnumType.STRING)
    @Column(name = "bill_month", nullable = false)
    private Month month;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberBillStatus status = MemberBillStatus.PENDING;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal balance;
}
