let map;

let users = [];
let timer = 0;
let pinMode = false;

document.addEventListener("DOMContentLoaded", init);

function init() {

    // Loading map with user's location
    getCurrentLocation().then((location) => {
        loadMap();

        loadSelfUser(location);
    }).catch((error) => {
        console.log(error);
        loadMap(null);
    }).then(() => {
        // Loading user
        setInterval(() => {
            if (!SETTINGS.autogen) {
                return;
            }

            timer += 1;

            // Used to allow dynamic settings, with a step of 0.1s
            if (timer >= SETTINGS.autogenInterval * 10) {
                timer = 0;
                loadUser();
            }
        }, 100);
    });

    loadSettings();

    initIcons();

    initInfo();

    loadMapButtons();

    loadShortcuts();
}

function loadMapButtons() {
    document.getElementById("button-reset-view").onclick = () => resetMap(false);
    document.getElementById("button-add-user").onclick = () => loadUser();
    document.getElementById("button-clear-user").onclick = () => clearUsers();
    document.getElementById("button-settings").onclick = () => toggleSettings();
    document.getElementById("button-search").onclick = () => toggleSearchView();
    document.getElementById("button-pinmode").onclick = () => setPinMode(!pinMode);
}

function loadMap() {
    map = L.map('map');

    this.resetMap(true);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 3,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        noWrap: true
    }).addTo(map);

    map.on("click", (e) => {
        onMapClick(e);
    });
}

function clearUsers() {
    for (const user of users) {
        if (user.getMarker() !== null && user.getMarker() !== undefined) {
            user.getMarker().remove();
        }
    }

    users = [];
}

function loadUser() {
    while (users.length > SETTINGS.autogenMax) {
        const removedUser = users.shift();

        if (removedUser === currentUser) {
            if (SETTINGS.keepCurrentLoaded) {
                users.push(removedUser);
                return;
            }

            closeInfo();
        }

        if (removedUser.getMarker() !== null && removedUser.getMarker() !== undefined) {
            removedUser.getMarker().remove();
        }
    }

    const user = fetchUser();


    user.then(response => {
        const result = response.results[0];

        const name = result.name.first + " " + result.name.last;
        const age = result.dob.age;
        const profilePicture = result.picture.large;
        const city = result.location.city;
        const country = result.location.country;

        const user = new User(name, age, profilePicture, city, country);

        users.push(user);

        loadUserCoords(user);
    }).catch(error => console.log(error));
}

function centerMap(lat, lng, zoom = map.getZoom()) {
    map.flyTo([lat, lng], zoom);
}

function resetMap(fast = false) {
    if (fast) {
        map.setView([48.8566, 2.3522], 6.2);
    } else {
        map.flyTo([48.8566, 2.3522], 6.2);
    }
}

function loadUserCoords(user) {
    fetchCoords(user.getCity()).then(response => {
        if (response.results === null || response.results === undefined || response.results.length === 0) {
            console.log("Unable to fetch coords for " + user.getCity());
            loadUser();
            return;
        }

        const coords = response.results.filter(result => !SETTINGS.autogenOnlyFrance || result.country_code === "FR")[0];

        if (coords === undefined) {
            console.log("Unable to fetch coords for " + user.getCity());
            return;
        }

        user.setCoords(coords);

        displayUser(user);
    }).catch(error => console.log(error));
}

function loadSelfUser(location) {
    if (location === null || location === undefined) {
        return;
    }

    const user = new User(null);

    user.setCoords({
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        country: location.country_name,
        countryCode: location.country_code
    });

    displayUser(user);
}

function displayUser(user) {
    const coords = user.getCoords();

    const marker = L.marker([coords.latitude, coords.longitude]).addTo(map);

    user.setMarker(marker);

    marker.on("click", () => {
        displayPopup(user);
    });
}

function displayPopup(user) {
    const coords = user.getCoords();

    fetchMeteo(coords.latitude, coords.longitude).then(response => {
        user.setMeteo(response);

        openInfo(user);
    }).catch(error => console.log(error));
}

function loadShortcuts() {
    document.addEventListener("keydown", (event) => {
        if (event.key === " " && event.ctrlKey) {
            toggleSearchView();
            return;
        }

        if (event.target.tagName === "INPUT") {
            return;
        }

        if (event.key === "Escape") {
            if(pinMode) {
                setPinMode(false);
                return;
            }

            closeInfo();
        } else if (event.key === "Tab") {
            toggleSettings();
        } else if (event.key === "c") {
            resetMap(false);
        } else if (SETTINGS.moreTools) {
            if (event.key === "p") {
                loadUser();
            } else if (event.key === "r") {
                clearUsers();
            }
        }
    });
}

function setPinMode(value) {
    pinMode = value;

    if(value) {
        document.getElementById("map").style.cursor = "crosshair";
        document.getElementById("button-pinmode-icon").classList.add("button-pinmode-active");
    } else {
        document.getElementById("map").style.cursor = "default";
        document.getElementById("button-pinmode-icon").classList.remove("button-pinmode-active");
    }
}

function onMapClick(event) {
    if(!pinMode) {
        return;
    }

    const user = new User(undefined);

    user.coords = {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
    }

    const marker = L.marker([event.latlng.lat, event.latlng.lng]);

    marker.addTo(map);
    marker.on("click", () => {
        displayPopup(user);
    });

    document.getElementById("button-clear-user").addEventListener("click", listener => {
        marker.remove();
        listener.target.removeEventListener("click", listener);
    });

    displayPopup(user);

    setPinMode(false);
}



