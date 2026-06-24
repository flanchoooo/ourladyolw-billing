package com.parish.system.member;

import com.parish.system.common.BaseAuditableEntity;
import com.parish.system.guild.Guild;
import com.parish.system.masscentre.MassCentre;
import com.parish.system.ministry.Ministry;
import com.parish.system.section.Section;
import com.parish.system.zone.Zone;
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "members", indexes = {
        @Index(name = "idx_members_membership_no", columnList = "membership_no"),
        @Index(name = "idx_members_zone_id", columnList = "zone_id")
})
public class Member extends BaseAuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "membership_no", nullable = false, unique = true, length = 40)
    private String membershipNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mass_centre_id")
    private MassCentre massCentre;

    @Column(nullable = false)
    private String surname;

    @Column(nullable = false)
    private String firstNames;

    private String homeAddress;
    private String emailAddress;
    private String telephone;

    @Column(nullable = false)
    private String cell;

    private String baptismPlace;
    private LocalDate baptismDate;
    private LocalDate confirmationDate;
    private LocalDate marriageDate;
    private String parishPriestName;
    private LocalDate dateOfIssue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status = MemberStatus.ACTIVE;

    @ManyToMany
    @JoinTable(name = "member_ministries",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "ministry_id"))
    private Set<Ministry> ministries = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "member_guilds",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "guild_id"))
    private Set<Guild> guilds = new HashSet<>();
}
