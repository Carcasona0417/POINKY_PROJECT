Expenses Table
CREATE TABLE Expenses (
    ExpID      VARCHAR(50) NOT NULL PRIMARY KEY,
    UserID     VARCHAR(50) NOT NULL,
    PigID      VARCHAR(50) NOT NULL,
    FarmID     VARCHAR(50) NOT NULL,
    `Date`     DATE NOT NULL,
    Amount     DECIMAL(10,2) NOT NULL,
    Category   VARCHAR(100) NOT NULL,

    CONSTRAINT fk_exp_user
        FOREIGN KEY (UserID)
        REFERENCES User(UserID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_exp_pig
        FOREIGN KEY (PigID)
        REFERENCES Pig(PigID)
        ON DELETE CASCADE
        ON UPDATE CASCADE	
);

-- Sample expenses
INSERT INTO Expenses (ExpID, UserID, PigID, FarmID, `Date`, Amount, Category) VALUES
('E001','U001','P001','F001','2025-10-05',45.00,'Feed'),
('E002','U002','P002','F002','2025-09-20',120.50,'Veterinary'),
('E003','U001','P001','F001','2025-11-01',15.20,'Supplies');
