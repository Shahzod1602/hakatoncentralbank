package com.fintrack.service;
import com.fintrack.dto.request.SavingsGoalRequest;
import com.fintrack.dto.response.SavingsGoalResponse;
import com.fintrack.entity.SavingsGoal;
import com.fintrack.entity.User;
import com.fintrack.repository.SavingsGoalRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class SavingsGoalService {
    private final SavingsGoalRepository goalRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<SavingsGoalResponse> getAll() {
        return goalRepository.findByUserOrderByCreatedAtDesc(getCurrentUser())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SavingsGoalResponse create(SavingsGoalRequest req) {
        SavingsGoal goal = new SavingsGoal();
        goal.setUser(getCurrentUser());
        goal.setName(req.getName());
        goal.setTargetAmount(req.getTargetAmount());
        goal.setCurrentAmount(BigDecimal.ZERO);
        goal.setCurrency(req.getCurrency() != null ? req.getCurrency() : "USD");
        goal.setTargetDate(req.getTargetDate());
        goal.setColor(req.getColor() != null ? req.getColor() : "#6366f1");
        goal.setIcon(req.getIcon() != null ? req.getIcon() : "🎯");
        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse deposit(UUID id, BigDecimal amount) {
        User user = getCurrentUser();
        SavingsGoal goal = goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse update(UUID id, SavingsGoalRequest req) {
        User user = getCurrentUser();
        SavingsGoal goal = goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setName(req.getName());
        goal.setTargetAmount(req.getTargetAmount());
        if (req.getCurrency() != null) goal.setCurrency(req.getCurrency());
        goal.setTargetDate(req.getTargetDate());
        if (req.getColor() != null) goal.setColor(req.getColor());
        if (req.getIcon() != null) goal.setIcon(req.getIcon());
        return toResponse(goalRepository.save(goal));
    }

    public void delete(UUID id) {
        User user = getCurrentUser();
        SavingsGoal goal = goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goalRepository.delete(goal);
    }

    private SavingsGoalResponse toResponse(SavingsGoal g) {
        double progress = g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? g.getCurrentAmount().divide(g.getTargetAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;
        return new SavingsGoalResponse(g.getId(), g.getName(), g.getTargetAmount(), g.getCurrentAmount(),
                Math.min(progress, 100.0), g.getCurrency(), g.getTargetDate(), g.getColor(), g.getIcon(), g.getCreatedAt());
    }
}
