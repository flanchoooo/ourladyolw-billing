package com.parish.system.billing;

import com.parish.system.billing.dto.BillingItemRequest;
import com.parish.system.billing.dto.BillingItemResponse;
import com.parish.system.billing.dto.BillingRunRequest;
import com.parish.system.billing.dto.MemberBillResponse;
import com.parish.system.exception.BadRequestException;
import com.parish.system.exception.NotFoundException;
import com.parish.system.guild.Guild;
import com.parish.system.guild.GuildRepository;
import com.parish.system.member.Member;
import com.parish.system.member.MemberRepository;
import com.parish.system.member.MemberStatus;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {
    private final BillingItemRepository billingItemRepository;
    private final MemberBillRepository memberBillRepository;
    private final MemberRepository memberRepository;
    private final GuildRepository guildRepository;

    @Override
    @Transactional
    public BillingItemResponse createItem(BillingItemRequest request) {
        BillingItem item = new BillingItem();
        apply(item, request);
        return toItemResponse(billingItemRepository.save(item));
    }

    @Override
    public List<BillingItemResponse> items() {
        return billingItemRepository.findAll().stream().map(this::toItemResponse).toList();
    }

    @Override
    public BillingItemResponse item(Long id) {
        return toItemResponse(findItem(id));
    }

    @Override
    @Transactional
    public BillingItemResponse updateItem(Long id, BillingItemRequest request) {
        BillingItem item = findItem(id);
        apply(item, request);
        return toItemResponse(item);
    }

    @Override
    public void deleteItem(Long id) {
        billingItemRepository.delete(findItem(id));
    }

    @Override
    @Transactional
    public List<MemberBillResponse> run(BillingRunRequest request) {
        BillingItem item = findItem(request.billingItemId());
        List<Member> members = switch (item.getAppliesTo()) {
            case ALL_MEMBERS -> memberRepository.findByStatus(MemberStatus.ACTIVE);
            case ZONE -> {
                if (request.zoneId() == null) {
                    throw new BadRequestException("zoneId is required for zone billing");
                }
                yield memberRepository.findByZoneId(request.zoneId()).stream()
                        .filter(member -> member.getStatus() == MemberStatus.ACTIVE)
                        .toList();
            }
            case GUILD -> {
                if (request.guildId() == null) {
                    throw new BadRequestException("guildId is required for guild billing");
                }
                Guild guild = guildRepository.findById(request.guildId()).orElseThrow(() -> new NotFoundException("Guild not found"));
                yield memberRepository.findByStatus(MemberStatus.ACTIVE).stream()
                        .filter(member -> member.getGuilds().contains(guild))
                        .toList();
            }
            case INDIVIDUAL -> {
                if (request.memberId() == null) {
                    throw new BadRequestException("memberId is required for individual billing");
                }
                Member member = memberRepository.findById(request.memberId()).orElseThrow(() -> new NotFoundException("Member not found"));
                yield member.getStatus() == MemberStatus.ACTIVE ? List.of(member) : List.of();
            }
        };
        return members.stream()
                .filter(member -> !memberBillRepository.existsByMemberIdAndBillingItemIdAndYearAndMonth(
                        member.getId(), item.getId(), request.year(), request.month()))
                .map(member -> createBill(member, item, request.year(), request.month()))
                .map(this::toBillResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberBillResponse> bills() {
        return memberBillRepository.findAll().stream().map(this::toBillResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberBillResponse> memberBills(Long memberId) {
        return memberBillRepository.findByMemberId(memberId).stream().map(this::toBillResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberBillResponse> outstanding() {
        return memberBillRepository.findByStatusIn(List.of(MemberBillStatus.PENDING, MemberBillStatus.PARTIALLY_PAID))
                .stream().map(this::toBillResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberBillResponse> byPeriod(int year, Month month) {
        return memberBillRepository.findByYearAndMonth(year, month).stream().map(this::toBillResponse).toList();
    }

    private MemberBill createBill(Member member, BillingItem item, int year, Month month) {
        MemberBill bill = new MemberBill();
        bill.setMember(member);
        bill.setBillingItem(item);
        bill.setAmount(item.getAmount());
        bill.setCurrency(item.getCurrency());
        bill.setYear(year);
        bill.setMonth(month);
        bill.setDueDate(LocalDate.of(year, month.ordinal() + 1, 1).plusMonths(1).minusDays(1));
        bill.setBalance(item.getAmount());
        return memberBillRepository.save(bill);
    }

    private void apply(BillingItem item, BillingItemRequest request) {
        item.setName(request.name());
        item.setDescription(request.description());
        item.setAmount(request.amount());
        item.setCurrency(request.currency());
        item.setFrequency(request.frequency());
        item.setAppliesTo(request.appliesTo());
        item.setYear(request.year());
        item.setMonth(request.month());
        item.setStatus(request.status() == null ? BillingItemStatus.ACTIVE : request.status());
    }

    private BillingItem findItem(Long id) {
        return billingItemRepository.findById(id).orElseThrow(() -> new NotFoundException("Billing item not found"));
    }

    private BillingItemResponse toItemResponse(BillingItem item) {
        return new BillingItemResponse(item.getId(), item.getName(), item.getDescription(), item.getAmount(),
                item.getCurrency(), item.getFrequency(), item.getAppliesTo(), item.getYear(), item.getMonth(), item.getStatus());
    }

    public MemberBillResponse toBillResponse(MemberBill bill) {
        return new MemberBillResponse(bill.getId(), bill.getMember().getId(),
                bill.getMember().getFirstNames() + " " + bill.getMember().getSurname(),
                bill.getBillingItem().getId(), bill.getBillingItem().getName(), bill.getAmount(), bill.getCurrency(),
                bill.getYear(), bill.getMonth(), bill.getDueDate(), bill.getStatus(), bill.getAmountPaid(), bill.getBalance());
    }
}
