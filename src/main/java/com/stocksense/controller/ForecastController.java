
package com.stocksense.controller;

import com.stocksense.entity.Sale;
import com.stocksense.repository.SaleRepository;
import com.stocksense.service.ForecastService;
import com.stocksense.service.ForecastCalculationService;
import com.stocksense.dto.ForecastResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forecasts")
@CrossOrigin(origins = "*")
public class ForecastController {

    private final ForecastService forecastService;
    private final SaleRepository saleRepository;
    private final ForecastCalculationService forecastCalculationService;

    public ForecastController(
            ForecastService forecastService,
            SaleRepository saleRepository,
            ForecastCalculationService forecastCalculationService) {

        this.forecastService = forecastService;
        this.saleRepository = saleRepository;
        this.forecastCalculationService = forecastCalculationService;
    }

    // Existing moving average API
    @GetMapping("/moving-average/{productId}")
    public double getMovingAverage(@PathVariable Long productId) {

        List<Sale> productSales =
                saleRepository.findByProduct_Id(productId);

        return forecastService.calculateMovingAverage(productSales);
    }

    // Generate forecasts for all products
    @PostMapping("/run")
    public ResponseEntity<?> runForecast() {

        try {
            List<ForecastResponse> forecasts =
                    forecastCalculationService.generateForecastsForAllProducts();

            return ResponseEntity.ok(Map.of(
                    "message", "Forecasts generated successfully",
                    "totalProducts", forecasts.size(),
                    "forecasts", forecasts
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    // Get all saved forecasts
    @GetMapping
    public List<ForecastResponse> getAllForecasts() {
        return forecastCalculationService.getAllForecasts();
    }

    // Get forecasts for a particular product
    @GetMapping("/{productId}")
    public List<ForecastResponse> getForecastsByProduct(
            @PathVariable Long productId) {

        return forecastCalculationService.getForecastsByProduct(productId);
    }

    // Generate forecast for one product
    @PostMapping("/run/{productId}")
    public ResponseEntity<?> runForecastForProduct(
            @PathVariable Long productId) {

        try {
            ForecastResponse forecast =
                    forecastCalculationService.generateForecast(productId);

            return ResponseEntity.ok(forecast);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }
}
