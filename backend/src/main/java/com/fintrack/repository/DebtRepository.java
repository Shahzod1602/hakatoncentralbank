package com.fintrack.repository;

import com.fintrack.entity.Debt;
import com.fintrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DebtRepository extends JpaRepository<Debt, UUID> {

    Optional<Debt> findByIdAndUser(UUID id, User user);

    @Query("SELECT d FROM Debt d WHERE d.user = :user " +
           "AND (:type IS NULL OR d.type = :type) " +
           "AND (:status IS NULL OR d.status = :status) " +
           "ORDER BY d.createdAt DESC")
    List<Debt> findWithFilters(
            @Param("user") User user,
            @Param("type") Debt.DebtType type,
            @Param("status") Debt.DebtStatus status);
}
