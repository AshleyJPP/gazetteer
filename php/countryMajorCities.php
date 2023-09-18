<?php
require_once 'config.php';

ini_set('display_errors', 'On');
error_reporting(E_ALL);


header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$executionStartTime = microtime(true);

$countryCode = $_GET['c'];

$url = 'http://api.geonames.org/searchJSON?&country=' . $countryCode . '&cities=cities15000&maxRows=30&lang=en&username=ajppeters' . $geonames_key . '&style=full';

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

$cURLERROR = curl_errno($ch);

curl_close($ch);

if ($cURLERROR) {

    $output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
    $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
    $output['data'] = null;
} else {

    $cities = json_decode($result, true);

    if (json_last_error() !== JSON_ERROR_NONE) {

        $output['status']['code'] = json_last_error();
        $output['status']['name'] = "Failure - JSON";
        $output['status']['description'] = json_last_error_msg();
        $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
        $output['data'] = null;
    } else {


        if (isset($cities['status'])) {

            $output['status']['code'] = $cities['status']['value'];
            $output['status']['name'] = "Failure - API";
            $output['status']['description'] = $cities['error']['message'];
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            $output['data'] = null;
        } else {


            $finalResult = [];

            foreach ($cities['geonames'] as $item) {

                $temp['name'] = $item['asciiName'];
                $temp['lat'] = $item['lat'];
                $temp['lng'] = $item['lng'];
                $temp['population'] = $item['population'];

                array_push($finalResult, $temp);
            }

            $output['status']['code'] = 200;
            $output['status']['name'] = "success";
            $output['status']['description'] = "all ok";
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            // $output['data'] = $cities;
            $output['data'] = $finalResult;
        }
    }
}

echo json_encode($output, JSON_NUMERIC_CHECK);
?>
