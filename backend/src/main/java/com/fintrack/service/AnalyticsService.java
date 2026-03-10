package com.fintrack.service;

import com.fintrack.dto.response.*;
import com.fintrack.entity.Account;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.AccountRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public AnalyticsSummaryResponse getSummary(LocalDate startDate, LocalDate endDate) {
        User user = getCurrentUser();
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        BigDecimal totalIncome = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.INCOME, start, end);
        BigDecimal totalExpense = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.EXPENSE, start, end);

        List<Account> accounts = accountRepository.findByUserOrderByCreatedAtDesc(user);
        List<AnalyticsSummaryResponse.AccountBalance> accountBalances = accounts.stream()
                .map(acc -> {
                    BigDecimal income = transactionRepository.sumByAccountAndTypeAndDateBetween(
                            acc, Transaction.TransactionType.INCOME, start, end);
                    BigDecimal expense = transactionRepository.sumByAccountAndTypeAndDateBetween(
                            acc, Transaction.TransactionType.EXPENSE, start, end);
                    return new AnalyticsSummaryResponse.AccountBalance(
                            acc.getId().toString(), acc.getName(), acc.getCurrency(),
                            acc.getBalance(), income, expense);
                })
                .collect(Collectors.toList());

        return new AnalyticsSummaryResponse(
                totalIncome,
                totalExpense,
                totalIncome.subtract(totalExpense),
                accountBalances
        );
    }

    public List<CategorySummaryResponse> getByCategory(Transaction.TransactionType type,
                                                         LocalDate startDate, LocalDate endDate) {
        User user = getCurrentUser();
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Object[]> results = transactionRepository.sumByCategory(user, type, start, end);

        BigDecimal total = results.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return results.stream()
                .map(row -> {
                    BigDecimal amount = (BigDecimal) row[1];
                    double percentage = total.compareTo(BigDecimal.ZERO) != 0
                            ? amount.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                            : 0.0;
                    return new CategorySummaryResponse(
                            row[0] != null ? (String) row[0] : "Uncategorized",
                            amount,
                            percentage
                    );
                })
                .collect(Collectors.toList());
    }

    public TimeSeriesResponse getTimeSeries(String groupBy, LocalDate startDate, LocalDate endDate) {
        User user = getCurrentUser();
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Object[]> dailyData = transactionRepository.getDailyTimeSeries(user, start, end);

        List<TimeSeriesResponse.DataPoint> dataPoints = dailyData.stream()
                .map(row -> {
                    LocalDate date = (LocalDate) row[0];
                    BigDecimal income = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
                    BigDecimal expense = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
                    return new TimeSeriesResponse.DataPoint(
                            date.toString(), income, expense, income.subtract(expense)
                    );
                })
                .collect(Collectors.toList());

        return new TimeSeriesResponse(dataPoints);
    }

    public CalendarResponse getCalendar(Integer year, Integer month) {
        User user = getCurrentUser();
        int y = year != null ? year : LocalDate.now().getYear();
        int m = month != null ? month : LocalDate.now().getMonthValue();

        YearMonth ym = YearMonth.of(y, m);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Object[]> dailyData = transactionRepository.getDailyTimeSeries(user, start, end);

        List<CalendarResponse.DayData> days = dailyData.stream()
                .map(row -> {
                    LocalDate date = (LocalDate) row[0];
                    BigDecimal income = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
                    BigDecimal expense = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
                    return new CalendarResponse.DayData(
                            date.toString(), income, expense, income.subtract(expense)
                    );
                })
                .collect(Collectors.toList());

        return new CalendarResponse(days);
    }
}
