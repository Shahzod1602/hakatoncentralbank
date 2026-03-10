package com.fintrack.controller;

import com.fintrack.dto.response.AnalyticsSummaryResponse;
import com.fintrack.dto.response.CalendarResponse;
import com.fintrack.dto.response.CategorySummaryResponse;
import com.fintrack.dto.response.TimeSeriesResponse;
import com.fintrack.entity.Transaction;
import com.fintrack.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getSummary(startDate, endDate));
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<CategorySummaryResponse>> getByCategory(
            @RequestParam(required = false) Transaction.TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Transaction.TransactionType txType = type != null ? type : Transaction.TransactionType.EXPENSE;
        return ResponseEntity.ok(analyticsService.getByCategory(txType, startDate, endDate));
    }

    @GetMapping("/time-series")
    public ResponseEntity<TimeSeriesResponse> getTimeSeries(
            @RequestParam(required = false, defaultValue = "DAY") String groupBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getTimeSeries(groupBy, startDate, endDate));
    }

    @GetMapping("/calendar")
    public ResponseEntity<CalendarResponse> getCalendar(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(analyticsService.getCalendar(year, month));
    }
}
