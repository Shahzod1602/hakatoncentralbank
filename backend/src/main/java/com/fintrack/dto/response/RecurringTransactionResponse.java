package com.fintrack.dto.response;
import com.fintrack.entity.RecurringTransaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @AllArgsConstructor
public class RecurringTransactionResponse {
    private UUID id;
    private UUID accountId;
    private String accountName;
    private RecurringTransaction.TransactionType type;
    private BigDecimal amount;
    private String category;
    private String description;
    private RecurringTransaction.Frequency frequency;
    private LocalDate nextDate;
    private boolean active;
    private LocalDateTime createdAt;
}
