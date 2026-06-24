package com.parish.system.member;

import com.parish.system.member.dto.MemberResponse;
import java.util.stream.Collectors;

public final class MemberMapper {
    private MemberMapper() {
    }

    public static MemberResponse toResponse(Member member) {
        return new MemberResponse(
                member.getId(),
                member.getMembershipNo(),
                member.getZone().getId(),
                member.getZone().getName(),
                member.getSection() == null ? null : member.getSection().getId(),
                member.getSection() == null ? null : member.getSection().getName(),
                member.getMassCentre() == null ? null : member.getMassCentre().getId(),
                member.getMassCentre() == null ? null : member.getMassCentre().getName(),
                member.getSurname(),
                member.getFirstNames(),
                member.getHomeAddress(),
                member.getEmailAddress(),
                member.getTelephone(),
                member.getCell(),
                member.getBaptismPlace(),
                member.getBaptismDate(),
                member.getConfirmationDate(),
                member.getMarriageDate(),
                member.getMinistries().stream().map(m -> m.getName()).collect(Collectors.toSet()),
                member.getGuilds().stream().map(g -> g.getName()).collect(Collectors.toSet()),
                member.getParishPriestName(),
                member.getDateOfIssue(),
                member.getStatus());
    }
}
