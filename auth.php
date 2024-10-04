<?php
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Headers: Content-Type");
  header("Content-Type: application/json");

  // Connect to database
  $servername = "localhost";
  $SQLusername = "root";  // MySQL username
  $SQLpassword = "";      // MySQL password
  $DBname = "test_db"; // Database name

  // Create a connection to the MySQL database
  $connection = new mysqli($servername, $SQLusername, $SQLpassword, $DBname);

  // Check the database connection, exit if failed
  if ($connection->connect_error) {
      echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $conn->connect_error]);
      exit();
  }

  // Decode received POST data
  $data = json_decode(file_get_contents('php://input'), true);
  $firstName = trim($data['firstName']); // Remove whitespace
  $lastName = trim($data['lastName']); // Remove whitespace
  $email = trim($data['email']); // Remove whitespace
  $password = trim($data['password']); // Remove whitespace

  // SQL query to access database
  $sql = "SELECT * FROM user WHERE email = ?";
  $stmt = $connection->prepare($sql);
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $result = $stmt->get_result();

  // Check if user exists and verify the password
  if ($result->num_rows > 0) {
      echo json_encode(['success' => false, 'message' => 'Account with email already exists']);
  }
  else {
      // Update database with new account information
      $row = $result->fetch_assoc();
      $row['firstName'] = password_hash($firstName, PASSWORD_DEFAULT);
      $row['lastName'] = password_hash($lastName, PASSWORD_DEFAULT);
      $row['email'] = password_hash($email, PASSWORD_DEFAULT);
      $row['password'] = password_hash($password, PASSWORD_DEFAULT);

      // Verify that the database was correctly updated
      if (password_verify($row['email'], $email) && password_verify($row['firstName'], $firstName) && password_verify($row['lastName'], $lastName) && password_verify($row['password'],  $password)) {
          echo json_encode(['success' => true, 'message' => 'Registration succesful, continue to Sign In']);
  }

  $stmt->close();
  $conn->close();
?>
