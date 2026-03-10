package com.fintrack.controller;
import com.fintrack.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/currency") @RequiredArgsConstructor @CrossOrigin
public class CurrencyController {
    private final CurrencyService currencyService;

    @GetMapping("/rates")
    public Map<String, Object> getRates(@RequestParam(defaultValue = "USD") String base) {
        return currencyService.getRates(base);
    }
}
