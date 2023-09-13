<?php

function getMinPopulationForCountry($countryISO2) {
    switch($countryISO2) {
        case 'US':
            return 1500000;
        case 'MA': // ISO code for Morocco
            return 1000000;
        // Add more countries as needed
        case 'GB':
            return 400000;
            case 'CN':
                return 10000000;
                case 'JP':
                    return 1000000;
                    case 'TR':
                        return 1000000;
        default:
            return 200000; // Some default value
    }
}

if (isset($_GET['countryISO2']) && !empty($_GET['countryISO2'])) {
    $countryISO2 = $_GET['countryISO2'];
    
    // Get the minimum population for the country
    $minPopulation = getMinPopulationForCountry($countryISO2);
    
    $curl = curl_init();
    // Add the minPopulation to the URL
    $url = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=" . $countryISO2 . "&minPopulation=" . $minPopulation . "&limit=30";

    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => [
            "X-RapidAPI-Host: wft-geo-db.p.rapidapi.com",
            "X-RapidAPI-Key: 98f4f2f379msh19589ed57897fa6p119ab6jsn3b9f2cbf5937"  // Replace with your actual API Key
        ],
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
        echo json_encode(["error" => "cURL Error: " . $err]);
    } else {
        echo $response;
    }
} else {
    echo json_encode(["error" => "No valid country ISO2 provided."]);
}
?>
