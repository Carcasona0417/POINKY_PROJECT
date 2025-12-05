CREATE TABLE Pig (
    PigID      VARCHAR(50)  NOT NULL PRIMARY KEY,
    PigName    VARCHAR(100) NOT NULL,
    Breed      VARCHAR(100),
    Gender     ENUM('Male', 'Female') NOT NULL,
    `Date`     DATE NOT NULL,
    Age        VARCHAR(100),
    Weight     DECIMAL(5,2) NOT NULL,
    PigType    ENUM('Piglet', 'Starter', 'Grower', 'Finisher') NOT NULL,
    PigStatus  ENUM('Growing', 'ToSale', 'Sold', 'Deceased') NOT NULL DEFAULT 'Growing',
    FarmID     VARCHAR(50) NOT NULL,

    CONSTRAINT fk_pig_farm
        FOREIGN KEY (FarmID)
        REFERENCES Farm(FarmID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Sample pigs
INSERT INTO Pig (PigID, PigName, Breed, Gender, `Date`, Age, Weight, PigType, PigStatus, FarmID)
VALUES
('P001','Bacon Jr.','Large White','Male','2024-02-15','9 months',32.50,'Grower','Growing','F001'),
('P002','Rosie','Berkshire','Female','2023-08-01','16 months',85.75,'Finisher','ToSale','F002'),
('P003','Snout','Duroc','Male','2025-05-10','3 months',12.20,'Piglet','Growing','F001');
