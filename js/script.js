const selectedCountryCode = $('#country').val();
var mapContainer = document.getElementById('map');
var dropdownContainer = document.getElementById('dropdown-container');
mapContainer.appendChild(dropdownContainer);
var markers = L.markerClusterGroup();




var map = L.map('map').setView([51.5, -0.1], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
map.addLayer(markers);




var countryBordersLayer;


$.getJSON('json/countryBorders.geo.json', function(data) {
    var countrySelect = $('#country');
    
    
    data.features.sort(function(a, b) {
        return a.properties.name.localeCompare(b.properties.name);
    });

    $.each(data.features, function(index, feature) {
        countrySelect.append($("<option>", {
            value: feature.properties.iso_a2,
            text: feature.properties.name
        }));
    });

    countrySelect.on('change', function() {
        var selectedCountryCode = $(this).val();
        updateLocalTime(selectedCountryCode);
        highlightSelectedCountry(data, selectedCountryCode);
    });
});


function highlightSelectedCountry(geojsonData, countryCode) {
    if (countryBordersLayer) {
        map.removeLayer(countryBordersLayer); // Remove the previous country border layer
    }

    if (countryCode !== 'ZZ') {
        var selectedCountryFeature = geojsonData.features.find(function(feature) {
            return feature.properties.iso_a2 === countryCode;
        });

        if (selectedCountryFeature) {
            countryBordersLayer = L.geoJSON(selectedCountryFeature, {
                style: {
                    color: 'blue',
                    weight: 7
                }
            });
            // Add the new country borders to the cluster layer
            map.addLayer(countryBordersLayer);

            map.fitBounds(countryBordersLayer.getBounds());
        }
    }
}

$('#country').on('change', function() {
    const selectedCountryCode = $(this).val();

    if (countryBordersLayer) {
        map.removeLayer(countryBordersLayer);
    }

    updateLocalTime(selectedCountryCode);
    highlightSelectedCountry(countryGeoJSONData, selectedCountryCode);
    
    
});





// navigator.geolocation for users location
$(document).ready(function() {
    navigator.geolocation.getCurrentPosition( geolocationCallback );  
});

  var pericon = L.icon({
    iconUrl: './packages/fontawesome/userLocation.png',
    iconSize: [40,40],
    iconAnchor:  [20,40]
});



// Load GeoJSON data
$.getJSON('json/countryBorders.geo.json', function(data) {
    countryGeoJSONData = data;
});



var countryGeoJSONData;

L.easyButton({
    id: 'wikipedia',
    states: [{
        icon: 'fas fa-wikipedia-w',
        onClick: function(btn, map) {
            const selectedCountry = document.getElementById('country').value;
            fetchWikipediaInfo(selectedCountry).then(info => {
                document.getElementById('wikipediaContent').innerHTML = info.extract;
                document.getElementById('wikipedia-full-link').href = info.fullUrl;
                $('#wikipedia-modal').modal('show');
            });
        },
        title: 'Wikipedia'
    }],
    className: 'custom-easy-button'
}).addTo(map);

function openWikipediaModal() {
    // You can fetch Wikipedia content here and then display it in the modal
    // For demonstration purposes, let's just display a dummy content

    var dummyWikipediaContent = "<h3>Wikipedia Content</h3><p>This is a sample Wikipedia content.</p>";

    // Update the modal content with the fetched Wikipedia content
    document.getElementById("wikipedia-modal-content").innerHTML = dummyWikipediaContent;

    // Open the Wikipedia modal
    $('#wikipedia-modal').modal('show');
}

let currencyCodeMappings = {}; 


$.getJSON('json/countries.json', function(data) {
    const countries = data.countries.country;
    
    
    for (const country of countries) {
        const countryCode = country.countryCode;
        const currencyCode = country.currencyCode;
        
        currencyCodeMappings[countryCode] = currencyCode;
    }
    
    setupCurrencyButton(); // Call the function to set up the currency button after loading the mappings
});

function setupCurrencyButton() {
    L.easyButton({
        id: 'currency',
        states: [{
            icon: 'fas fa-dollar-sign', // Font Awesome class for the icon
            onClick: function(btn, map) {
                const selectedCountryCode = $('#country').val();

                const selectedCurrencyCode = currencyCodeMappings[selectedCountryCode];

                if (selectedCurrencyCode) {
                    const currencySettings = {
                        async: true,
                        crossDomain: true,
                        url: `https://currencytick.p.rapidapi.com/live?base=${selectedCurrencyCode}&target=USD&amount=1`,
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': '98f4f2f379msh19589ed57897fa6p119ab6jsn3b9f2cbf5937',
                            'X-RapidAPI-Host': 'currencytick.p.rapidapi.com'
                        }
                    };

                    $.ajax(currencySettings).done(function (response) {
                        const exchangeRate = response.rate.toFixed(2);
                        $('#currency-modal-title').text(`Currency Exchange Rate for ${selectedCountryCode}`);
                        updateCurrencyModalContent(selectedCurrencyCode, exchangeRate);
                        $('#currency-modal').modal('show');
                    });
                } else {
                    // Handle the case where there's no currency mapping available
                    console.error(`No currency mapping found for country code ${selectedCountryCode}`);
                }
            },
            title: 'Currency Exchange'
        }]
    }).addTo(map);
}

function updateCurrencyModalContent(currencyCode, exchangeRate) {
    $('#currency-content').html(`
        <div class="currency-conversion">
            <div class="currency-header">
                <p>${currencyCode}</p>
                <div class="amount-control">
                    <button id="decrease-amount" class="amount-button">-</button>
                    <span id="currency-amount">1</span>
                    <button id="increase-amount" class="amount-button">+</button>
                </div>
            </div>
            <p id="converted-amount">1 ${currencyCode} = ${exchangeRate} USD</p>
        </div>
    `);

$('#increase-amount').on('click', function() {
        const currentAmount = parseFloat($('#currency-amount').text());
        $('#currency-amount').text(currentAmount + 1);
        updateConvertedAmount(exchangeRate);
    });

    $('#decrease-amount').on('click', function() {
        const currentAmount = parseFloat($('#currency-amount').text());
        if (currentAmount > 1) {
            $('#currency-amount').text(currentAmount - 1);
            updateConvertedAmount(exchangeRate);
        }
    });


    $('#currency-amount').on('input', function() {
        updateConvertedAmount(exchangeRate);
    });

   function updateConvertedAmount(exchangeRate) {
        const amount = parseFloat($('#currency-amount').text());
        const convertedAmount = (amount * exchangeRate).toFixed(2);
        $('#converted-amount').text(`${amount} ${currencyCode} = ${convertedAmount} USD`);
    }
}


L.easyButton({
    id: 'weather',
    states: [{
        icon: 'fas fa-cloud-sun', // Font Awesome class for the icon
        onClick: function(btn, map) {
            const selectedCountry = document.getElementById('country').value;
            fetchWeatherInfo(selectedCountry).then(weatherInfo => {
                updateWeatherModal(weatherInfo);
                $('#weather-modal').modal('show');
            });
        },
        title: 'Weather Data'
    }]
}).addTo(map);


function fetchWeatherInfo(countryCode) {
    var apiKey = '125b0872658e69e8a6508bfacd5bed92';
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${apiKey}&q=${countryCode}`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            return {
                temperature: data.main.temp,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            };
        })
        .catch(error => {
            console.error('Error fetching weather information:', error);
            return {
                temperature: 'N/A',
                description: 'Weather data unavailable',
                icon: '01d'
            };
        });
}


function updateWeatherModal(weatherInfo) {
    var weatherIcon = document.querySelector('.weather-icon');
    var temperature = document.querySelector('.temperature');
    var weatherDescription = document.querySelector('.weather-description');

    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo.icon}.png`;
    temperature.textContent = `Temperature: ${weatherInfo.temperature}°C`;
    weatherDescription.textContent = `Description: ${weatherInfo.description}`;
}


L.easyButton({
    id: 'forecast',
    states: [{
        icon: 'fas fa-calendar-week', // Font Awesome class for the icon
        onClick: function(btn, map) {
            const selectedCountryCode = document.getElementById('country').value;
            
            fetchForecastData(selectedCountryCode).done(function(response) {
                // Handle the forecast data response here
                // You can update the modal content with the forecast data
                console.log(response);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching forecast data:', errorThrown);
                // Update modal content with error message
            });

            $('#forecast-modal').modal('show');
        },
        title: 'Forecast Data'
    }]
}).addTo(map);


function fetchForecastData(selectedCountryCode) {
    const settings = {
        async: true,
        crossDomain: true,
        url: 'https://ai-weather-by-meteosource.p.rapidapi.com/find_places?text=' + selectedCountryCode + '&language=en',
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '98f4f2f379msh19589ed57897fa6p119ab6jsn3b9f2cbf5937',
            'X-RapidAPI-Host': 'ai-weather-by-meteosource.p.rapidapi.com'
        }
    };

    return $.ajax(settings);
}




function updateForecastModal(data) {
    var forecastContent = $('#forecast-modal-content');
    forecastContent.empty(); // Clear previous content


    data.forEach(function(forecastItem) {
        var forecastElement = $('<div class="forecast-item">');
        forecastElement.append('<p>Date: ' + forecastItem.date + '</p>');
        forecastElement.append('<p>Temperature: ' + forecastItem.temperature + '°C</p>');
        forecastContent.append(forecastElement);
    });
    $('#forecast-modal').modal('show');
}

L.easyButton({
    id: 'news',
    states: [{
        icon: 'fas fa-newspaper',
        onClick: function(btn, map) {
            $('#news-modal').modal('show'); // Open the news modal
        },
        title: 'Country News'
    }]
}).addTo(map);





function fetchWikipediaInfo(country) {
    return fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&titles=${country}&origin=*`)
        .then(response => response.json())
        .then(data => {
            const pageId = Object.keys(data.query.pages)[0];
            const extract = data.query.pages[pageId].extract;
            const fullUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(country)}`;
            return { extract, fullUrl };
        })
        .catch(error => {
            console.error('Error fetching Wikipedia information:', error);
            return { extract: 'Error fetching Wikipedia information.', fullUrl: '' };
        });
}

var countryCityMap = {
    US: 'New_York',
    GB: 'London',
    
};


$(document).ready(function() {
    var populationData;

    $.getJSON('json/population.json', function(data) {
        populationData = data.data;
    });

    L.easyButton({
        id: 'population',
        states: [{
            icon: 'fas fa-users',
            onClick: function(btn, map) {
                const selectedCountryCode = $('#country').val();
                const selectedCountry = populationData.find(country => country.code === selectedCountryCode);

                if (selectedCountry) {
                    const population2018 = selectedCountry.populationCounts.find(entry => entry.year === 2018);
                    if (population2018) {
                        $('#population-content').text(`Population in 2018: ${population2018.value}`);
                    } else {
                        $('#population-content').text('Population data for 2018 unavailable');
                    }
                } else {
                    $('#population-content').text('Population data unavailable');
                }
                $('#population-modal').modal('show');
            },
            title: 'Population'
        }]
    }).addTo(map);
});





var apiKey = 'ym4GgPN59urMEuRhdNudXg==erwr9ofNxGu6hDs8';

document.getElementById('country').addEventListener('change', function() {
    var selectedCountryCode = this.value;
    updateLocalTime(selectedCountryCode);
});

function updateLocalTime(selectedCountryCode) {
    var selectedCity = countryCityMap[selectedCountryCode];

    if (selectedCity) {
        $.ajax({
            method: 'GET',
            url: 'https://api.api-ninjas.com/v1/worldtime?city=' + selectedCity,
            headers: { 'X-Api-Key': 'ym4GgPN59urMEuRhdNudXg==erwr9ofNxGu6hDs8' },
            contentType: 'application/json',
            success: function(result) {
                var localTime = result.time;
                var timeButton = document.getElementById('local-time');
                timeButton.textContent = localTime;
            },
            error: function(jqXHR) {
                console.error('Error: ', jqXHR.responseText);
                var timeButton = document.getElementById('local-time');
                timeButton.textContent = 'Error';
            }
        });
    }
}
$(document).ready(function() {
function fetchAndDisplayTimezone(lat, lon) {
    const apiKey = 'YOUR_RAPIDAPI_KEY';
    const apiUrl = `https://timezone-by-location.p.rapidapi.com/timezone?lat=${lat}&lon=${lon}&c=1&s=0`;

    const headers = {
        'X-RapidAPI-Key': '98f4f2f379msh19589ed57897fa6p119ab6jsn3b9f2cbf5937',
        'X-RapidAPI-Host': 'timezone-by-location.p.rapidapi.com'
    };

    fetch(apiUrl, { headers })
        .then(response => response.json())
        .then(data => {
            const timezone = data['timezone'];
            const modalContent = `Timezone: ${timezone}`;
            document.getElementById('timezone-modal-content').textContent = modalContent;
            $('#timezone-modal').modal('show');
        })
        .catch(error => {
            console.error('Error fetching timezone data:', error);
        });
}

L.easyButton({
    id: 'timezone',
    states: [{
        icon: 'fas fa-clock', // Font Awesome class for the clock icon
        onClick: function(btn, map) {
            const selectedCountryCode = document.getElementById('country').value;
            fetchAndDisplayTimezone(selectedCountryCode);
        },
        title: 'Timezone'
    }]
}).addTo(map);
});










function geolocationCallback( position ){
    
    // Set variable lat and lng for the users current latitude and longitude
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    //set variable latlng as the users coordinates using the geolocation function
    var latlng = new L.LatLng(lat, lng);
 
    //set the starting view of the map as the users location at zoom level 10
    mymap = map.setView(latlng, 8);

    //add a marker to the users position to easily find on a zoomed out map
    L.marker(latlng, {title: 'You are here', icon: pericon}).addTo(map);

    // Get ISO 2 country code using users current position lat and long
    $.ajax({
        url: "php/latlngtocc.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng,
        },
        success: function(result) {
            
            // Set users home currency
            homeCurrency = result['data']['currency'];
            // Send data to functions which will get and display more data from different APIs and set the users local currency
            getData(result['data']['country']); 
        },
        // Error section uses an error function which  logs to console the error
        // each error uses this function and has it owns log of where the error is
        error: function(jqXHR, exception){
            errorajax(jqXHR, exception);
            console.log("lat and long to country code");
        }
    }); 

}




function errorajax(jqXHR, exception) {

    var msg = '';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        console.log(msg);
}


var myStyle = {
    color: '#4497b2',
    opacity: 1,
    fillOpacity: 0.8,
    fillColor: '#b04d8f',
    dashArray: '6, 4',
    weight: 2
};
