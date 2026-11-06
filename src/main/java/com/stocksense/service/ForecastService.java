package com.stocksense.service;

import com.stocksense.entity.Sale;
import com.stocksense.entity.Forecast;
import com.stocksense.repository.ForecastRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ForecastService {

    @Autowired
    private ForecastRepository forecastRepository;

    // NEW METHOD: Call this right before saving new forecasts to fix the duplicate bug permanently!
    public void clearOldForecasts() {
        forecastRepository.deleteAll();
    }

    // 1. Moving Average Forecasting using Sale entity
    public double calculateMovingAverage(List<Sale> recentSales) {
        if (recentSales == null || recentSales.isEmpty()) return 0.0;
        
        int sum = 0;
        int days = Math.min(recentSales.size(), 7); // Use up to last 7 days
        
        for (int i = recentSales.size() - days; i < recentSales.size(); i++) {
            // Pulls actual historical sales from Member 4's database variable
            sum += recentSales.get(i).getQuantitySold(); 
        }
        return (double) sum / days;
    }

    // 2. Mean Absolute Error (MAE) using Forecast entity
    public double calculateMAE(List<Forecast> pastForecasts) {
        if (pastForecasts == null || pastForecasts.isEmpty()) return 0.0;
        
        double totalError = 0;
        int validRecords = 0;
        
        for (Forecast forecast : pastForecasts) {
            if (forecast.getActualDemand() != null && forecast.getPredictedDemand() != null) {
                totalError += Math.abs(forecast.getActualDemand() - forecast.getPredictedDemand());
                validRecords++;
            }
        }
        return validRecords == 0 ? 0.0 : totalError / validRecords;
    }
}