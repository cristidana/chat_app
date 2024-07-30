DROP DATABASE IF EXISTS chat_app;
CREATE DATABASE chat_app;
USE chat_app;

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) DEFAULT NULL,
                       role ENUM('USER_ROLE', 'ADMIN_ROLE') NOT NULL
);

CREATE TABLE messages (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          user_id INT NOT NULL,
                          message TEXT NOT NULL,
                          sender ENUM('user', 'admin') NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Check if the 'admin' user already exists before inserting
INSERT INTO users (username, password_hash, role)
SELECT 'admin', '$2a$12$3CjJmVxPhEE4DZnvhEJNKu0AwwzmBsUvyZoCCDELabUaUPyACsxdi', 'ADMIN_ROLE'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
