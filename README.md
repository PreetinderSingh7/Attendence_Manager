# AttendEase — School Attendance Manager

A complete, single-page attendance management system for teachers.
No backend required — runs entirely in the browser using localStorage.

---

## 📁 File Structure

```
attendance-manager/
│
├── index.html              ← Main app (login + dashboard, all pages)
│
├── css/
│   └── style.css           ← All styles (variables, layout, components)
│
├── js/
│   └── app.js              ← Core logic (auth, data, pages, routing)
│
├── data/
│   ├── users.json          ← Teacher accounts (reference / seed data)
│   └── students.json       ← Student records + attendance log (reference)
│
└── README.md               ← This file
```

---

## 🚀 How to Run

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
2. No server, no npm install, no build step needed

---

## 🔑 Demo Login Credentials

| Teacher             | Email                         | Password    | Classes          |
|---------------------|-------------------------------|-------------|------------------|
| Dr. Priya Sharma    | priya.sharma@school.edu       | teacher123  | 10-A, 10-B, 11-A |
| Mr. Rajesh Kumar    | rajesh.kumar@school.edu       | teacher456  | 9-A, 9-B, 10-A   |
| Ms. Anita Verma     | anita.verma@school.edu        | teacher789  | 11-A, 11-B, 12-A |

---

## ✨ Features

### 🔐 Teacher Authentication
- Only teachers can log in
- Session persists across page refreshes
- Each teacher sees only their assigned classes

### ✅ Attendance Taking
- Select class + date → load students
- Mark each student: Present / Absent / Late
- Bulk-mark all present or all absent
- Save attendance (persists in localStorage)

### 👥 Student Management
- View all students with search & class filter
- Add, edit, delete students
- See per-student attendance percentage

### 📈 Reports
- View attendance summary per student
- Filter by class and/or specific date
- Color-coded percentages (green ≥75%, yellow ≥50%, red <50%)

### 📤 Excel / CSV Import
- Drag-and-drop or click to upload `.xlsx`, `.xls`, `.csv`
- Preview data before importing
- Auto-maps columns: Name, Roll No, Phone, Parent Name, Parent Phone
- Skips duplicate roll numbers

---

## 📊 Excel Import Format

Your Excel file should have these column headers (row 1):

| Name         | Roll No | Phone      | Parent Name  | Parent Phone |
|--------------|---------|------------|--------------|--------------|
| Aarav Singh  | 101     | 9876543210 | Ramesh Singh | 9876543200   |
| Diya Mehta   | 102     | 9876543211 | Suresh Mehta | 9876543201   |

---

## 🛠 Data Storage

All data is stored in the browser's `localStorage` under these keys:
- `users` — teacher accounts
- `students` — student records + attendance records
- `session` — current logged-in teacher

To reset all data: open browser DevTools → Application → Local Storage → Clear All

---

## 📦 Dependencies (loaded via CDN)

- **SheetJS (xlsx 0.18.5)** — Excel/CSV parsing
- **Google Fonts** — DM Serif Display + DM Sans

No npm, no build tools, no backend needed.