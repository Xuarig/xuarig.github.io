function loadSettings() {
    loadAutoGen(SETTINGS.autogen);
    loadAutoGenInterval(SETTINGS.autogenInterval);
    loadKeepCurrentLoaded(SETTINGS.keepCurrentLoaded);
    loadOnlyFrance(SETTINGS.autogenOnlyFrance);
    loadMaxUsers(SETTINGS.autogenMax);
    loadGraphics(SETTINGS.graphics);
    loadMoreDetails(SETTINGS.moreDetails);
    loadMoreTools(SETTINGS.moreTools);
    loadDevMode(SETTINGS.devMode);
    loadAPIKeys(SETTINGS.apiKeys);

    document.getElementById("settings-reset").addEventListener("click", () => {
        SETTINGS = new Settings();
        saveSettings();
        loadSettings();
    });

    document.getElementById("settings-x").addEventListener("click", () => {
        closeSettings();
    });
}

function openSettings() {
    document.getElementById("settings-popup").style.visibility = "visible";

    closeSearchView();
}

function closeSettings() {
    document.getElementById("settings-popup").style.visibility = "hidden";
}

function toggleSettings() {
    if (document.getElementById("settings-popup").style.visibility === "visible") {
        closeSettings();
    } else {
        openSettings();
    }
}

function loadAutoGen(value) {
    document.getElementById("auto-generation-option").checked = value;

    document.getElementById("auto-generation-option").addEventListener("change", () => {
        SETTINGS.autogen = document.getElementById("auto-generation-option").checked;
        saveSettings();
    });
}

function loadAutoGenInterval(value) {
    document.getElementById("auto-generation-option-interval").value = value;

    document.getElementById("auto-generation-option-interval-value").innerHTML = "Intervalle de génération (" + Number.parseFloat(value).toFixed(1) + "s)";

    const action = () => {
        SETTINGS.autogenInterval = document.getElementById("auto-generation-option-interval").value;

        document.getElementById("auto-generation-option-interval-value").innerHTML = "Intervalle de génération (" + Number.parseFloat(SETTINGS.autogenInterval).toFixed(1) + "s)";

        saveSettings();
    };

    document.getElementById("auto-generation-option-interval").addEventListener("input", action);
    document.getElementById("auto-generation-option-interval").addEventListener("change", action);
}

function loadKeepCurrentLoaded(value) {
    document.getElementById("auto-generation-option-keep").checked = value;

    document.getElementById("auto-generation-option-keep").addEventListener("change", () => {
        SETTINGS.keepCurrentLoaded = document.getElementById("auto-generation-option-keep").checked;
        saveSettings();
    });
}

function loadOnlyFrance(value) {
    document.getElementById("auto-generation-option-france").checked = value;

    document.getElementById("auto-generation-option-france").addEventListener("change", () => {
        SETTINGS.autogenOnlyFrance = document.getElementById("auto-generation-option-france").checked;
        saveSettings();
    });
}

function loadMaxUsers(value) {
    document.getElementById("auto-generation-option-number").value = value;

    document.getElementById("auto-generation-option-number").addEventListener("change", () => {
        SETTINGS.autogenMax = document.getElementById("auto-generation-option-number").value;
        saveSettings();
    });
}

function loadGraphics(value) {
    document.getElementById("graphs-option-temp").checked = value.temperature;
    document.getElementById("graphs-option-rain").checked = value.rain;

    document.getElementById("graphs-option-temp").addEventListener("change", () => {
        SETTINGS.graphics.temperature = document.getElementById("graphs-option-temp").checked;
        checkGraphics("meteo-chart-temp-canvas", SETTINGS.graphics.temperature);
        saveSettings();
    });

    document.getElementById("graphs-option-rain").addEventListener("change", () => {
        SETTINGS.graphics.rain = document.getElementById("graphs-option-rain").checked;
        checkGraphics("meteo-chart-rain-canvas", SETTINGS.graphics.rain);
        saveSettings();
    });

    checkGraphics("meteo-chart-temp-canvas", SETTINGS.graphics.temperature);
    checkGraphics("meteo-chart-rain-canvas", SETTINGS.graphics.rain);
}

function checkGraphics(type, value) {
    document.getElementById(type).style.display = value ? null : "none";
}

function loadMoreDetails(value) {
    document.getElementById("detailled-infos-option").checked = value;

    document.getElementById("detailled-infos-option").addEventListener("change", () => {
        SETTINGS.moreDetails = document.getElementById("detailled-infos-option").checked;
        checkDetails();
        saveSettings();
    });

    checkDetails();
}

function checkDetails() {
    const info = ["meteo-clouds", "meteo-visibility", "meteo-pressure", "meteo-humidity"];
    for (const i of info) {
        document.getElementById(i).style.visibility = SETTINGS.moreDetails ? "visible" : "hidden";
        document.getElementById(i).style.height = SETTINGS.moreDetails ? null : "0";
    }
}

function loadMoreTools(value) {
    document.getElementById("more-tools-option").checked = value;

    document.getElementById("more-tools-option").addEventListener("change", () => {
        SETTINGS.moreTools = document.getElementById("more-tools-option").checked;
        checkTools();
        saveSettings();
    });

    checkTools();
}

function checkTools() {
    const buttons = ["button-add-user", "button-clear-user", "button-pinmode"];
    for (const button of buttons) {
        document.getElementById(button).style.visibility = SETTINGS.moreTools ? "visible" : "hidden";
        document.getElementById(button).style.height = SETTINGS.moreTools ? null : "0";
        document.getElementById(button).style.padding = SETTINGS.moreTools ? null : "0";
    }
}

function loadDevMode(value) {
    document.getElementById("dev-mode-option").checked = value;

    document.getElementById("dev-mode-option").addEventListener("change", () => {
        SETTINGS.devMode = document.getElementById("dev-mode-option").checked;
        checkDevMode();
        saveSettings();
    });

    checkDevMode();
}

function checkDevMode() {
    loadingInfoState.updateText();
}

function loadAPIKeys(value) {
    document.getElementById("api-key-option-timezone").value = value.timezone_db;
    document.getElementById("api-key-option-google").value = value.google_places;

    document.getElementById("api-key-option-timezone").addEventListener("change", () => {
        SETTINGS.apiKeys.timezone_db = document.getElementById("api-key-option-timezone").value;
        saveSettings();
    });

    document.getElementById("api-key-option-google").addEventListener("change", () => {
        SETTINGS.apiKeys.google_places = document.getElementById("api-key-option-google").value;
        saveSettings();
    });
}