package com.fintrack.controller;

import com.fintrack.entity.*;
import com.fintrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@CrossOrigin
public class DemoController {

    private final UserRepository userRepo;
    private final AccountRepository accountRepo;
    private final TransactionRepository txRepo;
    private final TransferRepository transferRepo;
    private final DebtRepository debtRepo;
    private final BudgetRepository budgetRepo;
    private final SavingsGoalRepository goalRepo;
    private final RecurringTransactionRepository recurringRepo;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> seed() {
        // Create or reuse demo user
        User user = userRepo.findByEmail("demo@fintrack.uz").orElseGet(() -> {
            User u = new User();
            u.setUsername("Demo User");
            u.setEmail("demo@fintrack.uz");
            u.setPasswordHash(passwordEncoder.encode("Demo1234"));
            return userRepo.save(u);
        });

        // Skip if already seeded
        if (accountRepo.findByUser(user).size() > 0) {
            return ResponseEntity.ok(Map.of("email", "demo@fintrack.uz", "password", "Demo1234", "status", "already seeded"));
        }

        // ── Accounts ──
        Account kapital = account(user, "Kapital Bank",   Account.AccountType.CHECKING,    "UZS", new BigDecimal("15500000"), "#6366f1");
        Account click   = account(user, "Click Wallet",   Account.AccountType.SAVINGS,     "UZS", new BigDecimal("8200000"),  "#10b981");
        Account uzcard  = account(user, "Uzcard",         Account.AccountType.CREDIT_CARD, "UZS", new BigDecimal("2000000"),  "#f59e0b");
        Account cash    = account(user, "Naqd pul",       Account.AccountType.CASH,        "UZS", new BigDecimal("500000"),   "#ef4444");
        Account usd     = account(user, "Dollar hisobi",  Account.AccountType.SAVINGS,     "USD", new BigDecimal("850"),      "#8b5cf6");

        // ── Transactions — last 3 months ──
        LocalDate today = LocalDate.now();

        // Month -2
        tx(user, kapital, Transaction.TransactionType.INCOME,  new BigDecimal("12000000"), "Salary",       "Oylik maosh — fevral", today.minusMonths(2).withDayOfMonth(5));
        tx(user, click,   Transaction.TransactionType.INCOME,  new BigDecimal("3500000"),  "Freelance",    "Veb-sayt loyihasi", today.minusMonths(2).withDayOfMonth(10));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("2800000"),  "Housing",      "Ijara haqi — fevral", today.minusMonths(2).withDayOfMonth(1));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("650000"),   "Food & Dining","Korzinka supermarket", today.minusMonths(2).withDayOfMonth(7));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("320000"),   "Transport",    "Yandex Taxi", today.minusMonths(2).withDayOfMonth(9));
        tx(user, click,   Transaction.TransactionType.EXPENSE, new BigDecimal("199000"),   "Entertainment","Netflix obuna", today.minusMonths(2).withDayOfMonth(12));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("450000"),   "Bills & Utilities","Elektr va gaz", today.minusMonths(2).withDayOfMonth(15));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("280000"),   "Food & Dining","Domino's Pizza", today.minusMonths(2).withDayOfMonth(18));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("1200000"),  "Shopping",     "Kiyim-kechak (Zara)", today.minusMonths(2).withDayOfMonth(22));
        tx(user, click,   Transaction.TransactionType.EXPENSE, new BigDecimal("95000"),    "Bills & Utilities","Uzmobile telefon", today.minusMonths(2).withDayOfMonth(25));

        // Month -1
        tx(user, kapital, Transaction.TransactionType.INCOME,  new BigDecimal("12000000"), "Salary",       "Oylik maosh — mart", today.minusMonths(1).withDayOfMonth(5));
        tx(user, usd,     Transaction.TransactionType.INCOME,  new BigDecimal("200"),      "Freelance",    "Upwork to'lovi", today.minusMonths(1).withDayOfMonth(8));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("2800000"),  "Housing",      "Ijara haqi — mart", today.minusMonths(1).withDayOfMonth(1));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("780000"),   "Food & Dining","Korzinka + bozor", today.minusMonths(1).withDayOfMonth(6));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("415000"),   "Transport",    "Yoqilg'i + taksi", today.minusMonths(1).withDayOfMonth(11));
        tx(user, uzcard,  Transaction.TransactionType.EXPENSE, new BigDecimal("2500000"),  "Shopping",     "Samsung telefon qopqog'i va aksessuar", today.minusMonths(1).withDayOfMonth(14));
        tx(user, click,   Transaction.TransactionType.EXPENSE, new BigDecimal("199000"),   "Entertainment","Netflix obuna", today.minusMonths(1).withDayOfMonth(12));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("450000"),   "Bills & Utilities","Elektr, gaz, suv", today.minusMonths(1).withDayOfMonth(16));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("350000"),   "Health",       "Klinika — tekshiruv", today.minusMonths(1).withDayOfMonth(19));
        tx(user, click,   Transaction.TransactionType.EXPENSE, new BigDecimal("120000"),   "Education",    "Udemy kurs", today.minusMonths(1).withDayOfMonth(21));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("95000"),    "Bills & Utilities","Uzmobile telefon", today.minusMonths(1).withDayOfMonth(25));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("680000"),   "Food & Dining","Restoran — oila tug'ilgan kuni", today.minusMonths(1).withDayOfMonth(28));

        // Current month
        tx(user, kapital, Transaction.TransactionType.INCOME,  new BigDecimal("12000000"), "Salary",       "Oylik maosh", today.withDayOfMonth(5));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("2800000"),  "Housing",      "Ijara haqi", today.withDayOfMonth(1));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("420000"),   "Food & Dining","Korzinka", today.withDayOfMonth(3));
        tx(user, click,   Transaction.TransactionType.EXPENSE, new BigDecimal("199000"),   "Entertainment","Netflix", today.withDayOfMonth(4));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("280000"),   "Transport",    "Taxi + avtobus", today.withDayOfMonth(6));
        tx(user, kapital, Transaction.TransactionType.EXPENSE, new BigDecimal("450000"),   "Bills & Utilities","Kommunal xizmatlar", today.withDayOfMonth(8));
        tx(user, uzcard,  Transaction.TransactionType.EXPENSE, new BigDecimal("890000"),   "Shopping",     "Adidas krossovka", today.withDayOfMonth(9));
        tx(user, click,   Transaction.TransactionType.INCOME,  new BigDecimal("1500000"),  "Freelance",    "Logo dizayn", today.withDayOfMonth(10));

        // ── Transfer ──
        Transfer t = new Transfer();
        t.setUser(user);
        t.setFromAccount(kapital);
        t.setToAccount(click);
        t.setAmount(new BigDecimal("1000000"));
        t.setToAmount(new BigDecimal("1000000"));
        t.setExchangeRate(BigDecimal.ONE);
        t.setDescription("Clickga o'tkazma");
        t.setDate(today.minusMonths(1).withDayOfMonth(20));
        kapital.setBalance(kapital.getBalance().subtract(new BigDecimal("1000000")));
        click.setBalance(click.getBalance().add(new BigDecimal("1000000")));
        accountRepo.save(kapital); accountRepo.save(click);
        transferRepo.save(t);

        // ── Debts ──
        debt(user, Debt.DebtType.RECEIVABLE, "Jasur Toshmatov", new BigDecimal("500000"),  "UZS", "Qarz bergan edim", Debt.DebtStatus.OPEN);
        debt(user, Debt.DebtType.RECEIVABLE, "Malika Yusupova", new BigDecimal("200000"),  "UZS", "Lunch uchun", Debt.DebtStatus.OPEN);
        debt(user, Debt.DebtType.DEBT,       "Otam",            new BigDecimal("2000000"), "UZS", "Televizor uchun",  Debt.DebtStatus.OPEN);
        debt(user, Debt.DebtType.DEBT,       "Hamkasb Botir",   new BigDecimal("150000"),  "UZS", "Kafe", Debt.DebtStatus.CLOSED);

        // ── Budgets ──
        int y = today.getYear(), m = today.getMonthValue();
        budget(user, y, m, "Food & Dining",      Budget.BudgetType.EXPENSE, new BigDecimal("1000000"));
        budget(user, y, m, "Transport",           Budget.BudgetType.EXPENSE, new BigDecimal("500000"));
        budget(user, y, m, "Entertainment",       Budget.BudgetType.EXPENSE, new BigDecimal("300000"));
        budget(user, y, m, "Shopping",            Budget.BudgetType.EXPENSE, new BigDecimal("1500000"));
        budget(user, y, m, "Bills & Utilities",   Budget.BudgetType.EXPENSE, new BigDecimal("500000"));
        budget(user, y, m, "Health",              Budget.BudgetType.EXPENSE, new BigDecimal("400000"));
        budget(user, y, m, "Education",           Budget.BudgetType.EXPENSE, new BigDecimal("300000"));
        budget(user, y, m, "Salary",              Budget.BudgetType.INCOME,  new BigDecimal("12000000"));
        budget(user, y, m, "Freelance",           Budget.BudgetType.INCOME,  new BigDecimal("2000000"));

        // ── Savings Goals ──
        goal(user, "Yangi MacBook",    new BigDecimal("8000000"),  new BigDecimal("3200000"), "UZS", today.plusMonths(4),  "#6366f1", "💻");
        goal(user, "Toshkent–Dubai",   new BigDecimal("15000000"), new BigDecimal("5000000"), "UZS", today.plusMonths(6),  "#f59e0b", "✈️");
        goal(user, "Favqulodda fond",  new BigDecimal("20000000"), new BigDecimal("8200000"), "UZS", today.plusMonths(12), "#10b981", "🛡️");
        goal(user, "Yangi avtomobil",  new BigDecimal("60000000"), new BigDecimal("12000000"),"UZS", today.plusYears(2),   "#ef4444", "🚗");

        // ── Recurring Transactions ──
        recurring(user, kapital, RecurringTransaction.TransactionType.EXPENSE, new BigDecimal("2800000"), "Housing",          "Ijara haqi",          RecurringTransaction.Frequency.MONTHLY,  today.plusMonths(1).withDayOfMonth(1));
        recurring(user, click,   RecurringTransaction.TransactionType.EXPENSE, new BigDecimal("199000"),  "Entertainment",    "Netflix obuna",       RecurringTransaction.Frequency.MONTHLY,  today.plusMonths(1).withDayOfMonth(12));
        recurring(user, kapital, RecurringTransaction.TransactionType.EXPENSE, new BigDecimal("95000"),   "Bills & Utilities","Uzmobile telefon",    RecurringTransaction.Frequency.MONTHLY,  today.plusMonths(1).withDayOfMonth(25));
        recurring(user, kapital, RecurringTransaction.TransactionType.INCOME,  new BigDecimal("12000000"),"Salary",           "Oylik maosh",         RecurringTransaction.Frequency.MONTHLY,  today.plusMonths(1).withDayOfMonth(5));
        recurring(user, kapital, RecurringTransaction.TransactionType.EXPENSE, new BigDecimal("450000"),  "Bills & Utilities","Kommunal xizmatlar",  RecurringTransaction.Frequency.MONTHLY,  today.plusMonths(1).withDayOfMonth(16));

        return ResponseEntity.ok(Map.of("email", "demo@fintrack.uz", "password", "Demo1234", "status", "seeded"));
    }

    // ── helpers ──
    private Account account(User user, String name, Account.AccountType type, String currency, BigDecimal balance, String color) {
        Account a = new Account();
        a.setUser(user); a.setName(name); a.setType(type);
        a.setCurrency(currency); a.setBalance(balance); a.setColor(color);
        return accountRepo.save(a);
    }

    private void tx(User user, Account account, Transaction.TransactionType type, BigDecimal amount, String category, String desc, LocalDate date) {
        Transaction t = new Transaction();
        t.setUser(user); t.setAccount(account); t.setType(type);
        t.setAmount(amount); t.setCategory(category); t.setDescription(desc); t.setDate(date);
        txRepo.save(t);
        // NOTE: balances are set from initial values above; no re-adjustment needed for seeded data
    }

    private void debt(User user, Debt.DebtType type, String person, BigDecimal amount, String currency, String desc, Debt.DebtStatus status) {
        Debt d = new Debt();
        d.setUser(user); d.setType(type); d.setPersonName(person);
        d.setAmount(amount); d.setCurrency(currency); d.setDescription(desc); d.setStatus(status);
        debtRepo.save(d);
    }

    private void budget(User user, int year, int month, String category, Budget.BudgetType type, BigDecimal amount) {
        Budget b = new Budget();
        b.setUser(user); b.setYear(year); b.setMonth(month);
        b.setCategory(category); b.setType(type); b.setPlannedAmount(amount);
        budgetRepo.save(b);
    }

    private void goal(User user, String name, BigDecimal target, BigDecimal current, String currency, LocalDate date, String color, String icon) {
        SavingsGoal g = new SavingsGoal();
        g.setUser(user); g.setName(name); g.setTargetAmount(target);
        g.setCurrentAmount(current); g.setCurrency(currency);
        g.setTargetDate(date); g.setColor(color); g.setIcon(icon);
        goalRepo.save(g);
    }

    private void recurring(User user, Account account, RecurringTransaction.TransactionType type, BigDecimal amount, String category, String desc, RecurringTransaction.Frequency freq, LocalDate nextDate) {
        RecurringTransaction r = new RecurringTransaction();
        r.setUser(user); r.setAccount(account); r.setType(type);
        r.setAmount(amount); r.setCategory(category); r.setDescription(desc);
        r.setFrequency(freq); r.setNextDate(nextDate); r.setActive(true);
        recurringRepo.save(r);
    }
}
