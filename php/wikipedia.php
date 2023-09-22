<?php

$lat = $_GET['lat'];
$lng = $_GET['lng'];

$url = "http://api.geonames.org/findNearbyWikipedia?lat={$lat}&lng={$lng}&username=ajppeters"; 

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result = curl_exec($ch);
curl_close($ch);

$xml = simplexml_load_string($result);
$json = json_encode($xml);

header('Content-Type: application/json');
echo $json;

?>
