// Select elements
const statsSection = document.getElementById("stats");
const lastUpdatedText = document.getElementById("lastUpdated");
const loader = document.getElementById("loader");
const forecastChartElement = document.getElementById("forecastChart");
const themeToggle = document.getElementById("themeToggle");

// Enable dark/light mode toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Show loader initially
loader.style.display = "flex";
forecastChartElement.style.display = "none";

// Fetch data from APIs
Promise.all([
  fetch("https://disease.sh/v3/covid-19/countries").then(res => res.json()),
  fetch("https://disease.sh/v3/covid-19/all").then(res => res.json()),
])
.then(([countriesData, globalData]) => {
  loader.style.display = "none";
  forecastChartElement.style.display = "block";
  displayStats(countriesData);
  renderForecastChart(globalData);
  const now = new Date();
  lastUpdatedText.textContent = `Last Updated: ${now.toLocaleString()}`;
})
.catch(err => {
  console.error("Error fetching data:", err);
  statsSection.innerHTML = `<p style="color: red;">Failed to load data. Please try again later.</p>`;
});

function displayStats(countries) {
  statsSection.innerHTML = ""; // Clear before rendering

  countries.forEach(country => {
    const card = document.createElement("div");
    card.className = "country-card";

    card.innerHTML = `
      <h3>
        <img class="flag" src="${country.countryInfo.flag}" alt="${country.country} Flag">
        ${country.country}
      </h3>
      <p><strong>Cases:</strong> ${country.cases.toLocaleString()}</p>
      <p><strong>Recovered:</strong> ${country.recovered.toLocaleString()}</p>
      <p><strong>Deaths:</strong> ${country.deaths.toLocaleString()}</p>
    `;

    statsSection.appendChild(card);
  });
}

// Render forecasting chart
function renderForecastChart(globalData) {
  const days = 14;
  const baseCases = globalData.cases;
  const avgIncrease = 150000; // Simple assumption
  const labels = [];
  const predictions = [];

  for (let i = 1; i <= days; i++) {
    labels.push(`Day ${i}`);
    predictions.push(baseCases + avgIncrease * i);
  }

  const ctx = document.getElementById("forecastChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Projected Cases (next 14 days)",
        data: predictions,
        backgroundColor: "rgba(30, 58, 138, 0.2)",
        borderColor: "rgba(30, 58, 138, 1)",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: value => value.toLocaleString()
          }
        }
      }
    }
  });
}
