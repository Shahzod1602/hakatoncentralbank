package com.fintrack.service;

import com.fintrack.dto.request.AccountRequest;
import com.fintrack.dto.response.AccountResponse;
import com.fintrack.dto.response.AccountSummaryResponse;
import com.fintrack.entity.Account;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.AccountRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<AccountResponse> getAllAccounts() {
        User user = getCurrentUser();
        return accountRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        User user = getCurrentUser();
        Account account = new Account();
        account.setUser(user);
        account.setName(request.getName());
        account.setType(request.getType());
        account.setCurrency(request.getCurrency());
        account.setBalance(request.getBalance());
        account.setColor(request.getColor() != null ? request.getColor() : "#6366f1");
        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse updateAccount(UUID id, AccountRequest request) {
        User user = getCurrentUser();
        Account account = accountRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setName(request.getName());
        account.setType(request.getType());
        account.setCurrency(request.getCurrency());
        account.setColor(request.getColor());
        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public void deleteAccount(UUID id) {
        User user = getCurrentUser();
        Account account = accountRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        accountRepository.delete(account);
    }

    public AccountSummaryResponse getAccountSummary(UUID id, LocalDate startDate, LocalDate endDate) {
        User user = getCurrentUser();
        Account account = accountRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        BigDecimal income = transactionRepository.sumByAccountAndTypeAndDateBetween(
                account, Transaction.TransactionType.INCOME, start, end);
        BigDecimal expense = transactionRepository.sumByAccountAndTypeAndDateBetween(
                account, Transaction.TransactionType.EXPENSE, start, end);

        return new AccountSummaryResponse(account.getBalance(), income, expense);
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getCurrency(),
                account.getBalance(),
                account.getColor(),
                account.getCreatedAt()
        );
    }
}
