package com.fintrack.repository;

import com.fintrack.entity.Account;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByIdAndUser(UUID id, User user);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user " +
           "AND (:accountId IS NULL OR t.account.id = :accountId) " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:startDate IS NULL OR t.date >= :startDate) " +
           "AND (:endDate IS NULL OR t.date <= :endDate) " +
           "ORDER BY t.date DESC, t.createdAt DESC")
    Page<Transaction> findWithFilters(
            @Param("user") User user,
            @Param("accountId") UUID accountId,
            @Param("type") Transaction.TransactionType type,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.user = :user AND t.category IS NOT NULL ORDER BY t.category")
    List<String> findDistinctCategoriesByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.account = :account AND t.type = :type AND t.date >= :startDate AND t.date <= :endDate")
    BigDecimal sumByAccountAndTypeAndDateBetween(
            @Param("account") Account account,
            @Param("type") Transaction.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.date >= :startDate AND t.date <= :endDate")
    BigDecimal sumByUserAndTypeAndDateBetween(
            @Param("user") User user,
            @Param("type") Transaction.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.date >= :startDate AND t.date <= :endDate GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByCategory(
            @Param("user") User user,
            @Param("type") Transaction.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t.date, SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END) FROM Transaction t WHERE t.user = :user AND t.date >= :startDate AND t.date <= :endDate GROUP BY t.date ORDER BY t.date")
    List<Object[]> getDailyTimeSeries(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.account = :account ORDER BY t.date DESC, t.createdAt DESC")
    List<Transaction> findByAccountOrderByDateDesc(@Param("account") Account account);

    List<Transaction> findByUserOrderByDateDescCreatedAtDesc(User user, Pageable pageable);

    List<Transaction> findByUserAndDateBetweenAndType(User user, LocalDate startDate, LocalDate endDate, Transaction.TransactionType type);
}
