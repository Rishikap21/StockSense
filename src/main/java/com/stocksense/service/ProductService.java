
package com.stocksense.service;

import com.stocksense.entity.Product;
import com.stocksense.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));
    }

    // Assign threshold based on category
    private int getThreshold(String category) {
        if (category == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Category is required");
        }

        return switch (category.toUpperCase()) {
            case "FAST_MOVING" -> 50;
            case "MEDIUM_MOVING" -> 30;
            case "SLOW_MOVING" -> 10;
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid product category");
        };
    }

    // Add new product
    public Product addProduct(Product product) {
        product.setMinimumStockThreshold(
                getThreshold(product.getCategory()));
        return productRepository.save(product);
    }

    // Update product
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = getProductById(id);

        existingProduct.setProductCode(updatedProduct.getProductCode());
        existingProduct.setProductName(updatedProduct.getProductName());
        existingProduct.setCurrentStock(updatedProduct.getCurrentStock());
        existingProduct.setLeadTimeDays(updatedProduct.getLeadTimeDays());

        if (updatedProduct.getCategory() != null) {
            existingProduct.setCategory(updatedProduct.getCategory());
            existingProduct.setMinimumStockThreshold(
                    getThreshold(updatedProduct.getCategory()));
        }

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
