# StockSense – Database Documentation

## 1. Database Details
- Database: stocksense_db
- DBMS: MySQL
- Backend: Spring Boot
- ORM: Spring Data JPA / Hibernate

## 2. Database Tables

### Products
Stores product and inventory details.
- id – Primary key
- product_code – Unique product code
- product_name – Product name
- current_stock – Available stock
- lead_time_days – Supplier delivery time
- created_at – Record creation time

### Sales
Stores historical sales records.
- id – Primary key
- product_id – Foreign key referencing products
- sale_date – Date of sale
- quantity_sold – Quantity sold

### Forecasts
Stores demand forecasting results.
- id – Primary key
- product_id – Foreign key referencing products
- forecast_date – Forecast date
- predicted_demand – Predicted demand
- actual_demand – Actual demand
- mae – Mean Absolute Error
- stockout_risk – Stockout risk level
- created_at – Record creation time

## 3. Dataset
- products.csv: 20 product records
- sales.csv: 1,200 sales records
- Sales history covers 60 days.

## 4. CSV Import
CsvImportService.java imports product and sales CSV files.
It validates empty files, required values, row formats, and product references.

## 5. Database Testing
Verified using MySQL Workbench:
- Products imported: 20
- Sales imported: 1,200
- Forecasts: 0 at the time of initial import

CSV import test completed successfully.