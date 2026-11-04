package com.stocksense.service;

import com.stocksense.entity.Product;
import com.stocksense.entity.Sale;
import com.stocksense.repository.ProductRepository;
import com.stocksense.repository.SaleRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@Service
public class CsvImportService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    public CsvImportService(ProductRepository productRepository,
                            SaleRepository saleRepository) {
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    @Transactional
    public int importProducts(MultipartFile file) throws Exception {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty.");
        }

        int importedCount = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(),
                        StandardCharsets.UTF_8))) {

            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {

                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                if (line.isBlank()) continue;

                String[] data = line.split(",", -1);

                if (data.length != 4) {
                    throw new IllegalArgumentException(
                            "Invalid product CSV row: " + line);
                }

                String productCode = data[0].trim();
                String productName = data[1].trim();
                int currentStock = Integer.parseInt(data[2].trim());
                int leadTimeDays = Integer.parseInt(data[3].trim());

                if (productCode.isEmpty() || productName.isEmpty()
                        || currentStock < 0 || leadTimeDays < 0) {
                    throw new IllegalArgumentException(
                            "Invalid product values: " + line);
                }

                Product product = productRepository
                        .findByProductCode(productCode)
                        .orElse(new Product());

                product.setProductCode(productCode);
                product.setProductName(productName);
                product.setCurrentStock(currentStock);
                product.setLeadTimeDays(leadTimeDays);

                productRepository.save(product);
                importedCount++;
            }
        }

        return importedCount;
    }

    @Transactional
    public int importSales(MultipartFile file) throws Exception {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty.");
        }

        int importedCount = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(),
                        StandardCharsets.UTF_8))) {

            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {

                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                if (line.isBlank()) continue;

                String[] data = line.split(",", -1);

                if (data.length != 3) {
                    throw new IllegalArgumentException(
                            "Invalid sales CSV row: " + line);
                }

                String productCode = data[0].trim();
                LocalDate saleDate = LocalDate.parse(data[1].trim());
                int quantitySold = Integer.parseInt(data[2].trim());

                if (productCode.isEmpty() || quantitySold <= 0) {
                    throw new IllegalArgumentException(
                            "Invalid sales values: " + line);
                }

                Product product = productRepository
                        .findByProductCode(productCode)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Product not found: " + productCode));

                Sale sale = new Sale();
                sale.setProduct(product);
                sale.setSaleDate(saleDate);
                sale.setQuantitySold(quantitySold);

                saleRepository.save(sale);
                importedCount++;
            }
        }

        return importedCount;
    }
}