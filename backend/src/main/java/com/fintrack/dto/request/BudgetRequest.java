package com.fintrack.dto.request;

import com.fintrack.entity.Budget;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {
    @NotNull
    @Min(2020)
    @Max(2100)
    private Integer year;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer month;

    @NotBlank
    private String category;

    @NotNull
    private Budget.BudgetType type;

    @NotNull
    @Positive
    private BigDecimal plannedAmount;
}
