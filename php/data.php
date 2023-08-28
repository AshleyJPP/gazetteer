<?php

	// Echo all errors back to the screen of the browser so PHP can be debugged
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    ini_set('memory_limit', '1024M');

    $executionStartTime = microtime(true);

    // Set variables that contain the input data
    $country = $_REQUEST['iso'];
    $currency = $_REQUEST['currency'];

    // Initialize cURL
    $ch = curl_init('https://restcountries.com/v3.1/all'  . $country);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

    // Store the data
    $result = curl_exec($ch);
    
    // End the cURL
    curl_close($ch);

    // Decode JSON response
    $rest = json_decode($result, true);

    ////////////////////////////////////////////////////////////////////////////////////////
    
     // Read data dfrom the large geoJson file
     $countryBorders = json_decode(file_get_contents("/json/countries_large.geo.json"), true);
 
     $border = null;
  
     // iterate through each data set to compare the ISO alpha 3 code against the desired code
     foreach ($countryBorders['features'] as $feature) {
  
         // If code matches set the variable border to the feature data
         if ($feature["properties"]["ISO_A3"] ==  $rest['alpha3Code']) {
  
             $border = $feature;
             break;
         }
         
     };

    ////////////////////////////////////////////////////////////////////////////////////////

     // Set access key in access key variable
    $access_key = '125b0872658e69e8a6508bfacd5bed92';

     // Initialize cURL
    $ch1 = curl_init('api.openweathermap.org/data/2.5/onecall?lat='. $rest['latlng'][0] . '&lon='  . $rest['latlng'][1]  . '&exclude=current,hourly,minutely&appid=' . $access_key);
    curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);

    // Store the data
    $forecastData = curl_exec($ch1);
    // End the cURL
    curl_close($ch1);

    // Decode JSON response
    $forecast = json_decode($forecastData, true);

    ////////////////////////////////////////////////////////////////////////////////////////

    // Initialise cURL
    $ch2 = curl_init('http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $rest['alpha2Code'] . '&username=ajppeters&style=full;');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);

    // Store the data
    $geoData = curl_exec($ch2);
    
    // End the cURL
    curl_close($ch2);

    // Decode JSON response
    $geonames = json_decode($geoData, true);

    ////////////////////////////////////////////////////////////////////////////////////////

     // Initialise cURL
    $ch3 = curl_init("https://covid-19-data.p.rapidapi.com/country/code?format=json&code=" . $rest['alpha2Code']);

    // Set cURL options
    curl_setopt_array($ch3, array(
	    CURLOPT_RETURNTRANSFER => true,
	    CURLOPT_FOLLOWLOCATION => true,
	    CURLOPT_ENCODING => "",
	    CURLOPT_MAXREDIRS => 10,
	    CURLOPT_TIMEOUT => 30,
	    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_SSL_VERIFYPEER => false,
	    CURLOPT_HTTPHEADER => array(
		    "x-rapidapi-host: covid-19-data.p.rapidapi.com",
		    "x-rapidapi-key: ec94972663msh845a225b632210ap19fd3djsnb875add99aa7"
	    ),
    ));

    // Store data and error codes
    $coronaData = curl_exec($ch3);

    // End the cURL
    curl_close($ch3);

    // Decode JSON response
    $corona = json_decode($coronaData, true);

    ////////////////////////////////////////////////////////////////////////////////////////

    // Initialise cURL
    $ch4 = curl_init();

    curl_setopt_array($ch4, array(
        CURLOPT_URL => "https://geo-services-by-mvpc-com.p.rapidapi.com/cities/significant?pourcent=0.1&countrycode=" . $rest['alpha2Code'] . "&limit=15&language=en",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER => array(
            "x-rapidapi-host: geo-services-by-mvpc-com.p.rapidapi.com",
            "x-rapidapi-key: 98f4f2f379msh19589ed57897fa6p119ab6jsn3b9f2cbf5937"
        ),
    ));

    // Store the data
    $cityData = curl_exec($ch4);
    
    // End the cURL
    curl_close($ch4);

    // Decode JSON response
    $city = json_decode($cityData, true); 

    ////////////////////////////////////////////////////////////////////////////////////////

    // Initialise cURL
    $ch5 = curl_init('http://api.geonames.org/earthquakesJSON?north=' . $geonames['geonames'][0]['north'] . '&south=' . $geonames['geonames'][0]['south'] . '&east=' . $geonames['geonames'][0]['east'] . '&west=' . $geonames['geonames'][0]['west'] . '&lang=en&username=mylesking&style=full;');
    curl_setopt($ch5, CURLOPT_RETURNTRANSFER, true);

    // Store the data
    $localQuakeData = curl_exec($ch5);
    
    // End the cURL
    curl_close($ch5);

    // Decode JSON response
    $localQuake = json_decode($localQuakeData, true); 

    ////////////////////////////////////////////////////////////////////////////////////////

    $ch6 = curl_init();

    curl_setopt_array($ch6, array(
        CURLOPT_URL => "https://currencyscoop.p.rapidapi.com/latest?base=" . $currency . "" ,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => array(
            "x-rapidapi-host: currencyscoop.p.rapidapi.com",
            "x-rapidapi-key: 98f4f2f379msh19589ed57897fa6p119ab6jsn3b9f2cbf5937"
        ),
    ));
    
    $exchangeData = curl_exec($ch6);
    
    curl_close($ch6);

    $exchange = json_decode($exchangeData, true); 

    ////////////////////////////////////////////////////////////////////////////////////////

    // Assign the output variable properties to relevant data
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data']['rest'] = $rest;
    $output['data']['borders'] = $border;
    $output['data']['forecast'] = $forecast;
    $output['data']['geonames'] = $geonames['geonames'][0];
    $output['data']['corona'] = $corona[0];
    
    // Conditional statements so that if the data returns 0, NULL, an empty value or false
    // the message will show. This is needed as if any of the above are put into the output
    // then the data set fails to parse so no data is recieved at all. 
    if (empty($localQuake)) {
        $output['data']['localQuake'] = "No data avaialable";
    } else {
        $output['data']['localQuake'] = $localQuake;
    };

    if (empty($city)) {
        $output['data']['city'] = "No data available";
    } else {
        $output['data']['city'] = $city;
    };

    if (empty($exchange['response']['rates'][$geonames['geonames'][0]['currencyCode']])) {
        $output['data']['exchange'] = "N/A";
    } else {
        $output['data']['exchange'] = $exchange['response']['rates'][$geonames['geonames'][0]['currencyCode']];
    };

    header('Content-Type: application/json; charset=UTF-8');

   // Echo out all the useful data
    echo json_encode($output);
    
?>