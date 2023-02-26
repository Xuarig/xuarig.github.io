class User {
    constructor(name, age, profilePicture, city, country) {
        this.name = name;
        this.age = age;
        this.profilePicture = profilePicture;
        this.city = city;
        this.country = country;
    }

    setMeteo(meteo) {
        this.meteo = meteo;
    }

    getMeteo() {
        return this.meteo;
    }

    setMarker(marker) {
        this.marker = marker;
    }

    getMarker() {
        return this.marker;
    }

    getName() {
        return this.name;
    }

    getAge() {
        return this.age;
    }

    getProfilePicture() {
        return this.profilePicture;
    }

    getCity() {
        return this.coords;
    }

    setCity(city) {
        this.coords = city;
    }

    getCountry() {
        return this.country;
    }

    setCountry(country) {
        this.country = country;
    }

    setCoords(coords) {
        this.coords = coords;

        if (coords.city === undefined) {
            this.coords = coords.name;
        } else {
            this.city = coords.city;
        }

        this.country = coords.country;

        if(coords.countryCode === undefined) {
            this.countryCode = coords.country_code;
        } else {
            this.countryCode = coords.countryCode;
        }
    }

    getCoords() {
        return this.coords;
    }
}

class LoadingState {
    constructor(neededValidations, onReady, onReset, tips = [], onTextChange = () => {
    }) {
        this.neededValidations = neededValidations;
        this.onReady = onReady;
        this.onReset = onReset;
        this.onTextChange = onTextChange;
        this.tips = tips;
        this.validationMap = new Map();
        this.fails = 0;
        this.step = 0;
        this.count = 0;

        setInterval(() => {
            this.step++;

            if (this.step >= this.tips.length) {
                this.step = 0;
                this.tips.sort(() => 0.5 - Math.random())
            }

            this.updateText();
        }, 10000);
    }

    updateText() {
        this.count = Math.max(this.validationMap.size, this.count);

        let text = this.tips[this.step] + " (" + this.count + "/" + this.neededValidations + ")";

        if(SETTINGS.devMode) {
            text += "<br><br>" + Array.from(this.validationMap.keys()).map(value => "✓ " + value).join("<br>");
        }

        this.onTextChange(text);
    }

    addCheck(validation) {
        this.validationMap.set(validation, true);
        this.checkReady();
        this.updateText();
    }


    addTimeout(onTimeout, timeout, onFail) {
        this.timeoutTask = setTimeout(onTimeout, timeout);
    }

    isReady() {
        return this.validationMap.size >= this.neededValidations;
    }

    checkReady() {
        if (this.isReady()) {
            this.forcePass();
        }
    }

    forcePass() {
        if (this.timeoutTask !== undefined && this.timeoutTask !== null) {
            clearTimeout(this.timeoutTask);
            this.timeoutTask = null;
        }

        setTimeout(() => {
            this.onReady();
        }, 500);

        this.fails = 0;
    }

    reset(onTimeout, timeout, onFail) {
        this.validationMap.clear();
        this.count = 0;
        this.fails += 1;

        if (this.fails > 5 && onFail !== undefined) {
            onFail();
            return;
        }

        if (onTimeout !== undefined && timeout !== undefined) {
            this.addTimeout(onTimeout, timeout);
        }

        this.onReset();
    }
}

class Settings {
    constructor() {
        this.autogen = true;
        this.autogenInterval = 1;
        this.keepCurrentLoaded = true;
        this.autogenMax = 10;
        this.autogenOnlyFrance = true;

        this.graphics = {
            "temperature": true,
            "rain": true
        }

        this.moreDetails = false;
        this.moreTools = false;
        this.devMode = false;

        this.apiKeys = {
            "timezone_db": "", /*Test Key : WCG3PNS90RTU*/
            "google_places": ""
        }
    }
}

let SETTINGS = loadSettings();

function loadSettings() {
    let settings = new Settings();

    if (localStorage.getItem("settings") !== null) {
        settings = JSON.parse(localStorage.getItem("settings"));
    }

    return settings;
}

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(SETTINGS));
}

const ICONS_DAY = new Map();
const ICONS_NIGHT = new Map();
const WEATHER_NAME = new Map();

function initIcons() {
    // Setting icons
    ICONS_DAY.set(0, "wi-day-sunny");
    ICONS_NIGHT.set(0, "wi-night-clear");
    ICONS_DAY.set(1, "wi-day-cloudy");
    ICONS_DAY.set(2, "wi-cloud");
    ICONS_DAY.set(3, "wi-cloudy");
    ICONS_DAY.set(45, "wi-day-fog");
    ICONS_DAY.set(48, "wi-day-fog");
    ICONS_DAY.set(51, "wi-day-sprinkle light_weather");
    ICONS_DAY.set(53, "wi-day-sprinkle medium_weather");
    ICONS_DAY.set(55, "wi-day-sprinkle heavy_weather");
    ICONS_DAY.set(56, "wi-day-rain-mix light_weather");
    ICONS_DAY.set(57, "wi-day-rain-mix heavy_weather");
    ICONS_DAY.set(61, "wi-day-rain light_weather");
    ICONS_DAY.set(63, "wi-day-rain medium_weather");
    ICONS_DAY.set(65, "wi-day-rain heavy_weather");
    ICONS_DAY.set(66, "wi-day-rain-mix light_weather");
    ICONS_DAY.set(67, "wi-day-rain-mix heavy_weather");
    ICONS_DAY.set(71, "wi-day-snow light_weather");
    ICONS_DAY.set(73, "wi-day-snow medium_weather");
    ICONS_DAY.set(75, "wi-day-snow heavy_weather");
    ICONS_DAY.set(77, "wi-day-snow bold_weather");
    ICONS_DAY.set(80, "wi-day-showers light_weather");
    ICONS_DAY.set(81, "wi-day-showers medium_weather");
    ICONS_DAY.set(82, "wi-day-showers heavy_weather");
    ICONS_DAY.set(85, "wi-day-showers light_weather");
    ICONS_DAY.set(86, "wi-day-showers heavy_weather");
    ICONS_DAY.set(95, "wi-day-thunderstorm");
    ICONS_DAY.set(96, "wi-day-storm-showers light_weather");
    ICONS_DAY.set(99, "wi-day-storm-showers heavy_weather");

    WEATHER_NAME.set(0, "Dégagé");
    WEATHER_NAME.set(1, "Légèrement nuageux");
    WEATHER_NAME.set(2, "Nuageux");
    WEATHER_NAME.set(3, "Très nuageux");
    WEATHER_NAME.set(45, "Brume");
    WEATHER_NAME.set(48, "Brouillard");
    WEATHER_NAME.set(51, "Légères averses");
    WEATHER_NAME.set(53, "Averses");
    WEATHER_NAME.set(55, "Fortes averses");
    WEATHER_NAME.set(56, "Légères pluies et neige");
    WEATHER_NAME.set(57, "Pluies et neige");
    WEATHER_NAME.set(61, "Légères pluies");
    WEATHER_NAME.set(63, "Pluies");
    WEATHER_NAME.set(65, "Fortes pluies");
    WEATHER_NAME.set(66, "Légères pluies et grêle");
    WEATHER_NAME.set(67, "Pluies et grêle");
    WEATHER_NAME.set(71, "Légères chutes de neige");
    WEATHER_NAME.set(73, "Chutes de neige");
    WEATHER_NAME.set(75, "Fortes chutes de neige");
    WEATHER_NAME.set(77, "Chutes de neige");
    WEATHER_NAME.set(80, "Légères averses de neige");
    WEATHER_NAME.set(81, "Averses de neige");
    WEATHER_NAME.set(82, "Fortes averses de neige");
    WEATHER_NAME.set(85, "Légères averses de grêle");
    WEATHER_NAME.set(86, "Averses de grêle");
    WEATHER_NAME.set(95, "Orages");
    WEATHER_NAME.set(96, "Légères averses orageuses");
    WEATHER_NAME.set(99, "Averses orageuses");

    for (let [key, value] of ICONS_DAY) {
        if (ICONS_NIGHT.get(key) === undefined) {
            ICONS_NIGHT.set(key, value.replace("-day-", "-night-"));
        }
    }
}

function getIcon(icon, isDay) {
    if (isDay) {
        return ICONS_DAY.get(icon);
    } else {
        return ICONS_NIGHT.get(icon);
    }
}

function getWeatherName(icon) {
    return WEATHER_NAME.get(icon);
}

function getWindspeedIcon(windspeed) {
    if (windspeed < 5) {
        return "wi-wind-beaufort-0";
    } else if (windspeed < 10) {
        return "wi-wind-beaufort-1";
    } else if (windspeed < 15) {
        return "wi-wind-beaufort-2";
    } else if (windspeed < 20) {
        return "wi-wind-beaufort-3";
    } else if (windspeed < 25) {
        return "wi-wind-beaufort-4";
    } else if (windspeed < 30) {
        return "wi-wind-beaufort-5";
    } else if (windspeed < 35) {
        return "wi-wind-beaufort-6";
    } else if (windspeed < 40) {
        return "wi-wind-beaufort-7";
    } else if (windspeed < 45) {
        return "wi-wind-beaufort-8";
    } else if (windspeed < 50) {
        return "wi-wind-beaufort-9";
    } else if (windspeed < 55) {
        return "wi-wind-beaufort-10";
    } else if (windspeed < 60) {
        return "wi-wind-beaufort-11";
    } else {
        return "wi-wind-beaufort-12";
    }
}

function getWindDirectionIcon(windDirection) {
    if (windDirection < 22.5 || windDirection >= 337.5) {
        return "wi-wind wi-from-n";
    } else if (windDirection < 67.5) {
        return "wi-wind wi-from-ne";
    } else if (windDirection < 112.5) {
        return "wi-wind wi-from-e";
    } else if (windDirection < 157.5) {
        return "wi-wind wi-from-se";
    } else if (windDirection < 202.5) {
        return "wi-wind wi-from-s";
    } else if (windDirection < 247.5) {
        return "wi-wind wi-from-sw";
    } else if (windDirection < 292.5) {
        return "wi-wind wi-from-w";
    } else if (windDirection < 337.5) {
        return "wi-wind wi-from-nw";
    }
}

function getVisibilityText(visibility) {
    if (visibility < 1000) {
        return "Très mauvaise";
    } else if (visibility < 5000) {
        return "Mauvaise";
    } else if (visibility < 10000) {
        return "Moyenne";
    } else if (visibility < 20000) {
        return "Bonne";
    } else {
        return "Très bonne";
    }
}

function getPressureText(pressure) {
    const atm = pressure / 1013.25;

    if (atm < 0.98) {
        return "Dépression";
    } else if (atm < 1.02) {
        return "Stable";
    } else {
        return "Anticyclone";
    }
}

function isDay(date, sunrise, sunset) {
    const currentDate = date == null ? new Date() : new Date(date);
    const sunriseDate = new Date(sunrise);
    const sunsetDate = new Date(sunset);

    return (sunriseDate.getHours() < currentDate.getHours() && sunsetDate.getHours() > currentDate.getHours())
        || (sunriseDate.getHours() === currentDate.getHours() && sunriseDate.getMinutes() < currentDate.getMinutes())
        || (sunsetDate.getHours() === currentDate.getHours() && sunsetDate.getMinutes() > currentDate.getMinutes());
}

// This function is used to get a random user
function fetchUser() {
    const data = fetch("https://randomuser.me/api/?results=1" + (SETTINGS.autogenOnlyFrance ? "&nat=fr" : ""));

    return data.then(response => response.json()).catch(error => console.log(error));
}

// This function is used to get the coordinates of a city
function fetchCoords(city) {
    const data = fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city));

    return data.then(response => response.json()).catch(error => console.log(error));
}

// This function is used to get the current meteo for a location
function fetchMeteo(lat, long) {
    const data = fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + long + "&current_weather=true&past_days=1&hourly=cloudcover,rain,temperature_2m,relativehumidity_2m,apparent_temperature,visibility,surface_pressure&daily=sunrise,sunset,precipitation_sum,precipitation_hours&timezone=Europe/Paris")

    return data.then(response => response.json()).catch(error => console.log(error));
}

function fetchTime(lat, long) {
    if(SETTINGS.apiKeys.timezone_db === "") return Promise.resolve({"formatted": "API key not set"});

    /*Test key : WCG3PNS90RTU*/
    const data = fetch("https://api.timezonedb.com/v2.1/get-time-zone?key=" + SETTINGS.apiKeys.timezone_db + "&format=json&by=position&lat=" + lat + "&lng=" + long);

    return data.then(response => response.json()).catch(error => console.log(error));
}

function generateIcon(icon) {
    return "<i class=\"wi " + icon + "\"></i>";
}

// This function is used to get the current location of the user
function getCurrentLocation() {
    const data = fetch("https://geolocation-db.com/json/", {
        AccessControlAllowOrigin: "*"
    });

    return data.then(response => response.json()).catch(error => console.log(error));
}

function filterData(data, start, end) {
    const newData = [];

    for (let i = 0; i < data.length; i++) {
        if (start < i && end > i) {
            newData.push(data[i]);
        }
    }

    return newData;
}

function timeToString(time) {
    if(time.startsWith("API")) return null;

    const date = new Date(time);

    const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()

    return hours + ":" + minutes;
}