
document.addEventListener("DOMContentLoaded", function () {

    // API endpoints
    const API = "/api/products";
    const PRODUCTS_CSV_API = "/api/csv/upload/products";
    const SALES_CSV_API = "/api/csv/upload/sales";

    let products = [];

    // HTML elements
    const tableBody = document.getElementById("productsTableBody");
    const searchInput = document.getElementById("productSearch");
    const leadTimeFilter = document.getElementById("leadTimeFilter");
    const stockFilter = document.getElementById("stockFilter");

    const productsFileInput = document.getElementById("csvFileInput");
    const salesFileInput = document.getElementById("salesCsvFileInput");

    const uploadProductsButton = document.getElementById("uploadCsvBtn");
    const uploadSalesButton = document.getElementById("uploadSalesCsvBtn");
    const addProductButton = document.getElementById("addProductBtn");

    // Check required HTML elements
    const requiredElements = [
        tableBody,
        searchInput,
        leadTimeFilter,
        stockFilter,
        productsFileInput,
        salesFileInput,
        uploadProductsButton,
        uploadSalesButton,
        addProductButton
    ];

    if (requiredElements.some(element => !element)) {
        console.error("Products page HTML elements are missing. Check element IDs.");
        return;
    }

    // Load products from database
    async function loadProducts() {
        try {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        Loading products...
                    </td>
                </tr>
            `;

            const response = await fetch(API);

            if (!response.ok) {
                throw new Error("Unable to fetch products.");
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid product data received.");
            }

            products = data;

            updateSummary();
            populateLeadTimes();
            filterProducts();

        } catch (error) {
            console.error("Products loading error:", error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        Unable to load products. Please refresh the page.
                    </td>
                </tr>
            `;
        }
    }

    // Determine stock status
    function getStockStatus(product) {

        const stock = Number(product.currentStock);

        if (stock === 0) return "out-of-stock";

        if (stock < 50) return "low-stock";

        return "in-stock";
    }

    // Update summary cards
    function updateSummary() {

        document.getElementById("totalProducts").textContent =
            products.length;

        document.getElementById("inStockProducts").textContent =
            products.filter(p => getStockStatus(p) === "in-stock").length;

        document.getElementById("lowStockProducts").textContent =
            products.filter(p => getStockStatus(p) === "low-stock").length;

        document.getElementById("outOfStockProducts").textContent =
            products.filter(p => getStockStatus(p) === "out-of-stock").length;
    }

    // Populate lead time dropdown
    function populateLeadTimes() {

        const selectedValue = leadTimeFilter.value;

        leadTimeFilter.innerHTML =
            '<option value="all">All Lead Times</option>';

        const leadTimes = [
            ...new Set(products.map(p => Number(p.leadTimeDays)))
        ].sort((a, b) => a - b);

        leadTimes.forEach(days => {

            const option = document.createElement("option");

            option.value = String(days);
            option.textContent = days + " days";

            leadTimeFilter.appendChild(option);
        });

        leadTimeFilter.value =
            leadTimes.includes(Number(selectedValue))
                ? selectedValue
                : "all";
    }

    // Display products
    function displayProducts(list) {

        tableBody.innerHTML = "";

        document.getElementById("productCount").textContent =
            list.length + " products";

        document.getElementById("tableFooterText").textContent =
            "Showing " + list.length + " products";

        if (list.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No products found.
                    </td>
                </tr>
            `;

            return;
        }

        list.forEach(product => {

            const status = getStockStatus(product);

            const statusLabels = {
                "in-stock": "In Stock",
                "low-stock": "Low Stock",
                "out-of-stock": "Out of Stock"
            };

            const row = document.createElement("tr");

            // Product name
            const nameCell = document.createElement("td");
            nameCell.textContent = product.productName;
            row.appendChild(nameCell);

            // Product code
            const codeCell = document.createElement("td");
            codeCell.textContent = product.productCode;
            row.appendChild(codeCell);

            // Lead time
            const leadCell = document.createElement("td");
            leadCell.textContent = product.leadTimeDays + " days";
            row.appendChild(leadCell);

            // Current stock
            const stockCell = document.createElement("td");
            stockCell.textContent = product.currentStock + " units";
            row.appendChild(stockCell);

            // Stock status
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");

            badge.className = "risk-badge risk-" + status;
            badge.textContent = statusLabels[status];

            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            // Actions
            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.className = "secondary-button";

            editButton.addEventListener("click", function () {
                editProduct(product);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "secondary-button";

            deleteButton.addEventListener("click", function () {
                deleteProduct(product);
            });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });
    }

    // Search and filters
    function filterProducts() {

        const searchText = searchInput.value.toLowerCase().trim();
        const selectedLeadTime = leadTimeFilter.value;
        const selectedStock = stockFilter.value;

        const filtered = products.filter(product => {

            const matchesSearch =
                product.productName.toLowerCase().includes(searchText) ||
                product.productCode.toLowerCase().includes(searchText);

            const matchesLeadTime =
                selectedLeadTime === "all" ||
                String(product.leadTimeDays) === selectedLeadTime;

            const matchesStock =
                selectedStock === "all" ||
                getStockStatus(product) === selectedStock;

            return matchesSearch && matchesLeadTime && matchesStock;
        });

        displayProducts(filtered);
    }

    // Add product
    async function addProduct() {

        const productCode = prompt("Enter product code:");
        if (productCode === null) return;

        const productName = prompt("Enter product name:");
        if (productName === null) return;

        const stockInput = prompt("Enter current stock:");
        if (stockInput === null) return;

        const leadInput = prompt("Enter lead time in days:");
        if (leadInput === null) return;

        const currentStock = Number(stockInput);
        const leadTimeDays = Number(leadInput);

        if (
            !productCode.trim() ||
            !productName.trim() ||
            !Number.isInteger(currentStock) ||
            currentStock < 0 ||
            !Number.isInteger(leadTimeDays) ||
            leadTimeDays <= 0
        ) {
            alert("Please enter valid product details.");
            return;
        }

        try {

            const response = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productCode: productCode.trim(),
                    productName: productName.trim(),
                    currentStock: currentStock,
                    leadTimeDays: leadTimeDays
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert("Product added successfully!");

            await loadProducts();

        } catch (error) {

            console.error("Add product error:", error);
            alert("Unable to add product: " + error.message);
        }
    }

    // Edit product
    async function editProduct(product) {

        const productName = prompt(
            "Enter product name:",
            product.productName
        );

        if (productName === null) return;

        const stockInput = prompt(
            "Enter current stock:",
            product.currentStock
        );

        if (stockInput === null) return;

        const leadInput = prompt(
            "Enter lead time:",
            product.leadTimeDays
        );

        if (leadInput === null) return;

        const currentStock = Number(stockInput);
        const leadTimeDays = Number(leadInput);

        if (
            !productName.trim() ||
            !Number.isInteger(currentStock) ||
            currentStock < 0 ||
            !Number.isInteger(leadTimeDays) ||
            leadTimeDays <= 0
        ) {
            alert("Please enter valid values.");
            return;
        }

        try {

            const response = await fetch(`${API}/${product.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productCode: product.productCode,
                    productName: productName.trim(),
                    currentStock: currentStock,
                    leadTimeDays: leadTimeDays
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert("Product updated successfully!");

            await loadProducts();

        } catch (error) {

            console.error("Edit product error:", error);
            alert("Unable to update product: " + error.message);
        }
    }

    // Delete product
    async function deleteProduct(product) {

        const confirmed = confirm(
            "Are you sure you want to delete " +
            product.productName + "?"
        );

        if (!confirmed) return;

        try {

            const response = await fetch(`${API}/${product.id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert("Product deleted successfully!");

            await loadProducts();

        } catch (error) {

            console.error("Delete product error:", error);
            alert("Unable to delete product: " + error.message);
        }
    }

    // Upload products CSV
    async function uploadProductsCSV(file) {

        if (!file.name.toLowerCase().endsWith(".csv")) {
            alert("Please select a valid CSV file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {

            const response = await fetch(PRODUCTS_CSV_API, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Products CSV upload failed.");
            }

            alert(
                result.message +
                "\nRecords imported: " +
                result.recordsImported
            );

            await loadProducts();

        } catch (error) {

            console.error("Products CSV error:", error);
            alert("Products CSV upload error: " + error.message);

        } finally {
            productsFileInput.value = "";
        }
    }

    // Upload sales CSV
    async function uploadSalesCSV(file) {

        if (!file.name.toLowerCase().endsWith(".csv")) {
            alert("Please select a valid CSV file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {

            const response = await fetch(SALES_CSV_API, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Sales CSV upload failed.");
            }

            alert(
                result.message +
                "\nRecords imported: " +
                result.recordsImported
            );

        } catch (error) {

            console.error("Sales CSV error:", error);
            alert("Sales CSV upload error: " + error.message);

        } finally {
            salesFileInput.value = "";
        }
    }

    // Products CSV button
    uploadProductsButton.addEventListener("click", function () {
        productsFileInput.click();
    });

    productsFileInput.addEventListener("change", function () {

        const file = productsFileInput.files[0];

        if (file) {
            uploadProductsCSV(file);
        }
    });

    // Sales CSV button
    uploadSalesButton.addEventListener("click", function () {
        salesFileInput.click();
    });

    salesFileInput.addEventListener("change", function () {

        const file = salesFileInput.files[0];

        if (file) {
            uploadSalesCSV(file);
        }
    });

    // Other event listeners
    searchInput.addEventListener("input", filterProducts);
    leadTimeFilter.addEventListener("change", filterProducts);
    stockFilter.addEventListener("change", filterProducts);

    addProductButton.addEventListener("click", addProduct);

    // Initial load
    loadProducts();

    // Initialize icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

});
