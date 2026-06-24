package com.parish.system.dashboard;

import com.parish.system.billing.MemberBillRepository;
import com.parish.system.billing.Month;
import com.parish.system.common.ApiResponse;
import com.parish.system.member.MemberRepository;
import com.parish.system.member.MemberStatus;
import com.parish.system.payment.PaymentRepository;
import com.parish.system.zone.ZoneRepository;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final MemberRepository memberRepository;
    private final MemberBillRepository memberBillRepository;
    private final PaymentRepository paymentRepository;
    private final ZoneRepository zoneRepository;

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> summary() {
        LocalDate today = LocalDate.now();
        Month month = Month.values()[today.getMonthValue() - 1];
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalMembers", memberRepository.count());
        data.put("activeMembers", memberRepository.countByStatus(MemberStatus.ACTIVE));
        data.put("inactiveMembers", memberRepository.countByStatus(MemberStatus.INACTIVE));
        data.put("totalBilledThisMonth", memberBillRepository.sumBilledForPeriod(today.getYear(), month));
        data.put("totalCollectedThisMonth", paymentRepository.sumByYearAndMonth(today.getYear(), today.getMonthValue()));
        data.put("outstandingBalance", memberBillRepository.sumOutstanding());
        data.put("collectionsToday", paymentRepository.sumByPaymentDate(today));
        data.put("membersByZone", zoneRepository.findAll().stream()
                .collect(LinkedHashMap::new,
                        (map, zone) -> map.put(zone.getName(), memberRepository.findByZoneId(zone.getId()).size()),
                        Map::putAll));
        data.put("collectionsByPaymentMethod", paymentRepository.paymentMethodSummary(today.withDayOfMonth(1), today).stream()
                .collect(LinkedHashMap::new, (map, row) -> map.put(row[0].toString(), row[1]), Map::putAll));
        return ApiResponse.ok("Dashboard summary fetched", data);
    }
}
