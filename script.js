// AAPKI NAYI API KEY
const API_KEY = '1be044b9c22f5b5dbfa44b8b98422c98';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const historyList = document.getElementById('history-list');
const toggleSwitch = document.getElementById('checkbox');
const weatherMain = document.getElementById('weather-main');
const forecastContainer = document.getElementById('forecast-container');

// State Array for History
let searchHistory = JSON.parse(localStorage.getItem('modernWeatherHistory')) || [];

// --- Init App ---
function init() {
    renderHistory();
    checkTheme();
}

// --- Fetch Weather Logic ---
async function getWeather(city) {
    if (!city) return;

    try {
        // Fetch Current Weather
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!currentRes.ok) throw new Error('City not found!');
        const currentData = await currentRes.json();

        // Fetch 5-Day Forecast
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();

        updateCurrentUI(currentData);
        updateForecastUI(forecastData);
        saveToHistory(city);
        
    } catch (error) {
        alert(error.message);
    }
}

// --- Update Current Weather UI ---
function updateCurrentUI(data) {
    weatherMain.classList.remove('hidden');
    
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    
    const options = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);
    
    document.getElementById('current-temp').textContent = `${Math.round(data.main.temp)}°`;
    document.getElementById('feels-like-temp').textContent = `${Math.round(data.main.feels_like)}°`;
    document.getElementById('current-desc').textContent = data.weather[0].description;
    
    document.getElementById('current-wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('current-humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('current-pressure').textContent = `${data.main.pressure} hPa`;
    
    const iconCode = data.weather[0].icon;
    document.getElementById('current-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`; // Using larger icon
}

// --- Update Forecast UI ---
function updateForecastUI(data) {
    forecastContainer.innerHTML = '';

    // Filter for 1 reading per day (at 12:00 PM)
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyData.forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;
        const desc = day.weather[0].main;

        const card = document.createElement('div');
        card.className = 'forecast-card glass-effect';
        card.innerHTML = `
            <h4>${date}</h4>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">
            <h3>${temp}°C</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">${desc}</p>
        `;
        forecastContainer.appendChild(card);
    });
}

// --- Search History Logic ---
function saveToHistory(city) {
    const cityStr = city.toLowerCase();
    
    if (!searchHistory.includes(cityStr)) {
        searchHistory.unshift(cityStr); 
        if (searchHistory.length > 5) searchHistory.pop(); // Max 5 recent searches
        localStorage.setItem('modernWeatherHistory', JSON.stringify(searchHistory));
        renderHistory();
    }
}

function renderHistory() {
    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid fa-clock-rotate-left" style="margin-right: 10px; opacity: 0.5;"></i> ${city}`;
        li.addEventListener('click', () => getWeather(city));
        historyList.appendChild(li);
    });
}

// --- Theme Switch Logic (Light/Dark Mode) ---
function checkTheme() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);

// --- Event Listeners ---
searchBtn.addEventListener('click', () => {
    getWeather(cityInput.value.trim());
    cityInput.value = '';
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather(cityInput.value.trim());
        cityInput.value = '';
    }
});

// Run Init
init();