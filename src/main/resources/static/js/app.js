// STOCKSENSE - DASHBOARD JAVASCRIPT

const API = {
    dashboard: "/api/dashboard/summary",
    alerts: "/api/alerts"
};

let inventoryChart = null;

// Load dashboard when page opens
document.addEventListener("DOMContentLoaded", function () {
    loadDashboard();
    loadAlerts();
});

// Fetch dashboard statistics
async function loadDashboard() {
    try {
        const response = await fetch(API.dashboard);

        if (!response.ok) {
            throw new Error("Dashboard data unavailable");
        }

        const data = await response.json();

        document.getElementById("totalProducts").textContent =
            data.totalProducts ?? "--";

        document.getElementById("totalSales").textContent =
            data.totalSales ?? "--";

        document.getElementById("lowStockProducts").textContent =
            data.lowStockProducts ?? "--";

        document.getElementById("highRiskProducts").textContent =
            data.highRiskProducts ?? "--";

        createInventoryChart(data);

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// Create inventory chart
function createInventoryChart(data) {
    const canvas = document.getElementById("inventoryChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const total = Number(data.totalProducts) || 0;
    const lowStock = Number(data.lowStockProducts) || 0;
    const highRisk = Number(data.highRiskProducts) || 0;

    const healthyStock = Math.max(0, total - lowStock - highRisk);

    if (inventoryChart) {
        inventoryChart.destroy();
    }

    inventoryChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: ["Healthy Stock", "Low Stock", "High Risk"],

            datasets: [{
                data: [healthyStock, lowStock, highRisk],
                backgroundColor: ["#6558d3", "#e89a36", "#df5263"],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            },

            cutout: "68%"
        }
    });
}

// Fetch stockout alerts
async function loadAlerts() {
    const tableBody = document.getElementById("alertTable");

    if (!tableBody) return;

    try {
        const response = await fetch(API.alerts);

        if (!response.ok) {
            throw new Error("Alerts unavailable");
        }

        const alerts = await response.json();

        if (!Array.isArray(alerts) || alerts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        No stockout alerts available.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = "";

        alerts.slice(0, 5).forEach(function (alert) {
            const row = document.createElement("tr");

            const values = [
                alert.productName || "Unnamed Product",
                alert.currentStock ?? 0,
                alert.stockoutRisk || "UNKNOWN",
                alert.recommendedQuantity ?? 0
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Alerts error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Unable to load alerts.
                </td>
            </tr>
        `;
    }
}