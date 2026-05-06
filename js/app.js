// ============================================
//  ATTENDANCE MANAGER - CORE APP
// ============================================

// ---- DATA STORE (simulates server JSON files) ----
const DEFAULT_USERS = {
  teachers: [
    { id: "T001", name: "Dr. Priya Sharma",  email: "priya.sharma@school.edu",  password: "teacher123", subject: "Mathematics", classes: ["10-A","10-B","11-A"] },
    { id: "T002", name: "Mr. Rajesh Kumar",  email: "rajesh.kumar@school.edu",  password: "teacher456", subject: "Science",      classes: ["9-A","9-B","10-A"]  },
    { id: "T003", name: "Ms. Anita Verma",   email: "anita.verma@school.edu",   password: "teacher789", subject: "English",      classes: ["11-A","11-B","12-A"] }
  ]
};

const DEFAULT_STUDENTS = {
  students: [
    { id:"S001", name:"Aarav Singh",    rollNo:"101", class:"10-A", phone:"9876543210", parentName:"Ramesh Singh",   parentPhone:"9876543200" },
    { id:"S002", name:"Diya Mehta",     rollNo:"102", class:"10-A", phone:"9876543211", parentName:"Suresh Mehta",   parentPhone:"9876543201" },
    { id:"S003", name:"Kabir Nair",     rollNo:"103", class:"10-A", phone:"9876543212", parentName:"Vikram Nair",    parentPhone:"9876543202" },
    { id:"S004", name:"Ishaan Patel",   rollNo:"104", class:"10-B", phone:"9876543213", parentName:"Dinesh Patel",   parentPhone:"9876543203" },
    { id:"S005", name:"Riya Gupta",     rollNo:"105", class:"10-B", phone:"9876543214", parentName:"Anil Gupta",     parentPhone:"9876543204" },
    { id:"S006", name:"Arjun Reddy",    rollNo:"201", class:"11-A", phone:"9876543215", parentName:"Suresh Reddy",   parentPhone:"9876543205" },
    { id:"S007", name:"Sneha Iyer",     rollNo:"202", class:"11-A", phone:"9876543216", parentName:"Mohan Iyer",     parentPhone:"9876543206" },
    { id:"S008", name:"Vivaan Joshi",   rollNo:"301", class:"9-A",  phone:"9876543217", parentName:"Pradeep Joshi",  parentPhone:"9876543207" },
    { id:"S009", name:"Ananya Sharma",  rollNo:"302", class:"9-A",  phone:"9876543218", parentName:"Deepak Sharma",  parentPhone:"9876543208" },
    { id:"S010", name:"Rohan Mishra",   rollNo:"401", class:"12-A", phone:"9876543219", parentName:"Sanjay Mishra",  parentPhone:"9876543209" }
  ],
  attendance: {}
};

// ---- STORAGE HELPERS ----
const Storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  init() {
    if (!this.get('users'))    this.set('users', DEFAULT_USERS);
    if (!this.get('students')) this.set('students', DEFAULT_STUDENTS);
  }
};

// ---- APP STATE ----
const App = {
  currentTeacher: null,
  currentPage: 'dashboard',

  init() {
    Storage.init();
    const saved = Storage.get('session');
    if (saved) {
      this.currentTeacher = saved;
      this.showDashboard();
    } else {
      this.showLogin();
    }
    this.bindGlobalEvents();
  },

  login(email, password) {
    const data = Storage.get('users');
    const teacher = data.teachers.find(t => t.email === email && t.password === password);
    if (teacher) {
      this.currentTeacher = teacher;
      Storage.set('session', teacher);
      this.showDashboard();
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem('session');
    this.currentTeacher = null;
    this.showLogin();
  },

  showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
  },

  showDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    this.updateTeacherUI();
    this.navigateTo('overview');
  },

  updateTeacherUI() {
    const t = this.currentTeacher;
    document.getElementById('teacher-name').textContent = t.name;
    document.getElementById('teacher-subject').textContent = t.subject;
    document.getElementById('topbar-title').textContent = `Welcome back, ${t.name.split(' ')[0]}`;
  },

  navigateTo(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
    const section = document.getElementById(`page-${page}`);
    if (section) section.classList.remove('hidden');

    document.getElementById('topbar-subtitle').textContent = {
      overview:   'Dashboard Overview',
      take:       'Take Attendance',
      students:   'Student Management',
      reports:    'Attendance Reports',
      upload:     'Import from Excel'
    }[page] || '';

    Pages[page] && Pages[page].render();
  },

  bindGlobalEvents() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass  = document.getElementById('login-pass').value;
      const ok = this.login(email, pass);
      if (!ok) {
        document.getElementById('login-error').classList.remove('hidden');
        document.getElementById('login-pass').value = '';
      } else {
        document.getElementById('login-error').classList.add('hidden');
      }
    });

    // Nav items
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.addEventListener('click', () => this.navigateTo(el.dataset.page));
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());
  }
};

// ============================================
//  DATA HELPERS
// ============================================
const Data = {
  getStudents(cls = null) {
    const d = Storage.get('students');
    if (cls) return d.students.filter(s => s.class === cls);
    return d.students;
  },

  getTeacherClasses() {
    return App.currentTeacher.classes;
  },

  addStudent(student) {
    const d = Storage.get('students');
    student.id = 'S' + String(Date.now()).slice(-6);
    d.students.push(student);
    Storage.set('students', d);
  },

  updateStudent(id, updates) {
    const d = Storage.get('students');
    const i = d.students.findIndex(s => s.id === id);
    if (i > -1) d.students[i] = { ...d.students[i], ...updates };
    Storage.set('students', d);
  },

  deleteStudent(id) {
    const d = Storage.get('students');
    d.students = d.students.filter(s => s.id !== id);
    Storage.set('students', d);
  },

  // attendance key: "CLASS_DATE" → { studentId: status }
  saveAttendance(cls, date, records) {
    const d = Storage.get('students');
    const key = `${cls}_${date}`;
    d.attendance[key] = records;
    Storage.set('students', d);
  },

  getAttendance(cls, date) {
    const d = Storage.get('students');
    return d.attendance[`${cls}_${date}`] || {};
  },

  getAllAttendance() {
    return Storage.get('students').attendance || {};
  },

  // Returns {present, absent, late, total, percent} for a student
  getStudentStats(studentId) {
    const att = this.getAllAttendance();
    let present = 0, absent = 0, late = 0;
    for (const key in att) {
      const record = att[key][studentId];
      if (record === 'present') present++;
      else if (record === 'absent') absent++;
      else if (record === 'late') late++;
    }
    const total = present + absent + late;
    const percent = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : null;
    return { present, absent, late, total, percent };
  },

  importStudentsFromArray(rows, cls) {
    const d = Storage.get('students');
    let added = 0;
    rows.forEach(row => {
      if (!row.name || !row.rollNo) return;
      const exists = d.students.find(s => s.rollNo === String(row.rollNo) && s.class === cls);
      if (!exists) {
        d.students.push({
          id: 'S' + String(Date.now() + Math.random()).replace('.','').slice(-8),
          name: String(row.name).trim(),
          rollNo: String(row.rollNo).trim(),
          class: cls,
          phone: String(row.phone || ''),
          parentName: String(row.parentName || ''),
          parentPhone: String(row.parentPhone || '')
        });
        added++;
      }
    });
    Storage.set('students', d);
    return added;
  }
};

// ============================================
//  PAGE RENDERERS
// ============================================
const Pages = {

  // ---- OVERVIEW ----
  overview: {
    render() {
      const classes = Data.getTeacherClasses();
      const allStudents = Data.getStudents();
      const myStudents = allStudents.filter(s => classes.includes(s.class));
      const today = new Date().toISOString().split('T')[0];
      const att = Data.getAllAttendance();

      // Count today's attendance
      let todayPresent = 0, todayAbsent = 0, todayLate = 0, todayMarked = 0;
      classes.forEach(cls => {
        const rec = att[`${cls}_${today}`] || {};
        const students = Data.getStudents(cls);
        students.forEach(s => {
          if (rec[s.id]) {
            todayMarked++;
            if (rec[s.id] === 'present') todayPresent++;
            else if (rec[s.id] === 'absent') todayAbsent++;
            else if (rec[s.id] === 'late') todayLate++;
          }
        });
      });

      document.getElementById('stat-students').textContent = myStudents.length;
      document.getElementById('stat-classes').textContent = classes.length;
      document.getElementById('stat-present').textContent = todayPresent;
      document.getElementById('stat-absent').textContent = todayAbsent;

      // Recent attendance summary
      const summaryEl = document.getElementById('class-summary');
      summaryEl.innerHTML = classes.map(cls => {
        const rec = att[`${cls}_${today}`] || {};
        const students = Data.getStudents(cls);
        const p = students.filter(s => rec[s.id] === 'present').length;
        const total = students.length;
        const pct = total > 0 ? Math.round((p / total) * 100) : 0;
        const color = pct >= 75 ? 'green' : pct >= 50 ? 'yellow' : 'red';
        return `
          <div class="class-row">
            <div class="class-row-info">
              <strong>Class ${cls}</strong>
              <span>${total} students · ${p} present today</span>
            </div>
            <div class="class-row-bar">
              <div class="progress-bar">
                <div class="progress-fill ${color}" style="width:${pct}%"></div>
              </div>
              <small>${pct}%</small>
            </div>
          </div>`;
      }).join('');
    }
  },

  // ---- TAKE ATTENDANCE ----
  take: {
    selectedClass: null,
    selectedDate: null,
    attendance: {},

    render() {
      const classes = Data.getTeacherClasses();
      const sel = document.getElementById('att-class-select');
      sel.innerHTML = `<option value="">-- Select Class --</option>` +
        classes.map(c => `<option value="${c}">${c}</option>`).join('');

      document.getElementById('att-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('att-student-list').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Select a class and date</h3>
          <p>Choose the class and date to begin marking attendance</p>
        </div>`;
    },

    loadStudents() {
      const cls  = document.getElementById('att-class-select').value;
      const date = document.getElementById('att-date').value;
      if (!cls || !date) return;
      this.selectedClass = cls;
      this.selectedDate  = date;

      const students = Data.getStudents(cls);
      const existing  = Data.getAttendance(cls, date);
      this.attendance  = { ...existing };

      if (students.length === 0) {
        document.getElementById('att-student-list').innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>No students in this class</h3>
            <p>Add students via the Students page or import from Excel</p>
          </div>`;
        return;
      }

      document.getElementById('att-student-list').innerHTML =
        `<div class="attendance-grid">` +
        students.map(s => {
          const status = this.attendance[s.id] || '';
          return `
          <div class="attendance-row" data-id="${s.id}">
            <div class="student-roll">${s.rollNo}</div>
            <div class="student-info">
              <div class="student-name">${s.name}</div>
              <div class="student-class-tag">Class ${s.class}</div>
            </div>
            <div class="attend-buttons">
              <button class="att-btn present ${status==='present'?'selected':''}" data-status="present" data-id="${s.id}">✓ Present</button>
              <button class="att-btn absent  ${status==='absent' ?'selected':''}" data-status="absent"  data-id="${s.id}">✗ Absent</button>
              <button class="att-btn late    ${status==='late'   ?'selected':''}" data-status="late"    data-id="${s.id}">⏰ Late</button>
            </div>
          </div>`;
        }).join('') + `</div>`;

      document.querySelectorAll('.att-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const status = btn.dataset.status;
          this.attendance[id] = status;
          document.querySelectorAll(`[data-id="${id}"].att-btn`).forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.updateCounter();
        });
      });
      this.updateCounter();
    },

    markAll(status) {
      const students = Data.getStudents(this.selectedClass);
      students.forEach(s => {
        this.attendance[s.id] = status;
        document.querySelectorAll(`[data-id="${s.id}"].att-btn`).forEach(b => b.classList.remove('selected'));
        const btn = document.querySelector(`[data-id="${s.id}"].att-btn.${status}`);
        if (btn) btn.classList.add('selected');
      });
      this.updateCounter();
    },

    updateCounter() {
      const p = Object.values(this.attendance).filter(v=>v==='present').length;
      const a = Object.values(this.attendance).filter(v=>v==='absent').length;
      const l = Object.values(this.attendance).filter(v=>v==='late').length;
      document.getElementById('att-counter').textContent = `✓ ${p} Present  ✗ ${a} Absent  ⏰ ${l} Late`;
    },

    save() {
      if (!this.selectedClass || !this.selectedDate) { showToast('Select class and date first', 'error'); return; }
      Data.saveAttendance(this.selectedClass, this.selectedDate, this.attendance);
      showToast('Attendance saved successfully!', 'success');
    }
  },

  // ---- STUDENTS ----
  students: {
    filter: '',
    filterClass: '',

    render() {
      const classes = Data.getTeacherClasses();
      const sel = document.getElementById('student-class-filter');
      sel.innerHTML = `<option value="">All Classes</option>` +
        classes.map(c => `<option value="${c}">Class ${c}</option>`).join('');
      this.renderTable();
    },

    renderTable() {
      let students = Data.getStudents();
      // Filter to teacher's classes only
      const classes = Data.getTeacherClasses();
      students = students.filter(s => classes.includes(s.class));

      if (this.filterClass) students = students.filter(s => s.class === this.filterClass);
      if (this.filter) {
        const q = this.filter.toLowerCase();
        students = students.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.includes(q) ||
          s.class.toLowerCase().includes(q)
        );
      }

      const tbody = document.getElementById('student-tbody');
      if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>No students found</h3>
            <p>Try adjusting filters or add students below</p>
          </div>
        </td></tr>`;
        return;
      }

      tbody.innerHTML = students.map(s => {
        const stats = Data.getStudentStats(s.id);
        const pct   = stats.percent !== null ? stats.percent : '—';
        const pctClass = stats.percent >= 75 ? 'percent-high' : stats.percent >= 50 ? 'percent-mid' : 'percent-low';
        return `<tr>
          <td><strong>${s.rollNo}</strong></td>
          <td>${s.name}</td>
          <td><span class="badge badge-gray">${s.class}</span></td>
          <td>${s.phone || '—'}</td>
          <td><span class="attendance-percent ${pctClass}">${pct}${stats.percent !== null ? '%' : ''}</span></td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="Pages.students.openEdit('${s.id}')">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" onclick="Pages.students.deleteStudent('${s.id}')">🗑</button>
            </div>
          </td>
        </tr>`;
      }).join('');
    },

    openAdd() {
      const classes = Data.getTeacherClasses();
      document.getElementById('modal-student-title').textContent = 'Add Student';
      document.getElementById('student-modal-id').value = '';
      document.getElementById('student-modal-name').value = '';
      document.getElementById('student-modal-roll').value = '';
      document.getElementById('student-modal-phone').value = '';
      document.getElementById('student-modal-parent').value = '';
      document.getElementById('student-modal-pphone').value = '';
      const sel = document.getElementById('student-modal-class');
      sel.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');
      openModal('student-modal');
    },

    openEdit(id) {
      const all = Data.getStudents();
      const s = all.find(x => x.id === id);
      if (!s) return;
      const classes = Data.getTeacherClasses();
      document.getElementById('modal-student-title').textContent = 'Edit Student';
      document.getElementById('student-modal-id').value = s.id;
      document.getElementById('student-modal-name').value = s.name;
      document.getElementById('student-modal-roll').value = s.rollNo;
      document.getElementById('student-modal-phone').value = s.phone || '';
      document.getElementById('student-modal-parent').value = s.parentName || '';
      document.getElementById('student-modal-pphone').value = s.parentPhone || '';
      const sel = document.getElementById('student-modal-class');
      sel.innerHTML = classes.map(c => `<option value="${c}" ${s.class===c?'selected':''}>${c}</option>`).join('');
      openModal('student-modal');
    },

    saveStudent() {
      const id   = document.getElementById('student-modal-id').value;
      const data = {
        name:        document.getElementById('student-modal-name').value.trim(),
        rollNo:      document.getElementById('student-modal-roll').value.trim(),
        class:       document.getElementById('student-modal-class').value,
        phone:       document.getElementById('student-modal-phone').value.trim(),
        parentName:  document.getElementById('student-modal-parent').value.trim(),
        parentPhone: document.getElementById('student-modal-pphone').value.trim()
      };
      if (!data.name || !data.rollNo) { showToast('Name and Roll No are required', 'error'); return; }
      if (id) Data.updateStudent(id, data);
      else    Data.addStudent(data);
      closeModal('student-modal');
      this.renderTable();
      showToast(id ? 'Student updated!' : 'Student added!', 'success');
    },

    deleteStudent(id) {
      if (!confirm('Delete this student? This action cannot be undone.')) return;
      Data.deleteStudent(id);
      this.renderTable();
      showToast('Student deleted', 'warning');
    }
  },

  // ---- REPORTS ----
  reports: {
    render() {
      const classes = Data.getTeacherClasses();
      const sel = document.getElementById('report-class-filter');
      sel.innerHTML = `<option value="">All My Classes</option>` +
        classes.map(c => `<option value="${c}">Class ${c}</option>`).join('');
      this.generate();
    },

    generate() {
      const filterClass = document.getElementById('report-class-filter').value;
      const filterDate  = document.getElementById('report-date-filter').value;
      const classes = Data.getTeacherClasses();
      let students = Data.getStudents().filter(s => classes.includes(s.class));
      if (filterClass) students = students.filter(s => s.class === filterClass);

      const tbody = document.getElementById('report-tbody');
      if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📊</div><h3>No data</h3></div></td></tr>`;
        return;
      }

      tbody.innerHTML = students.map(s => {
        let stats;
        if (filterDate) {
          const att = Data.getAllAttendance();
          const key = `${s.class}_${filterDate}`;
          const rec = att[key] || {};
          const status = rec[s.id] || '—';
          const badge = status === 'present' ? 'badge-green' : status === 'absent' ? 'badge-red' : status === 'late' ? 'badge-yellow' : 'badge-gray';
          return `<tr>
            <td>${s.rollNo}</td><td>${s.name}</td>
            <td><span class="badge badge-gray">${s.class}</span></td>
            <td colspan="4"><span class="badge ${badge}">${status.charAt(0).toUpperCase()+status.slice(1)}</span></td>
          </tr>`;
        }

        stats = Data.getStudentStats(s.id);
        const pct = stats.percent !== null ? stats.percent : null;
        const pctClass = pct === null ? '' : pct >= 75 ? 'percent-high' : pct >= 50 ? 'percent-mid' : 'percent-low';
        const barColor = pct === null ? 'green' : pct >= 75 ? 'green' : pct >= 50 ? 'yellow' : 'red';
        return `<tr>
          <td>${s.rollNo}</td>
          <td>${s.name}</td>
          <td><span class="badge badge-gray">${s.class}</span></td>
          <td><span class="badge badge-green">${stats.present}</span></td>
          <td><span class="badge badge-red">${stats.absent}</span></td>
          <td><span class="badge badge-yellow">${stats.late}</span></td>
          <td>
            ${pct !== null ? `
            <span class="attendance-percent ${pctClass}">${pct}%</span>
            <div class="progress-bar" style="width:100px;margin-top:4px">
              <div class="progress-fill ${barColor}" style="width:${pct}%"></div>
            </div>` : '—'}
          </td>
        </tr>`;
      }).join('');
    }
  },

  // ---- UPLOAD ----
  upload: {
    parsedData: [],
    selectedClass: '',

    render() {
      const classes = Data.getTeacherClasses();
      const sel = document.getElementById('upload-class');
      sel.innerHTML = `<option value="">-- Select Target Class --</option>` +
        classes.map(c => `<option value="${c}">${c}</option>`).join('');
      document.getElementById('upload-preview').innerHTML = '';
      document.getElementById('upload-import-btn').classList.add('hidden');
    },

    handleFile(file) {
      if (!file) return;
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['xlsx','xls','csv'].includes(ext)) {
        showToast('Please upload an Excel (.xlsx, .xls) or CSV file', 'error');
        return;
      }
      const cls = document.getElementById('upload-class').value;
      if (!cls) { showToast('Select a target class first', 'error'); return; }
      this.selectedClass = cls;

      if (ext === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          this.parsedData = this.parseCSV(text);
          this.showPreview();
        };
        reader.readAsText(file);
      } else {
        // xlsx/xls via SheetJS
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, {type:'array'});
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, {defval:''});
          this.parsedData = rows.map(r => ({
            name:        r['Name'] || r['name'] || r['Student Name'] || '',
            rollNo:      String(r['Roll No'] || r['rollNo'] || r['Roll'] || r['roll_no'] || ''),
            phone:       String(r['Phone'] || r['phone'] || r['Mobile'] || ''),
            parentName:  String(r['Parent Name'] || r['parentName'] || r['Guardian'] || ''),
            parentPhone: String(r['Parent Phone'] || r['parentPhone'] || '')
          }));
          this.showPreview();
        };
        reader.readAsArrayBuffer(file);
      }
    },

    parseCSV(text) {
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g,''));
      return lines.slice(1).map(line => {
        const cols = line.split(',');
        const row = {};
        headers.forEach((h, i) => row[h] = (cols[i] || '').trim());
        return {
          name:        row.name || row.studentname || '',
          rollNo:      row.rollno || row.roll || row.no || '',
          phone:       row.phone || row.mobile || '',
          parentName:  row.parentname || row.guardian || '',
          parentPhone: row.parentphone || ''
        };
      }).filter(r => r.name);
    },

    showPreview() {
      const data = this.parsedData;
      if (data.length === 0) { showToast('No valid rows found in file', 'error'); return; }
      document.getElementById('upload-preview').innerHTML = `
        <div class="card" style="margin-top:1.5rem">
          <div class="card-header">
            <h3>Preview — ${data.length} students found</h3>
            <span class="badge badge-green">${data.length} rows</span>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Roll No</th><th>Phone</th><th>Parent</th></tr></thead>
              <tbody>${data.slice(0,10).map((r,i)=>`<tr>
                <td>${i+1}</td>
                <td>${r.name||'—'}</td>
                <td>${r.rollNo||'—'}</td>
                <td>${r.phone||'—'}</td>
                <td>${r.parentName||'—'}</td>
              </tr>`).join('')}
              ${data.length>10?`<tr><td colspan="5" style="text-align:center;color:var(--text-muted);font-style:italic">... and ${data.length-10} more rows</td></tr>`:''}
              </tbody>
            </table>
          </div>
        </div>`;
      document.getElementById('upload-import-btn').classList.remove('hidden');
    },

    importData() {
      const added = Data.importStudentsFromArray(this.parsedData, this.selectedClass);
      showToast(`${added} students imported to Class ${this.selectedClass}`, 'success');
      document.getElementById('upload-preview').innerHTML = '';
      document.getElementById('upload-import-btn').classList.add('hidden');
      this.parsedData = [];
    }
  }
};

// ============================================
//  MODAL HELPERS
// ============================================
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// ============================================
//  TOAST HELPER
// ============================================
function showToast(msg, type = '') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const icons = { success:'✅', error:'❌', warning:'⚠️' };
  const t = document.createElement('div');
  t.id = 'toast';
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ============================================
//  INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Update date badge
  const d = new Date();
  document.getElementById('date-badge').textContent =
    d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });

  // Init app
  App.init();

  // Take Attendance page events
  document.getElementById('att-load-btn').addEventListener('click', () => Pages.take.loadStudents());
  document.getElementById('att-save-btn').addEventListener('click', () => Pages.take.save());
  document.getElementById('mark-all-present').addEventListener('click', () => Pages.take.markAll('present'));
  document.getElementById('mark-all-absent').addEventListener('click',  () => Pages.take.markAll('absent'));

  // Student modal
  document.getElementById('add-student-btn').addEventListener('click',  () => Pages.students.openAdd());
  document.getElementById('save-student-btn').addEventListener('click', () => Pages.students.saveStudent());
  document.getElementById('close-student-modal').addEventListener('click', () => closeModal('student-modal'));
  document.getElementById('cancel-student-btn').addEventListener('click', () => closeModal('student-modal'));

  // Student filters
  document.getElementById('student-search').addEventListener('input', (e) => {
    Pages.students.filter = e.target.value;
    Pages.students.renderTable();
  });
  document.getElementById('student-class-filter').addEventListener('change', (e) => {
    Pages.students.filterClass = e.target.value;
    Pages.students.renderTable();
  });

  // Reports
  document.getElementById('report-class-filter').addEventListener('change', () => Pages.reports.generate());
  document.getElementById('report-date-filter').addEventListener('change',  () => Pages.reports.generate());
  document.getElementById('report-clear-date').addEventListener('click', () => {
    document.getElementById('report-date-filter').value = '';
    Pages.reports.generate();
  });

  // Upload
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => Pages.upload.handleFile(fileInput.files[0]));
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    Pages.upload.handleFile(e.dataTransfer.files[0]);
  });

  document.getElementById('upload-import-btn').addEventListener('click', () => Pages.upload.importData());
});