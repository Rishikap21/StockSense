# StockSense – Database Documentation

## 1. Database Configuration
- Database: stocksense_db
- DBMS: MySQL
- Port: 3306
- ORM: Spring Data JPA / Hibernate

## 2. Database Tables
- products: Stores product details, current stock and lead time.
- sales: Stores product sales history.
- forecasts: Stores predicted demand, actual demand, MAE and stockout risk.

## 3. Dataset
- products.csv: 20 product records.
- sales.csv: 1,200 sales records.
- Sales history covers 60 days.

## 4. CSV Import
CsvImportService.java imports product and sales CSV files.
It validates empty files, required values, row formats and product references.

## 5. Database Testing
Verified using MySQL Workbench:
- Products imported: 20
- Sales imported: 1,200
- Forecasts: 0 at the time of initial import

CSV import test completed successfully.