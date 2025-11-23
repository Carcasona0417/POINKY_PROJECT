Vaccination_Record Table (WEAK)
CREATE TABLE Vaccination_Record (
    PigID    VARCHAR(50) NOT NULL,
    RemID    VARCHAR(50) NOT NULL,
    DueDate  DATE NOT NULL,
    Category VARCHAR(50) NOT NULL,

    PRIMARY KEY (PigID, RemID),

    CONSTRAINT fk_vacrec_pig
        FOREIGN KEY (PigID)
        REFERENCES Pig(PigID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_vacrec_rem
        FOREIGN KEY (RemID)
        REFERENCES Reminders(RemID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
