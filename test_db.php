<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=departement_info_db;charset=utf8mb4', 'root', '');
$stmt = $pdo->query("SELECT id, slug, contenu FROM actualite ORDER BY id DESC LIMIT 1");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
print_r($row);
