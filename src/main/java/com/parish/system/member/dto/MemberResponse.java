package com.parish.system.member.dto;

import com.parish.system.member.MemberStatus;
import java.time.LocalDate;
import java.util.Set;

public record MemberResponse(
        Long id,
        String membershipNo,
        Long zoneId,
        String zone,
        Long sectionId,
        String section,
        Long massCentreId,
        String massCentre,
        String surname,
        String firstNames,
        String homeAddress,
        String emailAddress,
        String telephone,
        String cell,
        String baptismPlace,
        LocalDate baptismDate,
        LocalDate confirmationDate,
        LocalDate marriageDate,
        Set<String> ministries,
        Set<String> guilds,
        String parishPriestName,
        LocalDate dateOfIssue,
        MemberStatus status
) {
}
