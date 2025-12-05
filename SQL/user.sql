CREATE DATABASE sample_db;
USE sample_db;

CREATE TABLE user (
    UserID VARCHAR(10) PRIMARY KEY,
    Username VARCHAR(100),
    Email VARCHAR(100),
    Password VARCHAR(255)
);

INSERT INTO user (UserID, Username, Email, Password)
VALUES ('U001','John Doe','john@example.com','123456');

-- Additional sample users
INSERT INTO user (UserID, Username, Email, Password)
VALUES ('U002','Jane Roe','jane@example.com','password123');

INSERT INTO user (UserID, Username, Email, Password)
VALUES ('U003','Alice Smith','alice@example.com','alicepwd');

SELECT * FROM user;
