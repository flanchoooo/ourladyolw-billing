package com.parish.system.member;

import com.parish.system.billing.MemberBill;
import com.parish.system.billing.MemberBillRepository;
import com.parish.system.billing.Month;
import com.parish.system.billing.dto.MemberBillResponse;
import com.parish.system.exception.BadRequestException;
import com.parish.system.exception.NotFoundException;
import com.parish.system.guild.GuildRepository;
import com.parish.system.masscentre.MassCentreRepository;
import com.parish.system.member.dto.ContributionSummaryResponse;
import com.parish.system.member.dto.MemberRequest;
import com.parish.system.member.dto.MemberResponse;
import com.parish.system.member.dto.StatementResponse;
import com.parish.system.ministry.MinistryRepository;
import com.parish.system.payment.Payment;
import com.parish.system.payment.PaymentRepository;
import com.parish.system.payment.PaymentService;
import com.parish.system.payment.dto.PaymentResponse;
import com.parish.system.section.SectionRepository;
import com.parish.system.zone.ZoneRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {
    private final MemberRepository memberRepository;
    private final ZoneRepository zoneRepository;
    private final SectionRepository sectionRepository;
    private final MassCentreRepository massCentreRepository;
    private final MinistryRepository ministryRepository;
    private final GuildRepository guildRepository;
    private final MemberBillRepository memberBillRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @Override
    @Transactional
    public MemberResponse create(MemberRequest request) {
        Member member = new Member();
        apply(member, request);
        if (!StringUtils.hasText(member.getMembershipNo())) {
            member.setMembershipNo(nextMembershipNo());
        }
        if (memberRepository.existsByMembershipNo(member.getMembershipNo())) {
            throw new BadRequestException("Membership number already exists");
        }
        return MemberMapper.toResponse(memberRepository.save(member));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberResponse> findAll() {
        return memberRepository.findAll().stream().map(MemberMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponse findById(Long id) {
        return MemberMapper.toResponse(findMember(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponse findByMembershipNo(String membershipNo) {
        return MemberMapper.toResponse(memberRepository.findByMembershipNo(membershipNo)
                .orElseThrow(() -> new NotFoundException("Member not found")));
    }

    @Override
    @Transactional
    public MemberResponse update(Long id, MemberRequest request) {
        Member member = findMember(id);
        apply(member, request);
        return MemberMapper.toResponse(memberRepository.save(member));
    }

    @Override
    public void delete(Long id) {
        memberRepository.delete(findMember(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberResponse> search(String keyword) {
        return memberRepository.search(keyword == null ? "" : keyword).stream().map(MemberMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberResponse> byZone(Long zoneId) {
        return memberRepository.findByZoneId(zoneId).stream().map(MemberMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public void addMinistry(Long memberId, Long ministryId) {
        Member member = findMember(memberId);
        member.getMinistries().add(ministryRepository.findById(ministryId).orElseThrow(() -> new NotFoundException("Ministry not found")));
    }

    @Override
    @Transactional
    public void removeMinistry(Long memberId, Long ministryId) {
        Member member = findMember(memberId);
        member.getMinistries().removeIf(ministry -> ministry.getId().equals(ministryId));
    }

    @Override
    @Transactional
    public void addGuild(Long memberId, Long guildId) {
        Member member = findMember(memberId);
        member.getGuilds().add(guildRepository.findById(guildId).orElseThrow(() -> new NotFoundException("Guild not found")));
    }

    @Override
    @Transactional
    public void removeGuild(Long memberId, Long guildId) {
        Member member = findMember(memberId);
        member.getGuilds().removeIf(guild -> guild.getId().equals(guildId));
    }

    @Override
    @Transactional(readOnly = true)
    public StatementResponse statement(Long memberId, LocalDate fromDate, LocalDate toDate) {
        Member member = findMember(memberId);
        List<MemberBillResponse> bills = memberBillRepository.findByMemberId(memberId).stream()
                .map(this::toBillResponse)
                .toList();
        List<PaymentResponse> payments = paymentRepository.findByMemberId(memberId).stream()
                .filter(payment -> inRange(payment.getPaymentDate(), fromDate, toDate))
                .map(paymentService::toResponse)
                .toList();
        BigDecimal currentBalance = memberBillRepository.findByMemberId(memberId).stream()
                .map(MemberBill::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new StatementResponse(MemberMapper.toResponse(member), BigDecimal.ZERO, bills, payments, currentBalance);
    }

    @Override
    @Transactional(readOnly = true)
    public ContributionSummaryResponse contributionSummary(Long memberId, int year) {
        List<MemberBill> bills = memberBillRepository.findByMemberId(memberId).stream()
                .filter(bill -> bill.getYear() == year)
                .toList();
        List<Payment> payments = paymentRepository.findByMemberId(memberId);
        List<ContributionSummaryResponse.MonthContribution> months = Arrays.stream(Month.values())
                .map(month -> {
                    List<MemberBill> monthBills = bills.stream().filter(bill -> bill.getMonth() == month).toList();
                    BigDecimal billed = monthBills.stream().map(MemberBill::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal paid = monthBills.stream().map(MemberBill::getAmountPaid).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal balance = monthBills.stream().map(MemberBill::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
                    String receipt = payments.stream()
                            .flatMap(payment -> payment.getAllocations().stream().map(allocation -> payment.getReceiptNo()))
                            .findFirst().orElse(null);
                    return new ContributionSummaryResponse.MonthContribution(month, billed, paid, balance,
                            monthBills.isEmpty() ? null : monthBills.get(0).getStatus(), receipt);
                })
                .collect(Collectors.toList());
        return new ContributionSummaryResponse(memberId, year, months);
    }

    private void apply(Member member, MemberRequest request) {
        member.setMembershipNo(StringUtils.hasText(request.membershipNo()) ? request.membershipNo() : member.getMembershipNo());
        member.setZone(zoneRepository.findById(request.zoneId()).orElseThrow(() -> new NotFoundException("Zone not found")));
        member.setSection(request.sectionId() == null ? null : sectionRepository.findById(request.sectionId()).orElseThrow(() -> new NotFoundException("Section not found")));
        member.setMassCentre(request.massCentreId() == null ? null : massCentreRepository.findById(request.massCentreId()).orElseThrow(() -> new NotFoundException("Mass centre not found")));
        member.setSurname(request.surname());
        member.setFirstNames(request.firstNames());
        member.setHomeAddress(request.homeAddress());
        member.setEmailAddress(request.emailAddress());
        member.setTelephone(request.telephone());
        member.setCell(request.cell());
        member.setBaptismPlace(request.baptismPlace());
        member.setBaptismDate(request.baptismDate());
        member.setConfirmationDate(request.confirmationDate());
        member.setMarriageDate(request.marriageDate());
        member.setParishPriestName(request.parishPriestName());
        member.setDateOfIssue(request.dateOfIssue());
        member.setStatus(request.status() == null ? MemberStatus.ACTIVE : request.status());
    }

    private Member findMember(Long id) {
        return memberRepository.findById(id).orElseThrow(() -> new NotFoundException("Member not found"));
    }

    private String nextMembershipNo() {
        return "PAR-" + LocalDate.now().getYear() + "-" + String.format("%06d", memberRepository.count() + 1);
    }

    private boolean inRange(LocalDate date, LocalDate from, LocalDate to) {
        return (from == null || !date.isBefore(from)) && (to == null || !date.isAfter(to));
    }

    private MemberBillResponse toBillResponse(MemberBill bill) {
        return new MemberBillResponse(bill.getId(), bill.getMember().getId(),
                bill.getMember().getFirstNames() + " " + bill.getMember().getSurname(),
                bill.getBillingItem().getId(), bill.getBillingItem().getName(), bill.getAmount(), bill.getCurrency(),
                bill.getYear(), bill.getMonth(), bill.getDueDate(), bill.getStatus(), bill.getAmountPaid(), bill.getBalance());
    }
}
