CREATE DATABASE sample_db;
USE sample_db;

CREATE TABLE user (
    UserID VARCHAR(10) PRIMARY KEY,
    Username VARCHAR(100),
    Email VARCHAR(100),
    PasswordHash VARCHAR(255)
);

INSERT INTO user (UserID, Username, Email, PasswordHash)
VALUES ('U001','John Doe','john@example.com','123456');

SELECT * FROM user;
