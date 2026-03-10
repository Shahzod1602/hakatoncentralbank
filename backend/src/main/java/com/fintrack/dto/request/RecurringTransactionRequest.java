package com.fintrack.dto.request;
import com.fintrack.entity.RecurringTransaction;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class RecurringTransactionRequest {
    private UUID accountId;
    private RecurringTransaction.TransactionType type;
    private BigDecimal amount;
    private String category;
    private String description;
    private RecurringTransaction.Frequency frequency;
    private LocalDate nextDate;
}
