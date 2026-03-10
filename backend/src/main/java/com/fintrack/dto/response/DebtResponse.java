package com.fintrack.dto.response;

import com.fintrack.entity.Debt;
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
public class DebtResponse {
    private UUID id;
    private Debt.DebtType type;
    private String personName;
    private BigDecimal amount;
    private String currency;
    private String description;
    private Debt.DebtStatus status;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
}
