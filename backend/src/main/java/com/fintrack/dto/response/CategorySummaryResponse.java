package com.fintrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorySummaryResponse {
    private String category;
    private BigDecimal amount;
    private Double percentage;
}
