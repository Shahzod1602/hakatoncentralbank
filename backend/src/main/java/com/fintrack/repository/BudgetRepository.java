package com.fintrack.repository;

import com.fintrack.entity.Budget;
import com.fintrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    Optional<Budget> findByIdAndUser(UUID id, User user);

    @Query("SELECT b FROM Budget b WHERE b.user = :user " +
           "AND (:year IS NULL OR b.year = :year) " +
           "AND (:month IS NULL OR b.month = :month) " +
           "ORDER BY b.type, b.category")
    List<Budget> findWithFilters(
            @Param("user") User user,
            @Param("year") Integer year,
            @Param("month") Integer month);
}
