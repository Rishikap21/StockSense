document.addEventListener("DOMContentLoaded", function () {


const products = [
    { name: "Wireless Headphones", sku: "SS-1001", category: "Electronics", price: 2499, stock: 45, minimumStock: 10 },
    { name: "Laptop Stand", sku: "SS-1002", category: "Accessories", price: 899, stock: 7, minimumStock: 10 },
    { name: "Office Chair", sku: "SS-1003", category: "Furniture", price: 5499, stock: 0, minimumStock: 5 },
    { name: "USB-C Cable", sku: "SS-1004", category: "Electronics", price: 399, stock: 80, minimumStock: 15 },
    { name: "Desk Lamp", sku: "SS-1005", category: "Furniture", price: 1299, stock: 4, minimumStock: 8 }
];

const tableBody = document.getElementById("productsTableBody");
const searchInput = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");
const stockFilter = document.getElementById("stockFilter");

function getStockStatus(product) {
    if (product.stock === 0) return "out-of-stock";
    if (product.stock <= product.minimumStock) return "low-stock";
    return "in-stock";
}

function updateSummary() {
    document.getElementById("totalProducts").textContent = products.length;

    document.getElementById("inStockProducts").textContent =
        products.filter(p => getStockStatus(p) === "in-stock").length;

    document.getElementById("lowStockProducts").textContent =
        products.filter(p => getStockStatus(p) === "low-stock").length;

    document.getElementById("outOfStockProducts").textContent =
        products.filter(p => getStockStatus(p) === "out-of-stock").length;
}

function populateCategories() {
    const categories = [...new Set(products.map(p => p.category))];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function displayProducts(list) {
    tableBody.innerHTML = "";

    document.getElementById("productCount").textContent =
        list.length + " products";

    document.getElementById("tableFooterText").textContent =
        "Showing " + list.length + " products";

    if (list.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "empty-state";
        cell.textContent = "No products found.";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    list.forEach(product => {
        const status = getStockStatus(product);

        let statusLabel = "In Stock";

        if (status === "low-stock") statusLabel = "Low Stock";
        if (status === "out-of-stock") statusLabel = "Out of Stock";

        const row = document.createElement("tr");

        const values = [
            product.name,
            product.sku,
            product.category,
            "₹" + product.price.toLocaleString("en-IN"),
            product.stock + " units"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "risk-badge risk-" + status;
        badge.textContent = statusLabel;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    });
}

function filterProducts() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStock = stockFilter.value;

    const filtered = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.sku.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        const matchesStock =
            selectedStock === "all" ||
            getStockStatus(product) === selectedStock;

        return matchesSearch && matchesCategory && matchesStock;
    });

    displayProducts(filtered);
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
stockFilter.addEventListener("change", filterProducts);

document.getElementById("uploadCsvBtn").addEventListener("click", function () {
    document.getElementById("csvFileInput").click();
});

document.getElementById("csvFileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file) {
        alert("Selected file: " + file.name +
            "\nCSV upload will be connected to the backend later.");
    }
});

document.getElementById("addProductBtn").addEventListener("click", function () {
    alert("Add Product functionality will be implemented later.");
});

updateSummary();
populateCategories();
displayProducts(products);

if (window.lucide) {
    window.lucide.createIcons();
}


});
