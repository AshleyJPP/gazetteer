<?php

    // Echo all errors back to the screen of the browser so PHP can be debugged
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    // Initialize cURL
    $lat = urlencode($_REQUEST['42.65']);
    $lng = urlencode($_REQUEST['1.41']);
    $apiUrl = 'http://secure.geonames.org/countryCodeJSON?lat=' . $lat . '&lng=' . $lng . '&username=ajppeters';
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Store the data
    $countryData = curl_exec($ch);
    
    if ($countryData === false) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "internal server error";
    $output['status']['description'] = "Error executing cURL request: " . curl_error($ch);
} else {
    // Decode JSON response
    $code = json_decode($countryData, true);

    // Check if decoding was successful
    if (json_last_error() === JSON_ERROR_NONE) {
        // Your normal processing code here...
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "internal server error";
        $output['status']['description'] = "Error decoding JSON response: " . json_last_error_msg();
    }
    
    var_dump($countryData);
    
    // End the cURL
    curl_close($ch);

    // Decode JSON response
    $code = json_decode($countryData, true);

    ////////////////////////////////////////////////

    $ch1 = curl_init('http://secure.geonames.org/countryInfoJSON?formatted=true&country=' . $code['countryCode'] . '&username=ajppeters&style=full;');
    curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);

    // Store the data
    $currencyData = curl_exec($ch1);
    
    var_dump($currencyData);
    
    // End the cURL
    curl_close($ch1);

    // Decode JSON response
    $currency = json_decode($currencyData, true);

    ////////////////////////////////////////////////

    // Assign the output variable properties to relevant data
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data']['country'] = $code['countryCode'];
    $output['data']['currency'] = $currency['geonames'][0]['currencyCode'];

    header('Content-Type: application/json; charset=UTF-8');

   // Echo out all the useful data
    echo json_encode($output);
    
}?>
