package com.stocksense.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String home() {
        return "dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/products")
    public String products() {
        return "products";
    }

    @GetMapping("/forecasts")
    public String forecasts() {
        return "forecasts";
    }
    @GetMapping("/form")
    public String form() {
        return "form";
    }
    @GetMapping("/alerts")
    public String alerts() {
        return "alerts";
    }
}