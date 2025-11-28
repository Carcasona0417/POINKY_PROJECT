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
