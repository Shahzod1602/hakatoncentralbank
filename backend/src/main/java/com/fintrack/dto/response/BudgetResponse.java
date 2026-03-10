package com.fintrack.dto.response;

import com.fintrack.entity.Budget;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private UUID id;
    private Integer year;
    private Integer month;
    private String category;
    private Budget.BudgetType type;
    private BigDecimal plannedAmount;
    private BigDecimal actualAmount;
    private LocalDateTime createdAt;
}
