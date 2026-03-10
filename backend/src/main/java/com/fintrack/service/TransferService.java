package com.fintrack.service;

import com.fintrack.dto.request.TransferRequest;
import com.fintrack.dto.response.TransferResponse;
import com.fintrack.entity.Account;
import com.fintrack.entity.Transfer;
import com.fintrack.entity.User;
import com.fintrack.repository.AccountRepository;
import com.fintrack.repository.TransferRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<TransferResponse> getAllTransfers() {
        User user = getCurrentUser();
        return transferRepository.findByUserOrderByDateDescCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransferResponse createTransfer(TransferRequest request) {
        User user = getCurrentUser();

        if (request.getFromAccountId().equals(request.getToAccountId())) {
            throw new RuntimeException("Cannot transfer to the same account");
        }

        Account fromAccount = accountRepository.findByIdAndUser(request.getFromAccountId(), user)
                .orElseThrow(() -> new RuntimeException("Source account not found"));
        Account toAccount = accountRepository.findByIdAndUser(request.getToAccountId(), user)
                .orElseThrow(() -> new RuntimeException("Destination account not found"));

        BigDecimal toAmount = request.getToAmount() != null ? request.getToAmount() : request.getAmount();
        BigDecimal exchangeRate = request.getAmount().compareTo(BigDecimal.ZERO) != 0
                ? toAmount.divide(request.getAmount(), 6, RoundingMode.HALF_UP)
                : BigDecimal.ONE;

        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(toAmount));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        Transfer transfer = new Transfer();
        transfer.setUser(user);
        transfer.setFromAccount(fromAccount);
        transfer.setToAccount(toAccount);
        transfer.setAmount(request.getAmount());
        transfer.setToAmount(toAmount);
        transfer.setExchangeRate(exchangeRate);
        transfer.setDescription(request.getDescription());
        transfer.setDate(request.getDate());

        return toResponse(transferRepository.save(transfer));
    }

    @Transactional
    public void deleteTransfer(UUID id) {
        User user = getCurrentUser();
        Transfer transfer = transferRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transfer not found"));

        Account fromAccount = transfer.getFromAccount();
        Account toAccount = transfer.getToAccount();

        fromAccount.setBalance(fromAccount.getBalance().add(transfer.getAmount()));
        toAccount.setBalance(toAccount.getBalance().subtract(transfer.getToAmount()));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
        transferRepository.delete(transfer);
    }

    private TransferResponse toResponse(Transfer t) {
        return new TransferResponse(
                t.getId(),
                t.getFromAccount().getId(),
                t.getFromAccount().getName(),
                t.getFromAccount().getCurrency(),
                t.getToAccount().getId(),
                t.getToAccount().getName(),
                t.getToAccount().getCurrency(),
                t.getAmount(),
                t.getToAmount(),
                t.getExchangeRate(),
                t.getDescription(),
                t.getDate(),
                t.getCreatedAt()
        );
    }
}
