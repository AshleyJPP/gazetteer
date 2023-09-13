<?php

$countryISO2 = $_GET['countryISO2'];
$username = "ajppeters";
$endpoint = "http://api.geonames.org/searchJSON";

$response = file_get_contents("{$endpoint}?q=airport&country={$countryISO2}&maxRows=30&lang=en&username={$username}");

echo $response;

?>
