<?php


if (isset($_GET['iso2'])) {
    $iso2 = $_GET['iso2'];

    
    $countryData = json_decode(file_get_contents("../json/countryBorders.geo.json"), true);

    $feature = null;

    foreach ($countryData['features'] as $featureData) {
        if ($featureData['properties']['iso_a2'] === $iso2) {
            $feature = $featureData;
            break;
        }
    }

    if ($feature !== null) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($feature);
    } else {
        header('HTTP/1.1 404 Not Found');
    }
} else {
    header('HTTP/1.1 400 Bad Request');
}
?>
