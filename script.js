let forecastChart;

function fetchData() {
  const country = document.getElementById('countrySelect').value;
  const countryName = document.getElementById('countryName');
  countryName.textContent = country;
  showLoading();

  // Fetch current COVID-19 data for the selected country
  fetch(`https://disease.sh/v3/covid-19/countries/${country}`)
    .then(res => res.json())
    .then(data => {
      hideLoading();
      updateLastUpdated();

      const cases = data.cases;
      const deaths = data.deaths;
      const recovered = data.recovered;
      
      // Create chart for current data
      const ctx = document.getElementById('chart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Cases', 'Deaths', 'Recovered'],
          datasets: [{
            label: 'COVID-19 Data',
            data: [cases, deaths, recovered],
            backgroundColor: ['#1e3a8a', '#e11d48', '#10b981'],
          }]
        }
      });
    });
}

function fetchHistoricalData(country) {
  fetch(`https://disease.sh/v3/covid-19/historical/${country}?lastdays=30`)
    .then(res => res.json())
    .then(data => {
      const timeline = data.timeline ? data.timeline : data; // Some responses vary
      const cases = timeline.cases;

      const dates = Object.keys(cases);
      const values = Object.values(cases);

      // Prepare data for ML
      const historicalData = values.slice(1); // Remove the first day, it's not useful for prediction
      const dateLabels = dates.slice(1);

      // Normalize data (important for machine learning models)
      const tensorData = tf.tensor2d(historicalData, [historicalData.length, 1]);

      // Building a simple Linear Regression model using TensorFlow.js
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

      model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

      const xs = tf.linspace(0, historicalData.length - 1, historicalData.length);
      const ys = tensorData;

      model.fit(xs, ys, { epochs: 100 }).then(() => {
        // Predict the next 7 days
        const predictionX = tf.linspace(historicalData.length, historicalData.length + 6, 7);
        model.predict(predictionX).array().then(forecastedData => {
          const forecastDates = [];
          const forecastValues = forecastedData.map(val => Math.round(val));

          for (let i = 1; i <= 7; i++) {
            forecastDates.push(`Day ${i}`);
          }

          // Prepare Actual vs Forecast data
          const actualData = historicalData.map((val, i, arr) => i === 0 ? 0 : val - arr[i - 1]).slice(1);

          if (forecastChart) forecastChart.destroy();
          forecastChart = new Chart(document.getElementById('forecastChart'), {
            type: 'line',
            data: {
              labels: [...dateLabels, ...forecastDates],
              datasets: [
                {
                  label: 'Actual Daily Cases',
                  data: actualData,
                  borderColor: '#3b82f6',
                  fill: false,
                  tension: 0.3
                },
                {
                  label: 'Forecasted Cases',
                  data: [...Array(actualData.length).fill(null), ...forecastValues],
                  borderColor: '#f43f5e',
                  borderDash: [5, 5],
                  fill: false,
                  tension: 0.3
                }
              ]
            }
          });
        });
      });
    });
}

// Fetching all country names dynamically
function loadCountryOptions() {
  fetch('https://disease.sh/v3/covid-19/countries')
    .then(res => res.json())
    .then(countries => {
      const countrySelect = document.getElementById('countrySelect');
      countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.countryInfo.iso2;
        option.textContent = country.country;
        countrySelect.appendChild(option);
      });
      // Default to first country in the list
      countrySelect.value = countries[0].countryInfo.iso2;
      fetchData();
      fetchHistoricalData(countries[0].countryInfo.iso2);
    });
}

function showLoading() {
  document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

function updateLastUpdated() {
  document.getElementById('lastUpdated').textContent = `Last updated: ${new Date().toLocaleString()}`;
}

loadCountryOptions();

