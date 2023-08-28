<?php
 
    // Echo all errors back to the screen of the browser so PHP can be debugged
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    ini_set('memory_limit', '1024M');

    $executionStartTime = microtime(true);

    // Get data from countries_large data file
    $countryData = json_decode(file_get_contents("../json/countries_large.geo.json"), true);

    // Create an empty array to add data to
    $country = [];

    // Use a for each loop to go through each feature of the geoJson data and get the country name and ISO 3 code
    foreach ($countryData['features'] as $feature) {

        // Create a temporary variable to store data
         $temp = null;
        // Add the iso 3 code into the code property of the temp variable
         $temp['code'] = $feature["properties"]['ISO_A3'];
        // Add the country name into the name property of the temp variable
         $temp['name'] = $feature["properties"]['ADMIN'];

        // Use the push method to append the temp data into the country array
         array_push($country, $temp); 
    };

    // Use the usort feature to compare items in the country array to put them in alphabetic order
    usort($country, function ($item1, $item2) {

        // Compare each name against one another and order alphabetically
         return $item1['name'] <=> $item2['name'];
    });

    // Assign the output variable properties to relevant data
     $output['status']['code'] = "200";
     $output['status']['name'] = "ok";
     $output['status']['description'] = "success";
     $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
     $output['data'] = $country;
 
     header('Content-Type: application/json; charset=UTF-8');

    // Echo out all the useful data
     echo json_encode($output);

?>