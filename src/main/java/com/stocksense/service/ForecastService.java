package com.stocksense.service;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ForecastService {

    // 1. Moving Average Forecasting (7 days)
    public double calculateMovingAverage(List<Integer> pastSales) {
        if (pastSales == null || pastSales.isEmpty()) return 0.0;
        
        int sum = 0;
        int days = Math.min(pastSales.size(), 7); // Use up to last 7 days
        
        for (int i = pastSales.size() - days; i < pastSales.size(); i++) {
            sum += pastSales.get(i);
        }
        return (double) sum / days;
    }

    // 2. Mean Absolute Error (MAE)
    public double calculateMAE(List<Double> actualDemand, List<Double> predictedDemand) {
        if (actualDemand.size() != predictedDemand.size() || actualDemand.isEmpty()) return 0.0;
        
        double totalError = 0;
        for (int i = 0; i < actualDemand.size(); i++) {
            totalError += Math.abs(actualDemand.get(i) - predictedDemand.get(i));
        }
        return totalError / actualDemand.size();
    }
}