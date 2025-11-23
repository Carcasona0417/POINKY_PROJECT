Expenses_Record Table (WEAK)
CREATE TABLE Expenses_Record (
    PigID     VARCHAR(50) NOT NULL,
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
