
document.addEventListener("DOMContentLoaded", function () {

    const productForm = document.getElementById("productForm");
    const message = document.getElementById("message");

    const productCodeInput = document.getElementById("productCode");
    const productNameInput = document.getElementById("productName");
    const categoryInput = document.getElementById("category");
    const currentStockInput = document.getElementById("currentStock");
    const leadTimeInput = document.getElementById("leadTimeDays");

    // Check whether this is Add or Edit mode
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    const isEditMode = productId !== null;

    const submitButton = productForm.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    // Load existing product details in Edit mode
    async function loadProduct() {

        try {
            const response = await fetch(`/api/products/${productId}`);

            if (!response.ok) {
                throw new Error("Unable to load product details.");
            }

            const product = await response.json();

            productCodeInput.value = product.productCode || "";
            productNameInput.value = product.productName || "";
            categoryInput.value = product.category || "";
            currentStockInput.value = product.currentStock ?? "";
            leadTimeInput.value = product.leadTimeDays ?? "";

            document.querySelector(
                ".product-form-container h2"
            ).textContent = "Edit Product";

            submitButton.textContent = "Update Product";

            message.textContent = "Edit the product details below.";
            message.style.color = "#666";

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";
        }
    }

    // Add or Update product
    productForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const product = {
            productCode: productCodeInput.value.trim(),
            productName: productNameInput.value.trim(),
            category: categoryInput.value,
            currentStock: Number(currentStockInput.value),
            leadTimeDays: Number(leadTimeInput.value)
        };

        if (
            !product.productCode ||
            !product.productName ||
            !product.category ||
            !Number.isInteger(product.currentStock) ||
            product.currentStock < 0 ||
            !Number.isInteger(product.leadTimeDays) ||
            product.leadTimeDays <= 0
        ) {
            message.textContent = "Please enter valid product details.";
            message.style.color = "red";
            return;
        }

        try {

            const url = isEditMode
                ? `/api/products/${productId}`
                : "/api/products";

            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            message.textContent = isEditMode
                ? "Product updated successfully!"
                : "Product added successfully!";

            message.style.color = "green";

            if (!isEditMode) {
                productForm.reset();
            }

        } catch (error) {

            console.error("Product form error:", error);

            message.textContent = isEditMode
                ? "Unable to update product. Please try again."
                : "Unable to add product. Please try again.";

            message.style.color = "red";
        }
    });

    // Load product only when editing
    if (isEditMode) {
        loadProduct();
    }

});
