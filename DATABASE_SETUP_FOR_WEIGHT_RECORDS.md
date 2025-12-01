# Database Setup for Weight Records Testing

## Required: Add Demo Pigs to Database

To test the weight records functionality, you need to add the demo pigs to your database. These pigs are referenced in the frontend demo data.

### SQL Script to Add Demo Pigs

Run this SQL in your database:

```sql
-- Insert demo farm (if not exists)
INSERT IGNORE INTO farm (FarmID, FarmName, UserID) 
VALUES ('F001', 'Farm 1', 1);

-- Insert demo pigs that match the frontend demo data
INSERT IGNORE INTO pig (PigID, PigName, Breed, Gender, `Date`, Age, Weight, PigType, PigStatus, FarmID) 
VALUES 
    ('P001', 'Babe', 'Large White', 'Female', '2025-01-01', '6', 30, 'Grower', 'Growing', 'F001'),
    ('P002', 'Porky', 'Berkshire', 'Male', '2024-12-10', '8', 45, 'Grower', 'Growing', 'F001'),
    ('P003', 'Snort', 'Duroc', 'Male', '2025-02-01', '5', 25, 'Grower', 'Growing', 'F001');

-- Verify the pigs were added
SELECT PigID, PigName, Breed, Weight, PigStatus, FarmID FROM pig WHERE FarmID = 'F001';
```

### Verify Setup

After running the SQL, verify by:

1. **Check pigs exist:**
   ```sql
   SELECT * FROM pig WHERE PigID IN ('P001', 'P002', 'P003');
   ```

2. **Check farm exists:**
   ```sql
   SELECT * FROM farm WHERE FarmID = 'F001';
   ```

3. **Check weight_records table exists:**
   ```sql
   DESCRIBE weight_records;
   ```

### What Changed

The frontend demo data now includes `PigID` field for each pig:
- Demo Pig 1: `PigID: "P001"` ← Must exist in database
- Demo Pig 2: `PigID: "P002"` ← Must exist in database  
- Demo Pig 3: `PigID: "P003"` ← Must exist in database

When you add a weight record, the frontend will:
1. Find the pig object from demo data
2. Extract the `PigID` (e.g., "P001")
3. Send "P001" to the backend API
4. Backend looks for pig with PigID = "P001" in database
5. ✅ If found → Weight record created successfully
6. ❌ If not found → "Pig not found" error

## Testing the Flow

### Step 1: Add the SQL to your database

Run the SQL script above in your database client.

### Step 2: Verify database records exist

```sql
SELECT PigID, PigName FROM pig;
SELECT * FROM weight_records LIMIT 5;
```

### Step 3: Restart the backend server

Make sure the backend sees the new database records:
```bash
npm run dev
```

### Step 4: Test adding a weight record

1. Open the application
2. Click on a pig (Babe, Porky, or Snort)
3. Click "Add Weight"
4. Fill in the form and submit
5. ✅ Should succeed now!

## Troubleshooting

### Still getting "pig not found"?

1. **Verify database pigs:**
   ```sql
   SELECT * FROM pig WHERE FarmID = 'F001';
   ```
   - Should show 3 rows with PigIDs: P001, P002, P003

2. **Check the API request:**
   - Open DevTools (F12) → Network tab
   - Add a weight record
   - Look for `POST /api/pigs/P001/weights`
   - Check the request body has correct pigId

3. **Check backend logs:**
   - Look for: `addWeightRecord called with: { pigId: 'P001', ... }`
   - If you see a numeric ID like `1`, the fix didn't apply

### Database connection issues?

1. Verify database is running
2. Check `BACKEND/Database/db.js` for connection settings
3. Test connection: `npm run test:db` (if available)

## Files Modified

- `FRONTEND/Mini-Capstone/js/Farm.js` - Added `PigID` field to demo pigs (lines ~15, ~27, ~39)
- `FRONTEND/Mini-Capstone/js/Farm.js` - Updated API calls to use `pig.PigID` (lines ~1573, ~3742)

## Next: After Testing

Once you verify weight records work with these demo pigs, you can:

1. **Load real pigs from database** - Implement API call to load pigs from `/api/pigs/get-pigs-by-farm`
2. **Remove demo data** - Delete hardcoded farms array once using real database
3. **Sync data** - Ensure localStorage also updates when database changes
