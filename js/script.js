//Global Variables
selectedCountryISO2 = $(this).find(':selected').data('iso2');
var markers = L.markerClusterGroup();

//Custom marker icons
var cityIcon = L.icon({
    iconUrl: 'images/cityMarker.png',
    iconSize: [32, 32], 
    iconAnchor: [16, 16], 
    popupAnchor: [0, -12]
});

var airportIcon = L.icon({
    iconUrl: '/images/airport3.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -12]
});

var earthquakeIcon = L.icon({
    iconUrl: '/images/equake.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -12]
});

$(".lds-dual-ring").show();

//Map initialization
var street = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 15,
        minZoom: 3,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYXNobGV5anBwIiwiYSI6ImNsbGFxbXk5dzAwM3czam1xdTVmMmM1NjIifQ.Gn2M_HtCnWnzkuPduztcsg'
}),
    satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 15,
        minZoom: 3,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYXNobGV5anBwIiwiYSI6ImNsbGFxbXk5dzAwM3czam1xdTVmMmM1NjIifQ.Gn2M_HtCnWnzkuPduztcsg'
})

var mymap = L.map('map', {
    layers: [street] 
});

var baseLayers = {
	"Street Map": street,
	"Satellite Map": satellite
};

//Map pin for users location
var pericon = L.icon({
    iconUrl: 'images/location.png',
    iconSize: [32,32],
    iconAnchor:  [20,40]
});

$(".lds-dual-ring").hide();

//Navigator geolocation to get users current position, and highlight users countries borders
$(document).ready(function() {
    navigator.geolocation.getCurrentPosition( geolocationCallback );  
});

function geolocationCallback(position) {
    
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var latlng = new L.LatLng(lat, lng);
 
    mymap = mymap.setView(latlng, 7);

    L.marker(latlng, {title: 'Your Location', icon: pericon}).addTo(mymap);

     $.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, function(data) {
        if (data && data.address && data.address.country_code) {
            selectedCountryISO2 = data.address.country_code.toUpperCase(); // Update global variable
            let userISO3Code = $('#country option[data-iso2="'+ selectedCountryISO2 +'"]').val();

            if(userISO3Code) {
                $('#country').val(userISO3Code).change();
            }
        }
    });
}

//To populate the dropdown with country list
$(document).ready(function() {
    $.ajax({
        url: "/php/select.php",
        type: 'POST',
        dataType: 'json',
        success: function(result) {
            $.each(result.data, function(index) {
                $('#country').append($("<option>", {
                    value: result.data[index].iso3,
                    text: result.data[index].name,
                    "data-iso2": result.data[index].iso2
                }));
            });
        }
    });
});

let countryBorders;

$.getJSON('/json/countryBorders.geo.json', function(data) {
    countryBorders = data;
});

//On change function
$('#country').change(function() {
    let selectedCountryISO3 = $(this).val();
    selectedCountryISO2 = $(this).find(':selected').data('iso2');
    let selectedCountryName = $(this).find(':selected').text();
    highlightCountry(selectedCountryISO3);
    if (selectedCountryISO2) {
        fetchCitiesAndAddMarkers(selectedCountryISO2);
        fetchAirportsAndAddMarkers(selectedCountryISO2);
        fetchEarthquakesForCountry(selectedCountryISO2);
    }
});


//To highlight country borders
let highlightedCountryLayer;

function highlightCountry(isoCode) {
    if (highlightedCountryLayer) {
        mymap.removeLayer(highlightedCountryLayer);
    }

    let countryData = countryBorders.features.find(feature => feature.properties.iso_a3 === isoCode);
    
    if (countryData) {
        highlightedCountryLayer = L.geoJSON(countryData, {
            style: {
                color: 'limegreen',  
                weight: 4,
                opacity: 0.9
            }
        }).addTo(mymap);
        mymap.fitBounds(highlightedCountryLayer.getBounds());
    }
}

//Country information/ Wiki article easybutton and modal
let currentArticleIndex = 0;

function getCountryInfo(iso2) {
    let apiUrl = `http://secure.geonames.org/countryInfo?country=${iso2}&username=ajppeters`;
    $(".lds-dual-ring").show();
        $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'xml',
        success: function(data) {
            let country = $(data).find('country');
            let capital = country.find('capital').text();
            let population = country.find('population').text();
            let area = country.find('areaInSqKm').text();
            let continent = country.find('continentName').text();
            let currency = country.find('currencyCode').text();
            let isoCode = country.find('fipsCode').text();

            let lat = (parseFloat(country.find('north').text()) + parseFloat(country.find('south').text())) / 2;
            let lng = (parseFloat(country.find('east').text()) + parseFloat(country.find('west').text())) / 2;

            getTimezoneInfo(lat, lng, function(timezoneData) {
                $.ajax({
                    url: `/php/wikipedia.php?lat=${lat}&lng=${lng}`,
                    type: 'GET',
                    dataType: 'json',
                    success: function(wikiData) {
    if (wikiData && wikiData.entry && wikiData.entry.length > 0) {
        if (currentArticleIndex >= wikiData.entry.length) {
            currentArticleIndex = 0;
        }
        const article = wikiData.entry[currentArticleIndex];
        $('#wikiSummary').text(article.summary);
        $('#wikiLink').attr('href', article.wikipediaUrl).show();("Read the full article");

        currentArticleIndex++;

    } else {
        $('#wikiSummary').text("No Wikipedia summary available for this location.");
        $('#wikiLink').hide();
    }
                        $('#localTime').text(timezoneData.formatted);
                        $('#gmtOffset').text(timezoneData.gmtOffset);
                        $('#capital').text(capital);
                        $('#population').text(population);
                        $('#area').text(area);
                        $('#continentName').text(continent);
                        $('#currency').text(currency);
                        $('#iso').text(isoCode);
                        $(".lds-dual-ring").hide();
                        $('#countryInfoModal').modal('show');
                    },
                    error: function(error) {
                        $(".lds-dual-ring").hide();
                        console.error("Error fetching Wikipedia data:", error);
                    }
                });
            });
        },
        error: function(error) {
            $(".lds-dual-ring").hide();
            console.error("Error fetching country data:", error);
        }
    });
}

L.easyButton('<i class="fas fa-info-circle" style="color: #3a76df;"></i>', function(btn, map) {
    let iso2 = $('#country').find('option:selected').data('iso2');
    if (iso2) {
        getCountryInfo(iso2);
    }
}, 'Get Country Info').addTo(mymap);


$('#countryInfoModal').on('hidden.bs.modal', function () {
    $('.modal-backdrop-show').remove();
});

//Functions to close modal with the close button
$(document).ready(function() {
    $('#closeModalBtn').on('click', function() {
        $('#countryInfoModal').modal('hide');
    });
    
    $('#closeModalBtn2').on('click', function() {
        $('#currencyModal').modal('hide');
    });
    
    $('#closeModalBtn3').on('click', function() {
        $('#news-modal').modal('hide');
    });
    $('#closeModalBtn4').on('click', function() {
        $('#flagModal').modal('hide');
    });
    $('#closeModalBtn5').on('click', function() {
        $('#timezoneModal').modal('hide');
    });
});

//Currency converter easybutton and modal
function showCurrencyModal(data) {
    $('#conversionRate').text('1 GBP = ' + data.result + ' ' + data.currencyCode);
    $('#currencyModal').modal('show');
}

function getCurrencyConversion(amount) {
    
    let countryCode = $('#country').find('option:selected').data('iso2');
    
    if (countryCode && amount) {
        $(".lds-dual-ring").show();
        $(".loading-overlay").show();

        $.ajax({
            url: "/php/currencyConverter.php",
            type: "GET",
            data: {
                countryCode: countryCode,
                amount: amount
            },
            dataType: "json",
            success: function(data) {
                $(".lds-dual-ring").hide();
                $(".loading-overlay").hide();

                if (data.new_amount && data.new_currency && data.old_amount && data.old_currency) {
                    let conversionMessage = `${amount} ${data.old_currency} is equivalent to ${data.new_amount} ${data.new_currency}.`;
                    $("#currencyModalBody").text(conversionMessage);
                    $('#currencyModal').modal('show');
                } else {
                    alert('Failed to convert currency.');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $(".lds-dual-ring").hide();
                $("#loadingOverlay").hide();
                alert("Currency Conversion Error: " + textStatus + " " + errorThrown + "\nResponse: " + jqXHR.responseText);
            }
        });
    } else {
        alert("Please provide a valid country code and amount.");
    }
}

$(document).ready(function() {
    let $gbpAmount = $('#gbpAmount');
    let $decreaseAmount = $('#decreaseAmount');
    let $increaseAmount = $('#increaseAmount');

    $decreaseAmount.click(function() {
        let currentAmount = parseFloat($gbpAmount.val());
        if (currentAmount > 0) {
            $gbpAmount.val(currentAmount - 1);
            getCurrencyConversion(currentAmount - 1);
        }
    });

    $increaseAmount.click(function() {
        let currentAmount = parseFloat($gbpAmount.val());
        $gbpAmount.val(currentAmount + 1);
        getCurrencyConversion(currentAmount + 1);
    });

    $gbpAmount.change(function() {
        let currentAmount = parseFloat($gbpAmount.val());
        if (currentAmount >= 0) { 
            getCurrencyConversion(currentAmount);
        }
    });
});

L.easyButton('<i class="fas fa-coins" style="color: #b27724;"></i>', function(btn, map) {
    let currentAmount = parseFloat($('#gbpAmount').val());
    if (currentAmount >= 0) {
        getCurrencyConversion(currentAmount); 
    }
}, 'Currency Converter').addTo(mymap);


//Adding major city markers to the map
let selectedCountryName = '';
let cityMarkers = L.layerGroup().addTo(mymap);

function fetchCitiesAndAddMarkers(countryISO2) {
        $.ajax({
        url: "/php/fetchCities.php",
        type: "GET",
        data: { countryISO2: countryISO2 },
        dataType: "json",
        success: function(data) {
            markers.clearLayers();
            if(data.data && Array.isArray(data.data)) {
                data.data.forEach(city => {
                    if (!city.name.startsWith('City of ') && !city.name.endsWith(' County')) { 
                        let marker = L.marker([city.latitude, city.longitude], { icon: cityIcon })
                            .bindPopup(city.name)
                            .bindTooltip(city.name, {
                                permanent: false,
                                offset: [0, -32],
                                direction: 'top'
                            });
                        markers.addLayer(marker);
                    }
                });
                mymap.addLayer(markers);
            } else {
                console.error("Unexpected data format received:", data);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX error:", textStatus, "; Error thrown:", errorThrown, "; Response text:", jqXHR.responseText);
        }
    });
}


//Adding airports as markers to the map
var airportMarkers = L.markerClusterGroup();

function fetchAirportsAndAddMarkers(countryISO2) {
    $.ajax({
        url: "/php/fetchAirports.php",
        type: "GET",
        data: { countryISO2: countryISO2 },
        dataType: "json",
        success: function(data) {
            airportMarkers.clearLayers();

            if(data.geonames && Array.isArray(data.geonames)) {
                data.geonames.forEach(airport => {
                    let marker = L.marker([airport.lat, airport.lng], { icon: airportIcon })
                        .bindPopup(airport.name)
                        .bindTooltip(airport.name, {
                            permanent: false,
                            offset: [0, -32],
                            direction: 'top'
                        });
                    airportMarkers.addLayer(marker);
                });
                mymap.addLayer(airportMarkers);
            } else {
                console.error("Unexpected data format received:", data);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX error:", textStatus, "; Error thrown:", errorThrown, "; Response text:", jqXHR.responseText);
        }
    });
}

//Adding earthquakes to the map as markers
let earthquakeMarkers = L.markerClusterGroup();
mymap.addLayer(earthquakeMarkers);

function fetchEarthquakesForCountry(countryISO2) {
    $.ajax({
        url: "/php/fetchEarthquakes.php",
        type: "GET",
        data: { countryISO2: countryISO2 },
        dataType: "json",
        success: function(data) {
            earthquakeMarkers.clearLayers();
            if(data && Array.isArray(data.earthquakes)) {
                data.earthquakes.forEach(earthquake => {
                    const latlng = [earthquake.lat, earthquake.lng];
                    const datetime = earthquake.datetime;

                    const popupContent = `
                        <strong>Earthquake Details:</strong><br>
                        Magnitude: ${earthquake.magnitude}<br>
                        Date/Time: ${datetime}
                    `;

                    
                    let marker = L.marker(latlng, { icon: earthquakeIcon })
    .bindPopup(popupContent);

                    earthquakeMarkers.addLayer(marker);
                });

                earthquakeMarkers.addTo(mymap);
            } else {
                console.error("Unexpected data format received:", data);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX error:", textStatus, "; Error thrown:", errorThrown, "; Response text:", jqXHR.responseText);
        }
    });
}



//Local news easybutton and modal
function fetchNewsForCountry() {
    let countryISO2 = $('#country').find(':selected').data('iso2');

    $(".lds-dual-ring").show();
    $(".loading-overlay").show();

    $.ajax({
        url: 'php/fetchNews.php',
        type: 'GET',
        data: { country: countryISO2 },
        dataType: 'json',
        success: function(data) {
            $(".lds-dual-ring").hide();
            $("#loadingOverlay").hide();

            if (data && data.data) {
                let newsList = $('#newsList');
                newsList.empty();

                for (let i = 0; i < 5 && i < data.data.length; i++) {
                    let news = data.data[i];
                    newsList.append('<h2>' + news.title + '</h2><a href="' + news.link + '" target="_blank">Read Full Article</a><hr>');
                }

                $('#news-modal').modal('show');
            } else {
                console.error("Unexpected data format:", data);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $(".lds-dual-ring").hide();
            $("#loadingOverlay").hide();
            alert("News Fetch Error: " + textStatus + " " + errorThrown + "\nResponse: " + jqXHR.responseText);
        }
    });
}

L.easyButton({
    id: 'open-news-btn',
    position: 'topleft',
    type: 'replace',
    leafletClasses: true,
    states: [{
        stateName: 'get-news',
        onClick: function(control) {
            fetchNewsForCountry();
        },
        title: 'Get News',
        icon: '<i class="fa-regular fas fa-newspaper" style="color: #000000;"></i>'
    }]
}).addTo(mymap);


//Selected countries flag easybutton and modal
function showFlag(iso2) {
    $('#countryFlagImg').attr('src', `https://ajppeters.com/images/flags/${iso2}.svg`);
    $('#flagModal').modal('show');
    }

L.easyButton('<i class="fa-regular fa-flag" style="color: #d50b0b;"></i>', function(btn, map) {
    if (selectedCountryISO2) {
        showFlag(selectedCountryISO2);
    } else {
        console.log("Country not selected yet");
    }
}).addTo(mymap);


//Selected country weather forecast easybutton and modal
function fetchWeather(lat, lon) {
    $.ajax({
        url: '/php/fetchWeather.php',
        type: 'GET',
        dataType: 'json',
        data: {
            lat: lat,
            lon: lon
        },
        success: function(data) {
            $('#currentTemp').text(data.current.temp_c + "°C");
            $('#weatherDescription').text(data.current.condition.text);
            $('#currentWeatherIcon').attr('src', 'https:' + data.current.condition.icon);

            const hourlyData = data.forecast.forecastday[0].hour;

            ['hourlyForecastBlock1', 'hourlyForecastBlock2', 'hourlyForecastBlock3'].forEach((blockId, index) => {
                const hourHtml = `
                    <span class="time">${hourlyData[index].time.split(' ')[1]}</span>
                    <img src="https:${hourlyData[index].condition.icon}" alt="Hourly Weather Icon">
                    <span class="hourTemp">${hourlyData[index].temp_c}°C</span>
                `;
                $(`#${blockId}`).html(hourHtml);
            });

            const dailyData = data.forecast.forecastday;
$('#dailyForecast').html("");
dailyData.forEach((dayData, index) => {
    if(index < 2) {
        const dayHtml = `
            <div class="col-6"> <!-- Here's the change -->
                <span class="dayName">${new Date(dayData.date).toLocaleDateString('default', { weekday: 'long' })}</span>
                <img src="https:${dayData.day.condition.icon}" alt="Daily Weather Icon">
                <span class="highTemp">${dayData.day.maxtemp_c}°C</span>/<span class="lowTemp">${dayData.day.mintemp_c}°C</span>
            </div>
        `;
        $('#dailyForecast').append(dayHtml);
    }
});

            let weatherCondition = data.current.condition.text.toLowerCase();
            let backgroundImage;

            if (weatherCondition.includes('rain')) {
            backgroundImage = 'url(/images/weather/rain.jpg)';
            } else if (weatherCondition.includes('sunny')) {
            backgroundImage = 'url(/images/weather/sun.jpg)';
            } else if (weatherCondition.includes('fog')) {
            backgroundImage = 'url(/images/weather/fog.jpg)';
            } else if (weatherCondition.includes('mist')) {
            backgroundImage = 'url(/images/weather/mist.jpg)';
            } else if (weatherCondition.includes('cloudy')) {
            backgroundImage = 'url(/images/weather/cloudy.jpg)';
            } else if (weatherCondition.includes('thunder')) {
            backgroundImage = 'url(/images/weather/thunder.jpg)';
            } else if (weatherCondition.includes('overcast')) {
            backgroundImage = 'url(/images/weather/overcast.jpg)';
            } else if (weatherCondition.includes('light') && weatherCondition.includes('rain')) {
            backgroundImage = 'url(/images/weather/lightrain.jpg)';
            } else {
            backgroundImage = 'url(/images/weather/default.jpg)';
}

          $('#weatherModal .modal-content .modal-body').css({
    'background-image': backgroundImage,
    'background-size': 'cover',
    'background-position': 'center center',
    'background-repeat': 'no-repeat'
});
            
            $('#weatherModal').modal('show');
        },
        error: function(error) {
            console.error("Error fetching weather data:", error);
        }
    });
}


L.easyButton('<i class="fa-solid fa-sun" style="color: #e0d01f;"></i>', function(btn, map) {
    let lat = map.getCenter().lat;
    let lon = map.getCenter().lng;
    fetchWeather(lat, lon);
}, 'Get Weather Info').addTo(mymap);



//Local and GMT offset easybutton and modal
function displayTimezoneInfo(iso2) {
    let apiUrl = `http://secure.geonames.org/countryInfo?country=${iso2}&username=ajppeters`;
    $(".lds-dual-ring").show();
    $(".loading-overlay").show();
    
    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'xml',
        success: function(data) {
            let country = $(data).find('country');
            let latitude = country.find('north').text();
            let longitude = country.find('west').text();

            
            getTimezoneInfo(latitude, longitude, function(timezoneData) {
                let offsetHours = timezoneData.gmtOffset / 3600; 
                let prefix = offsetHours >= 0 ? "UTC+" : "UTC"; 
                let formattedOffset = prefix + offsetHours;

                $('#localTime').text(timezoneData.formatted);
                $('#gmtOffset').text(formattedOffset); 
                
                $(".lds-dual-ring").hide();
                $(".loading-overlay").hide();
                $('#timezoneModal').modal('show');
            });
        },
        error: function(error) {
            console.error("Error fetching country info:", error);
        }
    });
}

function getTimezoneInfo(lat, lng, callback) {
    let apiUrl = `/php/timezone.php?lat=${lat}&lng=${lng}`;

    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            callback(data);
        },
        error: function(error) {
            console.error("Error fetching timezone data:", error);
        }
    });
}

L.easyButton('<i class="fa-regular fa-clock" style="color: #5188e6;"></i>', function(btn, map) {
    let iso2 = $('#country').find('option:selected').data('iso2');
    if (iso2) {
        displayTimezoneInfo(iso2);
    }
}, 'Get Timezone Info').addTo(mymap);

//Overlay for the markers to be enabled/ disabled in controls
let overlayMarkers = {
    "Cities": cityMarkers,
    "Airports": airportMarkers,
    "Earthquakes": earthquakeMarkers
};

L.control.layers(baseLayers, overlayMarkers).addTo(mymap);
