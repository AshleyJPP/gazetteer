<?php
$username = "ajppeters";

// Get the country ISO code from the request
$countryISO2 = $_GET['countryISO2'] ?? null;

// If the country code isn't set, return an error
if (!$countryISO2) {
    echo json_encode(['error' => 'No country code provided.']);
    exit;
}

// Fetch bounding box from countryInfo API
$countryInfoURL = "http://api.geonames.org/countryInfo?country={$countryISO2}&username={$username}&lang=en";
$response = file_get_contents($countryInfoURL);
$countryData = simplexml_load_string($response);

// If we don't get the expected data, exit
if (!$countryData || !$countryData->country) {
    echo json_encode(['error' => 'Failed to fetch country info.']);
    exit;
}

$north = $countryData->country->north;
$south = $countryData->country->south;
$east = $countryData->country->east;
$west = $countryData->country->west;

// Use the bounding box to fetch earthquakes data
$earthquakesURL = "http://api.geonames.org/earthquakesJSON?north={$north}&south={$south}&east={$east}&west={$west}&maxRows=50&username={$username}";
$earthquakeData = file_get_contents($earthquakesURL);

// Return the earthquakes data
echo $earthquakeData;
?>
