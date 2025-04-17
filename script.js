const ctx = document.getElementById('dataChart').getContext('2d');
let chart;
const spinner = document.getElementById("spinner");
const lastUpdated = document.getElementById("lastUpdated");
const countryName = document.getElementById("countryName");
const flagIcon = document.getElementById("flagIcon");
const forecastContainer = document.getElementById("forecastContainer");
const themeToggle = document.getElementById("themeSwitch");

document.getElementById('fetchDataBtn').addEventListener('click', () => {
  const country = document.getElementById('countrySelect').value;
  if (country) {
    fetchData(country);
  }
});

// Theme Toggle
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

async function fetchData(country) {
  spinner.style.display = "inline-block";
  try {
    const res = await fetch(`https://disease.sh/v3/covid-19/historical/${country}?lastdays=30`);
    const json = await res.json();
    const timeline = json.timeline || {};
    const cases = timeline.cases || {};
    const dates = Object.keys(cases);
    const values = Object.values(cases);

    // Update UI
    countryName.textContent = json.country || country;
    flagIcon.textContent = getFlagEmoji(json.country);
    lastUpdated.textContent = "Last Updated: " + new Date().toLocaleString();

    // Draw chart
    drawChart(dates, values);

    // Forecast
    generateForecast(values);

  } catch (error) {
    alert("Error fetching data: " + error.message);
  } finally {
    spinner.style.display = "none";
  }
}

function drawChart(labels, data) {
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Confirmed Cases',
        data: data,
        borderColor: '#6b21a8',
        backgroundColor: 'rgba(107, 33, 168, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Convert country name to flag emoji
function getFlagEmoji(countryName) {
  const code = countryName.slice(0, 2).toUpperCase();
  return String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt()));
}

// AI Forecast (simple linear model using TensorFlow.js)
async function generateForecast(data) {
  const tfData = data.map((val, i) => ({ x: i, y: val }));
  const xs = tf.tensor1d(tfData.map(p => p.x));
  const ys = tf.tensor1d(tfData.map(p => p.y));

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

  await model.fit(xs, ys, { epochs: 100 });

  const future = [30, 31, 32, 33, 34];
  const preds = model.predict(tf.tensor1d(future)).arraySync();

  forecastContainer.innerHTML = `
    <h3>📈 5-Day Forecast</h3>
    <ul>
      ${future.map((day, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return `<li>${date.toDateString()}: <strong>${Math.round(preds[i])}</strong> cases</li>`;
      }).join("")}
    </ul>
  `;
}
