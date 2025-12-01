# Testing Guide - Weight Records Integration

## Prerequisites

1. Backend server running (usually on port 8080)
2. Database properly configured with `weight_records` table
3. Frontend served (can be on Live Server 5500/5501 or same origin as backend)
4. At least one pig in the system

## Test Case 1: Add Weight Record

### Steps
1. Open the application and navigate to a farm
2. Click on a pig to open its details
3. In the pig details modal, click the Weight tab
4. Click "Add Weight" button
5. Fill in the form:
   - **Date**: Select a date from the calendar
   - **Weight**: Enter a value (e.g., 45.5)
   - **Picture (optional)**: Upload an image file
6. Click "Submit" button

### Expected Results
✅ Form validates and accepts the input
✅ Green success notification appears: "Weight record added successfully!"
✅ Weight record appears in the table
✅ Current weight updates in the left panel
✅ Record is saved to database
✅ Record persists after page reload

### If Something Goes Wrong
- **Notification says "Local save only"**: Backend is not responding, but data saved locally
- **Error notification**: Check browser console for error details
- **No notification appears**: Check if JavaScript errors exist in console

---

## Test Case 2: Edit Weight Record

### Steps
1. Open pig details (as in Test Case 1)
2. In the Weight Records table, find an existing record
3. Click the green edit icon (pencil) on that record
4. The edit modal should open with pre-filled data
5. Modify the weight value or date
6. Optionally upload a new image
7. Click "Submit" button

### Expected Results
✅ Edit modal opens with existing values pre-filled
✅ Form accepts modifications
✅ Green success notification: "Weight record updated successfully!"
✅ Table updates with new values
✅ Record is updated in database
✅ Changes persist after page reload

### Notes
- Last recorded weight should display above the form for reference
- If no image is selected during edit, the previous image is kept
- If a new image is selected, it replaces the old one

---

## Test Case 3: Delete Weight Record

### Steps
1. Open pig details (as in Test Case 1)
2. In the Weight Records table, find a record to delete
3. Click the red delete icon (trash) on that record
4. A confirmation modal should appear
5. Click "Yes, Delete" button to confirm

### Expected Results
✅ Confirmation modal appears
✅ Green success notification: "Weight record deleted successfully!"
✅ Record disappears from the table
✅ Record is deleted from database
✅ Deletion persists after page reload

### Recovery Notes
⚠️ **Deleted records cannot be recovered!** This is intentional for data integrity.

---

## Test Case 4: API Connectivity Test

### Purpose
Verify the backend API is responding correctly.

### Steps
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Open pig details and add a weight record
4. In Network tab, look for requests to `/api/pigs/{pigId}/weights`
5. Click on the request and check the response

### Expected Results
✅ POST request with 201 status code (for add)
✅ Response contains: `{ success: true, message: "...", record: {...} }`
✅ PUT request with 200 status code (for edit)
✅ DELETE request with 200 status code (for delete)

### If API Calls Fail
- Check if backend is running on correct port
- Verify firewall settings
- Check CORS configuration if on different domain
- Look for error messages in backend console

---

## Test Case 5: Offline Mode (Fallback Test)

### Purpose
Verify local storage fallback when backend is unavailable.

### Steps
1. Open DevTools Network tab
2. Offline the connection (go offline or throttle to 0)
3. Add a new weight record
4. Watch for warning notification: "Local save only - server connection failed"
5. Check that the record still appears in the table

### Expected Results
✅ Warning notification appears (orange)
✅ Record is saved locally despite offline status
✅ Record appears in the table
✅ Go back online and verify record persists

---

## Test Case 6: Live Server Detection Test

### Purpose
Verify the frontend correctly detects Live Server and routes API calls appropriately.

### Steps
1. Serve frontend on Live Server (port 5500 or 5501)
2. Open DevTools Network tab
3. Add a weight record
4. Check which API base was used in the console logs

### Expected Results
✅ Console shows attempts to connect to API
✅ Should see messages like "trying URL: http://localhost:8080/api/..."
✅ API calls should reach the backend successfully

---

## Test Case 7: Image Upload with Weight Record

### Purpose
Verify image handling during weight record operations.

### Steps
1. Open pig details and add a weight record
2. Upload an image file (JPG, PNG, etc.)
3. Submit the form
4. Click on the image thumbnail in the weight records table
5. An image viewer should open with the uploaded photo

### Expected Results
✅ Image is accepted during upload
✅ Image thumbnail appears in the table with size 40x40px
✅ Clicking thumbnail opens full-size image viewer
✅ Image is stored with the weight record in database
✅ When editing, previous image is displayed

### Image Format Notes
- Supported formats: JPEG, PNG, GIF, WebP
- Maximum file size: Browser's fetch limit (typically 100MB+)
- Images stored as base64 in database

---

## Test Case 8: Status-Based Restrictions

### Purpose
Verify that sold/deceased pigs cannot have weight records added/edited.

### Steps
1. Find or create a pig with status "Sold" or "Deceased"
2. Open its details
3. Try to click "Add Weight" button
4. Try to click edit on an existing weight record

### Expected Results
✅ "Add Weight" button is disabled (grayed out)
✅ Edit/delete buttons on weight records are disabled
✅ Tooltip shows: "Cannot add weight to sold/deceased pig"
✅ Cannot submit any modifications

---

## Test Case 9: Multiple Weight Records

### Purpose
Verify that multiple weight records display and sort correctly.

### Steps
1. Add 5+ weight records for a single pig with different dates
2. Check the table displays all records
3. Verify they sort by date (newest first)
4. Calculate the difference between consecutive weights

### Expected Results
✅ All records display in the table
✅ Records sorted in reverse chronological order (newest first)
✅ Each record shows: Date, Weight, Picture, Actions
✅ Differences calculate correctly for weight gain/loss

---

## Test Case 10: Concurrent Operations

### Purpose
Test behavior when multiple operations happen in quick succession.

### Steps
1. Open pig details
2. Quickly add a new weight record
3. Before notification disappears, add another record
4. Edit one of the records
5. Delete another record

### Expected Results
✅ All operations complete successfully
✅ Table updates correctly after each operation
✅ No race conditions or data corruption
✅ Each operation shows appropriate notification
✅ Database reflects all changes correctly

---

## Troubleshooting Guide

### Problem: "Failed to connect to server"
**Causes:**
- Backend server not running
- Wrong port configuration
- Firewall blocking connection
- CORS issues

**Solution:**
1. Verify backend is running: `npm run dev`
2. Check port is 8080
3. Check browser console for CORS errors
4. Verify firewall allows connections

### Problem: Weight record added but doesn't persist after reload
**Causes:**
- Only saved locally (server didn't respond)
- Database connection failed
- Incorrect pig ID format

**Solution:**
1. Check browser console for API errors
2. Verify backend logs for database errors
3. Verify pig ID format (e.g., "P001")
4. Check database connection

### Problem: Image not saving with weight record
**Causes:**
- File too large
- Unsupported format
- JavaScript error in image conversion

**Solution:**
1. Try with smaller image file
2. Use standard format (JPG or PNG)
3. Check browser console for errors
4. Check devtools Network tab for failed requests

### Problem: Can't delete weight record
**Causes:**
- Record not found in database
- Permission issues
- Foreign key constraints

**Solution:**
1. Verify record exists in database
2. Check backend logs for errors
3. Verify pig still exists
4. Check database for integrity issues

### Problem: API calls slow or timing out
**Causes:**
- Network latency
- Database queries slow
- Large image data

**Solution:**
1. Check network tab timing
2. Optimize database queries
3. Compress images before upload
4. Check server performance

---

## Performance Benchmarks

Expected response times (assuming good network):

| Operation | Expected Time |
|-----------|---------------|
| Add weight record | < 500ms |
| Edit weight record | < 500ms |
| Delete weight record | < 300ms |
| Load weight history | < 300ms |

If operations take longer, check:
- Network latency
- Database performance
- Server resource usage

---

## Success Criteria

All tests pass when:

✅ All 10 test cases pass without errors
✅ No console errors or warnings
✅ API calls complete within expected timeframe
✅ Data persists after page reload
✅ Notifications display correctly
✅ Status restrictions work properly
✅ Images upload and display correctly
✅ Offline mode provides graceful fallback

---

## After Testing

1. **Document Results**: Keep records of all test results
2. **Note Any Issues**: Report bugs with reproduction steps
3. **Performance Metrics**: Record actual response times
4. **Edge Cases**: Test with boundary values (0kg, 120kg, very old dates)
5. **Browser Compatibility**: Test on different browsers (Chrome, Firefox, Safari)

---

## Contact & Support

If you encounter any issues:

1. Check browser console (F12) for errors
2. Check backend server console for errors
3. Review the documentation in `WEIGHT_RECORDS_INTEGRATION.md`
4. Check database logs for failed queries

