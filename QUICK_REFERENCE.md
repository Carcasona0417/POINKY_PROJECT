# Quick Reference - Button Fixes Implementation

## What Was Fixed

### Issue 1: Edit/Delete Buttons Not Working
**Location**: `pig-details.html`
**Solution**: Unified `callParentAction` function to properly pass data parameters

### Issue 2: Dropdown Not Closing After Button Click
**Location**: `pig-details.html` button event listeners
**Solution**: Added `e.stopPropagation()` to prevent event bubbling

### Issue 3: Delete "Record Not Found" Error
**Location**: `Farm.js` weight form submission
**Solution**: Capture `WeightID` from API response and store in record

## Critical Code Snippets

### Unified Parent Caller (pig-details.html)
```javascript
function callParentAction(label, fnName, data) {
    let canDirect = false;
    try {
        canDirect = !!(window.parent && typeof window.parent[fnName] === "function");
    } catch (err) { canDirect = false; }
    if (canDirect) {
        try {
            window.parent[fnName](pigId, farmId, data);  // ← Supports data parameter
            return;
        } catch (err) { console.warn('Direct call failed:', err); }
    }
    window.parent.postMessage(
        { type: "openAction", action: fnName, pigId, farmId, data },
        "*"
    );
}
```

### Button Click Handlers (pig-details.html)
```javascript
// Edit Weight Button
onclick="editWeightRecord(${actualIndex})"

// Delete Weight Button  
onclick="deleteWeightRecord(${actualIndex})"

// Edit Pig Button
btnEditPig.addEventListener("click", (e) => {
    e.stopPropagation();  // ← Prevents dropdown close
    dropdown.style.display = "none";
    callParentAction("Edit Pig", "openEditPigDetailsFromDetails");
});

// Delete Pig Button
btnDeletePigEl.addEventListener('click', (e) => {
    e.stopPropagation();  // ← Prevents dropdown close
    dropdown.style.display = "none";
    callParentAction('Delete Pig', 'openDeletePigFromDetails');
});
```

### Window Functions (pig-details.html)
```javascript
window.editWeightRecord = function(index) {
    console.log('editWeightRecord called with index:', index);
    callParentAction("Edit Weight", "openEditWeightFromDetails", { index });
};

window.deleteWeightRecord = async function(index) {
    console.log('deleteWeightRecord called with index:', index);
    callParentAction("Delete Weight", "openDeleteRecordConfirmModal", { type: "weight", index });
};
```

### WeightID Capture (Farm.js)
```javascript
const apiResult = await callWeightRecordAPI(actualPigId, apiPayload, isEdit);
if (apiSuccess) {
    if (apiResult.record && apiResult.record.WeightID) {
        newRecord.weightId = apiResult.record.WeightID;  // ← CRITICAL LINE
    }
}
```

### Parent Functions (Farm.js)
```javascript
window.openEditWeightFromDetails = function (pigId, farmId, data) {
    currentEditWeightRecordIndex = data?.index;  // ← Extract index from data
    // ... populate and open modal
};

window.openDeleteRecordConfirmModal = function (type, pigId, farmId, index) {
    pendingDeleteData = { type, pigId, farmId, index };
    // ... open confirmation modal
};
```

## API Endpoints

### Add Weight
```
POST /api/pigs/{pigId}/weights
Body: { weight: 75.5, date: "2024-01-15", photoPath: "..." }
Response: { success: true, record: { WeightID: "W001", ... } }
```

### Edit Weight
```
PUT /api/pigs/{pigId}/weights/{weightId}
Body: { weight: 76.0, date: "2024-01-15", photoPath: "..." }
Response: { success: true, record: { WeightID: "W001", ... } }
```

### Delete Weight
```
DELETE /api/pigs/{pigId}/weights/{weightId}
Response: { success: true, message: "..." }
```

### Edit Pig
```
PUT /api/pigs/{pigId}
Body: { name: "Bessie", ... }
Response: { success: true, pig: { ... } }
```

### Delete Pig (Cascades to weight_records)
```
DELETE /api/pigs/{pigId}
Response: { success: true, message: "..." }
```

## Console Log Patterns to Expect

### When Adding Weight
```
Attempting API call with pigId: P001 original: 123
API Result: { success: true, record: { WeightID: "W001", ... } }
```

### When Editing Weight
```
editWeightRecord called with index: 0
pigId: P001 farmId: F001
Calling callParentAction for edit weight
```

### When Deleting Weight
```
deleteWeightRecord called with index: 0
pigId: P001 farmId: F001
Calling parent openDeleteRecordConfirmModal
Attempting weight delete API with pigId: P001 weightId: W001
Weight record deleted successfully on server
```

### API Fallback
```
callWeightRecordAPI: trying URL: http://localhost:8080/api/pigs/P001/weights
callWeightRecordAPI: success with http://localhost:8080
```

## Database Verification

### After Adding Weight
```sql
SELECT * FROM weight_records WHERE PigID = 'P001';
-- Should show new record with auto-generated WeightID
```

### After Deleting Weight
```sql
SELECT COUNT(*) FROM weight_records WHERE PigID = 'P001';
-- Count decreased by 1
```

### After Deleting Pig
```sql
SELECT * FROM pig WHERE PigID = 'P001';
SELECT * FROM weight_records WHERE PigID = 'P001';
-- Both return 0 rows (cascade delete works)
```

## Debugging Checklist

- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Click button and watch for expected log messages
- [ ] If button doesn't respond: Check for JavaScript errors
- [ ] If modal doesn't open: Check that parent function exists
- [ ] If data not saved: Check API response in Network tab
- [ ] If "record not found": Verify WeightID was captured in console

## Common Issues & Fixes

### Issue: Button click doesn't register
- Check: `onclick="editWeightRecord(${actualIndex})"` renders correct index
- Solution: Add console.log to verify function is called

### Issue: Dropdown stays open
- Check: Event listener has `e.stopPropagation()`
- Solution: Verify dropdown.style.display = "none" is set

### Issue: Delete says "record not found"  
- Check: WeightID captured in console as `newRecord.weightId = W001`
- Solution: Verify API response includes WeightID field

### Issue: API calls fail
- Check: Backend running on port 8080
- Check: Database connection established
- Solution: Look at console for API candidate URLs tried

## Files to Monitor

1. **pig-details.html** - Iframe with weight table and button handlers
2. **Farm.js** - Parent window with modal management and API calls
3. **pigController.js** - Backend API request handlers
4. **Weight-Records.js** - Backend database operations
5. **app.js** - Express server startup

## Success Indicators

✅ Edit button click opens modal with pre-filled data
✅ Delete button click opens confirmation modal
✅ Delete confirmation updates database
✅ Edit submission updates database and UI
✅ No "record not found" errors
✅ No JavaScript errors in console
✅ Database state matches UI state after operations

---

**For full details, see:**
- BUTTON_FIXES_VERIFICATION.md (detailed code flows)
- END_TO_END_TESTING_GUIDE.md (comprehensive test cases)
- IMPLEMENTATION_STATUS_REPORT.md (complete status overview)
