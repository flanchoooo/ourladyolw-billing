package com.parish.system.member;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberRepository extends JpaRepository<Member, Long> {
    @Override
    @EntityGraph(attributePaths = {"zone", "section", "massCentre"})
    List<Member> findAll();

    @Override
    @EntityGraph(attributePaths = {"zone", "section", "massCentre"})
    Optional<Member> findById(Long id);

    @EntityGraph(attributePaths = {"zone", "section", "massCentre"})
    Optional<Member> findByMembershipNo(String membershipNo);

    boolean existsByMembershipNo(String membershipNo);
    List<Member> findByStatus(MemberStatus status);

    @EntityGraph(attributePaths = {"zone", "section", "massCentre"})
    List<Member> findByZoneId(Long zoneId);

    long countByStatus(MemberStatus status);

    @EntityGraph(attributePaths = {"zone", "section", "massCentre"})
    @Query("""
            select m from Member m
            where lower(m.membershipNo) like lower(concat('%', :keyword, '%'))
               or lower(m.surname) like lower(concat('%', :keyword, '%'))
               or lower(m.firstNames) like lower(concat('%', :keyword, '%'))
               or lower(m.cell) like lower(concat('%', :keyword, '%'))
            """)
    List<Member> search(@Param("keyword") String keyword);
}
