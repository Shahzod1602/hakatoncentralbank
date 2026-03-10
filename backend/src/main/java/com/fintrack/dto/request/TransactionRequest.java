package com.fintrack.dto.request;

import com.fintrack.entity.Transaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TransactionRequest {
    @NotNull
    private UUID accountId;

    @NotNull
    private Transaction.TransactionType type;

    @NotNull
    @Positive
    private BigDecimal amount;

    private String category;
    private String description;

    @NotNull
    private LocalDate date;
}
