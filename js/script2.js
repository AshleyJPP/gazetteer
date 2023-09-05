var map = L.map('map').setView([51.5, -0.1], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const dropdown = document.getElementById('countryDropdown');




var geoJSONStyle = {
  color: 'green', 
  weight: 2,    
  opacity: 0.8  
};

document.addEventListener('DOMContentLoaded', function () {
    fetch('php/select.php')
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;

      
      if (Array.isArray(data)) {
        data.forEach((country) => {
          const option = document.createElement('option');
          option.value = country.code; 
          option.textContent = country.name; 
          dropdown.appendChild(option); 
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

  
  map.eachLayer(function (layer) {
    if (layer instanceof L.GeoJSON) {
      map.removeLayer(layer);
    }
  });

  
  const selectedCountryGeoJSON = geoJSONData.features.find((feature) => feature.properties.ISO_A3 === selectedCountryCode);

  if (selectedCountryGeoJSON) {
   
    const countryLayer = L.geoJSON(selectedCountryGeoJSON, {
      style: geoJSONStyle
    }).addTo(map);

    
    map.fitBounds(countryLayer.getBounds());
  } else {
    console.error('GeoJSON data not found for the selected country:', selectedCountryCode);
  }
});


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
        
        if (result && result.status && result.status.code === '200') {
            
        } else {
            console.error('Error fetching country information:', result.status.description);
            
        }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching country information:', errorThrown);
        
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
  var selectedOption = $('#countryDropdown option:selected'); 
  var selectedCountryCode = selectedOption.val();
  var selectedCountryName = selectedOption.text();
  fetchCountryInfo(selectedCountryCode);
  
  $('#countryInfoModal').modal('show');
},
    title: 'Country Information',
  }],
}).addTo(map);



