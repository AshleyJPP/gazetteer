<?php
$lat = urlencode($_REQUEST['lat']);
$lng = urlencode($_REQUEST['lng']);
$apiUrl = 'http://api.geonames.org/countryCodeJSON?lat=' . $lat . '&lng=' . $lng . '&type=JSON&username=ajppeters'; // Set type to JSON
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$countryCodeData = curl_exec($ch);

if ($countryCodeData === false) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "internal server error";
    $output['status']['description'] = "Error executing cURL request: " . curl_error($ch);
} else {
        $countryCodeResult = json_decode($countryCodeData, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        $countryCode = $countryCodeResult['countryCode'];

        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['data']['countryCode'] = $countryCode;
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($output);
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "internal server error";
        $output['status']['description'] = "Error decoding JSON response: " . json_last_error_msg();
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($output);
    }

    curl_close($ch);
}
?>
