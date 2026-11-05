
package com.stocksense.service;

import com.stocksense.dto.ForecastResponse;
import com.stocksense.entity.Forecast;
import com.stocksense.entity.Product;
import com.stocksense.entity.Sale;
import com.stocksense.repository.ForecastRepository;
import com.stocksense.repository.ProductRepository;
import com.stocksense.repository.SaleRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ForecastCalculationService {

    private final ForecastService forecastService;
    private final StockService stockService;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final ForecastRepository forecastRepository;

    public ForecastCalculationService(
            ForecastService forecastService,
            StockService stockService,
            ProductRepository productRepository,
            SaleRepository saleRepository,
            ForecastRepository forecastRepository) {

        this.forecastService = forecastService;
        this.stockService = stockService;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.forecastRepository = forecastRepository;
    }

    // Generate forecast for one product
    @Transactional
    public ForecastResponse generateForecast(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        List<Sale> sales =
                saleRepository.findByProduct_Id(productId);

        sales.sort(Comparator.comparing(Sale::getSaleDate));

        double dailyDemand =
                forecastService.calculateMovingAverage(sales);

        double daysRemaining =
                stockService.calculateDaysRemaining(
                        product.getCurrentStock(),
                        dailyDemand
                );

        String risk =
                stockService.identifyStockoutRisk(
                        daysRemaining,
                        product.getLeadTimeDays()
                );

        int reorderQuantity =
                stockService.calculateReorderQuantity(
                        dailyDemand,
                        product.getLeadTimeDays(),
                        product.getCurrentStock()
                );

        List<Forecast> pastForecasts =
                forecastRepository.findByProduct_Id(productId);

        double mae =
                forecastService.calculateMAE(pastForecasts);

        Forecast forecast = new Forecast();

        forecast.setProduct(product);
        forecast.setForecastDate(LocalDate.now());
        forecast.setPredictedDemand(dailyDemand);
        forecast.setMae(mae);
        forecast.setStockoutRisk(risk);

        Forecast savedForecast =
                forecastRepository.save(forecast);

        return new ForecastResponse(
                product.getId(),
                product.getProductName(),
                product.getCurrentStock(),
                dailyDemand,
                mae,
                risk,
                reorderQuantity,
                dailyDemand > 0 ? daysRemaining : null,
                savedForecast.getForecastDate()
        );
    }

    // Generate forecasts for all products
    @Transactional
    public List<ForecastResponse> generateForecastsForAllProducts() {

        List<Product> products = productRepository.findAll();

        return products.stream()
                .map(product -> generateForecast(product.getId()))
                .collect(Collectors.toList());
    }

    // Get all previously generated forecasts
    @Transactional(readOnly = true)
    public List<ForecastResponse> getAllForecasts() {

        return forecastRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get forecasts for one product
    @Transactional(readOnly = true)
    public List<ForecastResponse> getForecastsByProduct(Long productId) {

        return forecastRepository.findByProduct_Id(productId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Convert saved forecast into response DTO
    private ForecastResponse convertToResponse(Forecast forecast) {

        Product product = forecast.getProduct();

        double dailyDemand = forecast.getPredictedDemand();

        double daysRemaining =
                stockService.calculateDaysRemaining(
                        product.getCurrentStock(),
                        dailyDemand
                );

        int reorderQuantity =
                stockService.calculateReorderQuantity(
                        dailyDemand,
                        product.getLeadTimeDays(),
                        product.getCurrentStock()
                );

        return new ForecastResponse(
                product.getId(),
                product.getProductName(),
                product.getCurrentStock(),
                dailyDemand,
                forecast.getMae(),
                forecast.getStockoutRisk(),
                reorderQuantity,
                dailyDemand > 0 ? daysRemaining : null,
                forecast.getForecastDate()
        );
    }
}
