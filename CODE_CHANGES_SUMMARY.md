# Code Changes Summary - Weight Records Integration

## 1. Backend - Logic Layer Changes

### File: `BACKEND/Logic/Weight-Records.js`

**Added Functions:**

```javascript
// Function to update a weight record
export async function updateWeightRecord(pigId, weightId, weight, date, photoPath = null) {
    try {
        const updateFields = ['Weight = ?', 'Date = ?'];
        const updateValues = [weight, date];

        if (photoPath !== null && photoPath !== undefined && photoPath !== '') {
            updateFields.push('PhotoPath = ?');
            updateValues.push(photoPath);
        }

        updateValues.push(weightId);
        updateValues.push(pigId);

        const query = `
            UPDATE weight_records 
            SET ${updateFields.join(', ')}
            WHERE WeightID = ? AND PigID = ?
        `;

        const [result] = await pool.query(query, updateValues);
        
        if (result.affectedRows === 0) {
            throw new Error('Weight record not found');
        }

        return { WeightID: weightId, Date: date, Weight: parseFloat(weight), PigID: pigId, PhotoPath: photoPath };
    } catch (err) {
        throw err;
    }
}

// Function to delete a weight record
export async function deleteWeightRecord(pigId, weightId) {
    try {
        const [result] = await pool.query(`
            DELETE FROM weight_records
            WHERE WeightID = ? AND PigID = ?
        `, [weightId, pigId]);

        if (result.affectedRows === 0) {
            throw new Error('Weight record not found');
        }

        return { success: true, message: 'Weight record deleted successfully' };
    } catch (err) {
        throw err;
    }
}
```

---

## 2. Backend - Controller Changes

### File: `BACKEND/Controllers/pigController.js`

**Import Addition:**
```javascript
import * as weightService from "../Logic/Weight-Records.js"
```

**New Endpoint Handlers:**

```javascript
// ADD a new weight record
export const addWeightRecord = async (req, res, next) => {
    try {
        const { pigId, weight, date, photoPath } = req.body;
        
        if (!pigId || !weight || !date) {
            return res.status(400).json({ success: false, message: 'pigId, weight, and date are required' });
        }

        const newRecord = await weightService.addWeightRecord(pigId, weight, date, photoPath || null);
        res.status(201).json({ success: true, message: 'Weight record added successfully', record: newRecord });
    } catch (err) {
        console.error('addWeightRecord error:', err);
        next(err);
    }
}

// UPDATE a weight record
export const updateWeightRecord = async (req, res, next) => {
    try {
        const { pigId, weightId } = req.params;
        const { weight, date, photoPath } = req.body;
        
        if (!pigId || !weightId || !weight || !date) {
            return res.status(400).json({ success: false, message: 'pigId, weightId, weight, and date are required' });
        }

        const updatedRecord = await weightService.updateWeightRecord(pigId, weightId, weight, date, photoPath);
        res.json({ success: true, message: 'Weight record updated successfully', record: updatedRecord });
    } catch (err) {
        console.error('updateWeightRecord error:', err);
        if (err.message === 'Weight record not found') {
            return res.status(404).json({ success: false, message: 'Weight record not found' });
        }
        next(err);
    }
}

// DELETE a weight record
export const deleteWeightRecord = async (req, res, next) => {
    try {
        const { pigId, weightId } = req.params;
        
        if (!pigId || !weightId) {
            return res.status(400).json({ success: false, message: 'pigId and weightId are required' });
        }

        const result = await weightService.deleteWeightRecord(pigId, weightId);
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

## 3. Backend - Routes Changes

### File: `BACKEND/routes/pigRoutes.js`

**Changes:**
```javascript
// BEFORE
import { addPig, getAllUserPigs, getPigsByFarm, getPigWeights } from '../Controllers/pigController.js';

// AFTER
import { addPig, getAllUserPigs, getPigsByFarm, getPigWeights, addWeightRecord, updateWeightRecord, deleteWeightRecord } from '../Controllers/pigController.js';

// Add these three routes:
router.post('/:pigId/weights', addWeightRecord);
router.put('/:pigId/weights/:weightId', updateWeightRecord);
router.delete('/:pigId/weights/:weightId', deleteWeightRecord);
```

---

## 4. Frontend - Farm.js Changes

### File: `FRONTEND/Mini-Capstone/js/Farm.js`

**Added API Helper Functions:**

```javascript
// API helper to call backend for weight records
async function callWeightRecordAPI(pigId, weightData, isEdit = false) {
    try {
        let candidates = [];
        try {
            const origin = window.location.origin;
            if (origin && origin !== 'null') candidates.push(origin);
        } catch (e) {}
        candidates.push('http://localhost:8080');
        candidates = candidates.filter((v,i,a) => a.indexOf(v) === i);
        
        const pageOrigin = window.location?.origin;
        if (pageOrigin && (pageOrigin.includes(':5500') || pageOrigin.includes(':5501'))) {
            candidates = candidates.filter(c => c !== 'http://localhost:8080');
            candidates.unshift('http://localhost:8080');
        }

        const method = isEdit ? 'PUT' : 'POST';
        const pigIdEncoded = encodeURIComponent(pigId);
        let lastError = null;

        for (const base of candidates) {
            try {
                let url = `${base.replace(/\/$/, '')}/api/pigs/${pigIdEncoded}/weights`;
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(weightData)
                });

                if (response && response.ok) {
                    const result = await response.json();
                    console.log('Weight record API success:', result);
                    return result;
                } else {
                    console.debug(`API call to ${base} returned status ${response?.status}`);
                }
            } catch (err) {
                lastError = err;
                console.debug(`Failed to reach ${base}:`, err.message);
            }
        }

        throw lastError || new Error('No available API endpoint');
    } catch (err) {
        console.warn('callWeightRecordAPI error:', err);
        throw err;
    }
}

// API helper to delete weight record from backend
async function callWeightDeleteAPI(pigId, weightId) {
    try {
        let candidates = [];
        try {
            const origin = window.location.origin;
            if (origin && origin !== 'null') candidates.push(origin);
        } catch (e) {}
        candidates.push('http://localhost:8080');
        candidates = candidates.filter((v,i,a) => a.indexOf(v) === i);
        
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
                    return result;
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

**Modified Weight Form Submission:**

```javascript
// Inside addWeightForm.addEventListener("submit", async function (e))
// Add this before the local storage save:

// API call to backend
const isEdit = currentEditWeightRecordIndex !== null && pig.weightHistory[currentEditWeightRecordIndex];
const apiPayload = {
    weight: parseFloat(weightVal),
    date: dateVal,
    photoPath: imgData || (isEdit ? existingImg : null)
};

try {
    // Try to call backend API
    await callWeightRecordAPI(currentDetailPigId, apiPayload, isEdit);
} catch (apiErr) {
    console.warn('Weight record API call failed:', apiErr);
    // Continue with local storage fallback
    showAlert("warning", "Local save only - server connection failed");
}
```

**Modified Delete Confirmation Handler:**

```javascript
// Make confirmDeleteRecordBtn event listener async
if (confirmDeleteRecordBtn) {
    confirmDeleteRecordBtn.addEventListener("click", async () => {  // <- ADD: async
        // ... existing code ...
        
        switch (type) {
            case "weight":
                if (pig.weightHistory && pig.weightHistory[index]) {
                    const record = pig.weightHistory[index];
                    pig.weightHistory.splice(index, 1);
                    saveFarmsToStorage();
                    deleted = true;
                    typeName = "Weight record";
                    
                    // ADD: Try to call API to delete from backend
                    try {
                        const weightId = record.weightId || `W_${record.date}`;
                        await callWeightDeleteAPI(pigId, weightId);
                    } catch (apiErr) {
                        console.warn('Weight record API deletion failed:', apiErr);
                    }
                }
                break;
            // ... rest of cases ...
        }
    });
}
```

---

## 5. Frontend - Pig Details Changes

### File: `FRONTEND/Mini-Capstone/pig-details.html`

**Added Global Functions in Script:**

```javascript
// Get API base URL helper
function getApiBase() {
    let candidates = [];
    let parentOrigin = null;
    try {
        parentOrigin = window.parent && window.parent.location && window.parent.location.origin;
        if (parentOrigin && parentOrigin !== 'null') candidates.push(parentOrigin);
    } catch (e) { parentOrigin = null; }
    let pageOrigin = null;
    try {
        pageOrigin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : null;
        if (pageOrigin) candidates.push(pageOrigin);
    } catch (e) { pageOrigin = null; }
    const backendFallback = 'http://localhost:8080';
    candidates.push(backendFallback);
    candidates = candidates.filter((v,i,a) => a.indexOf(v) === i);
    const isLiveServer = pageOrigin && (pageOrigin.includes(':5500') || pageOrigin.includes(':5501'));
    if (isLiveServer) {
        candidates = candidates.filter(c => c !== backendFallback);
        candidates.unshift(backendFallback);
    }
    return candidates;
}

// Show notification helper
function showNotification(type, message) {
    let notif = document.getElementById('weightNotification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'weightNotification';
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: "Poppins", sans-serif;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notif);
    }
    
    notif.textContent = message;
    notif.style.background = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#ff9800';
    notif.style.color = 'white';
    notif.style.display = 'block';
    
    setTimeout(() => {
        notif.style.display = 'none';
    }, 3000);
}

// API helper for weight records - called by parent after form submission
window.submitWeightRecordToAPI = async function(pigId, farmId, weightData, isEdit = false, recordIndex = null) {
    try {
        const candidates = getApiBase();
        let response = null;
        let usedBase = null;

        const pigIdEncoded = encodeURIComponent(pigId);
        
        for (const base of candidates) {
            try {
                let url, method, body;
                
                if (isEdit && recordIndex !== null) {
                    const pig = window.parent?.getPigDataById?.(pigId, farmId);
                    if (!pig?.weightHistory?.[recordIndex]) {
                        console.warn('Could not find weight record to edit');
                        continue;
                    }
                    
                    const record = pig.weightHistory[recordIndex];
                    const weightId = record.weightId || `W_${record.date}`;
                    
                    url = `${base.replace(/\/$/, '')}/api/pigs/${pigIdEncoded}/weights/${encodeURIComponent(weightId)}`;
                    method = 'PUT';
                } else {
                    url = `${base.replace(/\/$/, '')}/api/pigs/${pigIdEncoded}/weights`;
                    method = 'POST';
                }

                body = {
                    weight: parseFloat(weightData.weight),
                    date: weightData.date,
                    photoPath: weightData.photoPath || null
                };

                const attempt = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (attempt && attempt.ok) {
                    response = attempt;
                    usedBase = base;
                    break;
                }
            } catch (err) {
                console.debug('API call error:', err.message);
            }
        }

        if (!response) {
            showNotification('error', 'Failed to connect to server');
            return false;
        }

        const result = await response.json();
        if (result.success) {
            showNotification('success', isEdit ? 'Weight record updated successfully!' : 'Weight record added successfully!');
            return true;
        } else {
            showNotification('error', result.message || 'Operation failed');
            return false;
        }
    } catch (err) {
        console.error('submitWeightRecordToAPI error:', err);
        showNotification('error', 'An error occurred');
        return false;
    }
};

// API helper for deleting weight records
window.deleteWeightRecordAPI = async function(pigId, farmId, recordIndex) {
    try {
        const candidates = getApiBase();
        let response = null;

        const pig = window.parent?.getPigDataById?.(pigId, farmId);
        if (!pig?.weightHistory?.[recordIndex]) {
            showNotification('error', 'Weight record not found');
            return false;
        }

        const record = pig.weightHistory[recordIndex];
        const weightId = record.weightId || `W_${record.date}`;
        const pigIdEncoded = encodeURIComponent(pigId);

        for (const base of candidates) {
            try {
                const url = `${base.replace(/\/$/, '')}/api/pigs/${pigIdEncoded}/weights/${encodeURIComponent(weightId)}`;
                
                const attempt = await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (attempt && attempt.ok) {
                    response = attempt;
                    break;
                }
            } catch (err) {
                console.debug('Delete API call error:', err.message);
            }
        }

        if (!response) {
            showNotification('error', 'Failed to connect to server');
            return false;
        }

        const result = await response.json();
        if (result.success) {
            showNotification('success', 'Weight record deleted successfully!');
            return true;
        } else {
            showNotification('error', result.message || 'Deletion failed');
            return false;
        }
    } catch (err) {
        console.error('deleteWeightRecordAPI error:', err);
        showNotification('error', 'An error occurred');
        return false;
    }
};
```

---

## Summary of Changes

| File | Type | Change |
|------|------|--------|
| Weight-Records.js | Logic | Added updateWeightRecord() and deleteWeightRecord() |
| pigController.js | Backend | Added 3 endpoint handlers |
| pigRoutes.js | Routes | Added 3 new routes |
| Farm.js | Frontend | Added 2 API helpers + modified form submission + delete handler |
| pig-details.html | Frontend | Added 3 global API functions + notification system |

**Total New Functions: 7**
**Total Modified Functions: 2**
**Total New Endpoints: 3**
**Total New Routes: 3**
