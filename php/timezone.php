<?php
$lat = $_GET['lat'];
$lng = $_GET['lng'];
$apiKey = "BTZQU61U7DDH";

$apiUrl = "https://api.timezonedb.com/v2.1/get-time-zone?key={$apiKey}&format=json&by=position&lat={$lat}&lng={$lng}";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
