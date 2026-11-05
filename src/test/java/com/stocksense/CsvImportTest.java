package com.stocksense;

import com.stocksense.service.CsvImportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.FileInputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class CsvImportTest {

    @Autowired
    private CsvImportService csvImportService;

    @Test
    void importCsvFiles() throws Exception {

        MockMultipartFile productsFile = new MockMultipartFile(
                "file", "products.csv", "text/csv",
                new FileInputStream("dataset/products.csv"));

        MockMultipartFile salesFile = new MockMultipartFile(
                "file", "sales.csv", "text/csv",
                new FileInputStream("dataset/sales.csv"));

        assertEquals(20, csvImportService.importProducts(productsFile));
        assertEquals(1200, csvImportService.importSales(salesFile));
    }
}