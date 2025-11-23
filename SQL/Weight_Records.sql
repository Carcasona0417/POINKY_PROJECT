Weight_Records Table (WEAK)
CREATE TABLE Weight_Records (
    WeightID VARCHAR(50) NOT NULL PRIMARY KEY,
    `Date`   DATE NOT NULL,
    Weight   DECIMAL(5,2) NOT NULL,
    PigID    VARCHAR(50) NOT NULL,
    PhotoPath VARCHAR(255) NULL,

    CONSTRAINT fk_weightrec_pig
        FOREIGN KEY (PigID)
        REFERENCES Pig(PigID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    UNIQUE KEY unique_pig_weight_date (PigID, Date)
);
