package com.fintrack.controller;
import com.fintrack.dto.request.SavingsGoalRequest;
import com.fintrack.dto.response.SavingsGoalResponse;
import com.fintrack.service.SavingsGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController @RequestMapping("/api/goals") @RequiredArgsConstructor @CrossOrigin
public class SavingsGoalController {
    private final SavingsGoalService goalService;

    @GetMapping
    public List<SavingsGoalResponse> getAll() { return goalService.getAll(); }

    @PostMapping
    public SavingsGoalResponse create(@RequestBody SavingsGoalRequest req) { return goalService.create(req); }

    @PutMapping("/{id}")
    public SavingsGoalResponse update(@PathVariable UUID id, @RequestBody SavingsGoalRequest req) {
        return goalService.update(id, req);
    }

    @PostMapping("/{id}/deposit")
    public SavingsGoalResponse deposit(@PathVariable UUID id, @RequestBody Map<String, BigDecimal> body) {
        return goalService.deposit(id, body.get("amount"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        goalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
