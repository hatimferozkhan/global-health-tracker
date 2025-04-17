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
      option.value = country.cca2;
      option.textContent = country.name.common;
      countryDropdown.appendChild(option);
    });
  });

countryDropdown.addEventListener('change', () => {
  const selected = countryDropdown.value;
  fetchData(selected);
});

function fetchData(countryCode) {
  // Placeholder chart update
  const dummyData = {
    labels: ['Cases', 'Deaths', 'Recovered'],
    datasets: [{
      label: 'COVID Stats',
      data: [Math.random()*100000, Math.random()*50000, Math.random()*70000],
      backgroundColor: ['#1E3A8A', '#f87171', '#34d399'],
    }]
  };

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: 'bar',
    data: dummyData,
  });
}
