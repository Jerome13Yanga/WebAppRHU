/**
 * Main Application Orchestrator & Router (ES Module)
 */
import { STORE_KEYS, pages, barangays, TABLES } from './config.js';
import { db, isOnlineMode, loadCollection, saveCollection, cleanRemoteRow } from './db.js';
import { initSyncEngine, queueOfflineAction, flushPendingSyncQueue } from './sync.js';
import { getCurrentUser, setCurrentUser, getOrCreateCurrentProfile, createManagedAuthAccount } from './auth.js';
import { toast, escapeHtml } from './utils/sanitize.js';
import { exportMcCcReportToExcel } from './utils/excelExport.js';
import { renderRolePill, openModal, closeModal, refreshLucideIcons } from './ui/components.js';
import { renderDashboardView } from './ui/dashboard.js';
import { renderMaternalView } from './ui/maternal.js';
import { renderInfantsView } from './ui/infants.js';
import { renderSchedulesView } from './ui/schedules.js';
import { renderReportsView } from './ui/reports.js';
import { renderUsersView } from './ui/users.js';
import { renderBackupView, renderContactsView } from './ui/backup.js';

let state = {
  users: [],
  currentUser: null,
  maternalRecords: [],
  infantRecords: [],
  checkupSchedules: [],
  reminders: [],
  monthlyReports: [],
  emergencyContacts: [],
  backupMeta: null
};

let activePage = "dashboard";
let selectedBarangay = barangays[0];

function visibleBarangays() {
  const current = getCurrentUser();
  if (current?.role === "Nurse / Midwife" && barangays.includes(current.barangay)) return [current.barangay];
  return barangays;
}

document.addEventListener("DOMContentLoaded", init);

async function init() {
  initSyncEngine();
  hydrateAuthOptions();
  bindAuthEvents();
  bindShellEvents();

  if (isOnlineMode()) {
    const { data, error } = await db.auth.getSession();
    if (error) toast(error.message, true);
    if (data?.session?.user) {
      await loadState();
      const current = await getOrCreateCurrentProfile(data.session.user);
      setCurrentUser(current);
      showApp(current);
      toast("Connected to Supabase.");
      flushPendingSyncQueue();
    } else {
      showAuth();
    }
    return;
  }

  await loadState();
  const current = getCurrentUser();
  current ? showApp(current) : showAuth();
}

async function loadState() {
  for (const key of STORE_KEYS) {
    if (key === "currentUser" || key === "backupMeta") continue;
    state[key] = await loadCollection(key, []);
  }

  if (isOnlineMode()) {
    await loadRemoteState();
  }
}

async function loadRemoteState() {
  for (const [key, table] of Object.entries(TABLES)) {
    const { data, error } = await db.from(table).select("*");
    if (!error && data) {
      state[key] = data;
      await saveCollection(key, data);
    }
  }
}

async function persistRecord(key, row) {
  const arr = state[key] || [];
  const idx = arr.findIndex(item => item.id === row.id);
  if (idx >= 0) arr[idx] = row;
  else arr.push(row);

  await saveCollection(key, arr);

  if (isOnlineMode() && TABLES[key]) {
    const { error } = await db.from(TABLES[key]).upsert(cleanRemoteRow(key, row), { onConflict: "id" });
    if (error) {
      console.error(`Supabase save error for ${key}:`, error);
      await queueOfflineAction(key, 'UPSERT', row);
    }
  } else {
    await queueOfflineAction(key, 'UPSERT', row);
  }
}

async function deleteRecord(key, id) {
  state[key] = (state[key] || []).filter(item => item.id !== id);
  await saveCollection(key, state[key]);

  if (isOnlineMode() && TABLES[key]) {
    const { error } = await db.from(TABLES[key]).delete().eq('id', id);
    if (error) {
      console.error(`Supabase delete error for ${key}:`, error);
      await queueOfflineAction(key, 'DELETE', { id });
    }
  } else {
    await queueOfflineAction(key, 'DELETE', { id });
  }
}

function showAuth() {
  document.getElementById("authScreen")?.classList.remove("hidden");
  document.getElementById("appShell")?.classList.add("hidden");
}

function showApp(userData) {
  document.getElementById("authScreen")?.classList.add("hidden");
  document.getElementById("appShell")?.classList.remove("hidden");

  const initials = (userData.name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const initialsEl = document.getElementById("userInitials");
  if (initialsEl) initialsEl.textContent = initials;

  const nameEl = document.getElementById("currentUserName");
  if (nameEl) nameEl.textContent = userData.name || userData.email;

  const metaEl = document.getElementById("currentUserMeta");
  if (metaEl) metaEl.textContent = `${userData.role} • ${userData.barangay}`;

  const rolePillEl = document.getElementById("rolePill");
  if (rolePillEl) rolePillEl.innerHTML = renderRolePill(userData.role);

  renderNav();
  renderPage(activePage);
}

function renderNav() {
  const current = getCurrentUser();
  const nav = document.getElementById("mainNav");
  if (!nav || !current) return;

  const allowed = pages.filter(p => p.roles.includes(current.role));
  nav.innerHTML = allowed.map(p => `
    <button class="nav-item ${p.id === activePage ? 'active' : ''} flex items-center gap-2.5 px-3 py-2 rounded-lg" data-page="${p.id}">
      <i data-lucide="${p.icon}" class="w-4 h-4 shrink-0"></i>
      <span>${p.label}</span>
    </button>
  `).join('');

  nav.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const pageId = btn.getAttribute("data-page");
      if (pageId === "logout") {
        handleLogout();
        return;
      }
      activePage = pageId;
      renderNav();
      renderPage(activePage);
    });
  });
  refreshLucideIcons();
}

function renderPage(pageId) {
  const titleEl = document.getElementById("pageTitle");
  const subEl = document.getElementById("pageSubtitle");
  const contentEl = document.getElementById("content");
  const bSelect = document.getElementById("topbarBarangaySelect");
  if (!contentEl) return;

  const current = getCurrentUser();
  const vis = visibleBarangays();
  const options = current?.role === "Nurse / Midwife" ? vis : ["All Barangays", ...barangays];

  if (bSelect) {
    bSelect.innerHTML = options.map(b => `<option value="${escapeHtml(b)}" ${b === selectedBarangay ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('');
  }

  if (!options.includes(selectedBarangay)) selectedBarangay = options[0] || barangays[0];

  const pg = pages.find(p => p.id === pageId);
  if (titleEl) titleEl.textContent = pg ? pg.label : "Dashboard";
  if (subEl) subEl.textContent = "Barangay:";

  const searchInput = document.getElementById("globalSearch");
  const searchTerm = searchInput ? searchInput.value.trim() : "";

  switch (pageId) {
    case "dashboard":
      contentEl.innerHTML = renderDashboardView(state, current, selectedBarangay, vis, searchTerm);
      break;
    case "maternal":
      contentEl.innerHTML = renderMaternalView(state, selectedBarangay);
      bindMaternalEvents();
      break;
    case "infants":
      contentEl.innerHTML = renderInfantsView(state, selectedBarangay);
      bindInfantsEvents();
      break;
    case "schedules":
      contentEl.innerHTML = renderSchedulesView(state, selectedBarangay, current);
      bindSchedulesEvents();
      break;
    case "reports":
      contentEl.innerHTML = renderReportsView(state, selectedBarangay);
      bindReportsEvents();
      break;
    case "users":
      contentEl.innerHTML = renderUsersView(state);
      bindUsersEvents();
      break;
    case "backup":
      contentEl.innerHTML = renderBackupView(state);
      bindBackupEvents();
      break;
    case "contacts":
      contentEl.innerHTML = renderContactsView(state);
      break;
    default:
      contentEl.innerHTML = renderDashboardView(state, current, selectedBarangay, vis, searchTerm);
  }
  refreshLucideIcons();
}

function hydrateAuthOptions() {
  const sel = document.getElementById("regBarangay");
  if (sel) {
    sel.innerHTML = barangays.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
  }
}

function bindAuthEvents() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      if (isOnlineMode()) {
        const { data, error } = await db.auth.signInWithPassword({ email, password });
        if (error) {
          toast(error.message, true);
          return;
        }
        const profile = await getOrCreateCurrentProfile(data.user);
        setCurrentUser(profile);
        showApp(profile);
        toast("Signed in successfully.");
      } else {
        let user = state.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          user = { id: `usr_${Date.now()}`, name: email.split('@')[0], email, role: 'Mother / Parent', barangay: barangays[0] };
        }
        setCurrentUser(user);
        showApp(user);
        toast("Signed in (Offline Mode).");
      }
    });
  }

  const showRegBtn = document.getElementById("showParentRegistration");
  if (showRegBtn) {
    showRegBtn.addEventListener("click", () => {
      document.getElementById("loginForm")?.classList.add("hidden");
      document.getElementById("registerForm")?.classList.remove("hidden");
    });
  }

  const backLoginBtn = document.getElementById("backToLogin");
  if (backLoginBtn) {
    backLoginBtn.addEventListener("click", () => {
      document.getElementById("registerForm")?.classList.add("hidden");
      document.getElementById("loginForm")?.classList.remove("hidden");
    });
  }

  const regForm = document.getElementById("registerForm");
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;
      const confirm = document.getElementById("regConfirm").value;
      const barangay = document.getElementById("regBarangay").value;

      if (password !== confirm) {
        toast("Passwords do not match.", true);
        return;
      }

      if (isOnlineMode()) {
        const { data, error } = await db.auth.signUp({
          email,
          password,
          options: { data: { name, role: "Mother / Parent", barangay } }
        });
        if (error) {
          toast(error.message, true);
          return;
        }
        if (data?.user) {
          const profile = await getOrCreateCurrentProfile(data.user, { name, role: "Mother / Parent", barangay });
          setCurrentUser(profile);
          showApp(profile);
          toast("Registration complete!");
        }
      } else {
        const profile = { id: `usr_${Date.now()}`, name, email, role: 'Mother / Parent', barangay };
        await persistRecord('users', profile);
        setCurrentUser(profile);
        showApp(profile);
        toast("Registration complete (Offline Mode)!");
      }
    });
  }
}

function bindShellEvents() {
  const modalClose = document.getElementById("modalClose");
  if (modalClose) modalClose.addEventListener("click", closeModal);

  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      document.getElementById("sidebar")?.classList.toggle("open");
    });
  }

  const bSelect = document.getElementById("topbarBarangaySelect");
  if (bSelect) {
    bSelect.addEventListener("change", (e) => {
      selectedBarangay = e.target.value;
      renderPage(activePage);
    });
  }

  const globalSearch = document.getElementById("globalSearch");
  if (globalSearch) {
    globalSearch.addEventListener("input", () => {
      renderPage(activePage);
    });
  }
}

function handleLogout() {
  if (isOnlineMode()) db.auth.signOut();
  setCurrentUser(null);
  showAuth();
  toast("Logged out.");
}

// Sub-module Event Handlers
function bindMaternalEvents() {
  document.getElementById("addMaternalBtn")?.addEventListener("click", () => {
    openModal("Add Maternal Record", `
      <form id="maternalForm" class="modal-form">
        <label>Full Name <input type="text" id="mName" required></label>
        <label>Age <input type="number" id="mAge" required></label>
        <label>Barangay 
          <select id="mBarangay">${barangays.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('')}</select>
        </label>
        <label>LMP (Last Menstrual Period) <input type="date" id="mLmp"></label>
        <label>EDD (Expected Delivery Date) <input type="date" id="mEdd"></label>
        <label>Risk Level 
          <select id="mRisk">
            <option value="Normal">Normal Risk</option>
            <option value="Elevated Risk">Elevated Risk</option>
            <option value="High Risk">High Risk</option>
          </select>
        </label>
        <button class="primary-btn full-btn" type="submit">Save Maternal Record</button>
      </form>
    `);

    document.getElementById("maternalForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newRec = {
        id: `mat_${Date.now()}`,
        fullName: document.getElementById("mName").value.trim(),
        age: parseInt(document.getElementById("mAge").value) || 0,
        barangay: document.getElementById("mBarangay").value,
        lmp: document.getElementById("mLmp").value || null,
        edd: document.getElementById("mEdd").value || null,
        riskLevel: document.getElementById("mRisk").value,
        checkupsCompleted: 0,
        assignedNurse: getCurrentUser()?.name || "RHU Staff"
      };
      await persistRecord("maternalRecords", newRec);
      closeModal();
      toast("Maternal record created.");
      renderPage("maternal");
    });
  });

  document.querySelectorAll(".delete-maternal-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this maternal record?")) {
        await deleteRecord("maternalRecords", id);
        toast("Record deleted.");
        renderPage("maternal");
      }
    });
  });
}

function bindInfantsEvents() {
  document.getElementById("addInfantBtn")?.addEventListener("click", () => {
    openModal("Add Infant Record", `
      <form id="infantForm" class="modal-form">
        <label>Infant Name <input type="text" id="iName" required></label>
        <label>Parent / Mother Name <input type="text" id="pName" required></label>
        <label>Birthdate <input type="date" id="iBirthdate" required></label>
        <label>Age (Months) <input type="number" id="iAge" required></label>
        <label>Barangay 
          <select id="iBarangay">${barangays.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('')}</select>
        </label>
        <label>Immunization Status 
          <select id="iStatus">
            <option value="Incomplete">Incomplete</option>
            <option value="Fully Immunized Child (FIC)">Fully Immunized Child (FIC)</option>
            <option value="Completely Immunized Child (CIC)">Completely Immunized Child (CIC)</option>
          </select>
        </label>
        <button class="primary-btn full-btn" type="submit">Save Infant Record</button>
      </form>
    `);

    document.getElementById("infantForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newRec = {
        id: `inf_${Date.now()}`,
        infantName: document.getElementById("iName").value.trim(),
        parentName: document.getElementById("pName").value.trim(),
        birthdate: document.getElementById("iBirthdate").value || null,
        ageMonths: parseInt(document.getElementById("iAge").value) || 0,
        barangay: document.getElementById("iBarangay").value,
        immunizationStatus: document.getElementById("iStatus").value,
        assignedNurse: getCurrentUser()?.name || "RHU Staff"
      };
      await persistRecord("infantRecords", newRec);
      closeModal();
      toast("Infant record created.");
      renderPage("infants");
    });
  });

  document.querySelectorAll(".delete-infant-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this infant record?")) {
        await deleteRecord("infantRecords", id);
        toast("Record deleted.");
        renderPage("infants");
      }
    });
  });
}

function bindSchedulesEvents() {
  document.getElementById("addScheduleBtn")?.addEventListener("click", () => {
    const current = getCurrentUser();
    openModal("Schedule Check-up", `
      <form id="schedForm" class="modal-form">
        <label>Patient Name <input type="text" id="sPatient" value="${escapeHtml(current?.name || '')}" required></label>
        <label>Care Type 
          <select id="sType">
            <option value="MC">MC - Maternal Care</option>
            <option value="CC">CC - Child Immunization</option>
          </select>
        </label>
        <label>Barangay 
          <select id="sBarangay">${barangays.map(b => `<option value="${escapeHtml(b)}" ${b === current?.barangay ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('')}</select>
        </label>
        <label>Preferred Date <input type="date" id="sDate" required></label>
        <label>Time <input type="time" id="sTime" required></label>
        <button class="primary-btn full-btn" type="submit">Submit Schedule</button>
      </form>
    `);

    document.getElementById("schedForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newSched = {
        id: `sch_${Date.now()}`,
        patientName: document.getElementById("sPatient").value.trim(),
        type: document.getElementById("sType").value,
        barangay: document.getElementById("sBarangay").value,
        date: document.getElementById("sDate").value,
        time: document.getElementById("sTime").value,
        status: "Pending",
        assignedNurse: "RHU Nurse"
      };
      await persistRecord("checkupSchedules", newSched);
      closeModal();
      toast("Check-up appointment scheduled.");
      renderPage("schedules");
    });
  });
}

function bindReportsEvents() {
  document.getElementById("generateReportBtn")?.addEventListener("click", async () => {
    const type = prompt("Enter Report Type: MC for Maternal Care, CC for Child Immunization", "MC");
    if (!type || !["MC", "CC"].includes(type.toUpperCase())) return;

    const monthStr = new Date().toISOString().slice(0, 7); // e.g. 2026-08
    const isMC = type.toUpperCase() === "MC";

    const relevantMaternal = state.maternalRecords.filter(r => r.barangay === selectedBarangay);
    const relevantInfants = state.infantRecords.filter(r => r.barangay === selectedBarangay);

    const reportObj = {
      id: `rep_${Date.now()}`,
      type: type.toUpperCase(),
      month: monthStr,
      barangay: selectedBarangay,
      total: isMC ? relevantMaternal.length : relevantInfants.length,
      newCount: isMC ? relevantMaternal.length : relevantInfants.length,
      completeOrDelivered: isMC ? relevantMaternal.filter(r => (r.checkupsCompleted || 0) >= 8).length : relevantInfants.filter(i => (i.immunizationStatus || '').includes('FIC')).length,
      incompleteOrHighRisk: isMC ? relevantMaternal.filter(r => (r.riskLevel || '').includes('High')).length : relevantInfants.filter(i => (i.immunizationStatus || '').includes('Incomplete')).length,
      preparedBy: getCurrentUser()?.name || "RHU Health Worker",
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: "Submitted"
    };

    await persistRecord("monthlyReports", reportObj);
    toast(`Generated ${reportObj.type} report for ${selectedBarangay}.`);
    renderPage("reports");
  });

  document.querySelectorAll(".export-excel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const repId = btn.getAttribute("data-id");
      const rep = state.monthlyReports.find(r => r.id === repId);
      if (!rep) return;

      const records = rep.type === "MC"
        ? state.maternalRecords.filter(r => r.barangay === rep.barangay)
        : state.infantRecords.filter(r => r.barangay === rep.barangay);

      exportMcCcReportToExcel(rep.type, rep.barangay, rep.month, records, rep);
    });
  });
}

function bindUsersEvents() {
  document.getElementById("addStaffBtn")?.addEventListener("click", () => {
    const generatedPassword = `RHU_${Math.floor(100000 + Math.random() * 900000)}`;

    openModal("Add Healthcare Staff Account", `
      <form id="staffForm" class="modal-form">
        <label>Full Name <input type="text" id="stName" required></label>
        <label>Email Address <input type="email" id="stEmail" required></label>
        <label>Role 
          <select id="stRole">
            <option value="MHO">MHO (Municipal Health Officer)</option>
            <option value="Nurse / Midwife">Nurse / Midwife</option>
            <option value="Doctor">Doctor</option>
          </select>
        </label>
        <label>Barangay / Station Assignment 
          <select id="stBarangay">${barangays.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('')}</select>
        </label>
        <div class="alert-box alert-warning">
          <strong>Generated Permanent Password:</strong> <code>${generatedPassword}</code>
          <br><small>Copy and share this password securely with the staff member.</small>
        </div>
        <button class="primary-btn full-btn" type="submit">Create Staff Account</button>
      </form>
    `);

    document.getElementById("staffForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const row = {
        id: `usr_${Date.now()}`,
        name: document.getElementById("stName").value.trim(),
        email: document.getElementById("stEmail").value.trim(),
        role: document.getElementById("stRole").value,
        barangay: document.getElementById("stBarangay").value
      };

      try {
        await createManagedAuthAccount(row, generatedPassword);
        await persistRecord("users", row);
        closeModal();
        toast("Staff account created successfully.");
        renderPage("users");
      } catch (err) {
        toast(err.message, true);
      }
    });
  });
}

function bindBackupEvents() {
  document.getElementById("exportBackupBtn")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `rhu_health_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  });
}
