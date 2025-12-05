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

-- Sample reminders
INSERT INTO Reminders (RemID, UserID, PigID, Date, Task, Notes) VALUES
('R001','U001','P001','2025-11-15','Vaccination - Booster','Bring vaccine A'),
('R002','U002','P002','2025-12-01','Weigh-in','Record weight and photo'),
('R003','U001','P003','2026-01-10','Sell preparation','Check vaccinations and health');
