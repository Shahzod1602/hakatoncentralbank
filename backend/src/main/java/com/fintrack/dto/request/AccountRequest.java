package com.fintrack.dto.request;

import com.fintrack.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {
    @NotBlank
    private String name;

    @NotNull
    private Account.AccountType type;

    @NotBlank
    private String currency;

    @NotNull
    private BigDecimal balance;

    private String color;
}
