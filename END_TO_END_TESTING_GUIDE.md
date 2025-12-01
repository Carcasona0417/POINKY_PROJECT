# Complete End-to-End Testing Guide

## System Architecture Overview

```
Frontend (Mini-Capstone/)
├── Dashboard.html → Farm.js (main controller)
└── pig-details.html (iframe for detailed pig view)
    └── Calls parent window functions via direct call or postMessage

Backend (BACKEND/)
├── app.js (Express server on port 8080)
├── routes/pigRoutes.js (API endpoints)
├── Controllers/pigController.js (request handlers)
└── Logic/
    ├── Add-Pig.js (pig business logic)
    └── Weight-Records.js (weight record business logic)

Database
├── pig (main pig records)
├── weight_records (weight history)
└── weight_id_counter (sequence counter for WeightID)
```

## Testing Prerequisites

1. **Backend Running**: `node app.js` should be running on port 8080
2. **Database Connected**: MySQL database initialized with schema
3. **Frontend Served**: Mini-Capstone folder accessible via browser
4. **Console Open**: Open browser DevTools to monitor logs

## Test Case 1: Add Weight Record

**Objective**: Verify weight records save to database and capture WeightID

**Steps**:
1. Open Dashboard.html
2. Click on a farm, then select a pig
3. In pig details iframe, click "Add Weight"
4. Enter:
   - Date: 2024-01-15
   - Weight: 75.5
   - Image: (optional)
5. Click "Submit"

**Expected Results**:
- [ ] Modal closes
- [ ] New weight appears in weight table
- [ ] Browser console shows:
  ```
  Attempting API call with pigId: [PigID] original: [localId]
  API Result: { success: true, record: { WeightID: "W001", ... } }
  Weight record successfully sent to backend
  ```
- [ ] Database query shows new record in weight_records table with WeightID

**Console Logs to Watch**:
```javascript
callWeightRecordAPI: Attempting to reach http://localhost:8080/api/pigs/P001/weights
API Result: { success: true, record: { WeightID: "W001", Date: "2024-01-15", ... } }
newRecord.weightId = W001  // This enables future delete/edit
```

## Test Case 2: Edit Weight Record

**Objective**: Verify weight records can be edited and persist changes

**Steps**:
1. From previous test, find the added weight record
2. Click the edit button (pencil icon)

**Expected Results - Modal Opens**:
- [ ] Edit modal appears
- [ ] Date field shows: 2024-01-15
- [ ] Weight field shows: 75.5
- [ ] Browser console shows:
  ```
  editWeightRecord called with index: 0
  pigId: P001 farmId: F001
  Calling callParentAction for edit weight
  ```

**Continue Test - Submit Edit**:
3. Change weight to: 76.0
4. Click "Submit"

**Expected Results - Edit Saved**:
- [ ] Modal closes
- [ ] Weight table updated to show 76.0 kg
- [ ] Database weight_records table shows updated value
- [ ] Console shows successful API call

## Test Case 3: Delete Weight Record

**Objective**: Verify weight records can be deleted from UI and database

**Steps**:
1. Find a weight record in the table
2. Click the delete button (trash icon)

**Expected Results - Click Fires**:
- [ ] Browser console shows:
  ```
  deleteWeightRecord called with index: 0
  pigId: P001 farmId: F001
  Calling parent openDeleteRecordConfirmModal
  ```

**Continue Test - Confirm Delete**:
3. Delete confirmation modal appears
4. Click "Confirm Delete"

**Expected Results - Delete Succeeds**:
- [ ] Modal closes
- [ ] Weight record removed from table
- [ ] Console shows:
  ```
  Attempting weight delete API with pigId: P001 weightId: W001
  Weight record deleted successfully on server
  ```
- [ ] Database query shows record no longer exists in weight_records

**Continue Test - Verify WeightID Was Used**:
- [ ] Verify that delete was called with proper WeightID (W001, not index)
- [ ] If WeightID wasn't captured, you'd see error: "Weight record not found"

## Test Case 4: Edit Pig Details

**Objective**: Verify pig information can be edited

**Steps**:
1. Click dropdown menu in pig details (three dots)
2. Click "Edit Pig"

**Expected Results**:
- [ ] Edit pig modal opens
- [ ] Current pig data is pre-populated
- [ ] Modal closes after clicking outside or submit
- [ ] Console shows:
  ```
  btnEditPig.addEventListener click fired
  e.stopPropagation() prevented dropdown close
  ```

**Submit Edit**:
3. Change pig name or other field
4. Click "Save"

**Expected Results**:
- [ ] Modal closes
- [ ] Pig details iframe refreshes
- [ ] New data displays in pig details
- [ ] Console shows successful API call to PUT /api/pigs/{pigId}

## Test Case 5: Delete Pig

**Objective**: Verify pigs can be deleted along with related weight records

**Setup**: Create test pig with multiple weight records

**Steps**:
1. Click dropdown menu in pig details
2. Click "Delete Pig"

**Expected Results - Modal**:
- [ ] Confirmation modal appears
- [ ] Modal asks to confirm deletion

**Confirm Delete**:
3. Click "Confirm Delete"

**Expected Results - Deletion**:
- [ ] Modal closes
- [ ] Pig removed from pig list
- [ ] Console shows:
  ```
  callDeletePigAPI: success with http://localhost:8080
  Pig successfully deleted
  ```
- [ ] Database shows:
  - [ ] Pig record removed from pig table
  - [ ] All related weight_records deleted (cascade)

## Test Case 6: Event Propagation

**Objective**: Verify dropdown doesn't close prematurely

**Steps**:
1. Click the three-dots dropdown menu in pig details
2. With dropdown open, click any action button (Edit, Delete)

**Expected Results**:
- [ ] Dropdown immediately closes (not left open)
- [ ] Action is properly triggered
- [ ] Console shows: `e.stopPropagation()` was called

## Test Case 7: Multi-Endpoint Fallback

**Objective**: Verify API calls work even if one endpoint fails

**Steps**:
1. Add a weight record while:
   - Primary endpoint (window.location.origin) is unavailable
   - Secondary endpoint (localhost:8080) is available

**Expected Results**:
- [ ] Browser tries multiple API bases in order
- [ ] Succeeds on first available endpoint
- [ ] Console shows:
  ```
  callWeightRecordAPI: trying URL: http://localhost:5500/api/pigs/P001/weights
  callWeightRecordAPI: failed to reach http://localhost:5500...
  callWeightRecordAPI: trying URL: http://localhost:8080/api/pigs/P001/weights
  callWeightRecordAPI: success with http://localhost:8080
  ```

## Test Case 8: Error Handling

**Objective**: Verify proper error messages when operations fail

**Scenario 1 - Pig Not Found**:
1. Manually set pigId to non-existent value
2. Try to add weight record

**Expected Results**:
- [ ] Error alert appears: "Pig not found in database"
- [ ] Weight NOT added locally
- [ ] Console shows 404 response

**Scenario 2 - Server Offline**:
1. Stop backend server
2. Try to add weight record

**Expected Results**:
- [ ] Error alert appears: "Server connection failed"
- [ ] Weight NOT added locally
- [ ] Console shows connection attempts to all candidates

## Database Verification Queries

### Verify Weight Record Added
```sql
SELECT * FROM weight_records WHERE PigID = 'P001' ORDER BY Date DESC;
```
Should show new record with auto-generated WeightID (W001, W002, etc.)

### Verify Weight Record Deleted
```sql
SELECT COUNT(*) FROM weight_records WHERE PigID = 'P001';
```
Count should decrease by 1

### Verify Cascade Delete Works
```sql
SELECT * FROM weight_records WHERE PigID = 'P001';
SELECT * FROM pig WHERE PigID = 'P001';
```
After deleting pig, both queries should return no results

### Check WeightID Counter
```sql
SELECT * FROM weight_id_counter;
```
Shows current sequence value for next WeightID

## Console Logging Checklist

Watch for these patterns in console:

```javascript
// Weight Add Flow
✓ Attempting API call with pigId: P001 original: 123
✓ API Result: { success: true, record: { WeightID: "W001", ... } }
✓ newRecord.weightId = W001

// Weight Edit Flow
✓ editWeightRecord called with index: 0
✓ pigId: P001 farmId: F001
✓ Calling callParentAction for edit weight

// Weight Delete Flow
✓ deleteWeightRecord called with index: 0
✓ pigId: P001 farmId: F001
✓ Calling parent openDeleteRecordConfirmModal
✓ Attempting weight delete API with pigId: P001 weightId: W001
✓ Weight record deleted successfully on server

// API Fallback
✓ callWeightRecordAPI: trying URL: http://localhost:8080/...
✓ callWeightRecordAPI: success with http://localhost:8080

// Error Cases
✗ API returned success=false
✗ Server connection failed
✗ Weight record not found
```

## Troubleshooting Guide

### Problem: "Delete button doesn't work"
- **Check Console**: Look for editWeightRecord/deleteWeightRecord log
- **If Missing**: Button onclick handler not firing
  - Solution: Check that actualIndex is being calculated correctly
- **If Present**: Modal not opening
  - Solution: Check that callParentAction is reaching parent functions

### Problem: "WeightID not captured, delete says 'record not found'"
- **Expected**: In console after add, should see: `newRecord.weightId = W001`
- **If Missing**: API response isn't being read correctly
  - Solution: Verify `apiResult.record.WeightID` exists in API response
  - Check backend is returning proper JSON structure

### Problem: "Edit modal shows old data after refresh"
- **Check**: Is localStorage being saved properly?
  - Look for: `saveFarmsToStorage()` being called
  - Browser DevTools → Application → Local Storage → verify pig data

### Problem: "Multiple endpoints failing"
- **Check**: Are all candidate APIs actually available?
  - Solution: Verify port 8080 is correct for backend
  - Check if using Live Server on port 5500/5501

### Problem: "Modal doesn't close after action"
- **Check**: Is modal display style set properly?
  - Solution: Verify `modal.style.display = "none"` is executing
  - Check CSS doesn't override display property

## Performance Considerations

- Weight tables with 100+ records: May need pagination
- Image uploads: Consider compression for large images
- API calls: Should timeout after 5-10 seconds
- Local storage: 5MB+ can cause performance issues

## Security Notes

- ✅ WeightID properly validated on backend (SQL WHERE clause)
- ✅ PigID validated before operations
- ✅ All deletions require confirmation
- ⚠️ Todo: Add authentication headers to API calls
- ⚠️ Todo: Implement request validation middleware

## Next Steps After Verification

1. **Once all tests pass**: System is production-ready for this feature
2. **Performance optimization**: Add pagination to large weight lists
3. **UI enhancement**: Add bulk operations (delete multiple records)
4. **Data export**: Add CSV export for weight history
5. **Analytics**: Add trending/charting for weight over time
