# Deep Read: Complete Button Click Flow Analysis

**Purpose**: Comprehensive analysis of all connected code for btnEditPig, btnDeletePig, editWeightRecord, deleteWeightRecord buttons and their data flow.

---

## 1. HTML UI Layer - Button Definitions

### File: `FRONTEND/Mini-Capstone/pig-details.html`

#### 1.1 Edit/Delete Pig Buttons (Dropdown Menu)
**Location**: Lines 356-360

```html
<div class="actions">
    <i class="fas fa-ellipsis-v actions-icon" id="detailsOptionsBtn"></i>
    <div class="actions-dropdown" id="detailsDropdown">
        <button id="btnEditPig"><i class="fas fa-edit"></i> Edit Pig</button>
        <button id="btnDeletePig" class="delete"><i class="fas fa-trash-alt"></i> Delete Pig</button>
    </div>
</div>
```

**CSS Classes** (Lines 294-326):
- `.action-btn`: Base styling (inline-flex, gap, transition)
- `.action-btn-edit`: Green color (#2E7D32) with hover opacity/scale
- `.action-btn-delete`: Red color (#C62828) with hover opacity/scale
- `.action-btn:disabled`: opacity 0.4, cursor not-allowed, pointer-events: none

#### 1.2 Weight Table Edit/Delete Buttons
**Location**: Lines 688-691 (inside weight table rendering loop)

```html
<button class="action-btn action-btn-edit" 
        onclick="editWeightRecord(${actualIndex})" 
        title="Edit" 
        aria-label="Edit weight" 
        ${pig.status === 'sold' || pig.status === 'deceased' ? 'disabled' : ''}>
    <i class="fas fa-edit" aria-hidden="true"></i>
</button>

<button class="action-btn action-btn-delete" 
        onclick="deleteWeightRecord(${actualIndex})" 
        title="Delete" 
        aria-label="Delete weight">
    <i class="fas fa-trash" aria-hidden="true"></i>
</button>
```

**Key Details**:
- `actualIndex = pig.weightHistory.length - 1 - idx`
- Edit button disabled when pig.status === 'sold' or 'deceased'
- Delete button always enabled
- Uses `onclick` attribute for direct function invocation

---

## 2. Dropdown Toggle Logic

### File: `FRONTEND/Mini-Capstone/pig-details.html`, Lines 475-483

```javascript
const optionsBtn = document.getElementById("detailsOptionsBtn");  // The three-dots icon
const dropdown = document.getElementById("detailsDropdown");      // The dropdown menu

// Toggle dropdown open/close
optionsBtn.addEventListener("click", (e) => {
    e.stopPropagation();  // Prevent document click handler from firing immediately
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown when clicking elsewhere in document
document.addEventListener("click", () => dropdown.style.display = "none");
```

**Flow**:
1. User clicks three-dots icon
2. Event propagation stopped with `e.stopPropagation()`
3. Dropdown toggles between display "block" and "none"
4. Clicking elsewhere on document closes dropdown

---

## 3. Edit/Delete Pig Button Event Listeners

### File: `FRONTEND/Mini-Capstone/pig-details.html`, Lines 558-576

#### 3.1 Delete Pig Button Listener
**Location**: Lines 558-565

```javascript
const btnDeletePigEl = document.getElementById('btnDeletePig');
if (btnDeletePigEl) {
    btnDeletePigEl.addEventListener('click', (e) => {
        e.stopPropagation();                    // ← Prevents dropdown close
        dropdown.style.display = "none";         // ← Explicitly close dropdown
        callParentAction('Delete Pig', 'openDeletePigFromDetails');  // ← Call parent
    });
}
```

#### 3.2 Edit Pig Button Listener
**Location**: Lines 568-576

```javascript
if (btnEditPig) {
    btnEditPig.addEventListener("click", (e) => {
        e.stopPropagation();                    // ← Prevents dropdown close
        dropdown.style.display = "none";         // ← Explicitly close dropdown
        callParentAction("Edit Pig", "openEditPigDetailsFromDetails");  // ← Call parent
    });
}
```

**Critical Points**:
- Both use `e.stopPropagation()` to prevent document click handler from firing
- Both explicitly set dropdown to "none"
- Both call `callParentAction()` to invoke parent window functions

---

## 4. callParentAction Helper Function

### File: `FRONTEND/Mini-Capstone/pig-details.html`, Lines 517-537

```javascript
function callParentAction(label, fnName, data) {
    // Try to get function from parent window
    let canDirect = false;
    try {
        canDirect = !!(window.parent && typeof window.parent[fnName] === "function");
    } catch (err) { canDirect = false; }

    // Attempt direct function call first
    if (canDirect) {
        try {
            window.parent[fnName](pigId, farmId, data);  // ← Direct invocation with data param
            return;
        } catch (err) { 
            console.warn('Direct call failed:', err);
        }
    }

    // Fallback: use postMessage API
    console.log('Using postMessage for:', fnName);
    window.parent.postMessage(
        { type: "openAction", action: fnName, pigId, farmId, data },
        "*"
    );
}
```

**Parameters**:
- `label`: Display name (unused, for debugging)
- `fnName`: Function name to call on parent (e.g., "openDeletePigFromDetails")
- `data`: Optional object with parameters (e.g., `{ index }`)

**Execution Path**:
1. Check if parent window has function: `window.parent[fnName]`
2. If yes: call directly with `window.parent[fnName](pigId, farmId, data)`
3. If no: send postMessage event: `{ type: "openAction", action: fnName, ... }`

---

## 5. Weight Record Edit Handler

### File: `FRONTEND/Mini-Capstone/pig-details.html`, Lines 910-922

```javascript
window.editWeightRecord = function(index) {
    console.log('editWeightRecord called with index:', index);
    const params = new URLSearchParams(window.location.search);
    const pigId = params.get("id");      // Extract from URL query params
    const farmId = params.get("farm");   // Extract from URL query params
    
    console.log('pigId:', pigId, 'farmId:', farmId);
    console.log('Calling callParentAction for edit weight');
    
    // Call parent function with data containing the index
    callParentAction("Edit Weight", "openEditWeightFromDetails", { index });
};
```

**Data Flow**:
1. User clicks edit button with `onclick="editWeightRecord(0)"`
2. Extract pigId/farmId from URL query parameters
3. Call parent's `openEditWeightFromDetails(pigId, farmId, { index: 0 })`
4. Either direct call or postMessage

---

## 6. Weight Record Delete Handler

### File: `FRONTEND/Mini-Capstone/pig-details.html`, Lines 923-975

```javascript
window.deleteWeightRecord = async function(index) {
    console.log('deleteWeightRecord called with index:', index);
    const params = new URLSearchParams(window.location.search);
    const pigId = params.get("id");      // Extract from URL
    const farmId = params.get("farm");   // Extract from URL
    
    console.log('pigId:', pigId, 'farmId:', farmId);
    
    if (!pigId) {
        showNotification('error', 'Pig ID not found');
        return;
    }

    try {
        // Try to get pig data from parent
        let pig = null;
        try {
            if (window.parent && typeof window.parent.getPigDataById === 'function') {
                pig = window.parent.getPigDataById(pigId, farmId);
                console.log('Got pig from parent:', pig ? 'yes' : 'no');
            }
        } catch (e) {
            console.warn('Error getting pig from parent:', e);
        }

        // Validate weight record exists
        if (!pig || !pig.weightHistory || !pig.weightHistory[index]) {
            showNotification('error', 'Weight record not found');
            return;
        }

        const record = pig.weightHistory[index];
        
        // Browser confirmation dialog
        if (!confirm(`Delete weight record from ${record.date}? This action cannot be undone.`)) {
            return;
        }

        // Call parent to open delete confirmation modal
        console.log('Calling parent openDeleteRecordConfirmModal');
        if (window.parent && typeof window.parent.openDeleteRecordConfirmModal === 'function') {
            console.log('Calling parent function directly');
            window.parent.openDeleteRecordConfirmModal("weight", pigId, farmId, index);
        } else {
            console.log('Using postMessage fallback');
            callParentAction("Delete Weight", "openDeleteRecordConfirmModal", { type: "weight", index });
        }
        
    } catch (err) {
        console.warn('deleteWeightRecord error:', err);
        showNotification('error', 'Failed to delete weight record');
    }
};
```

**Data Flow**:
1. User clicks delete button with `onclick="deleteWeightRecord(0)"`
2. Extract pigId/farmId from URL
3. Get pig data from parent's `getPigDataById(pigId, farmId)`
4. Validate weight record at `pig.weightHistory[index]` exists
5. Show browser confirm dialog
6. Call parent's `openDeleteRecordConfirmModal("weight", pigId, farmId, index)`

---

## 7. Parent Window Functions - Farm.js

### File: `FRONTEND/Mini-Capstone/js/Farm.js`

#### 7.1 openEditPigDetailsFromDetails (Line 599)

```javascript
window.openEditPigDetailsFromDetails = function (pigId, farmId) {
    const editModal = document.getElementById("editPigDetailsModal");
    if (!editModal) return;

    currentDetailPigId  = Number(pigId);
    currentDetailFarmId = Number(farmId);

    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig) return;

    // Hide details modal temporarily
    const pigDetailsModal = document.getElementById("pigDetailsModal");
    if (pigDetailsModal) pigDetailsModal.style.display = "none";

    // Populate edit form with pig data
    const nameInput   = document.getElementById("editPigName");
    const breedInput  = document.getElementById("editPigBreed");
    const genderInput = document.getElementById("editPigGender");
    const ageInput    = document.getElementById("editPigAge");
    const dateInput   = document.getElementById("editPigDate");

    if (nameInput)   nameInput.value   = pig.name   || "";
    if (breedInput)  breedInput.value  = pig.breed  || "";
    if (genderInput) genderInput.value = pig.gender || "";
    if (ageInput)    ageInput.value    = pig.age    || "";
    if (dateInput)   dateInput.value   = pig.date   || "";

    // Show pig ID in modal
    const shortIdLabel = document.getElementById("editPigShortIdDisplay");
    if (shortIdLabel) {
        const fallbackShort = pig.name ? pig.name.substring(0, 3).toUpperCase() : "PIG";
        shortIdLabel.textContent = `Editing: ${pig.id} (${pig.shortId || fallbackShort})`;
    }

    // Trigger floating label updates
    [breedInput, genderInput, ageInput].forEach(select => {
        if (select && select.value) {
            select.classList.add("has-value");
        }
    });

    if (dateInput && dateInput.value) {
        const dateWrapper = dateInput.closest(".date-wrapper");
        if (dateWrapper) dateWrapper.classList.add("has-value");
    }

    editModal.style.display = "flex";  // ← Open modal
};
```

**Actions**:
1. Get farm and pig from storage using pigId/farmId
2. Populate edit form with current pig values
3. Display pig identifier in modal
4. Trigger CSS floating label states
5. Open editPigDetailsModal

#### 7.2 openDeletePigFromDetails (Line 688)

```javascript
window.openDeletePigFromDetails = function (pigId, farmId) {
    const delModal = document.getElementById('deletePigConfirmModal');
    if (!delModal) return;

    currentDetailPigId  = Number(pigId);
    currentDetailFarmId = Number(farmId);

    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    const confirmText = document.getElementById('deletePigConfirmText');
    
    // Personalize confirmation text with pig name
    if (confirmText) 
        confirmText.innerHTML = `Are you sure you want to delete <strong>${pig?.name || 'this pig'}</strong>?<br>This action cannot be undone.`;

    // Clear and disable confirm button
    const input = document.getElementById('confirmDeletePigInput');
    const confirmBtn = document.getElementById('confirmDeletePig');
    if (input) input.value = '';
    if (confirmBtn) confirmBtn.disabled = true;

    delModal.style.display = 'flex';  // ← Open modal
    document.body.style.overflow = 'hidden';
};
```

**Actions**:
1. Get farm and pig from storage
2. Personalize confirmation text with pig name
3. Clear delete confirmation input field
4. Disable confirm button
5. Open deletePigConfirmModal with body overflow hidden

#### 7.3 openEditWeightFromDetails (Line 717)

```javascript
window.openEditWeightFromDetails = function (pigId, farmId, data) {
    const addWeightModal = document.getElementById("addWeightModal");
    if (!addWeightModal) return;

    currentDetailPigId = Number(pigId);
    currentDetailFarmId = Number(farmId);
    currentEditWeightRecordIndex = data?.index;  // ← Extract index from data

    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig || currentEditWeightRecordIndex === undefined) return;

    const record = pig.weightHistory[currentEditWeightRecordIndex];
    if (!record) return;
    console.debug("openEditWeightFromDetails called", { pigId, farmId, index: currentEditWeightRecordIndex, record });

    // Populate form with existing weight record values
    const dateInput = document.getElementById("newWeightDate");
    const weightInput = document.getElementById("newWeightValue");
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    const weightHint = document.getElementById("weightHint");

    if (dateInput) dateInput.value = record.date;
    if (weightInput) weightInput.value = record.weight;
    if (fileNameDisplay) fileNameDisplay.textContent = "Edit Image (optional)";

    // Show weight change comparison
    if (weightHint) {
        if (currentEditWeightRecordIndex > 0) {
            const lastRecord = pig.weightHistory[currentEditWeightRecordIndex - 1];
            const weightDiff = (record.weight - lastRecord.weight).toFixed(1);
            const diffSign = weightDiff >= 0 ? "+" : "";
            weightHint.textContent = `Last recorded: ${lastRecord.weight} kg (${diffSign}${weightDiff} kg)`;
        } else {
            weightHint.textContent = "First weight record";
        }
    }

    addWeightModal.style.display = "flex";  // ← Open modal
};
```

**Actions**:
1. Extract `index` from data parameter
2. Get farm and pig from storage
3. Retrieve weight record from `pig.weightHistory[index]`
4. Populate form with date, weight, and filename
5. Show weight difference hint if not first record
6. Open addWeightModal

#### 7.4 openDeleteRecordConfirmModal (Line 925)

```javascript
window.openDeleteRecordConfirmModal = function (type, pigId, farmId, index) {
    const modal = document.getElementById("deleteRecordConfirmModal");
    const title = document.getElementById("deleteRecordTitle");
    const text = document.getElementById("deleteRecordConfirmText");
    
    if (!modal) return;
    
    // Store pending delete data for later confirmation handler
    pendingDeleteData = {
        type: type,           // "weight", "expense", or "vaccination"
        pigId: pigId,
        farmId: farmId,
        index: index
    };
    
    // Set modal text based on record type
    const typeNames = {
        weight: "Weight Record",
        expense: "Expense Record",
        vaccination: "Vaccination Record"
    };
    
    if (title) title.textContent = `Delete ${typeNames[type] || 'Record'}`;
    if (text) text.innerHTML = `Are you sure you want to delete this ${typeNames[type]?.toLowerCase() || 'record'}?<br>This action cannot be undone.`;
    
    modal.style.display = "flex";  // ← Open modal
    document.body.style.overflow = "hidden";
};
```

**Actions**:
1. Store pendingDeleteData with type, pigId, farmId, index
2. Set modal title to "Delete Weight Record"
3. Set modal text to personalized message
4. Open deleteRecordConfirmModal
5. Hide body overflow

---

## 8. Delete Confirmation Handler

### File: `FRONTEND/Mini-Capstone/js/Farm.js`, Lines 4116-4194

```javascript
if (confirmDeleteRecordBtn) {
    confirmDeleteRecordBtn.addEventListener("click", async () => {
        if (!pendingDeleteData) return;

        const { type, pigId, farmId, index } = pendingDeleteData;
        const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
        
        if (!farm) {
            showAlert("error", "Farm not found.");
            return;
        }

        const pig = farm.pigs.find(p => p.id === pigId);
        if (!pig) {
            showAlert("error", "Pig not found.");
            return;
        }

        let deleted = false;
        let typeName = "";

        // Handle different record types
        switch (type) {
            case "weight":
                if (pig.weightHistory && pig.weightHistory[index]) {
                    const record = pig.weightHistory[index];
                    
                    // Call backend API FIRST
                    try {
                        const weightId = record.weightId || `W_${record.date}`;
                        const actualPigId = pig.PigID || pig.serverId || pigId;
                        console.log('Attempting weight delete API with pigId:', actualPigId, 'weightId:', weightId);
                        await callWeightDeleteAPI(actualPigId, weightId);  // ← API call
                        console.log('Weight record deleted successfully on server');
                    } catch (apiErr) {
                        console.error('Weight record API deletion failed:', apiErr);
                        showAlert("error", `Failed to delete weight: ${apiErr.message || 'Server connection failed'}`);
                        pendingDeleteData = null;
                        if (deleteRecordConfirmModal) deleteRecordConfirmModal.style.display = "none";
                        document.body.style.overflow = "auto";
                        return;  // ← Stop if API fails
                    }
                    
                    // Only delete locally if API succeeded
                    pig.weightHistory.splice(index, 1);  // ← Remove from array
                    saveFarmsToStorage();                 // ← Save to localStorage
                    deleted = true;
                    typeName = "Weight record";
                }
                break;
            case "expense":
                if (pig.expenses && pig.expenses[index]) {
                    pig.expenses.splice(index, 1);
                    deleted = true;
                    typeName = "Expense record";
                }
                break;
            case "vaccination":
                if (pig.vaccinations && pig.vaccinations[index]) {
                    pig.vaccinations.splice(index, 1);
                    deleted = true;
                    typeName = "Vaccination record";
                }
                break;
        }

        if (deleted) {
            // Refresh pig details iframe with updated pig data
            const pigDetailsFrame = document.getElementById("pigDetailsFrame");
            if (pigDetailsFrame && pigDetailsFrame.contentWindow) {
                const updatedPig = getPigDataById(pigId, farmId);
                pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
            }
        }

        // Close modal and reset
        if (deleteRecordConfirmModal) deleteRecordConfirmModal.style.display = "none";
        document.body.style.overflow = "auto";
        pendingDeleteData = null;
    });
}
```

**Execution Flow for Weight Delete**:
1. User clicks "Confirm Delete" on deleteRecordConfirmModal
2. Extract type, pigId, farmId, index from pendingDeleteData
3. Get pig from farm storage
4. **Call backend API**: `callWeightDeleteAPI(actualPigId, weightId)`
   - If API fails: Show error and return without deleting locally
   - If API succeeds: Continue
5. Remove weight record from local array: `pig.weightHistory.splice(index, 1)`
6. Save to storage: `saveFarmsToStorage()`
7. Refresh iframe with updated pig data via postMessage
8. Close modal and reset body overflow

---

## 9. Backend API Functions

### File: `FRONTEND/Mini-Capstone/js/Farm.js`, Lines 272-319

#### 9.1 callWeightDeleteAPI

```javascript
async function callWeightDeleteAPI(pigId, weightId) {
    try {
        // Build candidate API bases
        let candidates = [];
        try {
            const origin = window.location.origin;
            if (origin && origin !== 'null') candidates.push(origin);
        } catch (e) {}
        candidates.push('http://localhost:8080');
        candidates = candidates.filter((v,i,a) => a.indexOf(v) === i);
        
        // Prioritize backend fallback for Live Server
        const pageOrigin = window.location?.origin;
        if (pageOrigin && (pageOrigin.includes(':5500') || pageOrigin.includes(':5501'))) {
            candidates = candidates.filter(c => c !== 'http://localhost:8080');
            candidates.unshift('http://localhost:8080');
        }

        const pigIdEncoded = encodeURIComponent(pigId);
        const weightIdEncoded = encodeURIComponent(weightId);
        let lastError = null;

        for (const base of candidates) {
            try {
                const url = `${base.replace(/\/$/, '')}/api/pigs/${pigIdEncoded}/weights/${weightIdEncoded}`;
                
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response && response.ok) {
                    const result = await response.json();
                    console.log('Weight record delete API success:', result);
                    return result;  // ← Success
                } else {
                    console.debug(`Delete API call to ${base} returned status ${response?.status}`);
                }
            } catch (err) {
                lastError = err;
                console.debug(`Failed to reach ${base}:`, err.message);
            }
        }

        throw lastError || new Error('No available API endpoint');
    } catch (err) {
        console.warn('callWeightDeleteAPI error:', err);
        throw err;
    }
}
```

**API Call**:
- **Method**: DELETE
- **URL**: `/api/pigs/{pigId}/weights/{weightId}`
- **Headers**: `Content-Type: application/json`
- **Expected Response**: `{ success: true, message: "Weight record deleted successfully", ... }`

**Multi-Endpoint Fallback**:
1. Try page origin (e.g., http://localhost:5500)
2. Try localhost:8080
3. If neither works, throw error

---

### File: `BACKEND/routes/pigRoutes.js`

```javascript
import express from 'express';
import { addPig, getAllUserPigs, getPigsByFarm, getPigWeights, addWeightRecord, updateWeightRecord, deleteWeightRecord, updatePig, deletePig } from '../Controllers/pigController.js';

const router = express.Router();

router.post('/add-pig', addPig);
router.post('/get-user-pigs', getAllUserPigs);
router.post('/get-pigs-by-farm', getPigsByFarm);
router.get('/:pigId/weights', getPigWeights);

// Pig endpoints
router.put('/:pigId', updatePig);
router.delete('/:pigId', deletePig);

// Weight Records endpoints
router.post('/:pigId/weights', addWeightRecord);
router.put('/:pigId/weights/:weightId', updateWeightRecord);
router.delete('/:pigId/weights/:weightId', deleteWeightRecord);  // ← Routes DELETE request

export default router;
```

---

### File: `BACKEND/Controllers/pigController.js`, Lines 152-170

```javascript
// DELETE a weight record
export const deleteWeightRecord = async (req, res, next) => {
    try {
        const { pigId, weightId } = req.params;  // ← Extract from URL path
        
        if (!pigId || !weightId) {
            return res.status(400).json({ success: false, message: 'pigId and weightId are required' });
        }

        const result = await weightService.deleteWeightRecord(pigId, weightId);  // ← Call service
        res.json({ success: true, message: 'Weight record deleted successfully', ...result });
    } catch (err) {
        console.error('deleteWeightRecord error:', err);
        if (err.message === 'Weight record not found') {
            return res.status(404).json({ success: false, message: 'Weight record not found' });
        }
        next(err);
    }
}
```

---

### File: `BACKEND/Logic/Weight-Records.js`, Lines 115-130

```javascript
export async function deleteWeightRecord(pigId, weightId) {
    try {
        const [result] = await pool.execute(`
            WHERE WeightID = ? AND PigID = ?
        `, [weightId, pigId]);
        
        if (result.affectedRows === 0) {
            throw new Error('Weight record not found');
        }
        
        return { success: true, deletedId: weightId };
    } catch (err) {
        console.error('deleteWeightRecord error:', err);
        throw err;
    }
}
```

---

## 10. Complete Data Flow Diagram

### Edit Weight Record Flow

```
USER ACTION: Click Edit button on weight record
│
├─ HTML Trigger: onclick="editWeightRecord(0)"
│  └─ pig-details.html:688
│
├─ JavaScript Function: window.editWeightRecord(0)
│  └─ pig-details.html:910
│  ├─ Extract pigId/farmId from URL params
│  └─ Call: callParentAction("Edit Weight", "openEditWeightFromDetails", { index: 0 })
│
├─ Call Parent Action: callParentAction()
│  └─ pig-details.html:517
│  ├─ Check if window.parent.openEditWeightFromDetails exists
│  ├─ If yes: Call directly window.parent.openEditWeightFromDetails(pigId, farmId, { index: 0 })
│  └─ If no: Send postMessage event
│
├─ Parent Function: window.openEditWeightFromDetails(pigId, farmId, data)
│  └─ Farm.js:717
│  ├─ Extract currentEditWeightRecordIndex = data.index
│  ├─ Get pig from storage: farm.pigs.find(p => p.id === pigId)
│  ├─ Get weight record: record = pig.weightHistory[currentEditWeightRecordIndex]
│  ├─ Populate form fields with record data
│  │  ├─ dateInput.value = record.date
│  │  ├─ weightInput.value = record.weight
│  │  └─ weightHint = weight change comparison
│  └─ Open modal: addWeightModal.style.display = "flex"
│
├─ User Edits and Submits
│  └─ addWeightModal submit handler (Farm.js)
│
├─ Form Validation & API Call
│  └─ callWeightRecordAPI(actualPigId, apiPayload, isEdit=true)
│  └─ Farm.js:206
│  ├─ Multi-endpoint fallback to try: localhost:8080, page origin, etc.
│  ├─ PUT /api/pigs/{pigId}/weights/{weightId}
│  ├─ Request body: { weight: 76.0, date: "2025-01-15", photoPath: "..." }
│  └─ Expected response: { success: true, record: { WeightID: "W001", ... } }
│
├─ Backend Processing
│  └─ Express Route: PUT /api/pigs/:pigId/weights/:weightId
│  └─ BACKEND/routes/pigRoutes.js:17
│  └─ Controller: updateWeightRecord()
│  └─ BACKEND/Controllers/pigController.js:137
│  ├─ Extract pigId, weightId, weight, date from request
│  ├─ Call: weightService.updateWeightRecord(pigId, weightId, weight, date, photoPath)
│  └─ Database: UPDATE weight_records SET Weight=?, Date=? WHERE WeightID=? AND PigID=?
│
├─ Response & UI Update
│  ├─ Server responds with updated record
│  ├─ Frontend updates local array: pig.weightHistory[index] = newRecord
│  ├─ Frontend saves to localStorage: saveFarmsToStorage()
│  └─ Frontend closes modal
│
└─ END: Weight record updated in UI and database
```

### Delete Weight Record Flow

```
USER ACTION: Click Delete button on weight record
│
├─ HTML Trigger: onclick="deleteWeightRecord(0)"
│  └─ pig-details.html:691
│
├─ JavaScript Function: window.deleteWeightRecord(0)
│  └─ pig-details.html:923
│  ├─ Extract pigId/farmId from URL params
│  ├─ Get pig data: window.parent.getPigDataById(pigId, farmId)
│  ├─ Validate record exists: pig.weightHistory[0]
│  ├─ Show browser confirm: confirm("Delete weight from 2025-01-15?")
│  ├─ If user clicks OK:
│  │  └─ Call: window.parent.openDeleteRecordConfirmModal("weight", pigId, farmId, 0)
│  └─ If user clicks Cancel: Return (exit function)
│
├─ Parent Function: window.openDeleteRecordConfirmModal(type, pigId, farmId, index)
│  └─ Farm.js:925
│  ├─ Set pendingDeleteData = { type: "weight", pigId, farmId, index: 0 }
│  ├─ Set modal title: "Delete Weight Record"
│  ├─ Set modal text: "Are you sure you want to delete this weight record?"
│  └─ Open modal: deleteRecordConfirmModal.style.display = "flex"
│
├─ User Confirms Delete
│  └─ User clicks "Confirm Delete" button in modal
│
├─ Delete Handler: confirmDeleteRecordBtn.addEventListener("click", async ())
│  └─ Farm.js:4116
│  ├─ Extract: { type: "weight", pigId, farmId, index: 0 } from pendingDeleteData
│  ├─ Get pig from storage
│  ├─ Get weight record: record = pig.weightHistory[0]
│  │
│  ├─ CALL BACKEND API ◄─── CRITICAL STEP
│  │  └─ const weightId = record.weightId  (captured from API response when created)
│  │  └─ await callWeightDeleteAPI(actualPigId, weightId)
│  │  └─ Farm.js:272
│  │  ├─ Multi-endpoint fallback
│  │  ├─ DELETE /api/pigs/{pigId}/weights/{weightId}
│  │  └─ Expected response: { success: true, message: "Weight record deleted successfully" }
│  │
│  ├─ If API fails:
│  │  ├─ Show error alert
│  │  ├─ Close modal without deleting locally
│  │  └─ Return (exit handler)
│  │
│  ├─ If API succeeds:
│  │  ├─ Remove from local array: pig.weightHistory.splice(0, 1)
│  │  ├─ Save to storage: saveFarmsToStorage()
│  │  ├─ Refresh iframe: postMessage({ type: "pigData", pig: updatedPig })
│  │  └─ Close modal
│  │
│  └─ Reset: pendingDeleteData = null
│
├─ Backend Processing
│  └─ Express Route: DELETE /api/pigs/:pigId/weights/:weightId
│  └─ BACKEND/routes/pigRoutes.js:17
│  └─ Controller: deleteWeightRecord()
│  └─ BACKEND/Controllers/pigController.js:152
│  ├─ Extract pigId, weightId from URL params
│  ├─ Call: weightService.deleteWeightRecord(pigId, weightId)
│  └─ Database: DELETE FROM weight_records WHERE WeightID=? AND PigID=?
│
├─ Response
│  └─ Server responds: { success: true, message: "Weight record deleted successfully", ... }
│
└─ END: Weight record deleted from UI, localStorage, and database
```

---

## 11. Critical Data Points

### WeightID Management
**Problem**: Using array index for deletion could delete wrong record after edits
**Solution**: Capture WeightID from API response when weight record is created

**Location**: Farm.js, Lines 1852-1853
```javascript
if (apiResult.record && apiResult.record.WeightID) {
    newRecord.weightId = apiResult.record.WeightID;  // ← Store for later use
}
```

**When Delete is Called**: Use stored weightId, not index
```javascript
const weightId = record.weightId || `W_${record.date}`;  // Fall back to date-based ID
```

---

### Event Propagation Control
**Problem**: Dropdown stays open or closes prematurely after button click
**Solution**: Use `e.stopPropagation()` to prevent document click handler

**Locations**:
- Line 480: `optionsBtn` click - stops from triggering document close
- Line 560: `btnDeletePig` click - stops from triggering document close
- Line 569: `btnEditPig` click - stops from triggering document close

---

### Disabled States
**Edit Weight Button** (disabled when pig sold/deceased):
```html
${pig.status === 'sold' || pig.status === 'deceased' ? 'disabled' : ''}
```

**Delete Weight Button**: Always enabled (allows cleanup of sold pig records)

**Edit/Delete Pig Buttons**: No disabling (always enabled in dropdown)

---

### Modal Lifecycle
1. **Open**: `modal.style.display = "flex"`
2. **Populate**: Fill form fields with existing data
3. **User Action**: Edit/delete in form
4. **Close**: `modal.style.display = "none"`
5. **Reset**: Clear form fields and data

---

## 12. Connection Summary Table

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| HTML Buttons | pig-details.html | 359-360, 688-691 | Define edit/delete UI |
| Button Styles | pig-details.html | 294-326 | CSS for button appearance |
| Dropdown Toggle | pig-details.html | 475-483 | Open/close dropdown menu |
| Edit Pig Listener | pig-details.html | 568-576 | Event handler for edit pig |
| Delete Pig Listener | pig-details.html | 558-565 | Event handler for delete pig |
| Edit Weight Handler | pig-details.html | 910-922 | onclick="editWeightRecord()" |
| Delete Weight Handler | pig-details.html | 923-975 | onclick="deleteWeightRecord()" |
| callParentAction | pig-details.html | 517-537 | Helper to call parent window |
| openEditPigDetailsFromDetails | Farm.js | 599-654 | Open edit pig modal |
| openDeletePigFromDetails | Farm.js | 688-711 | Open delete pig confirmation |
| openEditWeightFromDetails | Farm.js | 717-755 | Open edit weight modal |
| openDeleteRecordConfirmModal | Farm.js | 925-950 | Open delete record confirmation |
| Delete Confirm Handler | Farm.js | 4116-4194 | Execute delete when confirmed |
| callWeightDeleteAPI | Farm.js | 272-319 | Call backend DELETE endpoint |
| Routes | pigRoutes.js | 1-17 | Express route definitions |
| Delete Controller | pigController.js | 152-170 | HTTP request handler |
| Delete Service | Weight-Records.js | 115-130 | Database query execution |

---

## 13. Key Takeaways

1. **Multi-Layer Architecture**:
   - HTML buttons → JavaScript functions → Parent window functions → Backend API → Database

2. **Event Flow is Controlled**:
   - Dropdown uses `e.stopPropagation()` to prevent unwanted closes
   - Each button has dedicated event listeners

3. **Data Passing Through Layers**:
   - HTML passes index via `onclick` attribute
   - JavaScript extracts from URL or gets from parent
   - Parent receives via function call or postMessage
   - Backend receives via URL path parameters

4. **WeightID is Critical**:
   - Must be captured from API response when record created
   - Used for reliable deletion (not array index)
   - Falls back to date-based ID if not available

5. **API-First Delete Pattern**:
   - Delete API called FIRST before local removal
   - If API fails, no local deletion occurs
   - Prevents data inconsistency

6. **Iframe Communication**:
   - pig-details.html is iframe loaded with query parameters
   - Calls parent functions via direct call or postMessage
   - Parent sends updates back via postMessage with { type: "pigData" }
