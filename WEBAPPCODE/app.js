const STORE_KEYS = [
  "users",
  "currentUser",
  "maternalRecords",
  "infantRecords",
  "checkupSchedules",
  "reminders",
  "monthlyReports",
  "emergencyContacts",
  "backupMeta"
];

const roles = ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"];
const barangays = ["Barangay Poblacion", "Barangay Maligaya", "Barangay San Isidro", "Barangay Mabini", "Barangay Sta. Cruz"];
const pages = [
  { id: "dashboard", label: "Dashboard", icon: "▦", roles },
  { id: "maternal", label: "Maternal Records", icon: "M", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "infants", label: "Infant Records", icon: "I", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "schedules", label: "Check-up Schedules", icon: "◷", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"] },
  { id: "reminders", label: "Reminders", icon: "✉", roles: ["Administrator", "Nurse / Midwife", "Mother / Parent"] },
  { id: "barangay", label: "Barangay Monitoring", icon: "⌂", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "reports", label: "Monthly Reports", icon: "▤", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"] },
  { id: "users", label: "Users and Roles", icon: "U", roles: ["Administrator"] },
  { id: "backup", label: "Backup and Recovery", icon: "⇩", roles: ["Administrator"] },
  { id: "contacts", label: "Emergency Contacts", icon: "☎", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"] },
  { id: "logout", label: "Logout", icon: "↩", roles }
];

let state = {};
let activePage = "dashboard";
let selectedBarangay = barangays[0];

document.addEventListener("DOMContentLoaded", init);

function init() {
  seedIfNeeded();
  loadState();
  hydrateAuthOptions();
  bindAuth();
  bindShell();
  const current = getCurrentUser();
  current ? showApp(current) : showAuth();
}

function seedIfNeeded() {
  if (localStorage.getItem("users")) return;
  const sample = sampleData();
  Object.entries(sample).forEach(([key, value]) => save(key, value));
}

function loadState() {
  STORE_KEYS.forEach((key) => {
    state[key] = read(key, key === "backupMeta" ? null : []);
  });
}

function sampleData() {
  const users = [
    user("U-001", "RHU Administrator", "admin@rhu.gov", "Administrator", "Municipal Health Office"),
    user("U-002", "Dr. Elisa Mercado", "mho@rhu.gov", "MHO", "Municipal Health Office"),
    user("U-003", "Nurse Ana Reyes", "nurse@rhu.gov", "Nurse / Midwife", "Barangay Poblacion"),
    user("U-004", "Dr. Carlo Santos", "doctor@rhu.gov", "Doctor", "Barangay San Isidro"),
    user("U-005", "Maria Dela Cruz", "parent@rhu.gov", "Mother / Parent", "Barangay Poblacion", "M-1001")
  ];

  const maternalRecords = [
    mother("M-1001", "Maria Dela Cruz", "Purok 2, Poblacion", "Barangay Poblacion", 27, "09171234567", "2026-01-18", "2026-10-25", "Ongoing", 4, "Low", "Nurse Ana Reyes", "Normal BP and weight gain."),
    mother("M-1002", "Grace Villanueva", "Sitio Centro, Maligaya", "Barangay Maligaya", 34, "09181234567", "2025-12-30", "2026-10-06", "High Risk", 3, "High", "Midwife Liza Ramos", "Needs close monitoring for hypertension."),
    mother("M-1003", "Joanne Reyes", "Zone 4, San Isidro", "Barangay San Isidro", 22, "09192223344", "2026-02-05", "2026-11-12", "Ongoing", 2, "Moderate", "Nurse Ana Reyes", "Missed one prenatal visit."),
    mother("M-1004", "Lina Bautista", "Mabini Road", "Barangay Mabini", 29, "09202223344", "2025-10-14", "2026-07-21", "Delivered", 7, "Low", "Midwife Cora Lim", "Delivered healthy baby girl."),
    mother("M-1005", "Catherine Uy", "Sta. Cruz Proper", "Barangay Sta. Cruz", 31, "09212223344", "2026-03-10", "2026-12-15", "Ongoing", 1, "Moderate", "Nurse Ben Garcia", "For nutrition counseling.")
  ];

  const infantRecords = [
    infant("I-2001", "Baby Lucia Dela Cruz", "Maria Dela Cruz", "Purok 2, Poblacion", "Barangay Poblacion", "2026-04-02", 2, "09171234567", "Pending", "2026-06-10", "2026-07-10", "Nurse Ana Reyes", "BCG completed, next OPV due."),
    infant("I-2002", "Baby Nico Bautista", "Lina Bautista", "Mabini Road", "Barangay Mabini", "2026-05-09", 1, "09202223344", "Incomplete", "2026-06-18", "2026-07-18", "Midwife Cora Lim", "Parent requested weekend schedule."),
    infant("I-2003", "Baby Sam Villanueva", "Grace Villanueva", "Sitio Centro, Maligaya", "Barangay Maligaya", "2025-12-14", 6, "09181234567", "Missed", "2026-05-22", "2026-06-28", "Midwife Liza Ramos", "Follow-up reminder required."),
    infant("I-2004", "Baby Ella Santos", "Mina Santos", "Zone 4, San Isidro", "Barangay San Isidro", "2026-02-18", 4, "09197778888", "Complete", "2026-06-19", "2026-07-19", "Nurse Ana Reyes", "On track."),
    infant("I-2005", "Baby Ivan Cruz", "Rosa Cruz", "Sta. Cruz Proper", "Barangay Sta. Cruz", "2026-03-30", 3, "09216667777", "Pending", "2026-06-05", "2026-07-05", "Nurse Ben Garcia", "Vitamin A schedule pending.")
  ];

  const checkupSchedules = [
    schedule("S-3001", "Maria Dela Cruz", "Maternal", "Barangay Poblacion", "2026-07-03", "09:00", "Nurse Ana Reyes", "Upcoming", "Routine prenatal check-up."),
    schedule("S-3002", "Grace Villanueva", "Maternal", "Barangay Maligaya", "2026-06-23", "10:00", "Midwife Liza Ramos", "Missed", "High-risk follow-up missed."),
    schedule("S-3003", "Baby Lucia Dela Cruz", "Infant", "Barangay Poblacion", "2026-07-10", "08:30", "Nurse Ana Reyes", "Upcoming", "Immunization appointment."),
    schedule("S-3004", "Baby Nico Bautista", "Infant", "Barangay Mabini", "2026-06-18", "13:30", "Midwife Cora Lim", "Completed", "Weight and immunization checked."),
    schedule("S-3005", "Joanne Reyes", "Maternal", "Barangay San Isidro", "2026-07-01", "14:00", "Nurse Ana Reyes", "Rescheduled", "Moved from June 28.")
  ];

  const reminders = [
    reminder("R-4001", "Maria Dela Cruz", "09171234567", "Maternal Check-up Reminder", "Magandang araw, Maria Dela Cruz. Paalala po sa inyong check-up sa July 3 sa barangay health center. Maraming salamat.", "2026-07-02", "Queue"),
    reminder("R-4002", "Grace Villanueva", "09181234567", "Missed Check-up Follow-up", "Magandang araw, Grace Villanueva. Nakaligtaan po ang inyong check-up. Makipag-ugnayan po sa RHU para sa bagong schedule.", "2026-06-24", "Sent"),
    reminder("R-4003", "Baby Lucia Dela Cruz", "09171234567", "Infant Immunization Reminder", "Magandang araw, Maria Dela Cruz. Paalala po sa immunization ni Baby Lucia sa July 10.", "2026-07-09", "Upcoming"),
    reminder("R-4004", "Midwife Liza Ramos", "09185550000", "Monthly Report Reminder", "Paalala po sa pagsusumite ng monthly maternal and infant summary report.", "2026-06-30", "Failed")
  ];

  const monthlyReports = [
    report("REP-5001", "Maternal", "June 2026", "Barangay Poblacion", 18, 3, 2, 1, 42, 1, "Nurse Ana Reyes", "2026-06-25", "Submitted"),
    report("REP-5002", "Infant", "June 2026", "Barangay Poblacion", 25, 4, 19, 6, 2, 38, "Nurse Ana Reyes", "2026-06-25", "Submitted"),
    report("REP-5003", "Maternal", "June 2026", "Barangay Maligaya", 14, 2, 1, 3, 30, 3, "Midwife Liza Ramos", "2026-06-24", "Submitted"),
    report("REP-5004", "Infant", "May 2026", "Barangay Mabini", 22, 2, 17, 5, 1, 31, "Midwife Cora Lim", "2026-05-29", "Submitted")
  ];

  const emergencyContacts = [
    contact("Nurse Ana Reyes", "Barangay Poblacion", "09175550101", "Poblacion Health Station", "911 / RHU 112"),
    contact("Midwife Liza Ramos", "Barangay Maligaya", "09175550102", "Maligaya Barangay Clinic", "911 / RHU 112"),
    contact("Nurse Ben Garcia", "Barangay Sta. Cruz", "09175550103", "Sta. Cruz Health Center", "911 / RHU 112"),
    contact("Midwife Cora Lim", "Barangay Mabini", "09175550104", "Mabini Birthing Station", "911 / RHU 112")
  ];

  return { users, currentUser: null, maternalRecords, infantRecords, checkupSchedules, reminders, monthlyReports, emergencyContacts, backupMeta: null };
}

function user(id, name, email, role, barangay, motherId = "") {
  return { id, name, email, username: email, password: "demo123", role, barangay, motherId, createdAt: new Date().toISOString() };
}

function mother(id, fullName, address, barangay, age, contact, lmp, edd, pregnancyStatus, checkupsCompleted, riskLevel, assignedNurse, notes) {
  return { id, fullName, address, barangay, age, contact, lmp, edd, pregnancyStatus, checkupsCompleted, riskLevel, assignedNurse, notes };
}

function infant(id, infantName, parentName, address, barangay, birthdate, ageMonths, contact, immunizationStatus, lastCheckup, nextCheckup, assignedNurse, notes) {
  return { id, infantName, parentName, address, barangay, birthdate, ageMonths, contact, immunizationStatus, lastCheckup, nextCheckup, assignedNurse, notes };
}

function schedule(id, patientName, type, barangay, date, time, assignedNurse, status, notes) {
  return { id, patientName, type, barangay, date, time, assignedNurse, status, notes };
}

function reminder(id, recipientName, contact, messageType, message, scheduleDate, status) {
  return { id, recipientName, contact, messageType, message, scheduleDate, status };
}

function report(id, type, month, barangay, total, newCount, completeOrDelivered, incompleteOrHighRisk, missedOrCompleted, completedOrMissed, preparedBy, dateSubmitted, status) {
  return { id, type, month, barangay, total, newCount, completeOrDelivered, incompleteOrHighRisk, missedOrCompleted, completedOrMissed, preparedBy, dateSubmitted, status };
}

function contact(nurseName, barangay, contactNumber, clinicLocation, hotline) {
  return { id: makeId("EC"), nurseName, barangay, contactNumber, clinicLocation, hotline };
}

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function persist(key) {
  save(key, state[key]);
}

function getCurrentUser() {
  return read("currentUser", null);
}

function hydrateAuthOptions() {
  fillSelect("regRole", roles);
  fillSelect("regBarangay", ["Municipal Health Office", ...barangays]);
}

function fillSelect(id, options, selected = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = options.map((opt) => `<option value="${escapeHtml(opt)}"${opt === selected ? " selected" : ""}>${escapeHtml(opt)}</option>`).join("");
}

function bindAuth() {
  document.querySelectorAll("[data-auth-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-auth-tab]").forEach((tab) => tab.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("loginForm").classList.toggle("hidden", btn.dataset.authTab !== "login");
      document.getElementById("registerForm").classList.toggle("hidden", btn.dataset.authTab !== "register");
    });
  });

  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const found = state.users.find((u) => (u.email.toLowerCase() === email || u.username.toLowerCase() === email) && u.password === password);
    if (!found) return toast("Invalid login details. Try a seeded demo account or register.", true);
    save("currentUser", found);
    showApp(found);
    toast(`Welcome, ${found.name}.`);
  });

  document.getElementById("registerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    if (password !== confirm) return toast("Passwords do not match.", true);
    if (state.users.some((u) => u.email.toLowerCase() === email)) return toast("That email is already registered.", true);
    const role = document.getElementById("regRole").value;
    const newUser = {
      id: makeId("U"),
      name: document.getElementById("regName").value.trim(),
      email,
      username: email,
      password,
      role,
      barangay: document.getElementById("regBarangay").value,
      motherId: role === "Mother / Parent" ? "M-1001" : "",
      createdAt: new Date().toISOString()
    };
    state.users.push(newUser);
    persist("users");
    save("currentUser", newUser);
    showApp(newUser);
    toast("Account created successfully.");
  });
}

function bindShell() {
  document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modal").addEventListener("click", (event) => {
    if (event.target.id === "modal") closeModal();
  });
  document.getElementById("globalSearch").addEventListener("input", () => renderPage(activePage));
  document.getElementById("restoreFile").addEventListener("change", restoreBackupFile);
}

function showAuth() {
  document.getElementById("authScreen").classList.remove("hidden");
  document.getElementById("appShell").classList.add("hidden");
}

function showApp(userData) {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
  document.getElementById("rolePill").textContent = userData.role;
  document.getElementById("currentUserName").textContent = userData.name;
  document.getElementById("currentUserMeta").textContent = `${userData.role} • ${userData.barangay}`;
  document.getElementById("userInitials").textContent = initials(userData.name);
  renderNav();
  activePage = "dashboard";
  renderPage(activePage);
}

function renderNav() {
  const current = getCurrentUser();
  const groups = [
    ["Main", ["dashboard", "barangay"]],
    ["Records", ["maternal", "infants", "schedules"]],
    ["Communication", ["reminders", "contacts"]],
    ["Reports", ["reports"]],
    ["System", ["users", "backup", "logout"]]
  ];
  const allowed = pages.filter((page) => page.roles.includes(current.role));
  document.getElementById("mainNav").innerHTML = groups.map(([label, ids]) => {
    const links = allowed.filter((page) => ids.includes(page.id));
    if (!links.length) return "";
    return `<div class="nav-group"><span>${label}</span>${links.map((page) => `<button class="nav-link ${page.id === activePage ? "active" : ""}" data-page="${page.id}"><span>${page.icon}</span>${page.label}</button>`).join("")}</div>`;
  }).join("");

  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.page === "logout") return logout();
      activePage = btn.dataset.page;
      document.getElementById("sidebar").classList.remove("open");
      renderPage(activePage);
      renderNav();
    });
  });
}

function renderPage(page) {
  const titles = {
    dashboard: ["Dashboard", "Monitoring summary"],
    maternal: ["Maternal Records", "Pregnancy monitoring and risk tracking"],
    infants: ["Infant Records", "Immunization and check-up monitoring"],
    schedules: ["Check-up Schedules", "Maternal and infant appointments"],
    reminders: ["Reminder System", "Front-end SMS and notification simulation"],
    barangay: ["Barangay Monitoring", "Monthly records by barangay clinic"],
    reports: ["Monthly Reports", "Maternal and infant summaries"],
    users: ["Users and Roles", "Account and assignment management"],
    backup: ["Backup and Recovery", "LocalStorage data export and restore"],
    contacts: ["Emergency Contacts", "Nurse and midwife contact information"]
  };
  document.getElementById("pageTitle").textContent = titles[page][0];
  document.getElementById("pageSubtitle").textContent = titles[page][1];
  const renderers = { dashboard: renderDashboard, maternal: renderMaternal, infants: renderInfants, schedules: renderSchedules, reminders: renderReminders, barangay: renderBarangay, reports: renderReports, users: renderUsers, backup: renderBackup, contacts: renderContacts };
  renderers[page]();
}

function renderDashboard() {
  const current = getCurrentUser();
  if (current.role === "Mother / Parent") return renderPatientDashboard();
  const stats = getDashboardStats();
  setContent(`
    <section class="section">
      ${renderAnalyticsCards(stats.cards)}
      <div class="chart-grid">
        <div class="card card-pad chart-card">
          <div class="section-head"><div><h3>Maternal and Infant Overview</h3><p>Barangay comparison</p></div></div>
          <div id="overviewChart" class="chart-box"></div>
        </div>
        <div class="card card-pad chart-card">
          <div class="section-head"><div><h3>Monthly Check-up Trend</h3><p>Completed, missed, and upcoming</p></div></div>
          <div id="checkupTrendChart" class="chart-box"></div>
        </div>
      </div>
      <div class="chart-grid compact">
        <div class="card card-pad chart-card">
          <div class="section-head"><div><h3>Pregnancy Risk Level</h3><p>Risk distribution</p></div></div>
          <div id="riskDonutChart" class="chart-box donut-box"></div>
        </div>
        <div class="card card-pad chart-card">
          <div class="section-head"><div><h3>Immunization Status</h3><p>Infant record distribution</p></div></div>
          <div id="immunizationDonutChart" class="chart-box donut-box"></div>
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Barangay Performance</h3><p>Pregnancy, infant, missed visit, and report indicators</p></div><button class="secondary-btn" data-jump="barangay">Open barangays</button></div>
        <div class="barangay-grid">${barangays.map(performanceCard).join("")}</div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Recent Monitoring Tables</h3><p>Records needing quick review</p></div><button class="secondary-btn" data-jump="reports">Open reports</button></div>
        ${recordTable(scoped(state.checkupSchedules).slice(0, 6), ["Patient", "Type", "Barangay", "Date", "Status"], (s) => [s.patientName, s.type, s.barangay, fmtDate(s.date), badge(s.status)])}
      </div>
    </section>
  `);
  renderBarChart("overviewChart", stats.overview, { series: ["Mothers", "Infants"] });
  renderLineChart("checkupTrendChart", stats.trend, { series: ["Completed", "Missed", "Upcoming"] });
  renderDonutChart("riskDonutChart", stats.risk);
  renderDonutChart("immunizationDonutChart", stats.immunization);
  bindJumpButtons();
}

function renderPatientDashboard() {
  const current = getCurrentUser();
  const mother = state.maternalRecords.find((m) => m.id === current.motherId) || state.maternalRecords[0];
  const infantRows = state.infantRecords.filter((i) => i.parentName === mother.fullName);
  const scheduleRows = state.checkupSchedules.filter((s) => s.patientName.includes(mother.fullName.split(" ")[0]) || infantRows.some((i) => i.infantName === s.patientName));
  const reminderRows = state.reminders.filter((r) => r.recipientName === mother.fullName || infantRows.some((i) => r.recipientName === i.infantName));
  setContent(`
    <section class="section">
      <div class="patient-grid">
        <div class="card card-pad">
          <div class="section-head"><div><h3>Personal Maternal Profile</h3><p>${escapeHtml(mother.barangay)}</p></div>${badge(mother.pregnancyStatus)}</div>
          ${profileRows([["Name", mother.fullName], ["Address", mother.address], ["Age", mother.age], ["Contact Number", mother.contact], ["Expected Delivery Date", fmtDate(mother.edd)], ["Check-ups Completed", mother.checkupsCompleted]])}
          <div class="progress"><span style="width:${Math.min(100, mother.checkupsCompleted * 12)}%"></span></div>
        </div>
        <div class="card card-pad">
          <div class="section-head"><div><h3>Infant Profile</h3><p>Immunization record</p></div></div>
          ${infantRows.map((i) => `<div class="mini-item"><div><strong>${escapeHtml(i.infantName)}</strong><br><small>${fmtDate(i.birthdate)} • ${i.ageMonths} months</small></div>${badge(i.immunizationStatus)}</div>${profileRows([["Address", i.address], ["Contact Number", i.contact], ["Next Immunization Date", fmtDate(i.nextCheckup)]])}`).join("") || empty("No infant profile linked.")}
        </div>
      </div>
      <div class="patient-grid">
        <div class="card card-pad"><div class="section-head"><div><h3>Check-up Schedules</h3><p>Maternal and infant appointments</p></div></div><div class="list-stack">${scheduleRows.map(scheduleMini).join("") || empty("No schedules found.")}</div></div>
        <div class="card card-pad"><div class="section-head"><div><h3>Automated Reminders</h3><p>Upcoming, missed, and completed reminders</p></div></div><div class="list-stack">${reminderRows.map(reminderMini).join("") || empty("No reminders found.")}</div></div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Completed Summary Reports</h3><p>Submitted RHU summaries</p></div></div>
        ${reportsTable(state.monthlyReports.filter((r) => r.barangay === mother.barangay && r.status === "Submitted"))}
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Emergency Contact Information</h3><p>Nurse and clinic contacts</p></div></div>
        <div class="barangay-grid">${state.emergencyContacts.filter((c) => c.barangay === mother.barangay).map(contactCard).join("") || state.emergencyContacts.map(contactCard).join("")}</div>
      </div>
    </section>
  `);
}

function renderMaternal() {
  const canEdit = canManageRecords();
  const filters = getFilters();
  let rows = applySearch(scoped(state.maternalRecords), ["id", "fullName", "barangay", "pregnancyStatus", "riskLevel", "assignedNurse"]);
  if (filters.barangay) rows = rows.filter((r) => r.barangay === filters.barangay);
  if (filters.status) rows = rows.filter((r) => r.pregnancyStatus === filters.status);
  if (filters.risk) rows = rows.filter((r) => r.riskLevel === filters.risk);
  const analytics = getMaternalAnalytics(scoped(state.maternalRecords));
  setContent(`
    <section class="section">
      ${toolbar("Maternal Records", "Search and filter pregnancy records.", canEdit ? `<button class="primary-btn" data-open-mother>Add maternal record</button>` : "")}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid compact">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Mothers per Barangay</h3><p>Active maternal load</p></div></div><div id="maternalBarangayChart" class="chart-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Risk Distribution</h3><p>Low, moderate, and high risk</p></div></div><div id="maternalRiskChart" class="chart-box donut-box"></div></div>
      </div>
      ${filterBar([{ id: "barangayFilter", label: "Barangay", options: ["", ...barangays], value: filters.barangay }, { id: "statusFilter", label: "Pregnancy Status", options: ["", "Ongoing", "Delivered", "High Risk", "Completed"], value: filters.status }, { id: "riskFilter", label: "Risk Level", options: ["", "Low", "Moderate", "High"], value: filters.risk }])}
      <div class="card card-pad">
        ${recordTable(rows, ["Mother ID", "Full Name", "Barangay", "Age", "EDD", "Check-ups", "Status", "Risk", "Assigned Nurse", "Actions"], (m) => [
          m.id, m.fullName, m.barangay, m.age, fmtDate(m.edd), m.checkupsCompleted, badge(m.pregnancyStatus), badge(m.riskLevel), m.assignedNurse, rowActions("mother", m.id, canEdit)
        ])}
      </div>
    </section>
  `);
  renderBarChart("maternalBarangayChart", analytics.byBarangay, { series: ["Mothers"] });
  renderDonutChart("maternalRiskChart", analytics.risk);
  bindFilters();
  if (canEdit) document.querySelector("[data-open-mother]").addEventListener("click", () => openMotherForm());
  bindRowActions();
}

function renderInfants() {
  const canEdit = canManageRecords();
  const filters = getFilters();
  let rows = applySearch(scoped(state.infantRecords), ["id", "infantName", "parentName", "barangay", "immunizationStatus", "assignedNurse"]);
  if (filters.barangay) rows = rows.filter((r) => r.barangay === filters.barangay);
  if (filters.immunization) rows = rows.filter((r) => r.immunizationStatus === filters.immunization);
  const analytics = getInfantAnalytics(scoped(state.infantRecords));
  setContent(`
    <section class="section">
      ${toolbar("Infant Records", "Track immunization and check-up progress.", canEdit ? `<button class="primary-btn" data-open-infant>Add infant record</button>` : "")}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid compact">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Infants per Barangay</h3><p>Barangay infant load</p></div></div><div id="infantBarangayChart" class="chart-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Immunization Distribution</h3><p>Completion and follow-up status</p></div></div><div id="infantStatusChart" class="chart-box donut-box"></div></div>
      </div>
      ${filterBar([{ id: "barangayFilter", label: "Barangay", options: ["", ...barangays], value: filters.barangay }, { id: "immunizationFilter", label: "Immunization Status", options: ["", "Complete", "Incomplete", "Pending", "Missed"], value: filters.immunization }])}
      <div class="card card-pad">
        ${recordTable(rows, ["Infant ID", "Infant Name", "Parent", "Barangay", "Age", "Next Check-up", "Immunization", "Assigned Nurse", "Actions"], (i) => [
          i.id, i.infantName, i.parentName, i.barangay, `${i.ageMonths} mo.`, fmtDate(i.nextCheckup), badge(i.immunizationStatus), i.assignedNurse, rowActions("infant", i.id, canEdit)
        ])}
      </div>
    </section>
  `);
  renderBarChart("infantBarangayChart", analytics.byBarangay, { series: ["Infants"] });
  renderDonutChart("infantStatusChart", analytics.status);
  bindFilters();
  if (canEdit) document.querySelector("[data-open-infant]").addEventListener("click", () => openInfantForm());
  bindRowActions();
}

function renderSchedules() {
  const current = getCurrentUser();
  const canEdit = ["Administrator", "Nurse / Midwife"].includes(current.role);
  const filters = getFilters();
  let rows = current.role === "Mother / Parent" ? patientSchedules() : scoped(state.checkupSchedules);
  rows = applySearch(rows, ["patientName", "type", "barangay", "status", "assignedNurse"]);
  if (filters.barangay) rows = rows.filter((r) => r.barangay === filters.barangay);
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.date) rows = rows.filter((r) => r.date === filters.date);
  const analytics = getScheduleAnalytics(current.role === "Mother / Parent" ? patientSchedules() : scoped(state.checkupSchedules));
  setContent(`
    <section class="section">
      ${toolbar("Check-up Schedules", "Upcoming, completed, missed, and rescheduled appointments.", canEdit ? `<button class="primary-btn" data-open-schedule>Add schedule</button>` : "")}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid compact">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Check-ups by Status</h3><p>Operational appointment state</p></div></div><div id="scheduleStatusChart" class="chart-box donut-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Maternal vs Infant</h3><p>Check-up volume by patient type</p></div></div><div id="scheduleTypeChart" class="chart-box"></div></div>
      </div>
      ${filterBar([{ id: "barangayFilter", label: "Barangay", options: ["", ...barangays], value: filters.barangay }, { id: "statusFilter", label: "Status", options: ["", "Upcoming", "Completed", "Missed", "Rescheduled"], value: filters.status }], true)}
      <div class="card card-pad">${recordTable(rows, ["Patient", "Type", "Barangay", "Date", "Time", "Assigned Nurse", "Status", "Notes", "Actions"], (s) => [s.patientName, s.type, s.barangay, fmtDate(s.date), s.time, s.assignedNurse, badge(s.status), s.notes, scheduleActions(s, canEdit)])}</div>
    </section>
  `);
  renderDonutChart("scheduleStatusChart", analytics.status);
  renderBarChart("scheduleTypeChart", analytics.type, { series: ["Check-ups"] });
  bindFilters();
  if (canEdit) document.querySelector("[data-open-schedule]").addEventListener("click", () => openScheduleForm());
  bindRowActions();
}

function renderReminders() {
  const current = getCurrentUser();
  const canEdit = ["Administrator", "Nurse / Midwife"].includes(current.role);
  let rows = current.role === "Mother / Parent" ? patientReminders() : state.reminders;
  rows = applySearch(rows, ["recipientName", "contact", "messageType", "status", "message"]);
  const analytics = getReminderAnalytics(current.role === "Mother / Parent" ? patientReminders() : state.reminders);
  setContent(`
    <section class="section">
      ${toolbar("SMS / Notification Reminder UI", "Front-end simulation only. No messages are sent externally.", canEdit ? `<button class="primary-btn" data-generate-reminder>Generate Reminder</button>` : "")}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid compact">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Reminder Status</h3><p>Queue, sent, failed, and upcoming</p></div></div><div id="reminderStatusChart" class="chart-box donut-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Reminder Types</h3><p>Message category mix</p></div></div><div id="reminderTypeChart" class="chart-box"></div></div>
      </div>
      <div class="card card-pad">${recordTable(rows, ["Recipient", "Contact", "Message Type", "Schedule Date", "Status", "Actions"], (r) => [r.recipientName, r.contact, r.messageType, fmtDate(r.scheduleDate), badge(r.status), reminderActions(r, canEdit)])}</div>
    </section>
  `);
  renderDonutChart("reminderStatusChart", analytics.status);
  renderBarChart("reminderTypeChart", analytics.type, { series: ["Reminders"] });
  if (canEdit) document.querySelector("[data-generate-reminder]").addEventListener("click", generateReminder);
  bindRowActions();
}

function renderBarangay() {
  const stats = getBarangayStats();
  const selected = stats.find((b) => b.name === selectedBarangay) || stats[0];
  setContent(`
    <section class="section">
      ${toolbar("Barangay-Based Monitoring", "Monthly maternal and infant records per barangay clinic.", "")}
      <div class="chart-grid">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Barangay Comparison</h3><p>Mothers, infants, and missed check-ups</p></div></div><div id="barangayCompareChart" class="chart-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>High-Risk by Barangay</h3><p>Priority maternal cases</p></div></div><div id="barangayRiskChart" class="chart-box"></div></div>
      </div>
      <div class="barangay-grid">${barangays.map(barangayCard).join("")}</div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>${escapeHtml(selected.name)} Dashboard</h3><p>Selected barangay operational summary</p></div>${badge(selected.reports ? "Submitted" : "Pending")}</div>
        ${renderAnalyticsCards([
          { icon: "M", label: "Maternal", value: selected.mothers, trend: "Pregnancy records", tone: "primary" },
          { icon: "I", label: "Infant", value: selected.infants, trend: "Infant records", tone: "success" },
          { icon: "!", label: "Missed", value: selected.missed, trend: "Check-ups to follow up", tone: "error" },
          { icon: "R", label: "Reports", value: selected.reports, trend: "Submitted summaries", tone: "warning" }
        ])}
      </div>
      <div class="split-grid">
        <div class="card card-pad">
          <div class="section-head"><div><h3>${escapeHtml(selectedBarangay)} Mothers</h3><p>Maternal summary and active records</p></div></div>
          ${recordTable(state.maternalRecords.filter((m) => m.barangay === selectedBarangay), ["Name", "EDD", "Status", "Risk"], (m) => [m.fullName, fmtDate(m.edd), badge(m.pregnancyStatus), badge(m.riskLevel)])}
        </div>
        <div class="card card-pad">
          <div class="section-head"><div><h3>${escapeHtml(selectedBarangay)} Infants</h3><p>Infant summary and immunization status</p></div></div>
          ${recordTable(state.infantRecords.filter((i) => i.barangay === selectedBarangay), ["Infant", "Parent", "Next Check-up", "Status"], (i) => [i.infantName, i.parentName, fmtDate(i.nextCheckup), badge(i.immunizationStatus)])}
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Monthly Summaries</h3><p>Maternal and infant reports for selected barangay</p></div></div>
        ${reportsTable(state.monthlyReports.filter((r) => r.barangay === selectedBarangay))}
      </div>
    </section>
  `);
  renderBarChart("barangayCompareChart", stats.map((b) => ({ label: shortBarangay(b.name), Mothers: b.mothers, Infants: b.infants, Missed: b.missed })), { series: ["Mothers", "Infants", "Missed"] });
  renderBarChart("barangayRiskChart", stats.map((b) => ({ label: shortBarangay(b.name), "High Risk": b.highRisk })), { series: ["High Risk"] });
  document.querySelectorAll("[data-select-barangay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedBarangay = btn.dataset.selectBarangay;
      renderBarangay();
    });
  });
}

function renderReports() {
  const current = getCurrentUser();
  const canCreate = ["Administrator", "Nurse / Midwife"].includes(current.role);
  const filters = getFilters();
  let rows = current.role === "Mother / Parent" ? state.monthlyReports.filter((r) => r.status === "Submitted") : scoped(state.monthlyReports);
  rows = applySearch(rows, ["type", "month", "barangay", "preparedBy", "status"]);
  if (filters.barangay) rows = rows.filter((r) => r.barangay === filters.barangay);
  if (filters.month) rows = rows.filter((r) => r.month.toLowerCase().includes(filters.month.toLowerCase()));
  const analytics = getMonthlyReportAnalytics(scoped(state.monthlyReports));
  setContent(`
    <section class="section">
      ${toolbar("Monthly Summary Reports", "Maternal and infant report submissions.", canCreate ? `<button class="primary-btn" data-open-report>Create monthly report</button><button class="secondary-btn" onclick="window.print()">Print Report</button><button class="ghost-btn" data-export-mockup>Export Front-End Mockup</button>` : `<button class="secondary-btn" onclick="window.print()">Print Report</button>`)}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Submitted vs Pending</h3><p>Report completion rate</p></div></div><div id="reportStatusChart" class="chart-box donut-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Barangay Report Comparison</h3><p>Submitted summary count</p></div></div><div id="reportBarangayChart" class="chart-box"></div></div>
      </div>
      ${filterBar([{ id: "barangayFilter", label: "Barangay", options: ["", ...barangays], value: filters.barangay }], false, true)}
      <div class="card card-pad">${reportsTable(rows, true)}</div>
    </section>
  `);
  renderDonutChart("reportStatusChart", analytics.status);
  renderBarChart("reportBarangayChart", analytics.byBarangay, { series: ["Reports"] });
  bindFilters();
  if (canCreate) {
    document.querySelector("[data-open-report]").addEventListener("click", () => openReportForm());
    document.querySelector("[data-export-mockup]").addEventListener("click", downloadBackup);
  }
  bindRowActions();
}

function renderUsers() {
  let rows = applySearch(state.users, ["name", "email", "role", "barangay"]);
  const filters = getFilters();
  if (filters.role) rows = rows.filter((r) => r.role === filters.role);
  setContent(`
    <section class="section">
      ${toolbar("Users and Roles", "Front-end role-based account visibility.", `<button class="secondary-btn" data-seed-user>Add demo user</button>`)}
      ${filterBar([{ id: "roleFilter", label: "Role", options: ["", ...roles], value: filters.role }])}
      <div class="card card-pad">${recordTable(rows, ["Name", "Email", "Role", "Assignment", "Created"], (u) => [u.name, u.email, badge(u.role), u.barangay, fmtDate(u.createdAt)])}</div>
    </section>
  `);
  bindFilters();
  document.querySelector("[data-seed-user]").addEventListener("click", () => {
    state.users.push(user(makeId("U"), "New Demo Nurse", `nurse${state.users.length}@rhu.gov`, "Nurse / Midwife", "Barangay Mabini"));
    persist("users");
    renderUsers();
    toast("Demo user added.");
  });
}

function renderBackup() {
  const total = ["users", "maternalRecords", "infantRecords", "checkupSchedules", "reminders", "monthlyReports", "emergencyContacts"].reduce((sum, key) => sum + state[key].length, 0);
  const bytes = new Blob([JSON.stringify(getBackupPayload())]).size;
  setContent(`
    <section class="section">
      ${toolbar("Data Backup and Recovery", "Simulated localStorage backup tools.", "")}
      ${renderAnalyticsCards([
        { icon: "B", label: "Last Backup", value: state.backupMeta?.date ? fmtDate(state.backupMeta.date) : "None", trend: "Local browser only", tone: "primary" },
        { icon: "R", label: "Records Stored", value: total, trend: "Current local records", tone: "success" },
        { icon: "S", label: "Backup Size", value: `${Math.ceil(bytes / 1024)} KB`, trend: "Estimated JSON size", tone: "warning" },
        { icon: "OK", label: "Restore Status", value: "Ready", trend: "JSON restore enabled", tone: "primary" }
      ])}
      <div class="card card-pad">
        <div class="actions">
          <button class="primary-btn" data-create-backup>Create Backup</button>
          <button class="secondary-btn" data-download-backup>Download Backup JSON</button>
          <button class="ghost-btn" data-restore-backup>Restore Backup</button>
          <button class="danger-btn" data-clear-demo>Clear Local Demo Data</button>
          <button class="secondary-btn" data-reset-sample>Reset Sample Data</button>
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Backup History</h3><p>Mock local activity log</p></div></div>
        <div class="list-stack">
          <div class="mini-item"><div><strong>Manual local backup</strong><br><small>${state.backupMeta?.date ? fmtDate(state.backupMeta.date) : "No backup created yet"}</small></div>${badge(state.backupMeta ? "Ready" : "Pending")}</div>
          <div class="mini-item"><div><strong>Sample data checkpoint</strong><br><small>Seeded browser records</small></div>${badge("Complete")}</div>
        </div>
      </div>
    </section>
  `);
  document.querySelector("[data-create-backup]").addEventListener("click", createBackup);
  document.querySelector("[data-download-backup]").addEventListener("click", downloadBackup);
  document.querySelector("[data-restore-backup]").addEventListener("click", () => document.getElementById("restoreFile").click());
  document.querySelector("[data-clear-demo]").addEventListener("click", clearDemo);
  document.querySelector("[data-reset-sample]").addEventListener("click", resetSampleData);
}

function renderContacts() {
  const rows = applySearch(state.emergencyContacts, ["nurseName", "barangay", "contactNumber", "clinicLocation"]);
  setContent(`
    <section class="section">
      ${toolbar("Emergency Contacts", "Nurse, midwife, clinic, and hotline information.", "")}
      <div class="barangay-grid">${rows.map(contactCard).join("")}</div>
    </section>
  `);
}

function getDashboardStats() {
  const mothers = scoped(state.maternalRecords);
  const infants = scoped(state.infantRecords);
  const schedules = scoped(state.checkupSchedules);
  const reports = scoped(state.monthlyReports);
  return {
    cards: [
      { icon: "M", label: "Pregnant Mothers", value: mothers.length, trend: "+8 this month", tone: "primary" },
      { icon: "I", label: "Infants", value: infants.length, trend: "+5 registered", tone: "success" },
      { icon: "U", label: "Upcoming", value: schedules.filter((s) => s.status === "Upcoming").length, trend: "Next schedules", tone: "warning" },
      { icon: "!", label: "Missed", value: schedules.filter((s) => s.status === "Missed").length, trend: "Needs follow-up", tone: "error" },
      { icon: "H", label: "High Risk", value: mothers.filter((m) => m.riskLevel === "High" || m.pregnancyStatus === "High Risk").length, trend: "Priority alerts", tone: "error" },
      { icon: "S", label: "SMS Sent", value: state.reminders.filter((r) => r.status === "Sent").length, trend: "Simulated only", tone: "success" },
      { icon: "R", label: "Reports", value: reports.filter((r) => r.status === "Submitted").length, trend: "Submitted", tone: "primary" },
      { icon: "B", label: "Barangays", value: new Set([...mothers, ...infants].map((r) => r.barangay)).size, trend: "Monitored", tone: "primary" }
    ],
    overview: barangays.map((b) => ({ label: shortBarangay(b), Mothers: mothers.filter((m) => m.barangay === b).length, Infants: infants.filter((i) => i.barangay === b).length })),
    trend: monthLabels().map((label, index) => ({
      label,
      Completed: schedules.filter((s) => s.status === "Completed").length + index,
      Missed: Math.max(0, schedules.filter((s) => s.status === "Missed").length - (index % 2)),
      Upcoming: schedules.filter((s) => s.status === "Upcoming").length + (index % 3)
    })),
    risk: countBy(mothers, "riskLevel", ["Low", "Moderate", "High"]),
    immunization: countBy(infants, "immunizationStatus", ["Complete", "Incomplete", "Pending", "Missed"])
  };
}

function getMaternalAnalytics(rows) {
  return {
    cards: [
      { icon: "M", label: "Total Mothers", value: rows.length, trend: "Maternal records", tone: "primary" },
      { icon: "O", label: "Ongoing", value: rows.filter((r) => r.pregnancyStatus === "Ongoing").length, trend: "Active pregnancies", tone: "warning" },
      { icon: "D", label: "Delivered", value: rows.filter((r) => r.pregnancyStatus === "Delivered").length, trend: "Delivered cases", tone: "success" },
      { icon: "!", label: "High Risk", value: rows.filter((r) => r.riskLevel === "High" || r.pregnancyStatus === "High Risk").length, trend: "Needs review", tone: "error" }
    ],
    byBarangay: barangays.map((b) => ({ label: shortBarangay(b), Mothers: rows.filter((r) => r.barangay === b).length })),
    risk: countBy(rows, "riskLevel", ["Low", "Moderate", "High"])
  };
}

function getInfantAnalytics(rows) {
  return {
    cards: [
      { icon: "I", label: "Total Infants", value: rows.length, trend: "Infant records", tone: "primary" },
      { icon: "C", label: "Complete", value: rows.filter((r) => r.immunizationStatus === "Complete").length, trend: "Immunization done", tone: "success" },
      { icon: "P", label: "Incomplete", value: rows.filter((r) => r.immunizationStatus === "Incomplete").length, trend: "Needs follow-up", tone: "warning" },
      { icon: "!", label: "Missed", value: rows.filter((r) => r.immunizationStatus === "Missed").length, trend: "Missed immunization", tone: "error" }
    ],
    byBarangay: barangays.map((b) => ({ label: shortBarangay(b), Infants: rows.filter((r) => r.barangay === b).length })),
    status: countBy(rows, "immunizationStatus", ["Complete", "Incomplete", "Pending", "Missed"])
  };
}

function getScheduleAnalytics(rows) {
  return {
    cards: ["Upcoming", "Completed", "Missed", "Rescheduled"].map((status) => ({ icon: status[0], label: status, value: rows.filter((r) => r.status === status).length, trend: "Check-up status", tone: status === "Missed" ? "error" : status === "Completed" ? "success" : "warning" })),
    status: countBy(rows, "status", ["Upcoming", "Completed", "Missed", "Rescheduled"]),
    type: ["Maternal", "Infant"].map((type) => ({ label: type, "Check-ups": rows.filter((r) => r.type === type).length }))
  };
}

function getReminderAnalytics(rows) {
  return {
    cards: [
      { icon: "T", label: "Total", value: rows.length, trend: "Reminder records", tone: "primary" },
      { icon: "S", label: "Sent", value: rows.filter((r) => r.status === "Sent").length, trend: "Marked sent", tone: "success" },
      { icon: "Q", label: "Pending", value: rows.filter((r) => r.status === "Queue" || r.status === "Upcoming").length, trend: "Queue/upcoming", tone: "warning" },
      { icon: "!", label: "Failed", value: rows.filter((r) => r.status === "Failed").length, trend: "Needs resend", tone: "error" }
    ],
    status: countBy(rows, "status", ["Queue", "Sent", "Failed", "Upcoming"]),
    type: Object.entries(rows.reduce((acc, r) => ({ ...acc, [r.messageType]: (acc[r.messageType] || 0) + 1 }), {})).map(([label, value]) => ({ label: compactLabel(label), Reminders: value }))
  };
}

function getBarangayStats() {
  return barangays.map((name) => {
    const mothers = state.maternalRecords.filter((m) => m.barangay === name);
    const infants = state.infantRecords.filter((i) => i.barangay === name);
    const schedules = state.checkupSchedules.filter((s) => s.barangay === name);
    return {
      name,
      mothers: mothers.length,
      infants: infants.length,
      missed: schedules.filter((s) => s.status === "Missed").length,
      highRisk: mothers.filter((m) => m.riskLevel === "High" || m.pregnancyStatus === "High Risk").length,
      reports: state.monthlyReports.filter((r) => r.barangay === name && r.status === "Submitted").length
    };
  });
}

function getMonthlyReportAnalytics(rows) {
  const expected = barangays.length * 2;
  const submitted = rows.filter((r) => r.status === "Submitted").length;
  return {
    cards: [
      { icon: "%", label: "Completion", value: `${Math.min(100, Math.round((submitted / expected) * 100))}%`, trend: "Expected monthly reports", tone: "success" },
      { icon: "S", label: "Submitted", value: submitted, trend: "Completed summaries", tone: "primary" },
      { icon: "P", label: "Pending", value: Math.max(0, expected - submitted), trend: "Mock pending count", tone: "warning" },
      { icon: "B", label: "Barangays", value: new Set(rows.map((r) => r.barangay)).size, trend: "With reports", tone: "primary" }
    ],
    status: [{ label: "Submitted", value: submitted }, { label: "Pending", value: Math.max(0, expected - submitted) }],
    byBarangay: barangays.map((b) => ({ label: shortBarangay(b), Reports: rows.filter((r) => r.barangay === b).length }))
  };
}

function renderAnalyticsCards(cards) {
  return `<div class="analytics-grid">${cards.map((card) => `
    <div class="card metric-card ${card.tone || "primary"}">
      <span class="metric-icon" aria-hidden="true">${escapeHtml(card.icon)}</span>
      <div><strong>${escapeHtml(card.value)}</strong><p>${escapeHtml(card.label)}</p><small>${escapeHtml(card.trend || "")}</small></div>
    </div>
  `).join("")}</div>`;
}

function renderBarChart(containerId, data, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const series = options.series || Object.keys(data[0] || {}).filter((key) => key !== "label");
  const max = Math.max(1, ...data.flatMap((row) => series.map((name) => Number(row[name] || 0))));
  const width = 640;
  const height = 250;
  const pad = 34;
  const groupWidth = (width - pad * 2) / Math.max(1, data.length);
  const barWidth = Math.max(8, (groupWidth - 14) / Math.max(1, series.length));
  const colors = ["#1976d2", "#2e7d32", "#ed6c02", "#d32f2f"];
  const bars = data.map((row, rowIndex) => series.map((name, seriesIndex) => {
    const value = Number(row[name] || 0);
    const barHeight = ((height - pad * 2) * value) / max;
    const x = pad + rowIndex * groupWidth + 7 + seriesIndex * barWidth;
    const y = height - pad - barHeight;
    return `<rect x="${x}" y="${y}" width="${barWidth - 3}" height="${barHeight}" rx="5" fill="${colors[seriesIndex % colors.length]}"><title>${escapeHtml(row.label)} ${escapeHtml(name)}: ${value}</title></rect>`;
  }).join("")).join("");
  const labels = data.map((row, index) => `<text x="${pad + index * groupWidth + groupWidth / 2}" y="${height - 10}" text-anchor="middle" class="chart-label">${escapeHtml(row.label)}</text>`).join("");
  el.innerHTML = chartSvg(width, height, `${gridLines(width, height, pad)}${bars}${labels}${legend(series, colors, pad)}`);
}

function renderLineChart(containerId, data, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const series = options.series || Object.keys(data[0] || {}).filter((key) => key !== "label");
  const width = 640;
  const height = 250;
  const pad = 34;
  const max = Math.max(1, ...data.flatMap((row) => series.map((name) => Number(row[name] || 0))));
  const colors = ["#2e7d32", "#d32f2f", "#ed6c02"];
  const step = (width - pad * 2) / Math.max(1, data.length - 1);
  const lines = series.map((name, index) => {
    const points = data.map((row, i) => `${pad + i * step},${height - pad - ((height - pad * 2) * Number(row[name] || 0)) / max}`).join(" ");
    const dots = data.map((row, i) => {
      const x = pad + i * step;
      const y = height - pad - ((height - pad * 2) * Number(row[name] || 0)) / max;
      return `<circle cx="${x}" cy="${y}" r="4" fill="${colors[index]}"><title>${escapeHtml(row.label)} ${escapeHtml(name)}: ${row[name]}</title></circle>`;
    }).join("");
    return `<polyline fill="none" stroke="${colors[index]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}"></polyline>${dots}`;
  }).join("");
  const labels = data.map((row, index) => `<text x="${pad + index * step}" y="${height - 10}" text-anchor="middle" class="chart-label">${escapeHtml(row.label)}</text>`).join("");
  el.innerHTML = chartSvg(width, height, `${gridLines(width, height, pad)}${lines}${labels}${legend(series, colors, pad)}`);
}

function renderDonutChart(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const total = Math.max(1, data.reduce((sum, item) => sum + Number(item.value || 0), 0));
  const radius = 62;
  const circumference = Math.PI * 2 * radius;
  const colors = ["#2e7d32", "#ed6c02", "#d32f2f", "#1976d2"];
  let offset = 0;
  const rings = data.map((item, index) => {
    const length = (Number(item.value || 0) / total) * circumference;
    const ring = `<circle cx="110" cy="100" r="${radius}" fill="none" stroke="${colors[index % colors.length]}" stroke-width="24" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 110 100)"><title>${escapeHtml(item.label)}: ${item.value}</title></circle>`;
    offset += length;
    return ring;
  }).join("");
  const items = data.map((item, index) => `<span><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(item.label)} ${escapeHtml(item.value)}</span>`).join("");
  el.innerHTML = `<div class="donut-layout">${chartSvg(220, 200, `<circle cx="110" cy="100" r="${radius}" fill="none" stroke="#e8eef3" stroke-width="24"></circle>${rings}<text x="110" y="96" text-anchor="middle" class="donut-total">${total}</text><text x="110" y="116" text-anchor="middle" class="chart-label">Total</text>`)}<div class="chart-legend vertical">${items}</div></div>`;
}

function renderProgressBar(containerId, value, max, label) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  el.innerHTML = `<div class="progress-block"><div class="profile-row"><span>${escapeHtml(label)}</span><strong>${percent}%</strong></div><div class="progress"><span style="width:${percent}%"></span></div></div>`;
}

function renderRoleBasedDashboard() {
  renderDashboard();
}

function updateChartsOnDataChange() {
  renderPage(activePage);
}

function chartSvg(width, height, body) {
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Analytics chart">${body}</svg>`;
}

function gridLines(width, height, pad) {
  return [0, 1, 2, 3].map((i) => {
    const y = pad + ((height - pad * 2) / 3) * i;
    return `<line x1="${pad}" x2="${width - pad}" y1="${y}" y2="${y}" class="grid-line"></line>`;
  }).join("");
}

function legend(series, colors, x) {
  return series.map((name, index) => `<g transform="translate(${x + index * 116},18)"><circle r="5" fill="${colors[index % colors.length]}"></circle><text x="10" y="4" class="chart-label">${escapeHtml(name)}</text></g>`).join("");
}

function countBy(rows, key, labels) {
  return labels.map((label) => ({ label, value: rows.filter((row) => row[key] === label).length }));
}

function openMotherForm(id = "") {
  const record = state.maternalRecords.find((m) => m.id === id) || {};
  openModal(id ? "Edit Maternal Record" : "Add Maternal Record", `
    <form id="motherForm" class="form-grid">
      ${input("Mother ID", "id", record.id || makeId("M"), true)}
      <div class="two-col">${input("Full Name", "fullName", record.fullName)}${input("Age", "age", record.age, false, "number")}</div>
      ${input("Address", "address", record.address)}
      <div class="two-col">${select("Barangay", "barangay", barangays, record.barangay)}${input("Contact Number", "contact", record.contact)}</div>
      <div class="two-col">${input("Last Menstrual Period", "lmp", record.lmp, false, "date")}${input("Expected Delivery Date", "edd", record.edd, false, "date")}</div>
      <div class="two-col">${select("Pregnancy Status", "pregnancyStatus", ["Ongoing", "Delivered", "High Risk", "Completed"], record.pregnancyStatus)}${select("Risk Level", "riskLevel", ["Low", "Moderate", "High"], record.riskLevel)}</div>
      <div class="two-col">${input("Check-ups Completed", "checkupsCompleted", record.checkupsCompleted ?? 0, false, "number")}${input("Assigned Nurse / Midwife", "assignedNurse", record.assignedNurse)}</div>
      ${textarea("Notes", "notes", record.notes)}
      <button class="primary-btn" type="submit">Save maternal record</button>
    </form>
  `);
  document.getElementById("motherForm").addEventListener("submit", (event) => {
    event.preventDefault();
    upsert("maternalRecords", formData(event.target), "id");
    closeModal();
    renderMaternal();
    toast("Maternal record saved.");
  });
}

function openInfantForm(id = "") {
  const record = state.infantRecords.find((i) => i.id === id) || {};
  openModal(id ? "Edit Infant Record" : "Add Infant Record", `
    <form id="infantForm" class="form-grid">
      ${input("Infant ID", "id", record.id || makeId("I"), true)}
      <div class="two-col">${input("Infant Name", "infantName", record.infantName)}${input("Parent / Mother Name", "parentName", record.parentName)}</div>
      ${input("Address", "address", record.address)}
      <div class="two-col">${select("Barangay", "barangay", barangays, record.barangay)}${input("Contact Number", "contact", record.contact)}</div>
      <div class="two-col">${input("Birthdate", "birthdate", record.birthdate, false, "date")}${input("Age in months", "ageMonths", record.ageMonths ?? 0, false, "number")}</div>
      <div class="two-col">${select("Immunization Status", "immunizationStatus", ["Complete", "Incomplete", "Pending", "Missed"], record.immunizationStatus)}${input("Assigned Nurse / Midwife", "assignedNurse", record.assignedNurse)}</div>
      <div class="two-col">${input("Last Check-up Date", "lastCheckup", record.lastCheckup, false, "date")}${input("Next Check-up Date", "nextCheckup", record.nextCheckup, false, "date")}</div>
      ${textarea("Notes", "notes", record.notes)}
      <button class="primary-btn" type="submit">Save infant record</button>
    </form>
  `);
  document.getElementById("infantForm").addEventListener("submit", (event) => {
    event.preventDefault();
    upsert("infantRecords", formData(event.target), "id");
    closeModal();
    renderInfants();
    toast("Infant record saved.");
  });
}

function openScheduleForm(id = "") {
  const record = state.checkupSchedules.find((s) => s.id === id) || {};
  openModal(id ? "Edit Check-up Schedule" : "Add Check-up Schedule", `
    <form id="scheduleForm" class="form-grid">
      ${input("Schedule ID", "id", record.id || makeId("S"), true)}
      <div class="two-col">${input("Patient Name", "patientName", record.patientName)}${select("Type", "type", ["Maternal", "Infant"], record.type)}</div>
      <div class="two-col">${select("Barangay", "barangay", barangays, record.barangay)}${input("Assigned Nurse", "assignedNurse", record.assignedNurse)}</div>
      <div class="two-col">${input("Date", "date", record.date, false, "date")}${input("Time", "time", record.time, false, "time")}</div>
      ${select("Status", "status", ["Upcoming", "Completed", "Missed", "Rescheduled"], record.status)}
      ${textarea("Notes", "notes", record.notes)}
      <button class="primary-btn" type="submit">Save schedule</button>
    </form>
  `);
  document.getElementById("scheduleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    upsert("checkupSchedules", formData(event.target), "id");
    closeModal();
    renderSchedules();
    toast("Schedule saved.");
  });
}

function openReportForm() {
  const current = getCurrentUser();
  openModal("Create Monthly Report", `
    <form id="reportForm" class="form-grid">
      ${input("Report ID", "id", makeId("REP"), true)}
      <div class="two-col">${select("Report Type", "type", ["Maternal", "Infant"])}${input("Month", "month", "June 2026")}</div>
      <div class="two-col">${select("Barangay", "barangay", barangays, current.barangay.includes("Barangay") ? current.barangay : barangays[0])}${input("Prepared By", "preparedBy", current.name)}</div>
      <div class="two-col">${input("Total Records", "total", 0, false, "number")}${input("New Pregnancies / Newborns", "newCount", 0, false, "number")}</div>
      <div class="two-col">${input("Delivered / Immunization Complete", "completeOrDelivered", 0, false, "number")}${input("High-Risk / Incomplete", "incompleteOrHighRisk", 0, false, "number")}</div>
      <div class="two-col">${input("Completed Check-ups / Missed Immunizations", "missedOrCompleted", 0, false, "number")}${input("Missed Check-ups / Completed Check-ups", "completedOrMissed", 0, false, "number")}</div>
      ${input("Date Submitted", "dateSubmitted", today(), false, "date")}
      <input type="hidden" name="status" value="Submitted">
      <button class="primary-btn" type="submit">Submit Report</button>
    </form>
  `);
  document.getElementById("reportForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.monthlyReports.unshift(formData(event.target));
    persist("monthlyReports");
    closeModal();
    renderReports();
    toast("Monthly report submitted.");
  });
}

function generateReminder() {
  const upcoming = state.checkupSchedules.find((s) => s.status === "Upcoming") || state.checkupSchedules[0];
  const msg = `Magandang araw, ${upcoming.patientName}. Paalala po sa inyong check-up sa ${fmtDate(upcoming.date)} sa barangay health center. Maraming salamat.`;
  state.reminders.unshift(reminder(makeId("R"), upcoming.patientName, "09XXXXXXXXX", `${upcoming.type} Check-up Reminder`, msg, upcoming.date, "Queue"));
  persist("reminders");
  renderReminders();
  toast("Reminder generated.");
}

function bindRowActions() {
  document.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
    const [kind, id] = btn.dataset.edit.split(":");
    ({ mother: openMotherForm, infant: openInfantForm, schedule: openScheduleForm }[kind])(id);
  }));
  document.querySelectorAll("[data-view]").forEach((btn) => btn.addEventListener("click", () => {
    const [kind, id] = btn.dataset.view.split(":");
    openRecordView(kind, id);
  }));
  document.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => {
    const [key, id] = btn.dataset.delete.split(":");
    if (!confirm("Delete this record from the local demo data?")) return;
    state[key] = state[key].filter((row) => row.id !== id);
    persist(key);
    renderPage(activePage);
    toast("Record deleted.");
  }));
  document.querySelectorAll("[data-status]").forEach((btn) => btn.addEventListener("click", () => {
    const [id, status] = btn.dataset.status.split(":");
    const row = state.checkupSchedules.find((s) => s.id === id);
    row.status = status;
    persist("checkupSchedules");
    renderSchedules();
    toast(`Schedule marked ${status.toLowerCase()}.`);
  }));
  document.querySelectorAll("[data-reminder]").forEach((btn) => btn.addEventListener("click", () => {
    const [id, action] = btn.dataset.reminder.split(":");
    const row = state.reminders.find((r) => r.id === id);
    if (action === "view") return openModal("Reminder Message", `<p>${escapeHtml(row.message)}</p>`);
    row.status = action === "sent" ? "Sent" : "Queue";
    persist("reminders");
    renderReminders();
    toast(action === "sent" ? "Reminder marked as sent." : "Reminder queued for resend.");
  }));
  document.querySelectorAll("[data-view-report]").forEach((btn) => btn.addEventListener("click", () => {
    const row = state.monthlyReports.find((r) => r.id === btn.dataset.viewReport);
    openModal("Monthly Report", `<div class="detail-grid">${Object.entries(row).map(([k, v]) => `<div class="profile-row"><span>${labelize(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join("")}</div>`);
  }));
}

function rowActions(kind, id, canEdit) {
  const current = getCurrentUser();
  if (!canEdit) return `<button class="ghost-btn" data-view="${kind}:${id}">View</button>`;
  const deleteKey = kind === "mother" ? "maternalRecords" : "infantRecords";
  return `<div class="actions"><button class="secondary-btn" data-edit="${kind}:${id}">Edit</button>${current.role === "Administrator" ? `<button class="danger-btn" data-delete="${deleteKey}:${id}">Delete</button>` : ""}</div>`;
}

function scheduleActions(row, canEdit) {
  if (!canEdit) return `<button class="ghost-btn" data-view="schedule:${row.id}">View</button>`;
  return `<div class="actions"><button class="secondary-btn" data-edit="schedule:${row.id}">Edit</button><button class="ghost-btn" data-status="${row.id}:Completed">Complete</button><button class="ghost-btn" data-status="${row.id}:Rescheduled">Reschedule</button></div>`;
}

function reminderActions(row, canEdit) {
  const view = `<button class="ghost-btn" data-reminder="${row.id}:view">View Message</button>`;
  if (!canEdit) return view;
  return `<div class="actions">${view}<button class="secondary-btn" data-reminder="${row.id}:sent">Mark as Sent</button><button class="ghost-btn" data-reminder="${row.id}:resend">Resend</button></div>`;
}

function reportsTable(rows, withActions = false) {
  return recordTable(rows, ["Type", "Month", "Barangay", "Total", "Prepared By", "Date Submitted", "Status", ...(withActions ? ["Actions"] : [])], (r) => [
    r.type, r.month, r.barangay, r.total, r.preparedBy, fmtDate(r.dateSubmitted), badge(r.status), ...(withActions ? [`<button class="secondary-btn" data-view-report="${r.id}">View Report</button>`] : [])
  ]);
}

function openRecordView(kind, id) {
  const sources = {
    mother: ["Maternal Record", state.maternalRecords],
    infant: ["Infant Record", state.infantRecords],
    schedule: ["Check-up Schedule", state.checkupSchedules]
  };
  const [title, rows] = sources[kind];
  const row = rows.find((item) => item.id === id);
  if (!row) return toast("Record not found.", true);
  openModal(title, `<div class="detail-grid">${Object.entries(row).map(([key, value]) => `<div class="profile-row"><span>${labelize(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`);
}

function recordTable(rows, headers, mapRow) {
  if (!rows.length) return empty("No records match the current view.");
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${mapRow(row).map((cell) => `<td>${cell ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function toolbar(title, subtitle, actions) {
  return `<div class="card card-pad section-head"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(subtitle)}</p></div><div class="actions">${actions}</div></div>`;
}

function filterBar(items, includeDate = false, includeMonth = false) {
  const controls = items.map((item) => `<label>${item.label}<select id="${item.id}">${item.options.map((opt) => `<option value="${escapeHtml(opt)}"${opt === item.value ? " selected" : ""}>${escapeHtml(opt || "All")}</option>`).join("")}</select></label>`);
  if (includeDate) controls.push(`<label>Date<input id="dateFilter" type="date" value="${escapeHtml(getFilters().date)}"></label>`);
  if (includeMonth) controls.push(`<label>Report Month<input id="monthFilter" type="text" placeholder="June 2026" value="${escapeHtml(getFilters().month)}"></label>`);
  return `<div class="card card-pad filter-row">${controls.join("")}</div>`;
}

function bindFilters() {
  ["barangayFilter", "statusFilter", "riskFilter", "immunizationFilter", "roleFilter", "dateFilter", "monthFilter"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => renderPage(activePage));
  });
}

function getFilters() {
  return {
    barangay: document.getElementById("barangayFilter")?.value || "",
    status: document.getElementById("statusFilter")?.value || "",
    risk: document.getElementById("riskFilter")?.value || "",
    immunization: document.getElementById("immunizationFilter")?.value || "",
    role: document.getElementById("roleFilter")?.value || "",
    date: document.getElementById("dateFilter")?.value || "",
    month: document.getElementById("monthFilter")?.value || ""
  };
}

function statGrid(stats, bare = false) {
  const body = stats.map(([label, value, helper]) => `<div class="card stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(helper)}</small></div>`).join("");
  return bare ? body : `<div class="stat-grid">${body}</div>`;
}

function barangayCard(name) {
  const mothers = state.maternalRecords.filter((m) => m.barangay === name);
  const infants = state.infantRecords.filter((i) => i.barangay === name);
  const schedules = state.checkupSchedules.filter((s) => s.barangay === name);
  return `<button class="card barangay-card ${name === selectedBarangay ? "active" : ""}" data-select-barangay="${escapeHtml(name)}">
    <h4>${escapeHtml(name)}</h4>
    <div class="metric-list">
      <div><span>Pregnant Mothers</span><strong>${mothers.length}</strong></div>
      <div><span>Infants</span><strong>${infants.length}</strong></div>
      <div><span>Upcoming Check-ups</span><strong>${schedules.filter((s) => s.status === "Upcoming").length}</strong></div>
      <div><span>Missed Check-ups</span><strong>${schedules.filter((s) => s.status === "Missed").length}</strong></div>
      <div><span>High-Risk Pregnancies</span><strong>${mothers.filter((m) => m.riskLevel === "High").length}</strong></div>
      <div><span>Submitted Reports</span><strong>${state.monthlyReports.filter((r) => r.barangay === name).length}</strong></div>
      <div><span>Assigned Nurse</span><strong>${escapeHtml((state.emergencyContacts.find((c) => c.barangay === name) || {}).nurseName || "RHU Staff")}</strong></div>
    </div>
  </button>`;
}

function barangayMini(name) {
  const missed = state.checkupSchedules.filter((s) => s.barangay === name && s.status === "Missed").length;
  return `<div class="mini-item"><div><strong>${escapeHtml(name)}</strong><br><small>${state.maternalRecords.filter((m) => m.barangay === name).length} mothers • ${state.infantRecords.filter((i) => i.barangay === name).length} infants</small></div>${badge(missed ? `${missed} missed` : "On track")}</div>`;
}

function performanceCard(name) {
  const stat = getBarangayStats().find((item) => item.name === name);
  return `<div class="card barangay-card">
    <div class="section-head"><div><h4>${escapeHtml(name)}</h4><p>${stat.reports ? "Report submitted" : "Report pending"}</p></div>${badge(stat.reports ? "Submitted" : "Pending")}</div>
    <div class="metric-list">
      <div><span>Pregnant</span><strong>${stat.mothers}</strong></div>
      <div><span>Infants</span><strong>${stat.infants}</strong></div>
      <div><span>Missed</span><strong>${stat.missed}</strong></div>
      <div><span>High Risk</span><strong>${stat.highRisk}</strong></div>
    </div>
  </div>`;
}

function scheduleMini(s) {
  return `<div class="mini-item"><div><strong>${escapeHtml(s.patientName)}</strong><br><small>${escapeHtml(s.type)} • ${fmtDate(s.date)} ${escapeHtml(s.time)}</small></div>${badge(s.status)}</div>`;
}

function reminderMini(r) {
  return `<div class="mini-item"><div><strong>${escapeHtml(r.messageType)}</strong><br><small>${fmtDate(r.scheduleDate)}</small></div>${badge(r.status)}</div>`;
}

function contactCard(c) {
  return `<div class="card card-pad"><h3>${escapeHtml(c.nurseName)}</h3>${profileRows([["Barangay", c.barangay], ["Contact Number", c.contactNumber], ["Clinic Location", c.clinicLocation], ["Emergency Hotline", c.hotline]])}</div>`;
}

function profileRows(rows) {
  return `<div class="list-stack">${rows.map(([label, value]) => `<div class="profile-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`;
}

function input(label, name, value = "", readonly = false, type = "text") {
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${readonly ? "readonly" : "required"}></label>`;
}

function select(label, name, options, value = "") {
  return `<label>${label}<select name="${name}" required>${options.map((opt) => `<option value="${escapeHtml(opt)}"${opt === value ? " selected" : ""}>${escapeHtml(opt)}</option>`).join("")}</select></label>`;
}

function textarea(label, name, value = "") {
  return `<label>${label}<textarea name="${name}">${escapeHtml(value)}</textarea></label>`;
}

function openModal(title, body) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = body;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function formData(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  ["age", "checkupsCompleted", "ageMonths", "total", "newCount", "completeOrDelivered", "incompleteOrHighRisk", "missedOrCompleted", "completedOrMissed"].forEach((key) => {
    if (key in data) data[key] = Number(data[key]);
  });
  return data;
}

function upsert(key, row, idKey) {
  const index = state[key].findIndex((item) => item[idKey] === row[idKey]);
  if (index >= 0) state[key][index] = row;
  else state[key].unshift(row);
  persist(key);
}

function canManageRecords() {
  return ["Administrator", "Nurse / Midwife"].includes(getCurrentUser().role);
}

function scoped(rows) {
  const current = getCurrentUser();
  if (["Administrator", "MHO", "Doctor"].includes(current.role)) return rows;
  if (current.role === "Nurse / Midwife") return rows.filter((r) => !r.barangay || r.barangay === current.barangay);
  return rows;
}

function patientSchedules() {
  const current = getCurrentUser();
  const mother = state.maternalRecords.find((m) => m.id === current.motherId) || state.maternalRecords[0];
  const infants = state.infantRecords.filter((i) => i.parentName === mother.fullName).map((i) => i.infantName);
  return state.checkupSchedules.filter((s) => s.patientName === mother.fullName || infants.includes(s.patientName));
}

function patientReminders() {
  const names = patientSchedules().map((s) => s.patientName);
  return state.reminders.filter((r) => names.includes(r.recipientName));
}

function applySearch(rows, keys) {
  const query = document.getElementById("globalSearch")?.value.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) => keys.some((key) => String(row[key] || "").toLowerCase().includes(query)));
}

function createBackup() {
  toast("Creating backup...");
  setTimeout(() => {
    const total = ["users", "maternalRecords", "infantRecords", "checkupSchedules", "reminders", "monthlyReports", "emergencyContacts"].reduce((sum, key) => sum + state[key].length, 0);
    state.backupMeta = { date: new Date().toISOString(), total };
    persist("backupMeta");
    renderBackup();
    toast("Backup created in localStorage.");
  }, 500);
}

function getBackupPayload() {
  return STORE_KEYS.reduce((payload, key) => {
    payload[key] = read(key, key === "backupMeta" ? null : []);
    return payload;
  }, {});
}

function downloadBackup() {
  const blob = new Blob([JSON.stringify(getBackupPayload(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rhu-health-monitor-backup-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Backup JSON prepared.");
}

function restoreBackupFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      STORE_KEYS.forEach((key) => {
        if (key in data) save(key, data[key]);
      });
      loadState();
      const restoredUser = getCurrentUser() || state.users[0];
      save("currentUser", restoredUser);
      showApp(restoredUser);
      toast("Backup restored.");
    } catch {
      toast("Could not restore that JSON file.", true);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function clearDemo() {
  if (!confirm("Clear all local demo data and return to login?")) return;
  STORE_KEYS.forEach((key) => localStorage.removeItem(key));
  state = {};
  toast("Local demo data cleared.");
  setTimeout(() => location.reload(), 500);
}

function resetSampleData() {
  if (!confirm("Reset all local data to sample records?")) return;
  const sample = sampleData();
  Object.entries(sample).forEach(([key, value]) => save(key, value));
  loadState();
  showAuth();
  toast("Sample data restored. Sign in again.");
}

function logout() {
  save("currentUser", null);
  showAuth();
  toast("Signed out.");
}

function bindJumpButtons() {
  document.querySelectorAll("[data-jump]").forEach((btn) => btn.addEventListener("click", () => {
    activePage = btn.dataset.jump;
    renderPage(activePage);
    renderNav();
  }));
}

function badge(value) {
  const className = String(value).toLowerCase().replace(/\s+/g, "-").replace(/\//g, "");
  return `<span class="badge ${className}">${escapeHtml(value)}</span>`;
}

function empty(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function setContent(html) {
  document.getElementById("content").innerHTML = html;
}

function toast(message, error = false) {
  const el = document.createElement("div");
  el.className = `toast${error ? " error" : ""}`;
  el.textContent = message;
  document.getElementById("toastHost").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function fmtDate(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name) {
  return String(name).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function makeId(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function monthLabels() {
  return ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
}

function shortBarangay(value) {
  return String(value).replace("Barangay ", "").replace("Sta. ", "Sta ");
}

function compactLabel(value) {
  return String(value).replace(" Reminder", "").replace("Missed Check-up Follow-up", "Missed Follow-up").replace("Infant Immunization", "Infant Imm.");
}

function labelize(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
