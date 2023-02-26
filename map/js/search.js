let sessionToken;
let autocompleteService;
let needToUpdate = false;

function loadAPI() {
    resetSearch();

    document.getElementById("search-imput").disabled = true;

    if (SETTINGS.apiKeys.google_places.length === 0) {
        document.getElementById("search-imput").placeholder = "Missing Google Places API key (in settings)";

        return;
    }

    document.getElementById("search-imput").placeholder = "Loading...";

    const script = document.createElement("script");
    console.log("Loading Google Places API");
    // Use place api with no location information
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + SETTINGS.apiKeys.google_places + "&libraries=places&callback=initAutocomplete";
    script.type = "text/javascript";
    script.id = "script-places-api";
    console.log(script.src);

    script.addEventListener("error", () => {
        document.getElementById("search-imput").disabled = true;
        document.getElementById("search-imput").placeholder = "Error while loading Google Places API";
    });

    document.getElementById("search-close").addEventListener("click", () => {
        resetSearch();
    });

    setInterval(() => {
        if(!needToUpdate) {
            return;
        }

        needToUpdate = false;

        autocompleteService.getPlacePredictions({
            input: document.getElementById("search-imput").value,
            sessionToken: sessionToken,
            fields: ["name", "place_id"],
            language: "fr",
            types: ["(regions)"]
        }, updateSearchResults);
    }, 1000);

    script.addEventListener("load", () => {
        console.log("Google Places API loaded");

        sessionToken = new google.maps.places.AutocompleteSessionToken();
        autocompleteService = new google.maps.places.AutocompleteService();

        document.getElementById("search-imput").addEventListener("input", () => {
            if (document.getElementById("search-imput").value.length <= 3) {
                resetSearch(false);
                needToUpdate = false;
                return;
            }

            needToUpdate = true;
        });

        let selectionIndex = 0;

        document.getElementById("search-imput").addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                if (selectionIndex === 0) {
                    return;
                }

                const results = document.getElementById("search-results-list").children;

                if (results.length < selectionIndex) {
                    return;
                }

                searchPlace(results[selectionIndex - 1].suggestion);
                closeSearchView();
            }

            if(event.key === "Escape") {
                closeSearchView();
            }

            if (event.key === "ArrowDown") {
                const results = document.getElementById("search-results-list").children;

                if (results.length === 0) {
                    return;
                }

                if (selectionIndex === results.length) {
                    return;
                }

                if (selectionIndex > 0) {
                    results[selectionIndex - 1].classList.remove("selected");
                }

                selectionIndex += 1;

                results[selectionIndex - 1].classList.add("selected");
            }

            if (event.key === "ArrowUp") {
                const results = document.getElementById("search-results-list").children;

                if (results.length === 0) {
                    return;
                }

                if (selectionIndex === 0) {
                    return;
                }

                if (selectionIndex > 0) {
                    results[selectionIndex - 1].classList.remove("selected");
                }

                selectionIndex -= 1;

                results[selectionIndex - 1].classList.add("selected");
            }
        });

        document.getElementById("search-imput").disabled = false;
        document.getElementById("search-imput").placeholder = "Search";

        document.getElementById("search-imput").focus();
        document.getElementById("search-imput").select();
    });

    document.body.appendChild(script);
}

function initAutocomplete() {
    console.log("Google Places API initialized");
}

function changePlacesAPIKey() {
    const script = document.getElementById("script-places-api");

    if (script !== null) {
        script.remove();
    }

    loadAPI();
}

function toggleSearchView() {
    if (document.getElementById("search-popup").style.visibility === "visible") {
        closeSearchView();
    } else {
        openSearchView();
    }
}

function openSearchView() {
    closeSettings();

    if (document.getElementById("script-places-api") === null) {
        loadAPI();
    }

    document.getElementById("search-popup").style.visibility = "visible";

    document.getElementById("search-imput").focus();
    document.getElementById("search-imput").select();
}

function closeSearchView() {
    document.getElementById("search-popup").style.visibility = "hidden";

    resetSearch();
}

function resetSearch(resetInput = true) {
    document.getElementById("search-results-list").innerHTML = "";

    if(resetInput) {
        document.getElementById("search-imput").value = "";
    }
}

function searchPlace(suggestion) {
    const placeDetailsService = new google.maps.places.PlacesService(document.createElement("div"));

    placeDetailsService.getDetails({
        placeId: suggestion.place_id
    }, (result, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
        }

        const location = result.geometry.location;

        centerMap(location.lat(), location.lng(), 10);

        const city = result.address_components.find((component) => {
            return component.types.includes("locality");
        });

        const country = result.address_components.find((component) => {
            return component.types.includes("country");
        });

        const user = new User();

        user.name = undefined;

        user.setCoords({
            latitude: location.lat(),
            longitude: location.lng(),
            city: city === undefined ? undefined : city.long_name,
            country: country === undefined ? undefined : country.long_name,
            countryCode: country === undefined ? undefined : country.short_name,
        })

        displayPopup(user);
    });
}

function updateSearchResults(predictions, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
    }

    const results = document.getElementById("search-results-list");
    results.innerHTML = "";

    let size = 0;

    for (const prediction of predictions) {
        size++;

        if (size > 10) {
            break;
        }

        const result = document.createElement("div");
        result.classList.add("search-result");
        result.classList.add("search-text");

        const text = document.createElement("div");
        text.classList.add("search-result-text");

        text.innerHTML = prediction.description;

        result.appendChild(text);

        result.onclick = () => {
            closeSearchView();

            searchPlace(prediction);
        };

        results.appendChild(result);
    }
}

