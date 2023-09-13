<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Check if 'countryCode' is set
if (!isset($_GET['countryCode'])) {
    echo json_encode(['error' => 'Country code is not provided.']);
    exit;
}

$countryCode = $_GET['countryCode'];

// Fetch currency code from GeoNames API
$url = 'http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $countryCode . '&username=ajppeters';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decode = json_decode($result, true);

if (!isset($decode['geonames'][0]['currencyCode'])) {
    echo json_encode(['error' => 'Failed to fetch currency code from GeoNames.']);
    exit;
}

$currencyCode = $decode['geonames'][0]['currencyCode'];
if (!isset($_GET['countryCode']) || empty($_GET['countryCode'])) {
    echo json_encode(["error" => "Country code is not provided."]);
    exit();
}

// Fetch conversion rate using the RapidAPI currency converter
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency?have=GBP&want=" . $currencyCode . "&amount=" . $_GET['amount'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => [
    "X-RapidAPI-Host: currency-converter-by-api-ninjas.p.rapidapi.com",
    "X-RapidAPI-Key: 98f4f2f379msh19589ed57897fa6p119ab6jsn3b9f2cbf5937"
],
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo json_encode(['error' => "cURL Error: $err"]);
} else {
    echo $response;
}
?>
