package com.stocksense.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/api/home")
    public String home() {
        return "Welcome to StockSense! Backend is running successfully.";
    }

    @GetMapping("/api/health")
    public String health() {
        return "StockSense API is healthy!";
    }
}