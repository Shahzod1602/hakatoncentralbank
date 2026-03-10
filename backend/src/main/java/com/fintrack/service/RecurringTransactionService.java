package com.fintrack.service;
import com.fintrack.dto.request.RecurringTransactionRequest;
import com.fintrack.dto.response.RecurringTransactionResponse;
import com.fintrack.entity.*;
import com.fintrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class RecurringTransactionService {
    private final RecurringTransactionRepository recurringRepo;
    private final AccountRepository accountRepo;
    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<RecurringTransactionResponse> getAll() {
        return recurringRepo.findByUserOrderByNextDateAsc(getCurrentUser())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public RecurringTransactionResponse create(RecurringTransactionRequest req) {
        User user = getCurrentUser();
        Account account = accountRepo.findByIdAndUser(req.getAccountId(), user)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        RecurringTransaction r = new RecurringTransaction();
        r.setUser(user); r.setAccount(account);
        r.setType(req.getType()); r.setAmount(req.getAmount());
        r.setCategory(req.getCategory()); r.setDescription(req.getDescription());
        r.setFrequency(req.getFrequency());
        r.setNextDate(req.getNextDate() != null ? req.getNextDate() : LocalDate.now());
        r.setActive(true);
        return toResponse(recurringRepo.save(r));
    }

    @Transactional
    public RecurringTransactionResponse update(UUID id, RecurringTransactionRequest req) {
        User user = getCurrentUser();
        RecurringTransaction r = recurringRepo.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Not found"));
        Account account = accountRepo.findByIdAndUser(req.getAccountId(), user)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        r.setAccount(account); r.setType(req.getType()); r.setAmount(req.getAmount());
        r.setCategory(req.getCategory()); r.setDescription(req.getDescription());
        r.setFrequency(req.getFrequency());
        if (req.getNextDate() != null) r.setNextDate(req.getNextDate());
        return toResponse(recurringRepo.save(r));
    }

    @Transactional
    public void execute(UUID id) {
        User user = getCurrentUser();
        RecurringTransaction r = recurringRepo.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Not found"));
        Transaction tx = new Transaction();
        tx.setUser(user); tx.setAccount(r.getAccount());
        tx.setType(r.getType() == RecurringTransaction.TransactionType.INCOME ? Transaction.TransactionType.INCOME : Transaction.TransactionType.EXPENSE);
        tx.setAmount(r.getAmount()); tx.setCategory(r.getCategory());
        tx.setDescription(r.getDescription() + " (recurring)");
        tx.setDate(LocalDate.now());
        Account acc = r.getAccount();
        if (tx.getType() == Transaction.TransactionType.INCOME) {
            acc.setBalance(acc.getBalance().add(r.getAmount()));
        } else {
            acc.setBalance(acc.getBalance().subtract(r.getAmount()));
        }
        accountRepo.save(acc);
        transactionRepo.save(tx);
        r.setNextDate(advance(r.getNextDate(), r.getFrequency()));
        recurringRepo.save(r);
    }

    public void delete(UUID id) {
        User user = getCurrentUser();
        RecurringTransaction r = recurringRepo.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Not found"));
        recurringRepo.delete(r);
    }

    private LocalDate advance(LocalDate date, RecurringTransaction.Frequency freq) {
        return switch (freq) {
            case DAILY -> date.plusDays(1);
            case WEEKLY -> date.plusWeeks(1);
            case MONTHLY -> date.plusMonths(1);
            case YEARLY -> date.plusYears(1);
        };
    }

    private RecurringTransactionResponse toResponse(RecurringTransaction r) {
        return new RecurringTransactionResponse(r.getId(), r.getAccount().getId(), r.getAccount().getName(),
                r.getType(), r.getAmount(), r.getCategory(), r.getDescription(),
                r.getFrequency(), r.getNextDate(), r.isActive(), r.getCreatedAt());
    }
}
