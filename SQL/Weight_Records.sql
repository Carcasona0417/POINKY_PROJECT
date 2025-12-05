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

<<<<<<< Updated upstream
-- Auto-increment counter table for WeightID generation
CREATE TABLE IF NOT EXISTS weight_id_counter (
    counter_id INT PRIMARY KEY DEFAULT 1,
    next_id INT DEFAULT 1,
    CONSTRAINT pk_counter CHECK (counter_id = 1)
);
=======
-- Sample weight records
INSERT INTO Weight_Records (WeightID, `Date`, Weight, PigID, PhotoPath) VALUES
('W001','2025-10-05',32.50,'P001','/img/weights/p001-20251005.jpg'),
('W002','2025-11-01',34.10,'P001','/img/weights/p001-20251101.jpg'),
('W003','2025-09-20',85.75,'P002','/img/weights/p002-20250920.jpg');
>>>>>>> Stashed changes
