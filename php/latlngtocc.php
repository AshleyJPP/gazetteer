<?php

    // Echo all errors back to the screen of the browser so PHP can be debugged
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    // Initialize cURL
    $ch = curl_init('http://api.geonames.org/countryCodeJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=ajppeters');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Store the data
    $countryData = curl_exec($ch);
    
    // End the cURL
    curl_close($ch);

    // Decode JSON response
    $code = json_decode($countryData, true);

    ////////////////////////////////////////////////

    $ch1 = curl_init('http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $code['countryCode'] . '&username=ajppeters&style=full;');
    curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);

    // Store the data
    $currencyData = curl_exec($ch1);
    
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
    
?>