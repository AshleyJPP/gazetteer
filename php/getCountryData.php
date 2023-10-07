<?php


$countryData = json_decode(file_get_contents("../json/countryBorders.geo.json"), true);

$data = [];

foreach ($countryData['features'] as $feature) {
    $temp = [];
    $temp['iso2'] = $feature["properties"]['iso_a2'];
    $temp['name'] = $feature["properties"]['name'];

    $data[] = $temp;
}

usort($data, function($item1, $item2) {
    return strcmp($item1['name'], $item2['name']);
});

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($data);
?>
