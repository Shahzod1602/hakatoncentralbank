package com.fintrack.service;

import com.fintrack.dto.request.DebtRequest;
import com.fintrack.dto.response.DebtResponse;
import com.fintrack.entity.Debt;
import com.fintrack.entity.User;
import com.fintrack.repository.DebtRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DebtService {

    private final DebtRepository debtRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<DebtResponse> getDebts(Debt.DebtType type, Debt.DebtStatus status) {
        User user = getCurrentUser();
        return debtRepository.findWithFilters(user, type, status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DebtResponse createDebt(DebtRequest request) {
        User user = getCurrentUser();
        Debt debt = new Debt();
        debt.setUser(user);
        debt.setType(request.getType());
        debt.setPersonName(request.getPersonName());
        debt.setAmount(request.getAmount());
        debt.setCurrency(request.getCurrency());
        debt.setDescription(request.getDescription());
        debt.setStatus(Debt.DebtStatus.OPEN);
        debt.setDueDate(request.getDueDate());
        return toResponse(debtRepository.save(debt));
    }

    @Transactional
    public DebtResponse updateDebt(UUID id, DebtRequest request) {
        User user = getCurrentUser();
        Debt debt = debtRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        debt.setType(request.getType());
        debt.setPersonName(request.getPersonName());
        debt.setAmount(request.getAmount());
        debt.setCurrency(request.getCurrency());
        debt.setDescription(request.getDescription());
        debt.setDueDate(request.getDueDate());
        if (request.getStatus() != null) {
            debt.setStatus(request.getStatus());
        }
        return toResponse(debtRepository.save(debt));
    }

    @Transactional
    public void deleteDebt(UUID id) {
        User user = getCurrentUser();
        Debt debt = debtRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        debtRepository.delete(debt);
    }

    private DebtResponse toResponse(Debt d) {
        return new DebtResponse(
                d.getId(),
                d.getType(),
                d.getPersonName(),
                d.getAmount(),
                d.getCurrency(),
                d.getDescription(),
                d.getStatus(),
                d.getDueDate(),
                d.getCreatedAt()
        );
    }
}
