
document.addEventListener("DOMContentLoaded", function () {

    let alerts = [];

    const tableBody = document.getElementById("alertsTableBody");
    const searchInput = document.getElementById("alertSearch");
    const riskFilter = document.getElementById("riskFilter");
    const refreshButton = document.getElementById("refreshAlertsBtn");

    async function loadAlerts() {
        try {
            refreshButton.disabled = true;

            const response = await fetch("/api/alerts");

            if (!response.ok) {
                throw new Error("Unable to fetch alerts");
            }

            alerts = await response.json();

            updateSummary();
            filterAlerts();

        } catch (error) {
            console.error("Alerts error:", error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        Unable to load alerts. Please try again.
                    </td>
                </tr>
            `;
        } finally {
            refreshButton.disabled = false;
        }
    }

    function updateSummary() {
        document.getElementById("totalAlerts").textContent = alerts.length;

        document.getElementById("highRiskAlerts").textContent =
            alerts.filter(item => item.risk === "HIGH").length;

        document.getElementById("mediumRiskAlerts").textContent =
            alerts.filter(item => item.risk === "MEDIUM").length;

        document.getElementById("lowRiskAlerts").textContent =
            alerts.filter(item => item.risk === "LOW").length;
    }

    function displayAlerts(list) {
        tableBody.innerHTML = "";

        document.getElementById("alertCount").textContent =
            list.length + " alerts";

        document.getElementById("alertsFooter").textContent =
            "Showing " + list.length + " alerts";

        if (list.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 9;
            cell.className = "empty-state";
            cell.textContent = "No alerts found.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        list.forEach(item => {
            const row = document.createElement("tr");

            // Product name
            addCell(row, item.name);

            // Category
            addCell(row, item.category || "N/A");

            // Current stock
            addCell(row, item.currentStock + " units");

            // Category-specific minimum stock threshold
            addCell(
                row,
                item.minimumStockThreshold == null
                    ? "N/A"
                    : item.minimumStockThreshold + " units"
            );

            // Low stock status
            const stockCell = document.createElement("td");
            const stockBadge = document.createElement("span");

            stockBadge.className = item.lowStock
                ? "risk-badge risk-high"
                : "risk-badge risk-low";

            stockBadge.textContent = item.lowStock
                ? "LOW STOCK"
                : "NORMAL";

            stockCell.appendChild(stockBadge);
            row.appendChild(stockCell);

            // Daily demand
            addCell(
                row,
                Number(item.dailyDemand).toFixed(2) + " units"
            );

            // Days remaining
            addCell(
                row,
                item.daysRemaining == null
                    ? "N/A"
                    : Number(item.daysRemaining).toFixed(1) + " days"
            );

            // Stockout risk
            const riskCell = document.createElement("td");
            const riskBadge = document.createElement("span");

            const risk = String(item.risk || "UNKNOWN").toLowerCase();

            riskBadge.className = "risk-badge risk-" + risk;
            riskBadge.textContent = item.risk || "UNKNOWN";

            riskCell.appendChild(riskBadge);
            row.appendChild(riskCell);

            // Reorder quantity
            addCell(row, item.reorder + " units");

            tableBody.appendChild(row);
        });
    }

    function addCell(row, value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    }

    function filterAlerts() {
        const searchText = searchInput.value.toLowerCase();
        const selectedRisk = riskFilter.value;

        const filteredAlerts = alerts.filter(item => {

            const matchesSearch =
                (item.name || "").toLowerCase().includes(searchText) ||
                (item.category || "").toLowerCase().includes(searchText);

            const matchesRisk =
                selectedRisk === "all" || item.risk === selectedRisk;

            return matchesSearch && matchesRisk;
        });

        displayAlerts(filteredAlerts);
    }

    searchInput.addEventListener("input", filterAlerts);
    riskFilter.addEventListener("change", filterAlerts);

    refreshButton.addEventListener("click", loadAlerts);

    loadAlerts();

    if (window.lucide) {
        window.lucide.createIcons();
    }
});
