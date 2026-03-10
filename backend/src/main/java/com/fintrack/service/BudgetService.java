package com.fintrack.service;

import com.fintrack.dto.request.BudgetRequest;
import com.fintrack.dto.response.BudgetResponse;
import com.fintrack.entity.Budget;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<BudgetResponse> getBudgets(Integer year, Integer month) {
        User user = getCurrentUser();
        List<Budget> budgets = budgetRepository.findWithFilters(user, year, month);
        return budgets.stream()
                .map(b -> toResponse(b, user))
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request) {
        User user = getCurrentUser();
        Budget budget = new Budget();
        budget.setUser(user);
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());
        budget.setCategory(request.getCategory());
        budget.setType(request.getType());
        budget.setPlannedAmount(request.getPlannedAmount());
        return toResponse(budgetRepository.save(budget), user);
    }

    @Transactional
    public BudgetResponse updateBudget(UUID id, BudgetRequest request) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());
        budget.setCategory(request.getCategory());
        budget.setType(request.getType());
        budget.setPlannedAmount(request.getPlannedAmount());
        return toResponse(budgetRepository.save(budget), user);
    }

    @Transactional
    public void deleteBudget(UUID id) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private BudgetResponse toResponse(Budget budget, User user) {
        YearMonth ym = YearMonth.of(budget.getYear(), budget.getMonth());
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        Transaction.TransactionType txType = budget.getType() == Budget.BudgetType.INCOME
                ? Transaction.TransactionType.INCOME
                : Transaction.TransactionType.EXPENSE;

        // Get actual spending for this category and month
        List<Object[]> categoryData = transactionRepository.sumByCategory(user, txType, startDate, endDate);
        BigDecimal actual = categoryData.stream()
                .filter(row -> budget.getCategory().equals(row[0]))
                .map(row -> (BigDecimal) row[1])
                .findFirst()
                .orElse(BigDecimal.ZERO);

        return new BudgetResponse(
                budget.getId(),
                budget.getYear(),
                budget.getMonth(),
                budget.getCategory(),
                budget.getType(),
                budget.getPlannedAmount(),
                actual,
                budget.getCreatedAt()
        );
    }
}
