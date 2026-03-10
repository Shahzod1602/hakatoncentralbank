package com.fintrack.service;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AiService {
    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;

    private static final Map<String, List<String>> CATEGORY_KEYWORDS = new LinkedHashMap<>() {{
        put("Food & Dining", List.of("food","restaurant","cafe","coffee","lunch","dinner","breakfast","pizza","burger","sushi","eat","meal","grocery","supermarket","market","bar","drink","snack","bread","milk","fruit"));
        put("Transport", List.of("uber","taxi","bus","metro","train","fuel","gas","petrol","parking","transport","car","auto","lyft","fare","ticket","ride"));
        put("Shopping", List.of("shop","store","amazon","mall","clothes","shoes","fashion","zara","h&m","buy","purchase","order","online","delivery"));
        put("Entertainment", List.of("netflix","spotify","cinema","movie","game","concert","theater","music","youtube","hulu","disney","subscription","sport","gym","fitness"));
        put("Health", List.of("hospital","clinic","doctor","medicine","pharmacy","health","medical","dentist","drug","vitamin","insurance"));
        put("Education", List.of("course","school","university","book","study","learn","tuition","edu","training","seminar","workshop"));
        put("Bills & Utilities", List.of("electricity","water","internet","phone","bill","utility","rent","gas","mobile","wifi","broadband","subscription","service","pay"));
        put("Travel", List.of("hotel","flight","airbnb","travel","trip","vacation","booking","tour","airline","passport","visa"));
        put("Salary", List.of("salary","wage","payroll","income","payment","bonus","commission"));
        put("Transfer", List.of("transfer","send","receive","wire","remittance"));
        put("Other", List.of());
    }};

    public Map<String, Object> categorize(String description) {
        if (description == null || description.isBlank()) {
            return Map.of("category", "Other", "confidence", 0.5);
        }
        String lower = description.toLowerCase();
        for (Map.Entry<String, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            for (String kw : entry.getValue()) {
                if (lower.contains(kw)) {
                    return Map.of("category", entry.getKey(), "confidence", 0.85, "keyword", kw);
                }
            }
        }
        return Map.of("category", "Other", "confidence", 0.5);
    }

    public List<Map<String, Object>> getInsights() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email).orElseThrow();
        List<Map<String, Object>> insights = new ArrayList<>();

        LocalDate now = LocalDate.now();
        LocalDate thisMonthStart = now.withDayOfMonth(1);
        LocalDate lastMonthStart = thisMonthStart.minusMonths(1);
        LocalDate lastMonthEnd = thisMonthStart.minusDays(1);

        List<Transaction> thisMonth = transactionRepo.findByUserAndDateBetweenAndType(user, thisMonthStart, now, Transaction.TransactionType.EXPENSE);
        List<Transaction> lastMonth = transactionRepo.findByUserAndDateBetweenAndType(user, lastMonthStart, lastMonthEnd, Transaction.TransactionType.EXPENSE);

        Map<String, BigDecimal> thisMonthByCategory = groupByCategory(thisMonth);
        Map<String, BigDecimal> lastMonthByCategory = groupByCategory(lastMonth);

        for (Map.Entry<String, BigDecimal> entry : thisMonthByCategory.entrySet()) {
            String cat = entry.getKey();
            BigDecimal thisAmt = entry.getValue();
            BigDecimal lastAmt = lastMonthByCategory.getOrDefault(cat, BigDecimal.ZERO);
            if (lastAmt.compareTo(BigDecimal.ZERO) > 0) {
                double changePercent = thisAmt.subtract(lastAmt).divide(lastAmt, 4, RoundingMode.HALF_UP).doubleValue() * 100;
                if (changePercent > 30) {
                    insights.add(Map.of(
                        "type", "WARNING",
                        "icon", "⚠️",
                        "title", cat + " xarajati oshdi",
                        "message", String.format("Bu oy %s kategoriyasida %.0f%% ko'proq sarfladingiz ($%.0f vs $%.0f o'tgan oy)", cat, changePercent, thisAmt.doubleValue(), lastAmt.doubleValue()),
                        "category", cat
                    ));
                }
            }
        }

        BigDecimal totalIncome = transactionRepo.findByUserAndDateBetweenAndType(user, thisMonthStart, now, Transaction.TransactionType.INCOME)
                .stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = thisMonth.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            double savingsRate = 1 - totalExpense.divide(totalIncome, 4, RoundingMode.HALF_UP).doubleValue();
            if (savingsRate > 0.3) {
                insights.add(Map.of("type", "SUCCESS", "icon", "✅", "title", "Ajoyib jamg'arish!", "message", String.format("Bu oy daromadingizning %.0f%% ini tejadingiz. Zo'r natija!", savingsRate * 100)));
            } else if (savingsRate < 0.05 && totalExpense.compareTo(BigDecimal.ZERO) > 0) {
                insights.add(Map.of("type", "WARNING", "icon", "⚠️", "title", "Xarajat ko'p", "message", "Bu oy daromadingizning deyarli hammasini sarfladingiz. Tejashga harakat qiling."));
            }
        }

        int txCount = thisMonth.size();
        if (txCount > 50) {
            insights.add(Map.of("type", "INFO", "icon", "ℹ️", "title", "Ko'p tranzaksiya", "message", String.format("Bu oy %d ta xarajat qildiniz. Kichik xarajatlarni birlashtiring.", txCount)));
        }

        if (insights.isEmpty()) {
            insights.add(Map.of("type", "INFO", "icon", "📊", "title", "Moliyaviy holat normal", "message", "Bu oyda hech qanday g'ayrioddiy xarajat aniqlanmadi. Davom eting!"));
        }
        return insights;
    }

    public Map<String, Object> getHealthScore() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email).orElseThrow();
        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);

        List<Transaction> incomes = transactionRepo.findByUserAndDateBetweenAndType(user, start, now, Transaction.TransactionType.INCOME);
        List<Transaction> expenses = transactionRepo.findByUserAndDateBetweenAndType(user, start, now, Transaction.TransactionType.EXPENSE);

        BigDecimal totalIncome = incomes.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = expenses.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        int score = 50;
        List<String> tips = new ArrayList<>();

        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            double ratio = totalExpense.divide(totalIncome, 4, RoundingMode.HALF_UP).doubleValue();
            if (ratio < 0.5) { score += 30; tips.add("Daromadingizning 50% dan kamini sarfladingiz — ajoyib!"); }
            else if (ratio < 0.7) { score += 20; tips.add("Daromadingizning 70% ini sarfladingiz — yaxshi."); }
            else if (ratio < 0.9) { score += 10; tips.add("Xarajatni kamaytiring, tejash uchun intiling."); }
            else { tips.add("Xarajat daromaddan oshmoqda — diqqat qiling!"); }
        }
        if (incomes.size() > 1) { score += 10; tips.add("Bir nechta daromad manbaingiz bor — yaxshi diversifikatsiya."); }
        if (expenses.size() > 0 && expenses.size() < 30) { score += 10; tips.add("Xarajatlaringizni nazorat ostida tutmoqdasiz."); }

        score = Math.min(100, Math.max(0, score));
        String grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";
        String status = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";

        return Map.of("score", score, "grade", grade, "status", status, "tips", tips, "totalIncome", totalIncome, "totalExpense", totalExpense);
    }

    private Map<String, BigDecimal> groupByCategory(List<Transaction> txs) {
        return txs.stream().collect(Collectors.groupingBy(
            t -> t.getCategory() != null ? t.getCategory() : "Other",
            Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
        ));
    }
}
