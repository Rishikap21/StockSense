package com.stocksense.service;

import org.springframework.stereotype.Service;

@Service
public class StockService {

    // 1. Calculate how many days stock will last
    public double calculateDaysRemaining(int currentStock, double averageDailyDemand) {
        if (averageDailyDemand <= 0) return Double.MAX_VALUE; // Avoid division by zero
        return currentStock / averageDailyDemand;
    }

    // 2. Determine stockout risk level
    public String identifyStockoutRisk(double daysRemaining, int leadTimeDays) {
        if (daysRemaining > leadTimeDays + 2) {
            return "LOW";
        } else if (daysRemaining > leadTimeDays) {
            return "MEDIUM";
        } else {
            return "HIGH"; // Stock runs out before new delivery arrives
        }
    }

    // 3. Calculate how much to reorder
    public int calculateReorderQuantity(double dailyDemand, int leadTimeDays, int currentStock) {
        int requiredStock = (int) Math.ceil(dailyDemand * leadTimeDays);
        int reorderAmount = requiredStock - currentStock;
        return Math.max(0, reorderAmount); // Return 0 if we already have enough stock
    }
}