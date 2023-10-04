<?php

$apiKey = "bcb96f6ed7464385831201524231709";
$region = $_GET['region'];

$url = "http://api.weatherapi.com/v1/forecast.json?key=$apiKey&q=$region&days=3";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$result = curl_exec($ch);

if(curl_errno($ch)){
    echo 'Request Error:' . curl_error($ch);
}

curl_close($ch);

echo $result;

?>
