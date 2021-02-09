'use strict';

const API_KEY = `dd6e11e723684666ae4fd838a1d7c4ef`;

let searches = getSearches();

// LocalStorage helpers
function getSearches() {
    return JSON.parse(localStorage.getItem("searches") || "[]");
}

function setSearches() {
    localStorage.setItem("searches", JSON.stringify(searches));
}
// END LocalStorage helpers

function renderSearchlist() {
    $('#history').empty();

    for (let i = 0; i < searches.length; i++) {
        const search = searches[i];
    
        $('#history').append(`<a href="#" class="list-group-item list-group-item-action" onclick="renderWeatherUIForCity('${search}')">${search}</a>`);
    }
}

function addToSearchHistory(search) {
    const cleanSearch = search.trim();

    // Exit early if search is blank
    if (!cleanSearch) {
        return;
    }

    // Add search to searches
    searches.unshift(search);

    // Limit is 10 search terms
    searches = searches.slice(0, 9);

    // Clear input's value
    $("#search-input").val("");

    // Rerender list
    renderSearchlist();

    // Store search in localStorage
    setSearches();
}

function renderWeatherUIForCity(city) {
    return queryForCurrentWeather(city).then(currentWeather => {
        if (!currentWeather) {
            alert("No weather information found for that city");
            return;
        }

        // Render current weather
        readerCurrentWeather(currentWeather);

        queryForUVIndex(currentWeather.lat, currentWeather.lon).then(uvIndex => {
            renderUVIndex(uvIndex);
        });

        queryForForecast(currentWeather.lat, currentWeather.lon).then(forecast => {
            renderForecast(forecast);
        });

        return currentWeather;
    });
}

function renderUVIndex(uvIndex) {
    $('#uv-index-text').text(uvIndex);
}

function renderForecast(forecast) {
    $('#forecast-container').empty();

    $('#forecast-container').append(
        `<div class="forecast-header">${forecast.length}-Day Forecast</div>
        <div id="forecast-elements"></div>`
    );

    for (const forecastElement of forecast) {
        $('#forecast-elements').append(
            `<div class="forecast-element">
                <div class="forecast-element-header">${forecastElement.dateString}</div>
                <div>
                    <img id="current-weather-icon" src="https://openweathermap.org/img/wn/${forecastElement.icon}">
                </div>
                <div class="current-weather-list-item">Temp: ${forecastElement.temperature} °F</div>
                <div class="current-weather-list-item">Humidity: ${forecastElement.humidity}%</div>
            </div>`
        );
    }
}

function performSearch() {
    // get input's value
    const inputValue = $("#search-input").val();

    if (!inputValue.trim()) {
        alert("Please type a city");
        // TODO: Maybe I'd validate that what they typed was a valid city
        return;
    }

    return renderWeatherUIForCity(inputValue).then(currentWeather => {
        // Add input's value to searches
        addToSearchHistory(currentWeather.name);// Store what was found
    });
}

function readerCurrentWeather(currentWeather) {
    $('#current-weather').html(
        `<div class="current-weather-header-container">
            <span class="current-weather-header">${currentWeather.name} (${currentWeather.dateString}) </span>
            <img id="current-weather-icon" src="https://openweathermap.org/img/wn/${currentWeather.icon}">
        </div>

        <div class="current-weather-list">
            <div class="current-weather-list-item">Temperature: ${currentWeather.temperature} °F</div>
            <div class="current-weather-list-item">Humidity: ${currentWeather.humidity}%</div>
            <div class="current-weather-list-item">Wind Speed: ${currentWeather.windSpeed} MPH</div>
            <div class="current-weather-list-item">UV Index: <span id="uv-index-text">...</span></div>
        </div>`
    );
}

function clearSearch() {
    searches = [];

    setSearches();

    // Rerender list
    renderSearchlist();
}

// https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey
// https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

function queryForCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`;

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
    }).then(res => {
        return {
            id: res?.id,
            name: res?.name,// May be different than what was searched
            temperature: res?.main?.temp,
            humidity: res?.main?.humidity,
            windSpeed: res?.wind?.speed,
            icon: (res?.weather?.[0].icon || '13n') + '.png',
            dateString: new Date(res.dt * 1000).toLocaleDateString(),
            lat: res?.coord?.lat,
            lon: res?.coord?.lon,
        };
    }).catch(error => {
        console.error(error);
        return;
    });
}

function queryForUVIndex(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
    }).then(res => {
        return res?.value;
    });
}

function queryForForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${API_KEY}`;

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
    }).then(res => {
        const forecast = [];

        if (res.daily) {
            for (let i = 0; i < res.daily.length; i++) {
                if (i > 4) {
                    break;
                }

                const hour = moment().hour();

                let selector = 'day';

                if (hour < 8) {
                    selector = 'morn';
                } else if (hour < 12) {
                    selector = 'day';
                } else if (hour < 17) {
                    selector = 'eve';
                } else {
                    selector = 'night';
                }

                const currentDay = res.daily[i];

                forecast.push({
                    temperature: currentDay?.temp?.[selector],
                    humidity: currentDay?.humidity,
                    icon: (currentDay?.weather?.[0].icon || '13n') + '.png',
                    dateString: new Date(currentDay.dt * 1000).toLocaleDateString(),
                });
            }
        }

        return forecast;
    });
}

renderSearchlist();
