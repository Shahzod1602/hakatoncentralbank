package com.fintrack.repository;
import com.fintrack.entity.RecurringTransaction;
import com.fintrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {
    List<RecurringTransaction> findByUserOrderByNextDateAsc(User user);
    Optional<RecurringTransaction> findByIdAndUser(UUID id, User user);
    List<RecurringTransaction> findByActiveTrueAndNextDateLessThanEqual(LocalDate date);
}
