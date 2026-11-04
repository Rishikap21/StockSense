
package com.stocksense.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecasts")
public class Forecast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "predicted_demand", nullable = false)
    private Double predictedDemand;

    @Column(name = "actual_demand")
    private Integer actualDemand;

    @Column(name = "mae")
    private Double mae;

    @Column(name = "stockout_risk", length = 30)
    private String stockoutRisk;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Forecast() {
    }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public LocalDate getForecastDate() {
        return forecastDate;
    }

    public void setForecastDate(LocalDate forecastDate) {
        this.forecastDate = forecastDate;
    }

    public Double getPredictedDemand() {
        return predictedDemand;
    }

    public void setPredictedDemand(Double predictedDemand) {
        this.predictedDemand = predictedDemand;
    }

    public Integer getActualDemand() {
        return actualDemand;
    }

    public void setActualDemand(Integer actualDemand) {
        this.actualDemand = actualDemand;
    }

    public Double getMae() {
        return mae;
    }

    public void setMae(Double mae) {
        this.mae = mae;
    }

    public String getStockoutRisk() {
        return stockoutRisk;
    }

    public void setStockoutRisk(String stockoutRisk) {
        this.stockoutRisk = stockoutRisk;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
