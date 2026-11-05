
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
                    <td colspan="6" class="empty-state">
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

            cell.colSpan = 6;
            cell.className = "empty-state";
            cell.textContent = "No alerts found.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        list.forEach(item => {
            const row = document.createElement("tr");

            const values = [
                item.name,
                item.currentStock + " units",
                Number(item.dailyDemand).toFixed(2) + " units",
                item.daysRemaining == null
                    ? "N/A"
                    : Number(item.daysRemaining).toFixed(1) + " days"
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const riskCell = document.createElement("td");
            const badge = document.createElement("span");

            badge.className = "risk-badge risk-" + item.risk.toLowerCase();
            badge.textContent = item.risk;

            riskCell.appendChild(badge);
            row.appendChild(riskCell);

            const reorderCell = document.createElement("td");
            reorderCell.textContent = item.reorder + " units";
            row.appendChild(reorderCell);

            tableBody.appendChild(row);
        });
    }

    function filterAlerts() {
        const searchText = searchInput.value.toLowerCase();
        const selectedRisk = riskFilter.value;

        const filteredAlerts = alerts.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchText);

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
