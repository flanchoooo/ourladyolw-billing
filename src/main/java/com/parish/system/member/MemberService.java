package com.parish.system.member;

import com.parish.system.member.dto.ContributionSummaryResponse;
import com.parish.system.member.dto.MemberRequest;
import com.parish.system.member.dto.MemberResponse;
import com.parish.system.member.dto.StatementResponse;
import java.time.LocalDate;
import java.util.List;

public interface MemberService {
    MemberResponse create(MemberRequest request);
    List<MemberResponse> findAll();
    MemberResponse findById(Long id);
    MemberResponse findByMembershipNo(String membershipNo);
    MemberResponse update(Long id, MemberRequest request);
    void delete(Long id);
    List<MemberResponse> search(String keyword);
    List<MemberResponse> byZone(Long zoneId);
    void addMinistry(Long memberId, Long ministryId);
    void removeMinistry(Long memberId, Long ministryId);
    void addGuild(Long memberId, Long guildId);
    void removeGuild(Long memberId, Long guildId);
    StatementResponse statement(Long memberId, LocalDate fromDate, LocalDate toDate);
    ContributionSummaryResponse contributionSummary(Long memberId, int year);
}
