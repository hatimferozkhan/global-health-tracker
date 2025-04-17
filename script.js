const countryDropdown = document.getElementById('country');
const chartCanvas = document.getElementById('healthChart');
let chart;

// Step 1: Fetch country list
fetch('https://restcountries.com/v3.1/all')
  .then(res => res.json())
  .then(data => {
    const sortedCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    sortedCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.name.common;
      option.textContent = country.name.common;
      countryDropdown.appendChild(option);
    });
  });

// Step 2: Listen for country selection
countryDropdown.addEventListener('change', () => {
  const selectedCountry = countryDropdown.value;
  fetchData(selectedCountry);
});

// Step 3: Fetch real data from API
function fetchData(countryName) {
  fetch(`https://disease.sh/v3/covid-19/countries/${countryName}?strict=true`)
    .then(res => res.json())
    .then(data => {
      const chartData = {
        labels: ['Cases', 'Deaths', 'Recovered', 'Active', 'Critical'],
        datasets: [{
          label: `${countryName} COVID-19 Stats`,
          data: [
            data.cases,
            data.deaths,
            data.recovered,
            data.active,
            data.critical
          ],
          backgroundColor: [
            '#1E3A8A',
            '#f87171',
            '#34d399',
            '#facc15',
            '#8b5cf6'
          ]
        }]
      };

      if (chart) chart.destroy();
      chart = new Chart(chartCanvas, {
        type: 'bar',
        data: chartData
      });
    })
    .catch(err => {
      alert("Data not found for this country. Try another.");
    });
}
