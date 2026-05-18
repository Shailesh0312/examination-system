# Project Context - BBD Examination System (Jija Ji App)

## Overview
A React + Vite examination invigilation management system for **Babu Banarasi Das University, Lucknow**. Manages exam duties, faculty assignments, UFM cases, control room staff, and real-time collaboration via Supabase.

**Tech Stack:** React 19, Vite 5, Supabase, xlsx library, plain CSS

---

## Project Structure

```
src/
├── App.jsx              # Main app, state management, routing
├── main.jsx             # React entry point
├── index.css            # Global styles (CSS variables, responsive)
├── lib/
│   ├── supabase.js      # Supabase client init (URL, anon key)
│   ├── db.js            # All DB operations (CRUD, realtime)
│   └── constants.js     # Colors, status, constants, utilities
└── components/
    ├── LoginPage.jsx    # Login with role-based access
    ├── Sidebar.jsx      # Navigation sidebar
    ├── Dashboard.jsx    # Home view with stats
    ├── ImportPanel.jsx  # Excel import + smart allocation
    ├── LiveOps.jsx      # Real-time duty management
    ├── ControlRoom.jsx  # Control room staff management
    ├── ProctorialBoard.jsx  # Proctorial team management
    ├── UFMCases.jsx     # Unfair Means cases
    ├── DutyCount.jsx    # Faculty duty statistics
    ├── History.jsx      # Past session history
    ├── ExportSheet.jsx  # Excel/PDF export
    ├── FacultyLookup.jsx    # Search faculty duties
    ├── WhatsAppMsg.jsx  # WhatsApp broadcast
    └── ui/
        └── index.jsx    # Shared components (Badge, Modal, etc.)
```

---

## Database Schema (Supabase)

### Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `exam_duties` | Faculty invigilation duties | id, date, slot, faculty_id, faculty_name, room, status, duty_type, is_reserved, substitute_for, incident |
| `faculty_master` | Faculty records | faculty_id (PK), faculty_name, dept, designation, mobile |
| `app_config` | Date/slot selection | key (PK), value |
| `ufm_cases` | Unfair Means cases | id, date, slot, roll_no, student_name, room_no, authority_info (JSONB) |
| `proctorial_board` | Proctorial staff | id, name, designation, department, mobile, school |
| `control_room` | Control room staff | id, date, slot, faculty_id, faculty_name, control_role |

### Storage
- `ufm-docs` bucket for UFM document uploads (images/PDFs)

---

## User Roles & Permissions

| Role | Access |
|------|--------|
| Admin | Full access (add/edit/delete all) |
| Controller | Full access to duties, UFM, control room |
| Deputy | Full access to duties, UFM, control room |
| Vice Chancellor | **Read-only** |
| Dean of Schools | **Read-only** |
| Viewer | **Read-only** |

### Hardcoded Users (src/lib/constants.js)
```
admin / admin123       → Admin
controller / exam2025  → Controller of Examinations
deputy / deputy123     → Deputy Controller
vc / vc2025            → Vice Chancellor
dean / dean2025        → Dean of Schools
viewer / view123       → Read-Only Viewer
```

---

## Key Constants (src/lib/constants.js)

### Status Types
- `present`, `absent`, `late`, `relieved`, `replaced`, `swapped`, `swapped_in`, `emergency`, `roomchg`, `cancelled`, `reserved`, `ifs`, `control`, `exchanged`

### Duty Done (counted for fairness score)
- `present`, `late`, `roomchg`, `emergency`, `swapped_in`, `ifs`, `control`, `exchanged`

### NOT counted
- `absent`, `cancelled`, `reserved`, `replaced`, `swapped`, `relieved`

### Duty Types
- `Invigilation`, `IFS`, `Control Room`, `Standby`

### Designations
- Professor, Associate Professor, Assistant Professor, HOD, Dean of Schools, Vice Chancellor, Lab Instructor, Guest Faculty, Admin Staff, Computer Lab Instructor

---

## State Management (App.jsx)

All state lives in `App.jsx`, passed down as props:
```jsx
user, view, duties, facultyMaster, proctorial, ufmCases, controlRows,
date, slot, loading, syncStatus, sidebarOpen, isMobile
```

Key handlers:
- `onImportConfirm(newDuties, date, slot)` - Save imported duties
- `onAddDuty(duty)` / `onUpdateDuty(duty)` / `onDeleteDuty(id)` - CRUD
- `onAddControl(row)` / `onDeleteControl(id)` - Control room
- `onAddProct(member)` / `onDeleteProct(id)` - Proctorial board
- `onAddUFM(case)` / `onDeleteUFM(id)` - UFM cases

---

## Supabase Integration

- **Realtime:** Subscribes to `exam_duties`, `ufm_cases`, `proctorial_board`, `control_room` for live sync
- **Auth:** Client-side only (hardcoded users, not Supabase Auth)
- **RLS:** All tables have "Allow all access" policy (permissive)

---

## Color Palette (Dark Theme)
```
bg: #080d1e        surface: #0d1530       card: #111a38
border: #1e2d55    primary: #8B0000       primaryL: #c0392b
gold: #c9a227      green: #10b981         red: #ef4444
orange: #f59e0b    purple: #8b5cf6        teal: #14b8a6
blue: #3b82f6      yellow: #fbbf24
```

---

## Key Utilities (src/lib/constants.js)

```js
uid(prefix)           // Generate unique ID
fmtDate(d)            // "18 May 2026"
fmtDateLong(d)        // "18 May 2026" (long format)
fmtDateDMY(d)         // "18/05/2026"
getFairnessScore(f, duties)  // Fairness for smart allocation
smartAllocate(facultyList, roomList, date, slot, duties)  // Auto-assign
```

---

## Common Patterns

### Adding a new page:
1. Create component in `src/components/`
2. Add to NAV array in `Sidebar.jsx`
3. Add view in App.jsx's views object

### Adding DB table:
1. Add to SUPABASE_SETUP.sql
2. Add to `src/lib/db.js` (table name const + rowToX / xToRow converters)
3. Add state in App.jsx if needed

### Adding a new status:
1. Add to STATUS object in constants.js
2. Update DUTY_DONE / DUTY_NOT_COUNTED / DEPLOY_TRIGGER sets

---

## Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
npm run preview # Preview production build
```

---

## Responsive Design
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- CSS variables in index.css: `--sidebar-width`, `--content-padding`, `--touch-target-min`

---

## Notes
- XLSX loaded from CDN (cdnjs.cloudflare.com) - not bundled
- Supabase anon key is hardcoded (public exposure is intentional per RLS policies)
- All modifications sync to Supabase with realtime updates
- Faculty fairness score algorithm: standby/reserved = +2, relieved = +1, present = -1, absent = -2