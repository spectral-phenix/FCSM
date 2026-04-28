<?php
require_once 'db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'me') {
    if (empty($_SESSION['id_etudiant'])) {
        jsonResponse(['connected' => false]);
    }

    $stmt = $pdo->prepare('SELECT id, nom, prenom, email, groupe FROM etudiant WHERE id = ?');
    $stmt->execute([$_SESSION['id_etudiant']]);
    $user = $stmt->fetch();

    if (!$user) {
        session_destroy();
        jsonResponse(['connected' => false]);
    }

    jsonResponse(['connected' => true, 'user' => $user]);
}

if ($method === 'POST') {
    $body = getBody();
    $action = $body['action'] ?? '';

    if ($action === 'login') {
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        $stmt = $pdo->prepare('SELECT id, nom, prenom, email, groupe, password FROM etudiant WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // V1 volontairement simple : mot de passe en clair, demandé pour les tests.
        if (!$user || $user['password'] !== $password) {
            jsonResponse(['error' => 'Email ou mot de passe incorrect'], 401);
        }

        $_SESSION['id_etudiant'] = (int) $user['id'];
        unset($user['password']);
        jsonResponse(['success' => true, 'user' => $user]);
    }

    if ($action === 'logout') {
        session_destroy();
        jsonResponse(['success' => true]);
    }
}

jsonResponse(['error' => 'Action inconnue'], 400);
