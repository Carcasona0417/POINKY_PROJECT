# Pig Details Edit Form Fixes - Part 2

## Issues Fixed

### 1. **Data Hidden by Placeholder in Edit Form** ✅
**Problem**: When opening the edit pig details form, the field values were there but hidden behind the floating labels/placeholders.

**Root Cause**: The CSS floating label system uses the `:not(:placeholder-shown)` pseudo-class for text inputs and `.has-value` class for selects and date inputs. When the form was populated programmatically, the `.has-value` class wasn't being added to selects and date wrappers, causing the labels to stay in the middle of the inputs covering the data.

**Solution**: Added code to manually trigger the floating label updates when the edit form is opened:
- For selects: Manually add `has-value` class to breed, gender, and age selects after setting their values
- For date input: Add `has-value` class to the date wrapper after setting the date value

**Changed in Farm.js** (~lines 200-215):
```javascript
// Trigger floating label updates for selects that have values
[breedInput, genderInput, ageInput].forEach(select => {
    if (select && select.value) {
        select.classList.add("has-value");
    }
});

// Trigger floating label updates for date wrapper
if (dateInput && dateInput.value) {
    const dateWrapper = dateInput.closest(".date-wrapper");
    if (dateWrapper) dateWrapper.classList.add("has-value");
}
```

---

### 2. **Pig Details Not Updating Instantly After Save** ✅
**Problem**: When saving pig details, the pig-details iframe modal would appear blank initially, and only show data after closing and reopening the modal.

**Root Cause**: When the edit form was submitted, the iframe URL was being changed to reload the page. However, there was a timing issue:
1. The iframe was reloaded with the new URL
2. The iframe tried to fetch pig data from the parent window
3. But there was a race condition where the iframe might render before the data was available

**Solution**: Implemented a proper postMessage mechanism to ensure the iframe gets the updated pig data immediately upon reloading:

**Changed in Farm.js** - Updated all 5 form submission handlers:
- Add Weight form submission
- Edit Weight form submission
- Add Expense form submission
- Add Vaccination form submission
- Edit Pig Details form submission

**Pattern used in all forms**:
```javascript
if (pigDetailsFrame && currentDetailPigId && currentDetailFarmId) {
    const refreshUrl = `pig-details.html?id=${encodeURIComponent(currentDetailPigId)}&farm=${encodeURIComponent(currentDetailFarmId)}`;
    
    // Set up postMessage to send updated pig data once iframe reloads
    const onFrameReload = function () {
        try {
            const updatedPig = window.getPigDataById(currentDetailPigId, currentDetailFarmId);
            if (updatedPig && pigDetailsFrame.contentWindow) {
                pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
            }
        } catch (err) {
            console.warn("Failed to postMessage updated pig data:", err);
        } finally {
            pigDetailsFrame.removeEventListener("load", onFrameReload);
        }
    };
    
    pigDetailsFrame.addEventListener("load", onFrameReload);
    pigDetailsFrame.src = refreshUrl;
}
```

This ensures that:
1. When the iframe finishes loading the new page
2. The parent window immediately sends the updated pig data via postMessage
3. The iframe receives this data and renders it
4. User sees the updated pig details instantly

---

## Testing Recommendations

### Test Case 1: Edit Form Data Visibility
1. Open a pig's details
2. Click "Edit Pig" button
3. **Expected**: All fields should show their current values with floating labels properly positioned ABOVE the inputs, not covering them
4. Values should be readable immediately

### Test Case 2: Instant Update After Save
1. Open a pig's details modal
2. Click "Edit Pig" button
3. Change any field (e.g., name from "Pig A" to "Pig Modified")
4. Click Save
5. **Expected**: Pig details modal should show the updated name immediately (not blank)
6. No need to close and reopen the modal to see changes

### Test Case 3: Weight/Expense/Vaccination Updates
1. Open a pig's details
2. Click "Add Weight" (or Expense/Vaccination)
3. Fill in the form and save
4. **Expected**: Pig details modal should update immediately showing the new record
5. No blank screen or need to refresh

---

## Files Modified

1. **Farm.js** - Main application logic
   - Added floating label class updates when edit form opens (lines 203-214)
   - Updated all 5 form submission handlers to use postMessage with onload handler (5 locations)

---

## Technical Notes

- The postMessage mechanism reuses the same pattern already used in `openPigDetails()` function
- The floating label system now works correctly because we manually trigger the CSS pseudo-class and class-based styles
- The text input fields use `:not(:placeholder-shown)` CSS which works automatically without needing the `.has-value` class
- All changes are non-breaking and maintain backward compatibility
