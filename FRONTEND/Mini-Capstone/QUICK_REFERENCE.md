# Mini-Capstone File Organization - Quick Reference

## Directory Structure

```
FRONTEND/Mini-Capstone/
├── Farm.html                          ← Start here for Farm page
├── Dashboard.html
├── expenses.html
├── reminders.html
├── ProfileSettings.html
├── Forgot_Pass.html
├── index.html
│
├── js/
│   ├── Farm.js                        ← Farm logic (3,640 lines)
│   ├── Dash.js                        ← Dashboard logic
│   ├── expi2.js                       ← Expenses & Reports logic
│   ├── rem.js                         ← Reminders logic
│   ├── Forgot.js                      ← Forgot password logic
│   ├── global-modals.js
│   ├── nav-transition.js
│   ├── profilebtnmodal.js
│   ├── ProfSet.js
│   └── script.js
│
├── css/
│   ├── Farm.css                       ← Farm page styles (1,284 lines)
│   ├── FarmInputs.css                 ← Farm forms/modals (862 lines)
│   ├── FarmStatus.css                 ← Farm status modals (400 lines)
│   ├── Dash.css
│   ├── exptri.css
│   ├── modalstyles.css
│   ├── rem.css
│   └── [other stylesheets]
│
├── assets/
│   ├── dash-icons/
│   │   └── [icon files]
│   └── background-images/
│       └── [background files]
│
├── deleted/                           ← Old/backup files
│
└── FILE_ORGANIZATION_SUMMARY.md       ← See this for full details
```

## Key Files at a Glance

### For Farm Management
- **HTML**: `Farm.html` (954 lines)
- **JavaScript**: `js/Farm.js` (3,640 lines)
- **CSS**: 
  - `css/Farm.css` - Main layout and table styles
  - `css/FarmInputs.css` - Form inputs and modals
  - `css/FarmStatus.css` - Status change dialogs

### For Expenses & Reports
- **HTML**: `expenses.html`
- **JavaScript**: `js/expi2.js` - With API integration and filtering
- **CSS**: `css/exptri.css`

### For Reminders
- **HTML**: `reminders.html`
- **JavaScript**: `js/rem.js`
- **CSS**: `css/rem.css`

### For Dashboard
- **HTML**: `Dashboard.html`
- **JavaScript**: `js/Dash.js`
- **CSS**: `css/Dash.css`

## Features Overview

### Farm Page (Farm.html)
- ✅ Multiple farm management with tabs
- ✅ Add/Edit/Delete pigs
- ✅ Track pig weight with images
- ✅ Log expenses per pig
- ✅ Record vaccination schedule
- ✅ Manage pig status (Growing → To Sale → Sold → Deceased)
- ✅ Bulk operations on multiple pigs
- ✅ LocalStorage persistence

### Key Modals in Farm.html
1. **Add Pig Modal** - Register new pigs
2. **Add Weight Modal** - Record weight with photo
3. **Add Expense Modal** - Log pig expenses
4. **Add Vaccination Modal** - Track vaccinations
5. **Edit Pig Details Modal** - Update pig info
6. **Status Change Modal** - Handle sales with pricing
7. **Alert/Success Modals** - User feedback

## Backend Integration Notes

The following Farm.js functions interact with APIs:
- (Currently designed for local storage)
- Ready to be updated for backend API calls if needed

The following expi2.js functions use backend APIs:
- `/add-expense` - Add new expense
- `/edit-expense` - Update expense
- `/delete-expense` - Remove expense
- `/cancel-sold-pig` - Revert pig sale
- `/Expenses-Income-Filtered` - Get filtered expense data
- `/Total-Expenses-Filtered` - Get filtered totals

## CSS Organization

### Farm CSS Files (1,546 lines total)

**Farm.css** (1,284 lines)
- Global variables and resets
- Sidebar styles
- Header section (background + top bar)
- Main content wrapper
- Farm tabs styling
- Table wrapper and content
- Action bar (filters, dropdowns)
- Status filters
- Table styles (pigs list)
- Empty state
- Pagination
- Responsive adjustments
- Profile & Logout modals

**FarmInputs.css** (862 lines)
- Modal overlay and container
- Close buttons
- Form groups and input wrappers
- File upload styling
- Dialog titles
- Date picker styling
- Weight wrapper styling
- Modal actions

**FarmStatus.css** (400 lines)
- Status modal card
- Input rows for pricing
- Receipt layout
- Status totals display
- Modal backdrop
- Success/error messages

## Quick Start

1. **Open Farm Page**: Open `Farm.html` in a browser
2. **Create Farm**: Click the `+` button in the farm tabs
3. **Add Pigs**: Use "Add Pig" button to register new pigs
4. **Manage Data**: Click pig ID badge to view details
5. **Track Records**: Add weight, expenses, and vaccinations
6. **Manage Sales**: Change status to "To Sale" then "Sold"

## Import Paths Reference

```javascript
// In Farm.html - CSS imports
<link rel="stylesheet" href="css/Farm.css">
<link rel="stylesheet" href="css/FarmInputs.css">
<link rel="stylesheet" href="css/FarmStatus.css">

// In Farm.html - JS import
<script src="js/Farm.js"></script>

// In Farm.html - Assets
<img src="assets/dash-icons/ICON.png">
<img src="assets/dash-icons/WPig.png">
<img src="assets/background-images/BG.png">
```

## Notes

- All Farm functionality uses **LocalStorage** for persistence
- No external dependencies required (vanilla JavaScript)
- Font Awesome 6.4.0 used for icons (CDN)
- Poppins font from Google Fonts (CDN)
- Fully responsive design (desktop, tablet, mobile)

## Data Schema (LocalStorage)

```javascript
// Key: 'poinky_farms_v1'
{
  farms: [
    {
      id: 1,
      name: "Farm 1",
      pigs: [
        {
          id: 1,
          name: "Babe",
          breed: "Large White",
          gender: "female",
          age: "6",
          date: "2025-01-01",
          shortId: "BAB",
          weight: "30kg",
          status: "growing",
          weightHistory: [...],
          expenses: [...],
          vaccinations: [...],
          statusHistory: [...]
        }
      ]
    }
  ],
  nextFarmId: 4,
  nextPigId: 4
}
```

---

**Last Updated**: File organization completed
**Total Farm Files**: 5 (1 HTML + 1 JS + 3 CSS)
**Total Lines of Code**: 6,180 lines (Farm feature only)
