
package com.stocksense.dto;

import java.time.LocalDate;

public class ForecastResponse {

    private Long productId;
    private String productName;
    private Integer currentStock;
    private Double predictedDemand;
    private Double mae;
    private String stockoutRisk;
    private Integer reorderQuantity;
    private Double daysRemaining;
    private LocalDate forecastDate;

    public ForecastResponse() {
    }

    public ForecastResponse(
            Long productId,
            String productName,
            Integer currentStock,
            Double predictedDemand,
            Double mae,
            String stockoutRisk,
            Integer reorderQuantity,
            Double daysRemaining,
            LocalDate forecastDate) {

        this.productId = productId;
        this.productName = productName;
        this.currentStock = currentStock;
        this.predictedDemand = predictedDemand;
        this.mae = mae;
        this.stockoutRisk = stockoutRisk;
        this.reorderQuantity = reorderQuantity;
        this.daysRemaining = daysRemaining;
        this.forecastDate = forecastDate;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public Double getPredictedDemand() {
        return predictedDemand;
    }

    public Double getMae() {
        return mae;
    }

    public String getStockoutRisk() {
        return stockoutRisk;
    }

    public Integer getReorderQuantity() {
        return reorderQuantity;
    }

    public Double getDaysRemaining() {
        return daysRemaining;
    }

    public LocalDate getForecastDate() {
        return forecastDate;
    }
}
