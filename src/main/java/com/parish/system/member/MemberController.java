package com.parish.system.member;

import com.parish.system.common.ApiResponse;
import com.parish.system.member.dto.ContributionSummaryResponse;
import com.parish.system.member.dto.MemberRequest;
import com.parish.system.member.dto.MemberResponse;
import com.parish.system.member.dto.StatementResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<MemberResponse> create(@Valid @RequestBody MemberRequest request) {
        return ApiResponse.ok("Member created successfully", memberService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN','ZONE_LEADER')")
    public ApiResponse<List<MemberResponse>> all() {
        return ApiResponse.ok("Members fetched", memberService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<MemberResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok("Member fetched", memberService.findById(id));
    }

    @GetMapping("/by-membership-no/{membershipNo}")
    public ApiResponse<MemberResponse> byMembershipNo(@PathVariable String membershipNo) {
        return ApiResponse.ok("Member fetched", memberService.findByMembershipNo(membershipNo));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<MemberResponse> update(@PathVariable Long id, @Valid @RequestBody MemberRequest request) {
        return ApiResponse.ok("Member updated successfully", memberService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        memberService.delete(id);
        return ApiResponse.ok("Member deleted successfully");
    }

    @GetMapping("/search")
    public ApiResponse<List<MemberResponse>> search(@RequestParam(defaultValue = "") String keyword) {
        return ApiResponse.ok("Members fetched", memberService.search(keyword));
    }

    @GetMapping("/by-zone/{zoneId}")
    public ApiResponse<List<MemberResponse>> byZone(@PathVariable Long zoneId) {
        return ApiResponse.ok("Members fetched", memberService.byZone(zoneId));
    }

    @PostMapping("/{memberId}/ministries/{ministryId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> addMinistry(@PathVariable Long memberId, @PathVariable Long ministryId) {
        memberService.addMinistry(memberId, ministryId);
        return ApiResponse.ok("Ministry assigned");
    }

    @DeleteMapping("/{memberId}/ministries/{ministryId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> removeMinistry(@PathVariable Long memberId, @PathVariable Long ministryId) {
        memberService.removeMinistry(memberId, ministryId);
        return ApiResponse.ok("Ministry removed");
    }

    @PostMapping("/{memberId}/guilds/{guildId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> addGuild(@PathVariable Long memberId, @PathVariable Long guildId) {
        memberService.addGuild(memberId, guildId);
        return ApiResponse.ok("Guild assigned");
    }

    @DeleteMapping("/{memberId}/guilds/{guildId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> removeGuild(@PathVariable Long memberId, @PathVariable Long guildId) {
        memberService.removeGuild(memberId, guildId);
        return ApiResponse.ok("Guild removed");
    }

    @GetMapping("/{memberId}/statement")
    public ApiResponse<StatementResponse> statement(@PathVariable Long memberId,
                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ApiResponse.ok("Statement fetched", memberService.statement(memberId, fromDate, toDate));
    }

    @GetMapping("/{memberId}/contributions/{year}")
    public ApiResponse<ContributionSummaryResponse> contributions(@PathVariable Long memberId, @PathVariable int year) {
        return ApiResponse.ok("Contribution summary fetched", memberService.contributionSummary(memberId, year));
    }
}
