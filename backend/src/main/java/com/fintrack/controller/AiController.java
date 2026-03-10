package com.fintrack.controller;
import com.fintrack.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/ai") @RequiredArgsConstructor @CrossOrigin
public class AiController {
    private final AiService aiService;

    @PostMapping("/categorize")
    public Map<String, Object> categorize(@RequestBody Map<String, String> body) {
        return aiService.categorize(body.get("description"));
    }

    @GetMapping("/insights")
    public List<Map<String, Object>> getInsights() { return aiService.getInsights(); }

    @GetMapping("/health-score")
    public Map<String, Object> getHealthScore() { return aiService.getHealthScore(); }
}
