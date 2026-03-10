package com.fintrack.controller;

import com.fintrack.dto.request.DebtRequest;
import com.fintrack.dto.response.DebtResponse;
import com.fintrack.entity.Debt;
import com.fintrack.service.DebtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/debts")
@RequiredArgsConstructor
public class DebtController {

    private final DebtService debtService;

    @GetMapping
    public ResponseEntity<List<DebtResponse>> getDebts(
            @RequestParam(required = false) Debt.DebtType type,
            @RequestParam(required = false) Debt.DebtStatus status) {
        return ResponseEntity.ok(debtService.getDebts(type, status));
    }

    @PostMapping
    public ResponseEntity<DebtResponse> createDebt(@Valid @RequestBody DebtRequest request) {
        return ResponseEntity.ok(debtService.createDebt(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DebtResponse> updateDebt(@PathVariable UUID id,
                                                    @Valid @RequestBody DebtRequest request) {
        return ResponseEntity.ok(debtService.updateDebt(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDebt(@PathVariable UUID id) {
        debtService.deleteDebt(id);
        return ResponseEntity.noContent().build();
    }
}
