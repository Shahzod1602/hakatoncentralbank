package com.fintrack.repository;
import com.fintrack.entity.SavingsGoal;
import com.fintrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {
    List<SavingsGoal> findByUserOrderByCreatedAtDesc(User user);
    Optional<SavingsGoal> findByIdAndUser(UUID id, User user);
}
