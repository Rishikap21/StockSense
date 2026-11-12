
document.addEventListener("DOMContentLoaded", function () {

    // API endpoints
    const API = "/api/products";
    const PRODUCTS_CSV_API = "/api/csv/upload/products";
    const SALES_CSV_API = "/api/csv/upload/sales";

    let products = [];
    let selectedProductToDelete = null;

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

    // Notification elements
    const notification = document.getElementById("productNotification");

    // Delete modal elements
    const deleteModal = document.getElementById("deleteModal");
    const deleteMessage = document.getElementById("deleteMessage");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

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
        addProductButton,
        notification,
        deleteModal,
        deleteMessage,
        cancelDeleteBtn,
        confirmDeleteBtn
    ];

    if (requiredElements.some(element => !element)) {
        console.error("Products page HTML elements are missing. Check element IDs.");
        return;
    }

    // Show website notification
    function showProductNotification(text, type = "success") {

        notification.textContent = text;
        notification.className = "product-notification " + type;
        notification.hidden = false;

        window.clearTimeout(notification.hideTimer);

        notification.hideTimer = window.setTimeout(function () {
            notification.hidden = true;
        }, 3500);
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

    // Determine stock status using category threshold
    function getStockStatus(product) {

        const stock = Number(product.currentStock);
        const threshold = Number(product.minimumStockThreshold);

        if (stock <= 0) {
            return "out-of-stock";
        }

        if (stock <= threshold) {
            return "low-stock";
        }

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
                openDeleteModal(product);
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

    // Edit product - open separate form page
    function editProduct(product) {
        window.location.href = `/form?id=${product.id}`;
    }

    // Open custom delete confirmation modal
    function openDeleteModal(product) {

        selectedProductToDelete = product;

       deleteMessage.textContent =
    `Are you sure you want to delete "${product.productName}"?`;
        deleteModal.hidden = false;

    }

    // Close custom delete confirmation modal
    function closeDeleteModal() {

        deleteModal.hidden = true;
        selectedProductToDelete = null;

        confirmDeleteBtn.disabled = false;
    }

    // Cancel deletion
    cancelDeleteBtn.addEventListener("click", function () {
        closeDeleteModal();
    });

    // Close modal when clicking outside the popup
    deleteModal.addEventListener("click", function (event) {

        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });

    // Close modal using Escape key
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" && !deleteModal.hidden) {
            closeDeleteModal();
        }
    });

    // Confirm and delete product
    confirmDeleteBtn.addEventListener("click", async function () {

        if (!selectedProductToDelete) {
            return;
        }

        const productId = selectedProductToDelete.id;

        confirmDeleteBtn.disabled = true;

        try {

            const response = await fetch(`${API}/${productId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Unable to delete product.");
            }

            closeDeleteModal();

            await loadProducts();

            showProductNotification(
                "Product deleted successfully!"
            );

        } catch (error) {

            console.error("Delete product error:", error);

            closeDeleteModal();

            showProductNotification(
                "Unable to delete product. Please try again.",
                "error"
            );
        }
    });

    // Upload products CSV
    async function uploadProductsCSV(file) {

        if (!file.name.toLowerCase().endsWith(".csv")) {
            showProductNotification(
                "Please select a valid CSV file.",
                "error"
            );
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

            showProductNotification(
                result.message + " Records imported: " + result.recordsImported
            );

            await loadProducts();

        } catch (error) {

            console.error("Products CSV error:", error);

            showProductNotification(
                "Products CSV upload error: " + error.message,
                "error"
            );

        } finally {
            productsFileInput.value = "";
        }
    }

    // Upload sales CSV
    async function uploadSalesCSV(file) {

        if (!file.name.toLowerCase().endsWith(".csv")) {
            showProductNotification(
                "Please select a valid CSV file.",
                "error"
            );
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

            showProductNotification(
                result.message + " Records imported: " + result.recordsImported
            );

        } catch (error) {

            console.error("Sales CSV error:", error);

            showProductNotification(
                "Sales CSV upload error: " + error.message,
                "error"
            );

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

    // Search and filter event listeners
    searchInput.addEventListener("input", filterProducts);
    leadTimeFilter.addEventListener("change", filterProducts);
    stockFilter.addEventListener("change", filterProducts);

    // Add Product button redirects to separate form page
    addProductButton.addEventListener("click", function () {
        window.location.href = "/form";
    });

    // Initial load
    loadProducts();

    // Initialize icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

});
