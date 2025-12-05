Expenses_Record Table (WEAK)
CREATE TABLE Expenses_Record (
    PigID     VARCHAR(50) NOT NULL,
    FarmID    VARCHAR(50) NOT NULL,
    ExpID     VARCHAR(50) NOT NULL,
    Amount    DECIMAL(10,2) NOT NULL,
    `Date`    DATE NOT NULL,
    Category  VARCHAR(50) NOT NULL,

    PRIMARY KEY (PigID, ExpID),

    CONSTRAINT fk_exprec_pig
        FOREIGN KEY (PigID)
        REFERENCES Pig(PigID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_exprec_exp
        FOREIGN KEY (ExpID)
        REFERENCES Expenses(ExpID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Sample expenses records
INSERT INTO Expenses_Record (PigID, FarmID, ExpID, Amount, `Date`, Category) VALUES
('P001','F001','E001',45.00,'2025-10-05','Feed'),
('P002','F002','E002',120.50,'2025-09-20','Medicine'),
('P001','F001','E003',15.20,'2025-11-01','Sold');
