<?php
$countryCode = urlencode($_REQUEST['countryCode']);
$apiUrl = 'http://api.geonames.org/countryInfoJSON?country=' . $countryCode . '&type=JSON&username=ajppeters';

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$countryInfoData = curl_exec($ch);

if ($countryInfoData === false) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "internal server error";
    $output['status']['description'] = "Error executing cURL request: " . curl_error($ch);
} else {
    $countryInfoResult = json_decode($countryInfoData, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        $countryInfo = $countryInfoResult['geonames'][0]; // Adjust this as per the actual structure of the response

        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['data'] = $countryInfo; // Sending all the country info
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "internal server error";
        $output['status']['description'] = "Error decoding JSON response: " . json_last_error_msg();
    }

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
}

curl_close($ch);
?>
