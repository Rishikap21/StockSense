
package com.stocksense.controller;

import com.stocksense.service.CsvImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/csv")
@CrossOrigin(origins = "*")
public class CsvUploadController {

    private final CsvImportService csvImportService;

    public CsvUploadController(CsvImportService csvImportService) {
        this.csvImportService = csvImportService;
    }

    @PostMapping("/upload/products")
    public ResponseEntity<?> uploadProducts(
            @RequestParam("file") MultipartFile file) {

        try {
            int count = csvImportService.importProducts(file);

            return ResponseEntity.ok(Map.of(
                    "message", "Products imported successfully",
                    "recordsImported", count
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upload/sales")
    public ResponseEntity<?> uploadSales(
            @RequestParam("file") MultipartFile file) {

        try {
            int count = csvImportService.importSales(file);

            return ResponseEntity.ok(Map.of(
                    "message", "Sales imported successfully",
                    "recordsImported", count
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        }
    }
}
