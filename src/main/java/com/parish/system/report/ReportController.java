package com.parish.system.report;

import com.parish.system.billing.MemberBillRepository;
import com.parish.system.common.ApiResponse;
import com.parish.system.member.MemberRepository;
import com.parish.system.payment.PaymentRepository;
import com.parish.system.zone.ZoneRepository;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final MemberRepository memberRepository;
    private final ZoneRepository zoneRepository;
    private final PaymentRepository paymentRepository;
    private final MemberBillRepository memberBillRepository;

    @GetMapping("/members/by-zone")
    public ApiResponse<List<Map<String, Object>>> membersByZone() {
        List<Map<String, Object>> data = zoneRepository.findAll().stream()
                .map(zone -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("zoneId", zone.getId());
                    row.put("zone", zone.getName());
                    row.put("members", memberRepository.findByZoneId(zone.getId()).size());
                    return row;
                })
                .toList();
        return ApiResponse.ok("Members by zone report fetched", data);
    }

    @GetMapping("/collections/daily")
    public ApiResponse<Map<String, Object>> daily(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok("Daily collections report fetched", Map.of("date", date, "totalCollected", paymentRepository.sumByPaymentDate(date)));
    }

    @GetMapping("/collections/monthly")
    public ApiResponse<Map<String, Object>> monthly(@RequestParam int year, @RequestParam int month) {
        return ApiResponse.ok("Monthly collections report fetched", Map.of("year", year, "month", month,
                "totalCollected", paymentRepository.sumByYearAndMonth(year, month)));
    }

    @GetMapping("/collections/yearly")
    public ApiResponse<Map<String, Object>> yearly(@RequestParam int year) {
        return ApiResponse.ok("Yearly collections report fetched", Map.of("year", year,
                "totalCollected", paymentRepository.sumByYear(year)));
    }

    @GetMapping("/outstanding-balances")
    public ApiResponse<Map<String, Object>> outstanding() {
        return ApiResponse.ok("Outstanding balances report fetched", Map.of("outstandingBalance", memberBillRepository.sumOutstanding(),
                "export", "PDF/Excel export placeholder"));
    }

    @GetMapping("/outstanding-balances/zone/{zoneId}")
    public ApiResponse<Map<String, Object>> outstandingByZone(@PathVariable Long zoneId) {
        return ApiResponse.ok("Zone outstanding balances report fetched", Map.of("zoneId", zoneId,
                "outstandingBalance", memberBillRepository.sumOutstandingByZone(zoneId),
                "export", "PDF/Excel export placeholder"));
    }

    @GetMapping("/cashier-summary")
    public ApiResponse<Map<String, Object>> cashierSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ApiResponse.ok("Cashier summary fetched", Map.of("fromDate", fromDate, "toDate", toDate,
                "note", "Cashier-level grouping can be expanded when payment audit reports are required"));
    }

    @GetMapping("/payment-method-summary")
    public ApiResponse<List<Map<String, Object>>> paymentMethodSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<Map<String, Object>> data = paymentRepository.paymentMethodSummary(fromDate, toDate).stream()
                .map(row -> Map.of("paymentMethod", row[0], "totalCollected", row[1]))
                .toList();
        return ApiResponse.ok("Payment method summary fetched", data);
    }
}
