package com.parish.system.member.dto;

import com.parish.system.member.MemberStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record MemberRequest(
        String membershipNo,
        @NotNull Long zoneId,
        Long sectionId,
        Long massCentreId,
        @NotBlank String surname,
        @NotBlank String firstNames,
        String homeAddress,
        @Email String emailAddress,
        String telephone,
        @NotBlank String cell,
        String baptismPlace,
        LocalDate baptismDate,
        LocalDate confirmationDate,
        LocalDate marriageDate,
        String parishPriestName,
        LocalDate dateOfIssue,
        MemberStatus status
) {
}
