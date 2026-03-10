package com.fintrack.entity;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Entity @Table(name = "recurring_transactions")
public class RecurringTransaction {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    private BigDecimal amount;
    private String category;
    private String description;
    @Enumerated(EnumType.STRING)
    private Frequency frequency;
    private LocalDate nextDate;
    private boolean active = true;
    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum TransactionType { INCOME, EXPENSE }
    public enum Frequency { DAILY, WEEKLY, MONTHLY, YEARLY }
}
