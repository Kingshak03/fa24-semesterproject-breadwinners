<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");

// Enable error reporting for debugging (can be disabled in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start the session
session_start();

// CSRF Token Verification
$csrf_token = $_COOKIE['csrf_token'] ?? '';
error_log('Session CSRF Token: ' . (isset($_SESSION['csrf_token']) ? $_SESSION['csrf_token'] : 'Not set'));
error_log('Cookie CSRF Token: ' . $csrf_token);

if (!isset($_SESSION['csrf_token']) || $csrf_token !== $_SESSION['csrf_token']) {
    echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
    exit();
}

// Database connection
include 'db_connection.php';

$response = array();

try {
    // Check for auth token in the request headers
    if (!isset($_COOKIE['auth_token'])) {
        throw new Exception("Missing authorization token");
    }

    $auth_token = $_COOKIE['auth_token'];

    // // Validate the auth token format If we want to add later we can
    // if (!preg_match('/^[a-zA-Z0-9_-]{32}$/', $auth_token)) {
    //     throw new Exception("Invalid authorization token format");
    // }

    // Verify auth token and fetch seller email
    $query = "SELECT email FROM user WHERE auth_token = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("s", $auth_token);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception("Invalid authorization token");
    }
    $user = $result->fetch_assoc();
    $seller_email = $user['email'];
    $stmt->close();

    // Fetch books for the specific seller
    $query = "SELECT id, title, author, image_url, price, genre, rating, stock,  total_books_sold  FROM books WHERE seller_email = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("s", $seller_email);
    $stmt->execute();

    $result = $stmt->get_result();
    $books = [];
    while ($row = $result->fetch_assoc()) {
        $row['profit'] = $row['total_books_sold'] * $row['price'];
        $books[] = $row;
    }

    $response['success'] = true;
    $response['books'] = $books;
    $stmt->close();
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Failed to fetch books: ' . $e->getMessage();
}

$conn->close();

echo json_encode($response);
?>