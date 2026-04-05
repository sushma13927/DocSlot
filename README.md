# DocSlot – Bug Fix & Deployment Guide

## Bugs Fixed

### Bug 1 — Dashboard pages missing from index.html (PRIMARY login bug)
**Symptom:** Login appeared to succeed but nothing showed — or showed "Invalid Credentials".  
**Root cause:** `index.html` only had Login, Signup, and OTP pages. The Patient Dashboard, Doctor Dashboard, Admin Dashboard, and all booking wizard pages were **never in the HTML**. `showPage()` silently failed because `document.getElementById(pageId)` returned `null`.  
**Fix:** Added all 10 missing pages to `index.html`.

---

### Bug 2 — `<form>` submit conflict with login button
**Symptom:** Pressing Enter or clicking Login sometimes did nothing or double-fired.  
**Root cause:** `index.html` wrapped the login fields in `<form id="loginForm">` but the JS only listened for a `click` on `#loginBtn`, not `submit` on the form. The browser's native form submit fired first, reloading the page before the click handler ran.  
**Fix:** Removed the `<form>` wrapper; kept bare `<div>`. Added an `Enter` keydown listener on the password field as a convenience shortcut.

---

### Bug 3 — Demo users wiped on re-load
**Symptom:** Credentials worked once, then stopped after a page refresh.  
**Root cause:** `preloadDemoData()` checked `localStorage.getItem('demo_data_loaded')` and **skipped** re-seeding on every subsequent load. If a user had cleared storage or the flag was missing, the users array was empty and all logins returned "Invalid Credentials".  
**Fix:** Demo users are **always** merged back in on every page load (by ID). New users registered via signup are preserved — they are not overwritten because their IDs differ from the demo IDs.

---

### Bug 4 — Logo broken on deployment (wrong path + wrong CSS)
**Root cause A:** `src="./assets/docslot-logo.svg"` — the `assets/` folder was never committed to the repo. Linux deployment servers (Vercel, Netlify, GitHub Pages) are case-sensitive and 404 on missing folders.  
**Root cause B:** `.nav-logo { fill: none }` — `fill` is an SVG presentation attribute. It has no effect on `<img>` tags locally but can suppress SVG fills in strict CDN/proxy environments.  
**Fix A:** Created `assets/` folder, placed `docslot-logo.svg` inside, removed `./` prefix from all `src` paths → `assets/docslot-logo.svg`.  
**Fix B:** Replaced `fill: none` with `object-fit: contain` on `.nav-logo` and `.card-logo`.

---

### Bug 5 — Time slot buttons had no visual feedback
**Root cause:** Slots were plain `<div>` elements with inline style changes on click. Selected state was hard to see.  
**Fix:** Used `.time-slot-btn` CSS class with a `.selected` state for clear visual feedback.

---

## Correct Project Structure

```
project-root/
│
├── assets/
│   └── docslot-logo.svg        ← logo MUST be here
│
├── index.html                  ← contains ALL pages (login + all dashboards)
├── style.css
├── storage-auth.js             ← storage helpers + auth + login/signup logic
├── workflow-utils.js           ← OTP, date formatting helpers
├── booking-stage-1.js          ← hospital → reason → doctor → date/time
├── booking-stage-2.js          ← payment → receipt → appointment history
├── doctor-admin.js             ← doctor dashboard + hospital admin panel
├── appointment.html            ← standalone reschedule page
├── appointment.js
│
├── vercel.json
└── netlify.toml
```

---

## Demo Credentials

| Role    | Email               | Password     |
|---------|---------------------|--------------|
| Patient | patient1@mail.com   | Patient@123  |
| Doctor  | doctor@mail.com     | Doctor@123   |
| Admin   | admin@mail.com      | Admin@123    |

Login also accepts **username** (patient1, doctor1, admin1) or **phone number**.

---

## Deployment

### Vercel
1. Push to GitHub. Import on vercel.com. Framework: `Other`. Root: `.`. Deploy.

### Netlify
1. Push to GitHub. Connect on app.netlify.com. Publish dir: `.`. Deploy.

### GitHub Pages
1. Settings → Pages → Source → main / root.
2. If in a subfolder: update `src` paths to `/repo-name/assets/docslot-logo.svg`.
