document.addEventListener("DOMContentLoaded", function () {

```
// Temporary demonstration data.
// Actual forecast results will come from the backend later.

const forecasts = [
    {
        name: "Wireless Headphones",
        currentStock: 45,
        predictedDemand: 60,
        mae: 3.2,
        risk: "LOW",
        reorder: 20
    },
    {
        name: "Laptop Stand",
        currentStock: 7,
        predictedDemand: 25,
        mae: 2.5,
        risk: "HIGH",
        reorder: 30
    },
    {
        name: "Office Chair",
        currentStock: 0,
        predictedDemand: 18,
        mae: 1.8,
        risk: "HIGH",
        reorder: 25
    },
    {
        name: "USB-C Cable",
        currentStock: 80,
        predictedDemand: 55,
        mae: 2.1,
        risk: "LOW",
        reorder: 0
    },
    {
        name: "Desk Lamp",
        currentStock: 4,
        predictedDemand: 20,
        mae: 2.9,
        risk: "MEDIUM",
        reorder: 22
    }
];

const tableBody = document.getElementById("forecastTableBody");

// Update summary cards
function updateSummary() {

    const totalDemand = forecasts.reduce(
        (sum, item) => sum + item.predictedDemand, 0
    );

    const averageMAE = forecasts.reduce(
        (sum, item) => sum + item.mae, 0
    ) / forecasts.length;

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

// Display forecast table
function displayForecasts() {

    tableBody.innerHTML = "";

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

        reorderCell.textContent =
            item.reorder + " units";

        row.appendChild(reorderCell);

        tableBody.appendChild(row);
    });
}

// Create demand chart
function createForecastChart() {

    const canvas = document.getElementById("forecastChart");

    if (!canvas || !window.Chart) {
        console.error("Forecast chart could not be loaded.");
        return;
    }

    const labels = [
        "Mon", "Tue", "Wed", "Thu",
        "Fri", "Sat", "Sun"
    ];

    const historicalDemand = [12, 18, 15, 22, 19, 25, 21];

    const predictedDemand = [20, 23, 22, 27, 25, 29, 31];

    new Chart(canvas, {
        type: "line",

        data: {
            labels: labels,

            datasets: [
                {
                    label: "Historical Demand",
                    data: historicalDemand,
                    borderColor: "#6658df",
                    backgroundColor: "rgba(102, 88, 223, 0.10)",
                    fill: true,
                    tension: 0.4
                },
                {
                    label: "Predicted Demand",
                    data: predictedDemand,
                    borderColor: "#20b997",
                    backgroundColor: "rgba(32, 185, 151, 0.08)",
                    fill: true,
                    tension: 0.4
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

// Temporary forecast button
document.getElementById("runForecastBtn")
    .addEventListener("click", function () {

        alert(
            "Forecast calculation will be connected " +
            "to the backend forecasting algorithm later."
        );

    });

// Initialize page
updateSummary();
displayForecasts();
createForecastChart();

// Initialize icons
if (window.lucide) {
    window.lucide.createIcons();
}
```

});
