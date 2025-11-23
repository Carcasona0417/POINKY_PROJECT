Expenses Table
CREATE TABLE Expenses (
    ExpID      VARCHAR(50) NOT NULL PRIMARY KEY,
    UserID     VARCHAR(50) NOT NULL,
    PigID      VARCHAR(50) NOT NULL,
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
