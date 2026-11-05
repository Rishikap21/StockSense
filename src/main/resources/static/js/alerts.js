document.addEventListener("DOMContentLoaded", function () {


// Temporary demonstration data.
// Real alerts will come from the backend later.

const alerts = [
    {
        name: "Laptop Stand",
        currentStock: 7,
        dailyDemand: 5,
        daysRemaining: 1.4,
        risk: "HIGH",
        reorder: 30
    },
    {
        name: "Office Chair",
        currentStock: 0,
        dailyDemand: 3,
        daysRemaining: 0,
        risk: "HIGH",
        reorder: 25
    },
    {
        name: "Desk Lamp",
        currentStock: 4,
        dailyDemand: 2,
        daysRemaining: 2,
        risk: "MEDIUM",
        reorder: 22
    },
    {
        name: "Wireless Headphones",
        currentStock: 45,
        dailyDemand: 3,
        daysRemaining: 15,
        risk: "LOW",
        reorder: 0
    },
    {
        name: "USB-C Cable",
        currentStock: 80,
        dailyDemand: 4,
        daysRemaining: 20,
        risk: "LOW",
        reorder: 0
    }
];

const tableBody = document.getElementById("alertsTableBody");
const searchInput = document.getElementById("alertSearch");
const riskFilter = document.getElementById("riskFilter");

// Update summary cards
function updateSummary() {

    document.getElementById("totalAlerts").textContent =
        alerts.length;

    document.getElementById("highRiskAlerts").textContent =
        alerts.filter(item => item.risk === "HIGH").length;

    document.getElementById("mediumRiskAlerts").textContent =
        alerts.filter(item => item.risk === "MEDIUM").length;

    document.getElementById("lowRiskAlerts").textContent =
        alerts.filter(item => item.risk === "LOW").length;
}

// Display alert records
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
            item.dailyDemand + " units",
            item.daysRemaining + " days"
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        // Risk badge
        const riskCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className =
            "risk-badge risk-" + item.risk.toLowerCase();

        badge.textContent = item.risk;

        riskCell.appendChild(badge);
        row.appendChild(riskCell);

        // Reorder quantity
        const reorderCell = document.createElement("td");

        reorderCell.textContent =
            item.reorder + " units";

        row.appendChild(reorderCell);

        tableBody.appendChild(row);
    });
}

// Search and filter alerts
function filterAlerts() {

    const searchText = searchInput.value.toLowerCase();
    const selectedRisk = riskFilter.value;

    const filteredAlerts = alerts.filter(item => {

        const matchesSearch =
            item.name.toLowerCase().includes(searchText);

        const matchesRisk =
            selectedRisk === "all" ||
            item.risk === selectedRisk;

        return matchesSearch && matchesRisk;
    });

    displayAlerts(filteredAlerts);
}

searchInput.addEventListener("input", filterAlerts);

riskFilter.addEventListener("change", filterAlerts);

// Refresh button
document.getElementById("refreshAlertsBtn")
    .addEventListener("click", function () {

        updateSummary();
        filterAlerts();

        alert("Alerts refreshed successfully!");
    });

// Initialize page
updateSummary();
displayAlerts(alerts);

// Initialize icons
if (window.lucide) {
    window.lucide.createIcons();
}


});
