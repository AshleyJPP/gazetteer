<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

$apiKey = "ym4GgPN59urMEuRhdNudXg==erwr9ofNxGu6hDs8";
$countryIso = urlencode($_GET['country']);
$year = $_GET['year']; // Added to retrieve year from AJAX call

$url = "https://api.api-ninjas.com/v1/holidays?country=" . $countryIso . "&year=" . $year; // Make sure the URL is accurate

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "X-Api-Key: " . $apiKey,
    "Content-Type: application/json" // Added to make sure the response is JSON
));

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode(["error" => curl_error($ch)]);
} else {
    echo $result;
}

curl_close($ch);
?>
