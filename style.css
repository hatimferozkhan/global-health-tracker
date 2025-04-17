const countrySelect = document.getElementById('countrySelect');
const chartCanvas = document.getElementById('chart');
let chart;

const countries = [
  'USA', 'Pakistan', 'India', 'Brazil', 'France', 'Germany', 'Japan',
  'UK', 'Russia', 'Canada', 'Italy', 'Australia'
];

countries.forEach(country => {
  const option = document.createElement('option');
  option.value = country;
  option.text = country;
  countrySelect.appendChild(option);
});

countrySelect.addEventListener('change', () => {
  const selectedCountry = countrySelect.value;
  fetchData(selectedCountry);
});

function fetchData(countryName) {
  document.getElementById('loader').style.display = 'block';

  fetch(`https://disease.sh/v3/covid-19/countries/${countryName}?strict=true`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('loader').style.display = 'none';

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
            '#1E3A8A', '#f87171', '#34d399', '#facc15', '#8b5cf6'
          ]
        }]
      };

      if (chart) chart.destroy();
      chart = new Chart(chartCanvas, {
        type: 'bar',
        data: chartData
      });

      document.getElementById('updatedTime').textContent =
        `Last Updated: ${new Date(data.updated).toLocaleString()}`;

      document.getElementById('flag').src = data.countryInfo.flag;
    })
    .catch(err => {
      document.getElementById('loader').style.display = 'none';
      alert("Data not found for this country. Try another.");
    });
}

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Auto-fetch first country's data
fetchData(countries[0]);
