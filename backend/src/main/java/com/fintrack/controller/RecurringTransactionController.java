package com.fintrack.controller;
import com.fintrack.dto.request.RecurringTransactionRequest;
import com.fintrack.dto.response.RecurringTransactionResponse;
import com.fintrack.service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/recurring") @RequiredArgsConstructor @CrossOrigin
public class RecurringTransactionController {
    private final RecurringTransactionService recurringService;

    @GetMapping
    public List<RecurringTransactionResponse> getAll() { return recurringService.getAll(); }

    @PostMapping
    public RecurringTransactionResponse create(@RequestBody RecurringTransactionRequest req) { return recurringService.create(req); }

    @PutMapping("/{id}")
    public RecurringTransactionResponse update(@PathVariable UUID id, @RequestBody RecurringTransactionRequest req) {
        return recurringService.update(id, req);
    }

    @PostMapping("/{id}/execute")
    public ResponseEntity<Void> execute(@PathVariable UUID id) {
        recurringService.execute(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        recurringService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
