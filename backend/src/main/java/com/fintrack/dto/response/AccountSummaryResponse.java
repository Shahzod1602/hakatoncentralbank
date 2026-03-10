package com.fintrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountSummaryResponse {
    private BigDecimal balance;
    private BigDecimal income;
    private BigDecimal expense;
}
