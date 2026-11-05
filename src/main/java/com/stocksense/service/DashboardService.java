
package com.stocksense.service;

import com.stocksense.repository.ProductRepository;
import com.stocksense.repository.SaleRepository;
import com.stocksense.repository.ForecastRepository;
import com.stocksense.entity.Forecast;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final ForecastRepository forecastRepository;

    public DashboardService(
            ProductRepository productRepository,
            SaleRepository saleRepository,
            ForecastRepository forecastRepository) {

        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.forecastRepository = forecastRepository;
    }

    public Map<String, Object> getDashboardSummary() {

        long totalProducts = productRepository.count();

        int totalSales = saleRepository.findAll()
                .stream()
                .mapToInt(sale -> sale.getQuantitySold())
                .sum();

        long lowStockProducts = productRepository.findAll()
                .stream()
                .filter(product -> product.getCurrentStock() < 50)
                .count();

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

        long highRiskProducts = latestForecasts.values()
                .stream()
                .filter(f -> "HIGH".equalsIgnoreCase(f.getStockoutRisk()))
                .count();

        Map<String, Object> result = new HashMap<>();
        result.put("totalProducts", totalProducts);
        result.put("totalSales", totalSales);
        result.put("lowStockProducts", lowStockProducts);
        result.put("highRiskProducts", highRiskProducts);

        return result;
    }
}