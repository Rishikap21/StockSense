document.addEventListener("DOMContentLoaded", function () {

    let forecasts = [];
    let forecastChart = null;

    const tableBody = document.getElementById("forecastTableBody");
    const runButton = document.getElementById("runForecastBtn");

    // Convert backend response into frontend format
    function mapForecast(item) {
        return {
            productId: item.productId,
            name: item.productName,
            currentStock: Number(item.currentStock || 0),
            predictedDemand: Number(item.predictedDemand || 0),
            mae: Number(item.mae || 0),
            risk: (item.stockoutRisk || "LOW").toUpperCase(),
            reorder: Number(item.reorderQuantity || 0),
            daysRemaining: item.daysRemaining,
            forecastDate: item.forecastDate
        };
    }

    // Fetch saved forecasts from backend
    async function loadForecasts() {

        try {
            tableBody.innerHTML =
                "<tr><td colspan='6'>Loading forecasts...</td></tr>";

            const response = await fetch("/api/forecasts");

            if (!response.ok) {
                throw new Error("Unable to load forecasts. Status: " + response.status);
            }

            const data = await response.json();

            const records = Array.isArray(data)
                ? data
                : data.content || data.forecasts || [];

            forecasts = records.map(mapForecast);

            updateSummary();
            displayForecasts();
            createForecastChart();

        } catch (error) {
            console.error("Forecast loading error:", error);

            tableBody.innerHTML =
                "<tr><td colspan='6'>Unable to load forecasts. Please try again.</td></tr>";
        }
    }

    // Update summary cards
    function updateSummary() {

        const totalDemand = forecasts.reduce(
            (sum, item) => sum + item.predictedDemand, 0
        );

        const averageMAE = forecasts.length
            ? forecasts.reduce((sum, item) => sum + item.mae, 0) / forecasts.length
            : 0;

        const highRisk = forecasts.filter(
            item => item.risk === "HIGH"
        ).length;

        const reorderCount = forecasts.filter(
            item => item.reorder > 0
        ).length;

        document.getElementById("forecastedDemand").textContent =
            totalDemand + " units";

        document.getElementById("averageMAE").textContent =
            averageMAE.toFixed(2);

        document.getElementById("highRiskCount").textContent =
            highRisk;

        document.getElementById("reorderCount").textContent =
            reorderCount;
    }

    // Display actual forecasts
    function displayForecasts() {

        tableBody.innerHTML = "";

        if (forecasts.length === 0) {
            tableBody.innerHTML =
                "<tr><td colspan='6'>No forecast records available.</td></tr>";
            return;
        }

        forecasts.forEach(item => {

            const row = document.createElement("tr");

            const values = [
                item.name,
                item.currentStock + " units",
                item.predictedDemand + " units",
                item.mae.toFixed(2)
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const riskCell = document.createElement("td");
            const riskBadge = document.createElement("span");

            riskBadge.className =
                "risk-badge risk-" + item.risk.toLowerCase();

            riskBadge.textContent = item.risk;

            riskCell.appendChild(riskBadge);
            row.appendChild(riskCell);

            const reorderCell = document.createElement("td");

            reorderCell.textContent = item.reorder + " units";

            row.appendChild(reorderCell);

            tableBody.appendChild(row);
        });
    }

    // Create chart using actual forecast data
    function createForecastChart() {

        const canvas = document.getElementById("forecastChart");

        if (!canvas || !window.Chart) {
            console.error("Forecast chart could not be loaded.");
            return;
        }

        if (forecastChart) {
            forecastChart.destroy();
        }

        const labels = forecasts.map(item => item.name);

        const currentStock = forecasts.map(
            item => item.currentStock
        );

        const predictedDemand = forecasts.map(
            item => item.predictedDemand
        );

        forecastChart = new Chart(canvas, {

            type: "bar",

            data: {
                labels: labels,

                datasets: [
                    {
                        label: "Current Stock",
                        data: currentStock,
                        backgroundColor: "#6658df"
                    },
                    {
                        label: "Predicted Demand",
                        data: predictedDemand,
                        backgroundColor: "#20b997"
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Units"
                        }
                    }
                }
            }
        });
    }

    // Run forecasting through backend
    async function runForecast() {

        try {

            runButton.disabled = true;
            runButton.textContent = "Generating...";

            const response = await fetch("/api/forecasts/run", {
                method: "POST"
            });

            if (!response.ok) {
                throw new Error("Forecast generation failed. Status: " + response.status);
            }

            alert("Forecasts generated successfully!");

            await loadForecasts();

        } catch (error) {

            console.error("Forecast generation error:", error);

            alert("Unable to generate forecasts. Please check the backend.");

        } finally {

            runButton.disabled = false;
            runButton.textContent = "Run Forecast";

        }
    }

    // Run Forecast button
    if (runButton) {
        runButton.addEventListener("click", runForecast);
    }

    // Initialize page
    loadForecasts();

    // Initialize icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

});