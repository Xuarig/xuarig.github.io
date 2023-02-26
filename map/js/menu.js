let currentUser;
let state = true;
let lastUpdate;
let temperatureChart;
let rainChart;

let loadingInfoState = new LoadingState(6, () => {
    document.getElementById("loader-info").classList.add("inactive");
    document.getElementById("loader-info").classList.remove("unselectable");
}, () => {
    document.getElementById("loader-info").classList.remove("inactive");
    document.getElementById("loader-info").classList.add("unselectable");
}, [
    "Le monde est grand, explorez-le !",
    "Nous vous souhaitons une bonne journée !",
    "La beauté est dans le regard de celui qui regarde",
    "Regardez profondément dans la nature, et alors vous comprendrez tout beaucoup mieux.",
    "La nature est un livre que l'on peut lire sans jamais l'avoir fini.",
    "Regardez profondément dans la nature, et alors vous comprendrez tout beaucoup mieux."

], tip => {
    document.getElementById("loader-info-tip").innerHTML = tip;
});

function initInfo() {
    loadButtons();

    setInterval(() => {
        if (!state) {
            return;
        }

        if (currentUser === undefined || currentUser === null) {
            return;
        }

        openInfo(currentUser);
    }, 5 * 60000);
}

function updateLastUpdate() {
    lastUpdate = new Date();

    document.getElementById("info-last-update").innerHTML = "Dernière mise à jour : " + lastUpdate.toLocaleTimeString();
}

function openInfo(user) {
    if (state && currentUser !== undefined && currentUser !== null && currentUser === user) {
        return;
    }

    state = true;

    new Promise((resolve, reject) => {
        if (!(user instanceof User)) {
            resolve.apply(this);
            return;
        }

        loadingInfoState.reset(() => {
            if (!state) {
                reject.apply(this);
                return;
            }

            resolve.apply(this);

            state = false;
            openInfo(user);
        }, 5000, () => {
            if (state && currentUser === user) {
                closeInfo();
            }
        });

        // Load data
        loadLocationData(user);
        loadUserData(user);

        getMeteo(user, reject);

        currentUser = user;

        resolve.apply(this);
    }).then(() => {
        updateLastUpdate();
        document.getElementById("info").classList.add("active");
    }).catch(() => {
        console.log("Unable to load data");
    });
}

function getMeteo(user, reject) {
    fetchTime(user.getCoords().latitude, user.getCoords().longitude).then(response => {
        if (response === null) {
            reject.apply(this);
            return;
        }

        loadMeteoData(user.meteo, response);
    }).catch(error => {
        console.log(error);
    });
}

function loadButtons() {
    document.getElementById("info-x").onclick = closeInfo;
    document.getElementById("info-location").onclick = () => {
        if (currentUser === undefined || currentUser === null) {
            return;
        }

        centerMap(currentUser.getCoords().latitude, currentUser.getCoords().longitude, 10);
    };

    document.getElementById("info-reload").onclick = () => {
        if (currentUser === undefined || currentUser === null) {
            return;
        }

        state = false;
        openInfo(currentUser);
    }

    document.getElementById("info-delete").onclick = () => {
        if (currentUser === undefined || currentUser === null) {
            return;
        }

        currentUser.marker.remove();
        closeInfo();
    }
}

function loadLocationInfo(user) {
    if(user.city === undefined) {
        document.getElementById("city-name").style.display = "none";
    } else {
        document.getElementById("city-name").style.display = null;
    }

    if(user.country === undefined) {
        document.getElementById("city-country").style.display = "none";
    } else {
        document.getElementById("city-country").style.display = null;
    }

    document.getElementById("city-name").innerHTML = user.city;

    setCountry(user.country, user.countryCode);

    loadingInfoState.addCheck("coords");
}

function loadLocationData(user) {
    fetchTime(user.getCoords().latitude, user.getCoords().longitude).then(response => {
        if (response.cityName === undefined || response.countryName === undefined) {
            loadLocationInfo(user);

            console.log("Unable to fetch location data");
            return;
        }

        user.setCity(response.cityName);
        user.setCountry(response.countryName);

        loadLocationInfo(user);
    }).catch(error => {
        console.log(error);
    });
}

function setCountry(country, code) {
    document.getElementById("city-country").innerHTML = (code === undefined ? "" : "<img crossorigin='anonymous' class='country_flag' src='https://www.countryflagsapi.com/png/" + code + "'/> ") + country
}

function loadUserData(user) {
    if(user.name === undefined) {
        document.getElementById("info-user").style.display = "none";
        loadingInfoState.addCheck("user");
        loadingInfoState.addCheck("avatar");
        return;
    }

    document.getElementById("info-user").style.display = "flex";

    if (user.name === null) {
        document.getElementById("user-name").innerHTML = "<b>C'est vous...</b>";
        document.getElementById("user-age").hidden = true;
        document.getElementById("user-avatar").hidden = true

        loadingInfoState.addCheck("user");
        loadingInfoState.addCheck("avatar");
        return;
    }

    document.getElementById("user-age").hidden = false;
    document.getElementById("user-avatar").hidden = false;

    document.getElementById("user-name").innerHTML = user.name;
    document.getElementById("user-age").innerHTML = user.age + " ans";

    document.getElementById("user-avatar").onload = () => {
        loadingInfoState.addCheck("avatar");
    };

    document.getElementById("user-avatar").src = user.profilePicture;

    loadingInfoState.addCheck("user");
}

function loadMeteoData(meteo, time) {
    let hourlyIndex = 0;

    console.log("Loading meteo data");

    if (time === null || time === undefined || meteo === null || meteo === undefined) {
        console.log("Unable to load meteo data");
        return;
    }

    if(meteo.error === true) {
        console.log("Unable to load meteo data");
        console.log("Error : " + meteo.reason);

        document.getElementById("meteo-icon").innerHTML = generateIcon("wi-na");
        document.getElementById("meteo-type-text").innerHTML = "Météo indisponible";

        document.getElementById("meteo-infolist").style.visibility = "hidden";

        loadingInfoState.forcePass();

        return;
    }

    document.getElementById("meteo-infolist").style.visibility = "visible";

    const hourly = meteo.hourly;
    const daily = meteo.daily;
    const currentWeather = meteo.current_weather;

    for (let i = 0; i < hourly.time.length; i++) {
        const time = hourly.time[i];

        if (new Date(time).getTime() === new Date(currentWeather.time).getTime()) {
            hourlyIndex = i;
            break;
        }
    }

    new Promise(resolve => {
        drawTemperatureChart(meteo, hourlyIndex);
        resolve.apply(this);
    }).then(() => loadingInfoState.addCheck("tempGraph"))
        .catch(() => console.log("Unable to load temperature chart"));

    new Promise(resolve => {
        drawPrecipitationChart(meteo, hourlyIndex);
        resolve.apply(this);
    }).then(() => loadingInfoState.addCheck("rainGraph"))
        .catch(() => console.log("Unable to load precipitation chart"));


    const temperature = hourly.temperature_2m[hourlyIndex];
    const apparentTemperature = hourly.apparent_temperature[hourlyIndex];
    const visibility = hourly.visibility[hourlyIndex];
    const humidity = hourly.relativehumidity_2m[hourlyIndex];
    const pressure = hourly.surface_pressure[hourlyIndex];
    const cloudCover = hourly.cloudcover[hourlyIndex];

    const windSpeed = currentWeather.windspeed;
    const windDirection = currentWeather.winddirection;

    const sunrise = daily.sunrise[0];
    const sunset = daily.sunset[0];
    const precipitation = daily.precipitation_sum[0];
    const precipitationHours = daily.precipitation_hours[0];

    const timeString = timeToString(time.formatted);

    if (timeString != null) {
        document.getElementById("meteo-time").innerHTML = "<b>Heure :</b> " + timeString;
    }

    const day = isDay(timeString == null ? timeString : time.formatted, sunrise, sunset);

    document.getElementById("meteo-icon").innerHTML = generateIcon(getIcon(currentWeather.weathercode, day));
    document.getElementById("meteo-type-text").innerHTML = getWeatherName(currentWeather.weathercode, day);

    document.getElementById("meteo-time").style.visibility = timeString != null ? "visible" : "hidden";
    document.getElementById("meteo-time").style.height = timeString != null ? null : "0";

    document.getElementById("meteo-sunrise").innerHTML = "<b>Lever du soleil :</b> " + timeToString(sunrise);
    document.getElementById("meteo-sunset").innerHTML = "<b>Coucher du soleil :</b> " + timeToString(sunset);

    document.getElementById("meteo-temperature").innerHTML = "<b>Température :</b> " + temperature + "°C";
    document.getElementById("meteo-apparent-temperature").innerHTML = "<b>Température ressentie :</b> " + apparentTemperature + "°C";

    if (precipitation === 0) {
        document.getElementById("meteo-precipitation").innerHTML = "<b>Précipitations :</b> Aucune";
    } else {
        document.getElementById("meteo-precipitation").innerHTML = "<b>Précipitations :</b> " + precipitation + "mm (" + precipitationHours + "h)";
    }

    document.getElementById("meteo-clouds").innerHTML = "<b>Couverture nuageuse :</b> " + cloudCover + "%";
    document.getElementById("meteo-wind").innerHTML = "<b>Vent :</b> " + generateIcon(getWindDirectionIcon(windDirection)) + " " + windSpeed + " km/h";
    document.getElementById("meteo-humidity").innerHTML = "<b>Humidité :</b> " + humidity + "%";
    document.getElementById("meteo-pressure").innerHTML = "<b>Pression :</b> " + pressure + " hPa (" + getPressureText(pressure) + ")";
    document.getElementById("meteo-visibility").innerHTML = "<b>Visibilité :</b> " + getVisibilityText(visibility);

    loadingInfoState.addCheck("meteo");
}

function drawTemperatureChart(meteo, hourlyIndex) {
    const canvas = document.getElementById("meteo-chart-temp-canvas");

    if (temperatureChart !== null && temperatureChart !== undefined) {
        temperatureChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    const hourly = meteo.hourly;

    const dataWidth = 12;

    const filteredTime = filterData(hourly.time, hourlyIndex - dataWidth, hourlyIndex + dataWidth);
    const temperature = filterData(hourly.temperature_2m, hourlyIndex - dataWidth, hourlyIndex + dataWidth);
    const apparentTemperature = filterData(hourly.apparent_temperature, hourlyIndex - dataWidth, hourlyIndex + dataWidth);

    temperatureChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: filteredTime.map(time => timeToString(time)),
            datasets: [{
                label: "Température",
                data: temperature,
                borderColor: "red",
                borderWidth: 2,
                pointRadius: 0,
                hitRadius: 20,
                cubicInterpolationMode: "monotone"
            }, {
                label: "Température ressentie",
                data: apparentTemperature,
                borderColor: "blue",
                borderWidth: 2,
                pointRadius: 0,
                hitRadius: 20,
                cubicInterpolationMode: "monotone"
            }]
        },
        options: {
            legend: {
                display: true,
                position: "bottom"
            },
            interaction: {
                mode: 'nearest'
            }
        }
    });

    if(!SETTINGS.graphics.temperature) {
        canvas.style.display = "none";
    } else {
        canvas.style.display = null;
    }
}

function drawPrecipitationChart(meteo, hourlyIndex) {
    const canvas = document.getElementById("meteo-chart-rain-canvas");

    if (rainChart !== null && rainChart !== undefined) {
        rainChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    const hourly = meteo.hourly;

    const dataWidth = 12;

    const filteredTime = filterData(hourly.time, hourlyIndex - dataWidth, hourlyIndex + dataWidth);
    const precipitation = filterData(hourly.rain, hourlyIndex - dataWidth, hourlyIndex + dataWidth);

    if (precipitation.every(precipitation => precipitation === 0)) {
        canvas.hidden = true;

        return;
    }

    canvas.hidden = false;

    rainChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: filteredTime.map(time => timeToString(time)),
            datasets: [{
                label: "Précipitations",
                data: precipitation,
                borderColor: "blue",
                borderWidth: 2,
                pointRadius: 0,
                hitRadius: 20,
                cubicInterpolationMode: "monotone"
            }]
        },
        options: {
            legend: {
                display: true,
                position: "bottom"
            },
            interaction: {
                mode: 'nearest'
            }
        }
    });

    if(!SETTINGS.graphics.rain) {
        canvas.style.display = "none";
    } else {
        canvas.style.display = null;
    }
}

function closeInfo() {
    if (state === false) return;

    state = false;

    document.getElementById("info").classList.remove("active");
}
