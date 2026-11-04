package com.stocksense.controller;

import com.stocksense.entity.Sale;
import com.stocksense.repository.SaleRepository;
import com.stocksense.service.ForecastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forecasts")
@CrossOrigin(origins = "*") // Allows the frontend to connect
public class ForecastController {

    @Autowired
    private ForecastService forecastService;

    @Autowired
    private SaleRepository saleRepository;

    @GetMapping("/moving-average/{productId}")
    public double getMovingAverage(@PathVariable Long productId) {
        // Fetch sales and filter by product ID
        List<Sale> productSales = saleRepository.findAll().stream()
                .filter(sale -> sale.getProduct().getId().equals(productId))
                .toList();

        // Calculate and return the math result
        return forecastService.calculateMovingAverage(productSales);
    }
}