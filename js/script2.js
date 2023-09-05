var map = L.map('map').setView([51.5, -0.1], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const dropdown = document.getElementById('countryDropdown');



// Define a custom style for the GeoJSON borders
var geoJSONStyle = {
  color: 'green', // Border color
  weight: 2,    // Border weight
  opacity: 0.8  // Border opacity
};

document.addEventListener('DOMContentLoaded', function () {
  // Fetch JSON data from the PHP script to populate the dropdown
  fetch('php/select.php')
    .then((response) => response.json())
    .then((result) => {
      const data = result.data; // Access the 'data' property of the result

      // Check if data is an array before using forEach
      if (Array.isArray(data)) {
        data.forEach((country) => {
          const option = document.createElement('option');
          option.value = country.code; // Set the value
          option.textContent = country.name; // Set the displayed text
          dropdown.appendChild(option); // Add the option to the dropdown
        });
      } else {
        console.error('Data is not an array:', data);
      }
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
});

dropdown.addEventListener('change', function () {
  const selectedCountryCode = this.value;

  // Clear existing GeoJSON layers from the map
  map.eachLayer(function (layer) {
    if (layer instanceof L.GeoJSON) {
      map.removeLayer(layer);
    }
  });

  // Filter the GeoJSON data for the selected country by ISO_A3 code
  const selectedCountryGeoJSON = geoJSONData.features.find((feature) => feature.properties.ISO_A3 === selectedCountryCode);

  if (selectedCountryGeoJSON) {
    // Create a GeoJSON layer with custom style and add it to the map
    const countryLayer = L.geoJSON(selectedCountryGeoJSON, {
      style: geoJSONStyle
    }).addTo(map);

    // Fit the map bounds to the selected country's bounds
    map.fitBounds(countryLayer.getBounds());
  } else {
    console.error('GeoJSON data not found for the selected country:', selectedCountryCode);
  }
});

// Fetch and store the countries_large.geo.json data
fetch('json/countries_large.geo.json')
  .then((response) => response.json())
  .then((data) => {
    geoJSONData = data;
  })
  .catch((error) => {
    console.error('Error fetching GeoJSON data:', error);
  });
  
  $(document).ready(function() {
    navigator.geolocation.getCurrentPosition( geolocationCallback );  
});

  var pericon = L.icon({
    iconUrl: './packages/fontawesome/userLocation.png',
    iconSize: [40,40],
    iconAnchor:  [20,40]
});


function geolocationCallback( position ){
    
    
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    
    var latlng = new L.LatLng(lat, lng);
 
    
    mymap = map.setView(latlng, 8);

    
    L.marker(latlng, {title: 'You are here', icon: pericon}).addTo(map);
}


//Country Information and Wikipedia summary/ link
$.ajax({
    url: 'php/latlngtocc.php',
    type: 'GET',
    dataType: 'json',
    data: {
        lat: latitude,
        lng: longitude
    },
    success: function (result) {
        // Check if the response is valid JSON
        if (result && result.status && result.status.code === '200') {
            // Process the data
        } else {
            // Handle error responses here
            console.error('Error fetching country information:', result.status.description);
            // Display an error message to the user
        }
    },
    error: function (jqXHR, textStatus, errorThrown) {
        // Handle network or other errors here
        console.error('Error fetching country information:', errorThrown);
        // Display an error message to the user
    }
});

var selectedOption = $('#country option:selected');
var selectedCountryName = selectedOption.text();
fetchCountryInfo(selectedCountryName);


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
  var selectedOption = $('#countryDropdown option:selected'); // Get the selected option
  var selectedCountryCode = selectedOption.val(); // Get the value attribute of the selected option
  var selectedCountryName = selectedOption.text(); // Get the text of the selected option
  fetchCountryInfo(selectedCountryCode);
  
  $('#countryInfoModal').modal('show');
},
    title: 'Country Information',
  }],
}).addTo(map);



