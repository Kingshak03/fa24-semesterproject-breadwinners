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
    // Check if best seller sorting is requested
    $sortByBestSeller = isset($_GET['sortByBestSeller']) && $_GET['sortByBestSeller'] === 'true';

    // Query to fetch book data
    if ($sortByBestSeller) {
        // Fetch books sorted by total books sold and rating
        $query = "SELECT id, title, author, genre, seller_email, image_url, rating, stock, price, total_books_sold FROM books ORDER BY total_books_sold DESC, rating DESC";
    } else {
        // Default fetch without sorting
        $query = "SELECT id, title, author, genre, seller_email, image_url, rating, stock, price, total_books_sold FROM books";
    }
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->execute();

    $result = $stmt->get_result();
    $books = [];
    while ($row = $result->fetch_assoc()) {
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