//global variables
const selectedCountryCode = $('#country').val().toLowerCase();
var mapContainer = document.getElementById('map');
var dropdownContainer = document.getElementById('dropdown-container');
mapContainer.appendChild(dropdownContainer);
var markers = L.markerClusterGroup();
var airportMarkers = L.markerClusterGroup();
var majorCities = L.markerClusterGroup();


//load map and markers/layers
var map = L.map('map').setView([51.5, -0.1], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
map.addLayer(markers);
map.addLayer(airportMarkers);
map.addLayer(majorCities);


var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


//highlight country borders

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
        fetchCountryInfo(selectedCountryCode);
        const flagImg = $('#countryFlag');
        flagImg.attr('src', `images/flags/${selectedCountryCode}.svg`);
        $('#countryInfoModal').modal('show');
        
        
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
                    color: 'green',
                    weight: 7
                }
            });
            // Add the new country borders to the cluster layer
            map.addLayer(countryBordersLayer);

            map.fitBounds(countryBordersLayer.getBounds());
        }
    }
}



// Load airport data
$.getJSON('json/airports.json', function(data) {
    const airports = data;

    
    $('#country').on('change', function() {
        const selectedCountryCode = $(this).val();
        if (countryBordersLayer) {
            map.removeLayer(countryBordersLayer);
        }

        updateLocalTime(selectedCountryCode);
        highlightSelectedCountry(countryGeoJSONData, selectedCountryCode);
        
        // Clear existing airport markers from the marker cluster group
        markers.clearLayers();

        // Filter airports based on the selected country code
        const airportsInCountry = Object.values(airports).filter(airport => airport.country === selectedCountryCode);
        
         const airportIcon = L.icon({
        iconUrl: '/images/airport.png', 
        iconSize: [32, 32], 
        iconAnchor: [16, 32], 
        popupAnchor: [0, -32]
    });


        // Add markers for airports
        for (const airport of airportsInCountry) {
        const airportName = airport.name;
        const airportCity = airport.city;
        const airportCountry = airport.country;
        const airportIataCode = airport.iata;
        const airportLat = airport.lat;
        const airportLng = airport.lon;

            
            const marker = L.marker([airportLat, airportLng], { icon: airportIcon })
                .bindPopup(`${airportName}, ${airportCity}, ${airportCountry} (${airportIataCode})`)
                .bindTooltip(airportName, { direction: 'top', permanent: false, opacity: 1 });
            
            
            markers.addLayer(marker);
        }

        
        map.addLayer(markers);
    });
});






const customCityIcon = L.icon({
    iconUrl: 'images/city.png', // Replace with the path to your SVG image
    iconSize: [32, 32], // Adjust the icon size as needed
    iconAnchor: [16, 32], // Adjust the icon anchor point if needed
    popupAnchor: [0, -16], // Adjust the popup anchor point if needed
});


//Add city markers on selected country
let cityMarkers;

function addCityMarkers(countryCode) {
    if (!cityMarkers) {
        cityMarkers = L.markerClusterGroup();
    } else {
        cityMarkers.clearLayers();
    }

    const countryCities = cities.filter(city => city.country === countryCode);

    console.log('Filtered Cities:', countryCities);

    countryCities.forEach(city => {
        const cityMarker = L.marker([city.lat, city.lng], { icon: customCityIcon });
        cityMarker.on('mouseover', function(e) {
      this.bindPopup(city.name).openPopup();
    });
    cityMarker.on('mouseout', function(e) {
      this.closePopup();
    });
        
        cityMarker.bindPopup(city.name);
        cityMarkers.addLayer(cityMarker);
    });

    console.log('City Markers:', cityMarkers);

    map.addLayer(cityMarkers);
}

// Load city data
let cities;

$.getJSON('json/cities.json', function (cityData) {
    cities = cityData;

    $('#country').on('change', function () {
        const selectedCountryCode = $(this).val();

        
        if (cityMarkers) {
            map.removeLayer(cityMarkers);
        }

        
        addCityMarkers(selectedCountryCode);
    });
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

//Country information modal/ easybutton with flag

function fetchCountryInfo(countryCode) {
  const username = 'ajppeters'; 
  const apiUrl = `https://secure.geonames.org/countryInfoJSON?formatted=true&lang=en&country=${countryCode}&username=${username}&style=full`;

  $.getJSON(apiUrl, function (data) {
    if (data.geonames && data.geonames.length > 0) {
      const countryData = data.geonames[0];

      updateCountryInfoModal(countryData);
    } else {
      console.error('No country information data available.');
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error fetching country information:', errorThrown);
  });
}

function updateCountryInfoModal(countryData) {
  const modalContent = $('#countryInfoList');
  modalContent.empty();

  const capital = countryData.capital;
  const population = countryData.population;
  const area = countryData.areaInSqKm;
  const continent = countryData.continentName;
  const currency = countryData.currencyCode;
  const isoCode = countryData.countryCode;

  
  const capitalItem = `<li><strong>Capital:</strong> ${capital}</li>`;
  const populationItem = `<li><strong>Population:</strong> ${population}</li>`;
  const areaItem = `<li><strong>Area:</strong> ${area} sq km</li>`;
  const continentItem = `<li><strong>Continent:</strong> ${continent}</li>`;
  const currencyItem = `<li><strong>Currency:</strong> ${currency}</li>`;
  const isoCodeItem = `<li><strong>ISO Code:</strong> ${isoCode}</li>`;

  
  modalContent.append(capitalItem, populationItem, areaItem, continentItem, currencyItem, isoCodeItem);

  
  $('#countryInfoModal').modal('show');
}

L.easyButton({
  id: 'country-info',
  states: [{
    icon: 'fas fa-info',
    onClick: function (btn, map) {
      var selectedCountryCode = $('#country').val();
      fetchCountryInfo(selectedCountryCode);
      var selectedCountryName = $('#country option:selected').text();
      fetchWikipediaSummary(selectedCountryCode);
      $('#countryInfoModal').modal('show');
    },
    title: 'Country Information',
  }],
}).addTo(map);


function fetchWikipediaSummary(latitude, longitude) {
    console.log('Fetching Wikipedia summary...');
  const username = 'ajppeters';
  const apiUrl = `https://secure.geonames.org/findNearbyWikipediaJSON?lat=${latitude}&lng=${longitude}&username=${username}`;

  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
        console.log('API Response:', data);
      
      const wikipediaEntries = data.geonames;

      
      if (wikipediaEntries.length > 0) {
        const summary = wikipediaEntries[0].summary;
        const fullArticleUrl = `https://en.wikipedia.org/wiki/${wikipediaEntries[0].title}`;
        
        console.log('Summary:', summary); 
        console.log('Full Article URL:', fullArticleUrl);

        return { summary, fullArticleUrl }; 
      } else {
        console.error('No Wikipedia entries found.');
        return { summary: '', fullArticleUrl: '' }; 
      }
    })
    .catch((error) => {
      console.error('Error fetching Wikipedia data:', error);
      return { summary: '', fullArticleUrl: '' }; 
    });
}

// Event handler for dropdown change
document.getElementById('country').addEventListener('change', function () {
  const selectedCountryCode = this.value; // Get the selected country code

  
  $.getJSON('json/countrylatlong.json', function (yourJsonData) {
    // Find the selected country's coordinates from your JSON data
    const countryData = yourJsonData.find((country) => country.alpha2 === selectedCountryCode);

    if (countryData) {
      const { latitude, longitude } = countryData.coordinates;
         fetchWikipediaSummary(latitude, longitude)
        .then((data) => {
          
          document.getElementById('countrySummary').innerHTML = data.summary;
          const fullArticleLink = document.getElementById('fullArticleLink');
          fullArticleLink.href = data.fullArticleUrl;
          fullArticleLink.style.display = 'block';
        });
    } else {
      console.error('Coordinates not found for the selected country.');
      document.getElementById('countrySummary').textContent = '';
      document.getElementById('fullArticleLink').href = '';
      document.getElementById('fullArticleLink').style.display = 'none';
    }
  });
});


function setCountryFlag(countryCode) {
  const flagImg = new Image();
  const flagSvgPath = `images/flags/${countryCode}.svg`;

  flagImg.src = flagSvgPath;
  flagImg.alt = `${countryCode} Flag`;
  flagImg.width = 50;

  
  const flagContainer = document.getElementById('countryFlag');
  flagContainer.innerHTML = '';
  flagContainer.appendChild(flagImg);
}


//Currency converter modal/ easybutton

let currencyCodeMappings = {}; 


$.getJSON('json/countries.json', function(data) {
    const countries = data.countries.country;
    
    
    for (const country of countries) {
        const countryCode = country.countryCode;
        const currencyCode = country.currencyCode;
        
        currencyCodeMappings[countryCode] = currencyCode;
    }
    
    setupCurrencyButton(); 
});

function setupCurrencyButton() {
    L.easyButton({
        id: 'currency',
        states: [{
            icon: 'fas fa-dollar-sign', 
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




//News on country with easybutton
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


const capitals = {
    "US":{
        capital: "Washington"
    },
     "GB":{
    "name": "United Kingdom",
    "capital": "London",
    },
};
 


// Update the fetchWeatherForecastForCapital function
function fetchWeatherForecastForCapital(countryCode) {
  const apiKey = '125b0872658e69e8a6508bfacd5bed92';
  const capitalInfo = capitals[countryCode];

  if (!capitalInfo) {
    console.error('Capital city information not available.');
    return;
  }

  const { capital, lat, lon } = capitalInfo;

  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=1&appid=${apiKey}`;

  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      
      if (data.list && data.list.length > 0) {
        const forecast = data.list[0];
        const temperatureInKelvin = forecast.main.temp;
        const temperatureInCelsius = (temperatureInKelvin - 273.15).toFixed(2);
        const description = forecast.weather[0].description;

        
        const modalContent = `
          <p><strong>Weather in ${capital}:</strong> ${description}, Temperature: ${temperatureInCelsius}°C</p>
          <!-- Add more weather information as needed -->
        `;
        $('#forecast-modal .modal-body').html(modalContent);

        
        $('#forecast-modal').modal('show');
      } else {
        console.error('No weather forecast data available.');
      }
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      $('#forecast-modal .modal-body').html('Error fetching weather data.');
      $('#forecast-modal').modal('show');
    });
}

$.getJSON('json/capitals.json', function (capitalData) {
  if (!capitalData || capitalData.error) {
    console.error('Failed to load capital data.');
    return;
  }
  
  capitalData.forEach(country => {
    capitals[country.iso2] = {
      capital: country.capital,
      lat: country.lat,
      lon: country.lon,
    };
  });
  
   $('#country').on('change', function () {
    const selectedCountryCode = $(this).val();
    fetchWeatherForecastForCapital(selectedCountryCode);
  });
});

// Update the easy button setup
L.easyButton({
  id: 'forecast',
  states: [{
    icon: 'fas fa-sun',
    onClick: function (btn, map) {
       const selectedCountryCode = $('#country').val();
       fetchWeatherForecastForCapital(selectedCountryCode);
    },
    title: 'Weather Forecast',
  }],
}).addTo(map);




var countryCityMap = {
    US: 'New_York',
    GB: 'London',
    
};







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
        icon: 'fas fa-clock',
        onClick: function(btn, map) {
            const selectedCountryCode = document.getElementById('country').value;
            fetchAndDisplayTimezone(selectedCountryCode);
        },
        title: 'Timezone'
    }]
}).addTo(map);
});










function geolocationCallback( position ){
    
    
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    
    var latlng = new L.LatLng(lat, lng);
 
    
    mymap = map.setView(latlng, 8);

    
    L.marker(latlng, {title: 'You are here', icon: pericon}).addTo(map);

    
    $.ajax({
        url: "php/latlngtocc.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng,
        },
        success: function(result) {
            
            
            homeCurrency = result['data']['currency'];
            
            getData(result['data']['country']); 
        },
        
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
