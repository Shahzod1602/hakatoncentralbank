package com.fintrack.service;

import com.fintrack.dto.request.TransactionRequest;
import com.fintrack.dto.response.TransactionResponse;
import com.fintrack.entity.Account;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.AccountRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Page<TransactionResponse> getTransactions(UUID accountId, Transaction.TransactionType type,
                                                      String category, LocalDate startDate, LocalDate endDate,
                                                      int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository.findWithFilters(user, accountId, type, category, startDate, endDate, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = getCurrentUser();
        Account account = accountRepository.findByIdAndUser(request.getAccountId(), user)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setDescription(request.getDescription());
        transaction.setDate(request.getDate());

        updateBalance(account, request.getType(), request.getAmount());
        accountRepository.save(account);
        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse updateTransaction(UUID id, TransactionRequest request) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Account oldAccount = transaction.getAccount();
        // Reverse old effect
        reverseBalance(oldAccount, transaction.getType(), transaction.getAmount());

        Account newAccount = accountRepository.findByIdAndUser(request.getAccountId(), user)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        transaction.setAccount(newAccount);
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setDescription(request.getDescription());
        transaction.setDate(request.getDate());

        // Apply new effect
        updateBalance(newAccount, request.getType(), request.getAmount());

        if (!oldAccount.getId().equals(newAccount.getId())) {
            accountRepository.save(oldAccount);
        }
        accountRepository.save(newAccount);
        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(UUID id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Account account = transaction.getAccount();
        reverseBalance(account, transaction.getType(), transaction.getAmount());
        accountRepository.save(account);
        transactionRepository.delete(transaction);
    }

    public List<String> getCategories() {
        User user = getCurrentUser();
        return transactionRepository.findDistinctCategoriesByUser(user);
    }

    private void updateBalance(Account account, Transaction.TransactionType type, BigDecimal amount) {
        if (type == Transaction.TransactionType.INCOME) {
            account.setBalance(account.getBalance().add(amount));
        } else {
            account.setBalance(account.getBalance().subtract(amount));
        }
    }

    private void reverseBalance(Account account, Transaction.TransactionType type, BigDecimal amount) {
        if (type == Transaction.TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(amount));
        } else {
            account.setBalance(account.getBalance().add(amount));
        }
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getAccount().getId(),
                t.getAccount().getName(),
                t.getAccount().getCurrency(),
                t.getType(),
                t.getAmount(),
                t.getCategory(),
                t.getDescription(),
                t.getDate(),
                t.getCreatedAt()
        );
    }
}
