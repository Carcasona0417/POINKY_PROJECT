Reminders Table
CREATE TABLE Reminders (
    RemID   VARCHAR(50) NOT NULL PRIMARY KEY,
    UserID  VARCHAR(50) NOT NULL,
    PigID   VARCHAR(50) NOT NULL,
    Date    DATE NOT NULL,
    Task    TEXT NOT NULL,
    Notes   VARCHAR(100),

    CONSTRAINT fk_rem_user
        FOREIGN KEY (UserID)
        REFERENCES User(UserID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_rem_pig
        FOREIGN KEY (PigID)
        REFERENCES Pig(PigID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
