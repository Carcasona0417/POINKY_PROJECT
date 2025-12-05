Farm Table
CREATE TABLE Farm (
    FarmID   VARCHAR(50) NOT NULL PRIMARY KEY,
    FarmName VARCHAR(50) NOT NULL,
    UserID   VARCHAR(50) NOT NULL,
    CONSTRAINT fk_farm_user
        FOREIGN KEY (UserID)
        REFERENCES User(UserID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Sample farm records
INSERT INTO Farm (FarmID, FarmName, UserID) VALUES ('F001','Sunny Farm','U001');
INSERT INTO Farm (FarmID, FarmName, UserID) VALUES ('F002','Riverside Farm','U002');
INSERT INTO Farm (FarmID, FarmName, UserID) VALUES ('F003','Green Pastures','U003');
