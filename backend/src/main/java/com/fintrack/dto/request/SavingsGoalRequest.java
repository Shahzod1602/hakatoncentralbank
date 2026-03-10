package com.fintrack.dto.request;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SavingsGoalRequest {
    private String name;
    private BigDecimal targetAmount;
    private String currency;
    private LocalDate targetDate;
    private String color;
    private String icon;
}
