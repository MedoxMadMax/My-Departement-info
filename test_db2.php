<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=departement_info_db;charset=utf8mb4', 'root', '');
$stmt = $pdo->query("SELECT id, slug, contenu FROM actualite ORDER BY id DESC LIMIT 5");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: " . $row['id'] . "\n";
    $contenu = json_decode($row['contenu'], true);
    if ($contenu && isset($contenu['googleMapsUrl'])) {
        echo "Map: " . $contenu['googleMapsUrl'] . "\n";
    }
}
