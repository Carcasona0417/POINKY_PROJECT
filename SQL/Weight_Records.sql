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

-- Auto-increment counter table for WeightID generation
CREATE TABLE IF NOT EXISTS weight_id_counter (
    counter_id INT PRIMARY KEY DEFAULT 1,
    next_id INT DEFAULT 1,
    CONSTRAINT pk_counter CHECK (counter_id = 1)
);
