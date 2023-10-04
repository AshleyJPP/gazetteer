//Global Variables
selectedCountryISO2 = $(this).find(':selected').data('iso2');
var markers = L.markerClusterGroup();

document.addEventListener("DOMContentLoaded", function() {
    const initialLoader = document.querySelector('#initialLoader');
    if (initialLoader) {
        initialLoader.style.display = 'flex';
    }

    setTimeout(function() {
        if (initialLoader) {
            initialLoader.style.display = 'none';
        }
    }, 2000);
});



//Custom marker icons
var cityIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
  icon: 'fa-city',
  markerColor: 'green',
  shape: 'square'
});


var airportIcon = L.ExtraMarkers.icon({
    icon: 'fa-plane',
    markerColor: 'blue', 
    shape: 'circle',
    prefix: 'fa',
    iconColor: 'black'
});


var earthquakeIcon = L.icon({
    iconUrl: '/project1/images/equake.png',
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
    iconUrl: '/project1/images/location.png',
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
            selectedCountryISO2 = data.address.country_code.toUpperCase();
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
        url: "/project1/php/select.php",
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

$.getJSON('/project1/json/countryBorders.geo.json', function(data) {
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

//Country Information easybutton and modal, including wikipedia article summary
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
            let iso3 = country.find('isoAlpha3').text();
            let postalCode = country.find('postalCodeFormat').text();
            let languages = country.find('languages').text();

            let wikiSearchUrl = `http://secure.geonames.org/wikipediaSearch?q=${capital}&maxRows=1&username=ajppeters`;

            population = numberWithCommas(population);

            $.ajax({
                url: wikiSearchUrl,
                type: 'GET',
                dataType: 'xml',
                success: function(wikiData) {
                    let entry = $(wikiData).find('entry:first');
                    if (entry) {
                        $('#wikiSummary').text(entry.find('summary').text());
                        $('#wikiLink').attr('href', `https://${entry.find('wikipediaUrl').text()}`).text("Read the full article");
                        $('#wikiLink').show();
                    } else {
                        $('#wikiSummary').text("No Wikipedia summary available for this country.");
                        $('#wikiLink').hide();
                    }

                    $('#capital').text(capital);
                    $('#population').text(population);
                    $('#area').text(area);
                    $('#continentName').text(continent);
                    $('#currency').text(currency);
                    $('#iso').text(isoCode);
                    $('#iso3Code').text(iso3);
                    $('#postalCodeFormat').text(postalCode);
                    $('#languages').text(languages);
                    $(".lds-dual-ring").hide();
                    $('#countryInfoFlag').attr('src', `https://ajppeters.com/project1/images/flags/${iso2}.svg`);
                    $('#countryInfoModal').modal('show');
                },
                error: function(error) {
                    $(".lds-dual-ring").hide();
                    console.error("Error fetching Wikipedia data:", error);
                }
            });
        },
        error: function(error) {
            $(".lds-dual-ring").hide();
            console.error("Error fetching country data:", error);
        }
    });
}




function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
            url: "/project1/php/currencyConverter.php",
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
        url: "/project1/php/fetchCities.php",
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
        url: "/project1/php/fetchAirports.php",
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
        url: "/project1/php/fetchEarthquakes.php",
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


function fetchNewsForCountry(countryIso) {
    
    $.ajax({
        url: "/project1/php/fetchNews.php",
        type: 'GET',
        data: { country: countryIso },
        dataType: 'json',
        success: function(data) {
            let newsHtml = '';
            if (data.results && data.results.length) {
    data.results.slice(0, 5).forEach(function(article) {
        const imageUrl = article.image_url || "path/to/your/placeholder-image.jpg";

        newsHtml += `
            <div class="news-item d-flex align-items-start">
                ${article.image_url ? `<img src="${imageUrl}" alt="${article.title}" class="news-thumbnail me-3">` : ''}
                <div>
                    <h4 class="news-headline">${article.title}</h4>
                    <a href="${article.link}" target="_blank" class="view-link">View full article</a>
                </div>
            </div>
        `;
    });
} else {
    newsHtml = '<p>No news articles available.</p>';
}
            $('#newsModalBody').html(newsHtml);
            $('#newsModal').modal('show');
            $(".lds-dual-ring").hide();
            },
        error: function(error) {
            console.error("Error fetching news data:", error);
        }
    });
}

L.easyButton('<i class="fas fa-newspaper" style="color: #3a76df;"></i>', function(btn, map) {
    $(".lds-dual-ring").show();
    let countryIso = $('#country').find('option:selected').data('iso2');
    if (countryIso) {
        fetchNewsForCountry(countryIso);
    }
    }, 'Get News').addTo(mymap);


//Selected country weather forecast easybutton and modal
function fetchWeatherForCity(city) {
    $.ajax({
        url: '/project1/php/fetchWeatherByCity.php',
        type: 'GET',
        dataType: 'json',
        data: {
            city: city
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
            <div class="col-6">
                <span class="dayName">${new Date(dayData.date).toLocaleDateString('default', { weekday: 'long' })}</span>
                <img src="https:${dayData.day.condition.icon}" alt="Daily Weather Icon">
                <span class="highTemp">${dayData.day.maxtemp_c}°C</span>/<span class="lowTemp">${dayData.day.mintemp_c}°C</span>
            </div>
        `;
        $('#dailyForecast').append(dayHtml);
    }
});

            $('#weatherModal').modal('show');
        },
        error: function(error) {
            console.error("Error fetching weather data:", error);
        }
    });
}

function getDefaultCityForCountry(countryIso) {
    const countryCityMap = {
        'US': 'New York City',
        // ... Add other mappings here
    };

    return countryCityMap[countryIso] || 'Unknown City';
}


L.easyButton('<i class="fa-solid fa-sun" style="color: #e0d01f;"></i>', function(btn, map) {
    let countryIso = $('#country').find('option:selected').data('iso2');
    const city = getDefaultCityForCountry(countryIso);
    fetchWeatherForCity(city);
}, 'Get Weather Info').addTo(mymap);

function fetchHolidaysForCountry(countryIso) {
    const currentYear = new Date().getFullYear(); // Current year
    
    $.ajax({
        url: "/project1/php/fetchHolidays.php",
        type: 'GET',
        data: { 
            country: countryIso, 
            year: currentYear 
        },
        dataType: 'json',
        success: function(data) {
    
    
    let holidaysHtml = '<table><tbody>'; 

    // Sort data by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (data && data.length) {
        data.forEach(function(holiday) {
            if (holiday.type === "PUBLIC_HOLIDAY" || holiday.type === "OBSERVANCE") {
                let dateObj = new Date(holiday.date);
                let formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

                holidaysHtml += `
                    <tr>
                        <td>${holiday.name}</td> 
                        <td>${formattedDate}</td>
                    </tr>
                `;
            }
        });
    } else {
        holidaysHtml += '<tr><td colspan="2">No holidays available for this country.</td></tr>';
    }
    holidaysHtml += '</tbody></table>';
    
    $('#holidaysModalBody').html(holidaysHtml);
    $('#holidaysModal').modal('show');
}





,
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
}

L.easyButton('<i class="fas fa-calendar-alt" style="color: #3a76df;"></i>', function(btn, map) {
    let countryIso = window.selectedCountryISO2; // Use your global ISO variable name if it's different
    if (countryIso) {
        fetchHolidaysForCountry(countryIso);
    }
}, 'Get Holidays').addTo(mymap);




//Overlay for the markers to be enabled/ disabled in controls
let overlayMarkers = {
    "Cities": cityMarkers,
    "Airports": airportMarkers,
    "Earthquakes": earthquakeMarkers
};

L.control.layers(baseLayers, overlayMarkers).addTo(mymap);
