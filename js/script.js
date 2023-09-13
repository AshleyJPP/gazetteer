//Global varibales
selectedCountryISO2 = $(this).find(':selected').data('iso2');
var markers = L.markerClusterGroup();

//Custom Icons
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

//Loading Spin
$(".lds-dual-ring").show();


//Map layers
var street = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        minZoom: 4,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYXNobGV5anBwIiwiYSI6ImNsbGFxbXk5dzAwM3czam1xdTVmMmM1NjIifQ.Gn2M_HtCnWnzkuPduztcsg'
}),
    sattelite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        minZoom: 4,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYXNobGV5anBwIiwiYSI6ImNsbGFxbXk5dzAwM3czam1xdTVmMmM1NjIifQ.Gn2M_HtCnWnzkuPduztcsg'
})

var mymap = L.map('map', {
    layers: [street] 
});

var baseLayers = {
	"Streets Map": street,
	"Satellite Map": sattelite
};

//Layer Control
L.control.layers(baseLayers).addTo(mymap);

//User Location icon
var pericon = L.icon({
    iconUrl: 'images/location.png',
    iconSize: [32,32],
    iconAnchor:  [20,40]
});

$(".lds-dual-ring").hide();

//Get users location
$(document).ready(function() {
    navigator.geolocation.getCurrentPosition( geolocationCallback );  
});

function geolocationCallback( position ){
    
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var latlng = new L.LatLng(lat, lng);
 
    mymap = mymap.setView(latlng, 7);

    L.marker(latlng, {title: 'Your Location', icon: pericon}).addTo(mymap);

    $.ajax({
        url: "php/latlngtocc.php",
        type: 'POST',
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
            errorajx(jqXHR, exception);
            console.log("latitude and longitude to country code");
        }
    }); 

}

//Adding countries to the dropdown
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

//Get users location currency
function getData() {
    var code = $('#country').val();

$.ajax({
        url: "php/data.php",
        type: 'POST',
        dataType: 'json',
        data: {
            iso: code,
            currency: homeCurrency
        },
        success: function(response) {
            },
        error: function(error) {
            }
    });
}


let countryBorders;

$.getJSON('/json/countryBorders.geo.json', function(data) {
    countryBorders = data;
});

//Data received when country is selected
$('#country').change(function() {
    let selectedCountryISO3 = $(this).val();
    selectedCountryISO2 = $(this).find(':selected').data('iso2'); // Modified line
    console.log("ISO2 from dropdown change:", selectedCountryISO2);
    let selectedCountryName = $(this).find(':selected').text();
    highlightCountry(selectedCountryISO3);
    if (selectedCountryISO2) {
        fetchCitiesAndAddMarkers(selectedCountryISO2);
        fetchAirportsAndAddMarkers(selectedCountryISO2);
        fetchEarthquakesForCountry(selectedCountryISO2);
    }
});


//Highlight selected countries borders
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

//Country information modal and easybutton
function getCountryInfo(iso2) {
    let apiUrl = `http://secure.geonames.org/countryInfo?country=${iso2}&username=ajppeters`;
    $(".lds-dual-ring").show();
    $("#loadingOverlay").show();

    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'xml',
        success: function(data) {
            $(".lds-dual-ring").hide();
            $("#loadingOverlay").hide();

            let country = $(data).find('country');
            let capital = country.find('capital').text();
            let population = country.find('population').text();
            let area = country.find('areaInSqKm').text();
            let continent = country.find('continent').text();
            let currency = country.find('currencyCode').text();
            let isoCode = country.find('countryCode').text();
            currentCapital = country.capital;
            
            $('#capital').text(capital);
            $('#population').text(population);
            $('#area').text(area);
            $('#continent').text(continent);
            $('#currency').text(currency);
            $('#isoCode').text(isoCode);
            $('#countryInfoModal').modal('show');
        },
        error: function(error) {
            $(".lds-dual-ring").hide();
            $("#loadingOverlay").hide();
            console.error("Error fetching data:", error);
        }
    });
}

L.easyButton('fas fa-info', function(btn, map) {
    let iso2 = $('#country').find('option:selected').data('iso2');
    if (iso2) {
        getCountryInfo(iso2);
    }
}, 'Get Country Info').addTo(mymap);


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
});

//Currency exchange modal and easybutton
function showCurrencyModal(data) {
    $('#conversionRate').text('1 GBP = ' + data.result + ' ' + data.currencyCode);
    $('#currencyModal').modal('show');
}

function getCurrencyConversion(amount) {
    
    let countryCode = $('#country').find('option:selected').data('iso2');
    
    if (countryCode && amount) {
        $(".lds-dual-ring").show();
        $("#loadingOverlay").show();

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
                $("#loadingOverlay").hide();

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

L.easyButton('fas fa-exchange-alt', function(btn, map) {
    let currentAmount = parseFloat($('#gbpAmount').val());
    if (currentAmount >= 0) {
        getCurrencyConversion(currentAmount); 
    }
}, 'Currency Converter').addTo(mymap);


let selectedCountryName = '';

//Adding major cities to the map as markers in a clustermarker group
let cityMarkers = L.layerGroup().addTo(mymap);

function fetchCitiesAndAddMarkers(countryISO2) {
    console.log('Fetching cities for country:', countryISO2);

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

//Adding airports to the map as markers in a clustergroup
var airportMarkers = L.markerClusterGroup();

function fetchAirportsAndAddMarkers(countryISO2) {
    console.log('Fetching airports for country:', countryISO2);

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

//Adding earthquakes to the map as markers and in a clustergroup
let earthquakeMarkers = L.markerClusterGroup();
mymap.addLayer(earthquakeMarkers);

function fetchEarthquakesForCountry(countryISO2) {
    $.ajax({
        url: "/php/fetchEarthquakes.php",
        type: "GET",
        data: { countryISO2: countryISO2 },
        dataType: "json",
        success: function(data) {
            console.log(data);
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




//Country news modal and easybutton
L.easyButton({
    id: 'open-news-btn',
    position: 'topleft',
    type: 'replace',
    leafletClasses: true,
    states: [{
        stateName: 'get-news',
        onClick: function(control) {
            let countryISO2 = $('#country').find(':selected').data('iso2');

            $(".lds-dual-ring").show();
            $("#loadingOverlay").show();

            $.ajax({
                url: 'php/get_news.php',
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
                }
            });
        },
        title: 'Get News',
        icon: 'fa-newspaper'
    }]
}).addTo(mymap);


//Country flag modal and easybutton
function showFlag(iso2) {
    console.log(iso2);
    $('#countryFlagImg').attr('src', `https://ajppeters.com/images/flags/${iso2}.svg`);
    $('#flagModal').modal('show');
}

L.easyButton('fa-flag', function(btn, map) {
        if (selectedCountryISO2) {
        showFlag(selectedCountryISO2);
    } else {
        console.log("Country not selected yet");
    }
}).addTo(mymap);


