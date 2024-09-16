<?php
    $servername = "localhost";
    $username = "root";
    $password = "";

    // Create connection
    $conn = new mysqli($servername, $username, $password);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } else {
        echo "connection sucessfully\n";
    }

    // debug: create database if not already
    $db_name = "test_db";
    $sql = "CREATE DATABASE IF NOT EXISTS $db_name";
    if ($conn->query($sql) === TRUE) {
        echo "Database created successfully\n";
    } else {
        echo "Error creating database: " . $conn->error . "\n";
    }
    // Select the database
    $conn->select_db($db_name);

    // debug: create table. Note: VARCHAR can have size limit, TEXT doesn't
    $sql = "CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        shopping_cart TEXT
    )";
    if ($conn->query($sql) === TRUE) {
        echo "Table 'user' created successfully\n";
    } else {
        echo "Error creating table: " . $conn->error . "\n";
    }

    // debug: insert sample data
    $sql = "INSERT INTO user (email, password, first_name, last_name, shopping_cart) VALUES
    ('afds@asdfasdf.com', '123456', 'Chonhei', 'Chan','Book7, Book8')"; //put simple data here
    if ($conn->query($sql) === TRUE) {
        echo "Sample data inserted successfully\n";
    } else {
        echo "Error inserting data: " . $conn->error . "\n";
    }

    $conn->close();
?>
