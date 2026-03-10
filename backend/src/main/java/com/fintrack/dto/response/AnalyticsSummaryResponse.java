package com.fintrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private List<AccountBalance> accountBalances;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountBalance {
        private String accountId;
        private String accountName;
        private String currency;
        private BigDecimal balance;
        private BigDecimal income;
        private BigDecimal expense;
    }
}
