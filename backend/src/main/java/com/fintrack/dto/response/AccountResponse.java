package com.fintrack.dto.response;

import com.fintrack.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private UUID id;
    private String name;
    private Account.AccountType type;
    private String currency;
    private BigDecimal balance;
    private String color;
    private LocalDateTime createdAt;
}
