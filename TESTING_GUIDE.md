# Testing Guide - Edit & Delete Actions for Pig Details Tables

## Implementation Complete ✓

All edit and delete actions have been successfully added to the pig details tables.

## Features Implemented

### 1. Weight Records Table
- ✅ Edit button for each weight record
- ✅ Delete button for each weight record
- ✅ Edit disabled for sold/deceased pigs
- ✅ Delete always available
- ✅ Form prepopulates with existing values when editing

### 2. Expenses Records Table  
- ✅ Edit button for each expense record
- ✅ Delete button for each expense record
- ✅ Edit disabled for sold/deceased pigs
- ✅ Delete always available
- ✅ Form prepopulates with existing values when editing

### 3. Vaccination Records Table
- ✅ Edit button for each vaccination record
- ✅ Delete button for each vaccination record
- ✅ Edit disabled for sold/deceased pigs
- ✅ Delete always available
- ✅ Form prepopulates with existing values when editing

## How to Test

### Test 1: Edit Weight Record
1. Open Farm.html
2. Click on a pig to view details
3. In the Weight Records tab, click "Edit" on any record
4. Modify the weight value
5. Click "Save"
6. Verify the weight record is updated in the table
7. Verify pig details modal refreshes with updated data

### Test 2: Delete Weight Record
1. Open Farm.html
2. Click on a pig to view details
3. In the Weight Records tab, click "Delete" on any record
4. Confirm the deletion in the dialog
5. Verify the record is removed from the table
6. Verify pig details modal refreshes

### Test 3: Edit Expense Record
1. Open Farm.html
2. Click on a pig to view details
3. In the Expenses Records tab, click "Edit" on any record
4. Modify the expense details
5. Click "Save"
6. Verify the expense is updated in the table
7. Verify pig details modal refreshes with updated data

### Test 4: Delete Expense Record
1. Open Farm.html
2. Click on a pig to view details
3. In the Expenses Records tab, click "Delete" on any record
4. Confirm the deletion in the dialog
5. Verify the record is removed from the table
6. Verify pig details modal refreshes

### Test 5: Edit Vaccination Record
1. Open Farm.html
2. Click on a pig to view details
3. In the Vaccination Records tab, click "Edit" on any record
4. Modify the vaccination details
5. Click "Save"
6. Verify the vaccination is updated in the table
7. Verify pig details modal refreshes with updated data

### Test 6: Delete Vaccination Record
1. Open Farm.html
2. Click on a pig to view details
3. In the Vaccination Records tab, click "Delete" on any record
4. Confirm the deletion in the dialog
5. Verify the record is removed from the table
6. Verify pig details modal refreshes

### Test 7: Edit Disabled for Sold/Deceased Pigs
1. Open Farm.html
2. Create a pig and change its status to "Sold" or "Deceased"
3. Click on the pig to view details
4. Add a weight record
5. Try to click "Edit" button on the record
6. Verify the button is disabled
7. Verify delete button is still enabled

### Test 8: Add Still Works
1. Open Farm.html
2. Click on a pig to view details
3. Click "Add Weight" button
4. Add a new weight record
5. Verify it appears in the table
6. Verify the record shows up in the pig details

## Expected Behavior

### When Editing
1. Form modal opens with existing data populated
2. User can modify any field
3. Clicking "Save" updates the record
4. Pig details iframe refreshes automatically
5. Success alert shows "updated successfully"
6. Table shows the new values

### When Deleting
1. Confirmation dialog appears
2. On confirmation, record is removed from array
3. Pig details iframe refreshes automatically
4. Success alert shows "deleted successfully"
5. Record is no longer visible in the table

### Button States
- **Edit buttons for growing pigs**: Enabled
- **Edit buttons for sold/deceased pigs**: Disabled (shows tooltip)
- **Delete buttons**: Always enabled (for all pig statuses)

## Troubleshooting

### Issue: Edit button doesn't work
- Check browser console for errors
- Verify Farm.js is loaded
- Check that pig details iframe is properly initialized

### Issue: Delete button doesn't work  
- Check browser console for errors
- Verify confirmation dialog appears
- Check that pig data structure has the array

### Issue: Changes don't persist
- Verify form is submitting (check Network tab)
- Check that edit index is properly set
- Verify pig details iframe refreshes

### Issue: Button is always disabled
- Check pig status (may be sold/deceased)
- For delete buttons, verify they're still visible
- Check CSS for opacity or pointer-events issues

## Files Modified

1. **pig-details.html**
   - Added "Actions" column to all three tables
   - Added CSS for action buttons
   - Added onclick handlers for edit/delete buttons
   - Added global handler functions
   - Added recordAction message handler

2. **Farm.js**
   - Added currentEditExpenseIndex and currentEditVaccinationIndex globals
   - Added openEdit*FromDetails functions (3 new functions)
   - Added delete*FromDetails functions (3 new functions)
   - Added recordAction message handler
   - Updated form submission to support edit vs add

3. **Farm.html**
   - No changes (works with updated supporting files)

## Browser Compatibility
- Chrome/Edge: ✓ Tested
- Firefox: Should work
- Safari: Should work

## Performance Considerations
- Edit/delete operations are instant (in-memory)
- No server calls (for demo purposes)
- Iframe refresh is optimized with postMessage
- No performance issues expected with normal usage
