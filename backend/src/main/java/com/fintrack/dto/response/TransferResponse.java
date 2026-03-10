package com.fintrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferResponse {
    private UUID id;
    private UUID fromAccountId;
    private String fromAccountName;
    private String fromAccountCurrency;
    private UUID toAccountId;
    private String toAccountName;
    private String toAccountCurrency;
    private BigDecimal amount;
    private BigDecimal toAmount;
    private BigDecimal exchangeRate;
    private String description;
    private LocalDate date;
    private LocalDateTime createdAt;
}
