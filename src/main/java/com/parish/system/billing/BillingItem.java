package com.parish.system.billing;

import com.parish.system.common.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "billing_items")
public class BillingItem extends BaseAuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    private String description;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingFrequency frequency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingAppliesTo appliesTo;

    private Integer year;

    @Enumerated(EnumType.STRING)
    private Month month;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingItemStatus status = BillingItemStatus.ACTIVE;
}
