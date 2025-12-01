# Fix: Weight Record "Pig Not Found" Error

## Root Cause

The error occurs because of a **mismatch between frontend pig IDs and backend database pig IDs**:

- **Frontend Demo Data**: Uses numeric IDs (1, 2, 3)
- **Backend Database**: Uses PigID format like "P001", "P002", etc.
- **The API Call**: Was sending numeric ID (e.g., `1`) to backend, but database has no pig with ID `1`

## Solution Applied

Updated `FRONTEND/Mini-Capstone/js/Farm.js` to:

1. **Before API call, get the actual database PigID** from the pig object:
   ```javascript
   const actualPigId = pig.PigID || pig.serverId || currentDetailPigId;
   ```

2. **Log the values for debugging**:
   ```javascript
   console.log('Attempting API call with pigId:', actualPigId, 'original:', currentDetailPigId);
   ```

3. **Send the correct PigID to the API**:
   ```javascript
   await callWeightRecordAPI(actualPigId, apiPayload, isEdit);
   ```

## What You Need To Do

### Option 1: Create Database Pigs (Recommended)

If you want to use the backend database, you need to:

1. **Add pigs to your database** with proper PigIDs like "P001", "P002":
   ```sql
   INSERT INTO pig (PigID, PigName, Breed, Gender, Date, Age, Weight, PigType, PigStatus, FarmID)
   VALUES ('P001', 'Babe', 'Large White', 'Female', '2025-01-01', '6', 30, 'Grower', 'Growing', 'F001');
   ```

2. **Make sure the FarmID matches** a farm that exists in your database

3. **Then use the pig ID when making API calls**

### Option 2: Use Demo Data Only

If you want to stay with demo data (no database):

1. **Add `PigID` field to demo pigs** in Farm.js:
   ```javascript
   {
       id: 1,
       name: "Babe",
       PigID: "P001",        // <- Add this
       serverId: "P001",     // <- Or this
       // ... rest of fields
   }
   ```

2. This way the frontend will find the PigID to send to the API

### Option 3: Hybrid Approach (Best Practice)

The **best approach is to have both**:

1. Backend database with real pigs (P001, P002, etc.)
2. Frontend initially loads from database
3. Pigs have both `id` (local) and `PigID` (database) fields
4. When making API calls, always use `PigID` or `serverId`

## Testing

After making changes, try adding a weight record again:

1. Open browser DevTools (F12)
2. Check Console tab
3. Look for message: `"Attempting API call with pigId: P001 original: 1"`
4. If you see this, the fix is working
5. Check Network tab to see the actual API call

## Debug Information

If still getting "pig not found" error:

1. **Check your database** - Query the pig table:
   ```sql
   SELECT PigID, PigName, FarmID FROM pig;
   ```

2. **Check Farm database** - Make sure farm exists:
   ```sql
   SELECT FarmID, FarmName FROM farm;
   ```

3. **Check Browser Console** - See what PigID is being sent

4. **Check Backend Console** - See what error is returned

## Files Modified

- `FRONTEND/Mini-Capstone/js/Farm.js` - Updated addWeightRecord API call (line ~1570)
- `FRONTEND/Mini-Capstone/js/Farm.js` - Updated deleteWeightRecord API call (line ~3740)
- `BACKEND/Controllers/pigController.js` - Added better error logging

## Next Steps

1. Verify your database has pigs with proper PigIDs
2. Check that those PigIDs have the format "P001", "P002", etc.
3. Make sure your frontend pig objects include `PigID` or `serverId` field
4. Try adding a weight record again
5. Check console logs to see the actual PigID being used
