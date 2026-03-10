package com.fintrack.service;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class CurrencyService {
    private final RestTemplate restTemplate = new RestTemplate();
    private Map<String, Object> cachedRates = null;
    private long cacheTime = 0;

    public Map<String, Object> getRates(String base) {
        long now = System.currentTimeMillis();
        if (cachedRates != null && (now - cacheTime) < 3600000) {
            return cachedRates;
        }
        try {
            String url = "https://api.exchangerate-api.com/v4/latest/" + (base != null ? base : "USD");
            Map response = restTemplate.getForObject(url, Map.class);
            cachedRates = new HashMap<>();
            cachedRates.put("base", base);
            cachedRates.put("rates", response != null ? response.get("rates") : getDefaultRates());
            cachedRates.put("source", "live");
            cacheTime = now;
            return cachedRates;
        } catch (Exception e) {
            return Map.of("base", base, "rates", getDefaultRates(), "source", "fallback");
        }
    }

    private Map<String, Double> getDefaultRates() {
        Map<String, Double> rates = new HashMap<>();
        rates.put("USD", 1.0); rates.put("EUR", 0.92); rates.put("GBP", 0.79);
        rates.put("UZS", 12800.0); rates.put("RUB", 91.0); rates.put("KZT", 450.0);
        rates.put("JPY", 149.0); rates.put("CNY", 7.24); rates.put("TRY", 32.0);
        return rates;
    }
}
