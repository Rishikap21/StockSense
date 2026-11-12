
package com.stocksense.service;

import com.stocksense.entity.Forecast;
import com.stocksense.entity.Product;
import com.stocksense.repository.ForecastRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AlertService {

    private final ForecastRepository forecastRepository;
    private final StockService stockService;

    public AlertService(
            ForecastRepository forecastRepository,
            StockService stockService) {
        this.forecastRepository = forecastRepository;
        this.stockService = stockService;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStockoutAlerts() {

        List<Forecast> forecasts = forecastRepository.findAll();

        Map<Long, Forecast> latestForecasts = new HashMap<>();

        for (Forecast forecast : forecasts) {
            Long productId = forecast.getProduct().getId();
            Forecast existing = latestForecasts.get(productId);

            if (existing == null ||
                forecast.getForecastDate().isAfter(existing.getForecastDate())) {
                latestForecasts.put(productId, forecast);
            }
        }

        List<Map<String, Object>> alerts = new ArrayList<>();

        for (Forecast forecast : latestForecasts.values()) {

            Product product = forecast.getProduct();

            double dailyDemand = forecast.getPredictedDemand();

            int currentStock = product.getCurrentStock();

            Integer threshold = product.getMinimumStockThreshold();

            boolean lowStock = threshold != null &&
                    currentStock <= threshold;

            double daysRemaining = stockService.calculateDaysRemaining(
                    currentStock, dailyDemand);

            int reorderQuantity = stockService.calculateReorderQuantity(
                    dailyDemand,
                    product.getLeadTimeDays(),
                    currentStock
            );

            Map<String, Object> alert = new LinkedHashMap<>();

            alert.put("name", product.getProductName());
            alert.put("category", product.getCategory());
            alert.put("currentStock", currentStock);
            alert.put("minimumStockThreshold", threshold);
            alert.put("lowStock", lowStock);
            alert.put("dailyDemand", dailyDemand);
            alert.put("daysRemaining",
                    dailyDemand > 0 ? daysRemaining : null);
            alert.put("risk", forecast.getStockoutRisk());
            alert.put("reorder", reorderQuantity);

            alerts.add(alert);
        }

        alerts.sort(Comparator.comparing(
                item -> String.valueOf(item.get("risk"))));

        return alerts;
    }
}
