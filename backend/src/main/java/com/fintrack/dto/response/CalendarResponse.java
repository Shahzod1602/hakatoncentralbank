package com.fintrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarResponse {
    private List<DayData> days;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayData {
        private String date;
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal net;
    }
}
