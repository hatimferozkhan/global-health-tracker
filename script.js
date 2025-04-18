// DOM elements
const countrySelect = document.getElementById('countrySelect');
const updateButton = document.getElementById('updateData');
const chartContainer = document.getElementById('chartContainer');
const loader = document.getElementById('loader');
const lastUpdated = document.getElementById('lastUpdated');

// Global variable for storing API data
let covidData = {};

// Helper function to fetch COVID-19 data by country
async function fetchCovidData(country = 'global') {
    const url = country === 'global' ? 
        'https://api.covid19api.com/summary' : 
        `https://api.covid19api.com/dayone/country/${country}`;
    
    loader.style.display = 'block';
    chartContainer.style.display = 'none';

    try {
        const response = await fetch(url);
        const data = await response.json();
        covidData = data;
        updateUI(country);
    } catch (error) {
        console.error("Error fetching data", error);
        alert("There was an error fetching the data. Please try again later.");
    } finally {
        loader.style.display = 'none';
        chartContainer.style.display = 'block';
    }
}

// Function to update the UI with new data
function updateUI(country) {
    const data = covidData.Countries ? covidData.Countries.find(c => c.Country === country) : null;
    const globalData = covidData.Global;

    if (country === 'global' && globalData) {
        updateStats(globalData);
    } else if (data) {
        updateStats(data);
    }

    // Update chart
    if (covidData.Countries) {
        const countryData = covidData.Countries.find(c => c.Country === country);
        const chartData = countryData ? countryData.Cases : [];
        createChart(chartData);
    }

    // Set last updated time
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
}

// Function to update COVID-19 stats on the page
function updateStats(data) {
    document.getElementById('totalCases').textContent = data.TotalConfirmed.toLocaleString();
    document.getElementById('totalDeaths').textContent = data.TotalDeaths.toLocaleString();
    document.getElementById('totalRecovered').textContent = data.TotalRecovered.toLocaleString();
    document.getElementById('totalActive').textContent = data.TotalActive.toLocaleString();
}

// Function to create a chart using Chart.js
function createChart(casesData) {
    const ctx = document.getElementById('covidChart').getContext('2d');
    const labels = casesData.map(item => new Date(item.Date).toLocaleDateString());
    const data = casesData.map(item => item.Confirmed);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Confirmed Cases',
                data: data,
                borderColor: '#1E3A8A',
                backgroundColor: 'rgba(30, 58, 138, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cases'
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }
            }
        }
    });
}

// Function to populate country selection dropdown
async function populateCountries() {
    const response = await fetch('https://api.covid19api.com/summary');
    const data = await response.json();
    const countries = data.Countries.map(country => country.Country);
    
    countrySelect.innerHTML = countries.map(country => 
        `<option value="${country}">${country}</option>`
    ).join('');
}

// Event listener for country selection change
countrySelect.addEventListener('change', () => {
    fetchCovidData(countrySelect.value);
});

// Initialize app
async function init() {
    await populateCountries();
    fetchCovidData('global');
}

// Initial call to load data
init();
