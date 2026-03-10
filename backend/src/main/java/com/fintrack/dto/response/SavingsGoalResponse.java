package com.fintrack.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @AllArgsConstructor
public class SavingsGoalResponse {
    private UUID id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private double progressPercent;
    private String currency;
    private LocalDate targetDate;
    private String color;
    private String icon;
    private LocalDateTime createdAt;
}
