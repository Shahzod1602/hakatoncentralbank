package com.fintrack.dto.request;

import com.fintrack.entity.Debt;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DebtRequest {
    @NotNull
    private Debt.DebtType type;

    @NotBlank
    private String personName;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotBlank
    private String currency;

    private String description;
    private LocalDate dueDate;
    private Debt.DebtStatus status;
}
