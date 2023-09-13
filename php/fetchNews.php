<?php

$countryCode = $_GET['country']; // Get the country code from the URL parameter

$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => "https://real-time-news-data.p.rapidapi.com/top-headlines?country=" . urlencode($countryCode) . "&lang=en&time_published=1d",
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"X-RapidAPI-Host: real-time-news-data.p.rapidapi.com",
		"X-RapidAPI-Key: 8371fa09d7msh669721e344d880dp191944jsned220c821ee2"
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

header('Content-Type: application/json'); // Setting the content type to JSON for proper handling on the client side

if ($err) {
    echo json_encode(["error" => "cURL Error #:" . $err]);
} else {
    echo $response;
}
?>
