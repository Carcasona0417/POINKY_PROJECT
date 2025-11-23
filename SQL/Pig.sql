Pig Table
CREATE TABLE Pig (
    PigID     VARCHAR(50) NOT NULL PRIMARY KEY,
    PigName   VARCHAR(100) NOT NULL,
    Breed     VARCHAR(100),
    Gender    ENUM('Male', 'Female') NOT NULL,
    `Date`    DATE NOT NULL,              
    Weight    DECIMAL(5,2) NOT NULL,      
    PigType   VARCHAR(100),               
    FarmID    VARCHAR(50) NOT NULL,       

    CONSTRAINT fk_pig_farm
        FOREIGN KEY (FarmID)
        REFERENCES Farm(FarmID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
