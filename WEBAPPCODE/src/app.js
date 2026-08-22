/**
 * Main Application Orchestrator & Router (ES Module)
 */
import { STORE_KEYS, pages, barangays, TABLES } from './config.js';
import { db, isOnlineMode, loadCollection, saveCollection, cleanRemoteRow } from './db.js';
import { initSyncEngine, queueOfflineAction, flushPendingSyncQueue } from './sync.js';
import { getCurrentUser, setCurrentUser, getOrCreateCurrentProfile, createManagedAuthAccount } from './auth.js';
import { toast, escapeHtml, formatDate } from './utils/sanitize.js';
import { exportMcCcReportToExcel } from './utils/excelExport.js';
import { renderRolePill, openModal, closeModal, refreshLucideIcons } from './ui/components.js';
import { renderDashboardView } from './ui/dashboard.js';
import { renderMaternalView } from './ui/maternal.js';
import { renderInfantsView } from './ui/infants.js';
import { renderSchedulesView } from './ui/schedules.js';
import { renderReportsView } from './ui/reports.js';
import { renderFormsView } from './ui/forms.js';
import { renderPadreBurgosMaternalFormHtml } from './ui/maternalCardForm.js';
import { renderTodoLigtasImmunizationCardHtml } from './ui/infantCardForm.js';
import { renderPrenatalClinicalRecordHtml } from './ui/prenatalClinicalForm.js';
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
      closeSidebar();
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

  const isParent = current?.role === "Mother / Parent";
  const isNurse = current?.role === "Nurse / Midwife";
  const showSelect = !isParent && !isNurse && vis.length > 1;

  if (bSelect) {
    if (!showSelect) {
      bSelect.classList.add("hidden");
    } else {
      bSelect.classList.remove("hidden");
      bSelect.innerHTML = options.map(b => `<option value="${escapeHtml(b)}" ${b === selectedBarangay ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('');
    }
  }

  if (!options.includes(selectedBarangay)) selectedBarangay = options[0] || barangays[0];

  const subtitles = {
    dashboard: "Monitoring summary",
    maternal: "Pregnancy monitoring and risk tracking",
    infants: "Immunization and check-up monitoring",
    schedules: "Maternal and infant appointments",
    forms: "Parent-submitted maternal and infant information",
    reminders: "Check-up and follow-up reminders",
    barangay: "Monthly records by barangay clinic",
    reports: "MC maternal care and CC child immunization summaries",
    users: "Account and assignment management",
    backup: "LocalStorage data export and restore",
    contacts: "Nurse and midwife contact information"
  };

  const pg = pages.find(p => p.id === pageId);
  if (titleEl) titleEl.textContent = pg ? pg.label : "Dashboard";
  if (subEl) subEl.textContent = subtitles[pageId] || "Monitoring summary";

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
    case "forms":
      contentEl.innerHTML = renderFormsView(state, current);
      bindFormsEvents();
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

export function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.add("hidden");
}

export function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.add("open");
  if (overlay) overlay.classList.remove("hidden");
}

function bindShellEvents() {
  const modalClose = document.getElementById("modalClose");
  if (modalClose) modalClose.addEventListener("click", closeModal);

  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const sidebar = document.getElementById("sidebar");
      if (sidebar?.classList.contains("open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  const overlay = document.getElementById("sidebarOverlay");
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  document.addEventListener("click", (e) => {
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    if (sidebar && sidebar.classList.contains("open")) {
      if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
        closeSidebar();
      }
    }
  });

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

  document.querySelectorAll(".edit-maternal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const rec = state.maternalRecords.find(r => r.id === id);
      if (rec) openPadreBurgosMaternalModal(rec);
    });
  });

  document.querySelectorAll(".open-prenatal-clinical-modal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const rec = state.maternalRecords.find(r => r.id === id);
      if (rec) openPrenatalClinicalRecordModal(rec);
    });
  });

  document.querySelectorAll(".verify-maternal-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const rec = state.maternalRecords.find(r => r.id === id);
      if (!rec) return;
      const current = getCurrentUser();
      const updated = {
        ...rec,
        verification_status: "Verified",
        verified_by: current?.fullName || current?.name || "RHU Nurse",
        verified_at: new Date().toISOString()
      };
      await persistRecord("maternalRecords", updated);
      toast(`Maternal health record verified for ${rec.fullName}.`);
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
        verification_status: "Verified",
        assignedNurse: getCurrentUser()?.name || "RHU Staff"
      };
      await persistRecord("infantRecords", newRec);
      closeModal();
      toast("Infant record created.");
      renderPage("infants");
    });
  });

  document.querySelectorAll(".verify-infant-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const rec = state.infantRecords.find(r => r.id === id);
      if (!rec) return;
      const current = getCurrentUser();
      const updated = {
        ...rec,
        verification_status: "Verified",
        verified_by: current?.fullName || current?.name || "RHU Nurse",
        verified_at: new Date().toISOString()
      };
      await persistRecord("infantRecords", updated);
      toast(`Infant health record verified for ${rec.infantName}.`);
      renderPage("infants");
    });
  });

  document.querySelectorAll(".view-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const rec = state.infantRecords.find(r => r.id === id);
      if (rec) openDigitalImmunizationCardModal(rec);
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

function openPrenatalClinicalRecordModal(record = {}) {
  const currentRec = record || {};

  const html = `
    <form id="prenatalClinicalModalForm" class="space-y-4">
      ${renderPrenatalClinicalRecordHtml(currentRec)}
      <div class="flex items-center justify-between border-t pt-3 mt-2">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3 flex items-center gap-1" onclick="window.print()">
          <span class="material-symbols-outlined text-sm">print</span>
          <span>Print Clinical Record</span>
        </button>
        <div class="flex items-center gap-2">
          <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Cancel</button>
          <button type="submit" class="primary-btn bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold py-1.5 px-4 rounded flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">save</span>
            <span>Save Prenatal Clinical Record</span>
          </button>
        </div>
      </div>
    </form>
  `;

  openModal(`Prenatal Clinical Record - ${escapeHtml(currentRec.fullName || 'Patient')}`, html);

  document.getElementById("prenatalClinicalModalForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const current = getCurrentUser();

    const surname = document.getElementById("pc_surname")?.value.trim() || "";
    const firstName = document.getElementById("pc_first_name")?.value.trim() || "";
    const fullName = `${firstName} ${surname}`.trim() || currentRec.fullName || "Maternal Patient";

    const formDetails = {
      ...(currentRec.formDetails || {}),
      surname,
      firstName,
      mi: document.getElementById("pc_mi")?.value.trim() || "",
      age: document.getElementById("pc_age")?.value || "",
      occupation: document.getElementById("pc_occupation")?.value.trim() || "",
      husbandName: document.getElementById("pc_husband_name")?.value.trim() || "",
      address: document.getElementById("pc_address")?.value.trim() || "",
      birthday: document.getElementById("pc_birthday")?.value || null,
      civilStatus: document.getElementById("pc_civil_status")?.value.trim() || "",
      menarche: document.getElementById("pc_menarche")?.value.trim() || "",
      flowScant: document.getElementById("pc_flow_scant")?.checked || false,
      flowMod: document.getElementById("pc_flow_mod")?.checked || false,
      flowProf: document.getElementById("pc_flow_prof")?.checked || false,
      durationDays: document.getElementById("pc_duration")?.value || "",
      cycleDays: document.getElementById("pc_cycle_days")?.value.trim() || "",
      regularMens: document.getElementById("pc_regular")?.value || "YES",
      painMens: document.getElementById("pc_pain")?.value || "NO",
      lmp: document.getElementById("pc_lmp")?.value || null,
      pmp: document.getElementById("pc_pmp")?.value || null,
      edc: document.getElementById("pc_edc")?.value || null,
      gravida: document.getElementById("pc_gravida")?.value || "1",
      para: document.getElementById("pc_para")?.value || "0",
      obCode: document.getElementById("pc_ob_code")?.value.trim() || "",
      medDm: document.getElementById("pc_med_dm")?.checked || false,
      medHeart: document.getElementById("pc_med_heart")?.checked || false,
      medTb: document.getElementById("pc_med_tb")?.checked || false,
      medAnemia: document.getElementById("pc_med_anemia")?.checked || false,
      medHpn: document.getElementById("pc_med_hpn")?.checked || false,
      medPneumo: document.getElementById("pc_med_pneumo")?.checked || false,
      medAllergy: document.getElementById("pc_med_allergy")?.checked || false,
      medTransfusion: document.getElementById("pc_med_transfusion")?.checked || false,
      medRenal: document.getElementById("pc_med_renal")?.checked || false,
      medRhd: document.getElementById("pc_med_rhd")?.checked || false,
      medJaundice: document.getElementById("pc_med_jaundice")?.checked || false,
      medStd: document.getElementById("pc_med_std")?.checked || false,
      medOthers: document.getElementById("pc_med_others")?.value.trim() || "",
      medOperation: document.getElementById("pc_med_operation")?.value.trim() || "",
      famHpn: document.getElementById("pc_fam_hpn")?.checked || false,
      famDm: document.getElementById("pc_fam_dm")?.checked || false,
      famMulti: document.getElementById("pc_fam_multi")?.checked || false,
      famTb: document.getElementById("pc_fam_tb")?.checked || false,
      famHeart: document.getElementById("pc_fam_heart")?.checked || false,
      famDystocia: document.getElementById("pc_fam_dystocia")?.checked || false,
      famPsych: document.getElementById("pc_fam_psych")?.checked || false,
      probNausea: document.getElementById("pc_prob_nausea")?.checked || false,
      probBleeding: document.getElementById("pc_prob_bleeding")?.checked || false,
      probPelvic: document.getElementById("pc_prob_pelvic")?.checked || false,
      probHeadache: document.getElementById("pc_prob_headache")?.checked || false,
      probDischarge: document.getElementById("pc_prob_discharge")?.checked || false,
      probEdema: document.getElementById("pc_prob_edema")?.checked || false,
      probFatigue: document.getElementById("pc_prob_fatigue")?.checked || false,
      probVisual: document.getElementById("pc_prob_visual")?.checked || false,
      probFever: document.getElementById("pc_prob_fever")?.checked || false,
      probDizziness: document.getElementById("pc_prob_dizziness")?.checked || false,
      probHpn: document.getElementById("pc_prob_hpn")?.checked || false,
      probBackache: document.getElementById("pc_prob_backache")?.checked || false,
      risk_1: document.getElementById("pc_risk_1")?.value.trim() || "",
      risk_2: document.getElementById("pc_risk_2")?.value.trim() || "",
      risk_3: document.getElementById("pc_risk_3")?.value.trim() || ""
    };

    for (let n = 1; n <= 3; n++) {
      formDetails[`ob_no_${n}`] = document.getElementById(`pc_ob_no_${n}`)?.value.trim() || "";
      formDetails[`ob_yr_${n}`] = document.getElementById(`pc_ob_yr_${n}`)?.value.trim() || "";
      formDetails[`ob_aog_${n}`] = document.getElementById(`pc_ob_aog_${n}`)?.value.trim() || "";
      formDetails[`ob_place_${n}`] = document.getElementById(`pc_ob_place_${n}`)?.value.trim() || "";
      formDetails[`ob_comp_${n}`] = document.getElementById(`pc_ob_comp_${n}`)?.value.trim() || "";
      formDetails[`ob_dur_${n}`] = document.getElementById(`pc_ob_dur_${n}`)?.value.trim() || "";
      formDetails[`ob_wt_${n}`] = document.getElementById(`pc_ob_wt_${n}`)?.value.trim() || "";
      formDetails[`ob_rem_${n}`] = document.getElementById(`pc_ob_rem_${n}`)?.value.trim() || "";

      formDetails[`vDate_${n}`] = document.getElementById(`pc_vDate_${n}`)?.value || null;
      formDetails[`vAog_${n}`] = document.getElementById(`pc_vAog_${n}`)?.value.trim() || "";
      formDetails[`vBp_${n}`] = document.getElementById(`pc_vBp_${n}`)?.value.trim() || "";
      formDetails[`vPr_${n}`] = document.getElementById(`pc_vPr_${n}`)?.value.trim() || "";
      formDetails[`vWt_${n}`] = document.getElementById(`pc_vWt_${n}`)?.value.trim() || "";
      formDetails[`vFht_${n}`] = document.getElementById(`pc_vFht_${n}`)?.value.trim() || "";
      formDetails[`vTemp_${n}`] = document.getElementById(`pc_vTemp_${n}`)?.value.trim() || "";
      formDetails[`sym_bleeding_${n}`] = document.getElementById(`pc_sym_bleeding_${n}`)?.checked || false;
      formDetails[`sym_bp_${n}`] = document.getElementById(`pc_sym_bp_${n}`)?.checked || false;
      formDetails[`sym_rupture_${n}`] = document.getElementById(`pc_sym_rupture_${n}`)?.checked || false;
      formDetails[`sym_fever_${n}`] = document.getElementById(`pc_sym_fever_${n}`)?.checked || false;
      formDetails[`sym_pallor_${n}`] = document.getElementById(`pc_sym_pallor_${n}`)?.checked || false;
      formDetails[`sym_vision_${n}`] = document.getElementById(`pc_sym_vision_${n}`)?.checked || false;
      formDetails[`sym_edema_${n}`] = document.getElementById(`pc_sym_edema_${n}`)?.checked || false;
      formDetails[`sym_fht_${n}`] = document.getElementById(`pc_sym_fht_${n}`)?.checked || false;
      formDetails[`remarks_${n}`] = document.getElementById(`pc_remarks_${n}`)?.value.trim() || "";
    }

    const updatedRec = {
      ...currentRec,
      id: currentRec.id || `mat_${Date.now()}`,
      fullName,
      lmp: formDetails.lmp || currentRec.lmp,
      edd: formDetails.edc || currentRec.edd,
      verification_status: currentRec.verification_status || "Verified",
      formDetails
    };

    await persistRecord("maternalRecords", updatedRec);
    closeModal();
    toast(`Prenatal Clinical Record saved for ${updatedRec.fullName}.`);
    renderPage(current?.role === "Mother / Parent" ? "forms" : "maternal");
  });
}

function openDigitalImmunizationCardModal(infant = {}) {
  const currentRec = infant || {};

  const html = `
    <form id="todoLigtasModalForm" class="space-y-4">
      ${renderTodoLigtasImmunizationCardHtml(currentRec)}
      <div class="flex items-center justify-between border-t pt-3 mt-2">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3 flex items-center gap-1" onclick="window.print()">
          <span class="material-symbols-outlined text-sm">print</span>
          <span>Print Immunization Card</span>
        </button>
        <div class="flex items-center gap-2">
          <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Cancel</button>
          <button type="submit" class="primary-btn bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold py-1.5 px-4 rounded flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">save</span>
            <span>Save Immunization Card</span>
          </button>
        </div>
      </div>
    </form>
  `;

  openModal(`DOH Immunization Card (Todo Ligtas) - ${escapeHtml(currentRec.infantName || 'Child Record')}`, html);

  document.getElementById("todoLigtasModalForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const current = getCurrentUser();

    const infantName = document.getElementById("tl_child_name")?.value.trim() || currentRec.infantName || "Child Patient";
    const birthdate = document.getElementById("tl_dob")?.value || currentRec.birthdate || null;
    const motherName = document.getElementById("tl_mother_name")?.value.trim() || currentRec.motherName || "";

    const formDetails = {
      ...(currentRec.formDetails || {}),
      placeOfBirth: document.getElementById("tl_birth_place")?.value.trim() || "",
      fatherName: document.getElementById("tl_father_name")?.value.trim() || "",
      address: document.getElementById("tl_address")?.value.trim() || "",
      birthHeight: document.getElementById("tl_birth_height")?.value.trim() || "50",
      birthWeight: document.getElementById("tl_birth_weight")?.value.trim() || "3.0",
      sex: document.getElementById("tl_sex")?.value || "Male",
      contactNo: document.getElementById("tl_contact_no")?.value.trim() || "",
      bcgDate: document.getElementById("tl_bcg_date")?.value || null,
      bcgRemarks: document.getElementById("tl_bcg_rem")?.value.trim() || "",
      hepatitisBDate: document.getElementById("tl_hepb_date")?.value || null,
      hepaBRemarks: document.getElementById("tl_hepb_rem")?.value.trim() || "",
      pentavalentDose1Date: document.getElementById("tl_penta_1")?.value || null,
      pentavalentDose2Date: document.getElementById("tl_penta_2")?.value || null,
      pentavalentDose3Date: document.getElementById("tl_penta_3")?.value || null,
      pentaRemarks: document.getElementById("tl_penta_rem")?.value.trim() || "",
      opvDose1Date: document.getElementById("tl_opv_1")?.value || null,
      opvDose2Date: document.getElementById("tl_opv_2")?.value || null,
      opvDose3Date: document.getElementById("tl_opv_3")?.value || null,
      opvRemarks: document.getElementById("tl_opv_rem")?.value.trim() || "",
      ipvDose1Date: document.getElementById("tl_ipv_1")?.value || null,
      ipvDose2Date: document.getElementById("tl_ipv_2")?.value || null,
      ipvRemarks: document.getElementById("tl_ipv_rem")?.value.trim() || "",
      pcvDose1Date: document.getElementById("tl_pcv_1")?.value || null,
      pcvDose2Date: document.getElementById("tl_pcv_2")?.value || null,
      pcvDose3Date: document.getElementById("tl_pcv_3")?.value || null,
      pcvRemarks: document.getElementById("tl_pcv_rem")?.value.trim() || "",
      mmrDose1Date: document.getElementById("tl_mmr_1")?.value || null,
      mmrDose2Date: document.getElementById("tl_mmr_2")?.value || null,
      mmrRemarks: document.getElementById("tl_mmr_rem")?.value.trim() || "",
      mcvG1Date: document.getElementById("tl_mcv_g1")?.value || null,
      mcvG1Remarks: document.getElementById("tl_mcv_g1_rem")?.value.trim() || "",
      mcvG71Date: document.getElementById("tl_mcv_g7_1")?.value || null,
      mcvG72Date: document.getElementById("tl_mcv_g7_2")?.value || null,
      mcvG7Remarks: document.getElementById("tl_mcv_g7_rem")?.value.trim() || "",
      td1ChildDate: document.getElementById("tl_td_1")?.value || null,
      td2ChildDate: document.getElementById("tl_td_2")?.value || null,
      tdRemarks: document.getElementById("tl_td_rem")?.value.trim() || "",
      hpv1Date: document.getElementById("tl_hpv_1")?.value || null,
      hpv2Date: document.getElementById("tl_hpv_2")?.value || null,
      hpvRemarks: document.getElementById("tl_hpv_rem")?.value.trim() || "",
      fluDate: document.getElementById("tl_flu_date")?.value || null,
      fluRemarks: document.getElementById("tl_flu_rem")?.value.trim() || "",
      pneumoDate: document.getElementById("tl_pneumo_date")?.value || null,
      pneumoRemarks: document.getElementById("tl_pneumo_rem")?.value.trim() || "",
      otherVac1Name: document.getElementById("tl_other_vac_1")?.value.trim() || "",
      otherVac1Dose: document.getElementById("tl_other_dose_1")?.value.trim() || "",
      otherVac1Date: document.getElementById("tl_other_date_1")?.value || null,
      otherVac1Remarks: document.getElementById("tl_other_rem_1")?.value.trim() || "",
      otherVac2Name: document.getElementById("tl_other_vac_2")?.value.trim() || "",
      otherVac2Dose: document.getElementById("tl_other_dose_2")?.value.trim() || "",
      otherVac2Date: document.getElementById("tl_other_date_2")?.value || null,
      otherVac2Remarks: document.getElementById("tl_other_rem_2")?.value.trim() || ""
    };

    let status = "Incomplete";
    if (formDetails.bcgDate && formDetails.pentavalentDose3Date && formDetails.opvDose3Date && formDetails.mmrDose2Date) {
      status = "Fully Immunized Child (FIC)";
    } else if (formDetails.mmrDose2Date) {
      status = "Completely Immunized Child (CIC)";
    }

    let ageMonths = currentRec.ageMonths || 0;
    if (birthdate) {
      const dob = new Date(birthdate);
      const now = new Date();
      ageMonths = Math.max(0, (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth()));
    }

    const updatedInfant = {
      ...currentRec,
      id: currentRec.id || `inf_${Date.now()}`,
      infantName,
      birthdate,
      ageMonths,
      parentName: motherName || currentRec.parentName || "Parent",
      motherName: motherName || currentRec.motherName || "Parent",
      barangay: currentRec.barangay || current?.barangay || "Basiao (Poblacion)",
      immunizationStatus: status,
      verification_status: currentRec.verification_status || (current?.role === "Nurse / Midwife" ? "Verified" : "Pending Verification"),
      formDetails
    };

    await persistRecord("infantRecords", updatedInfant);
    closeModal();
    toast(`Todo Ligtas Immunization Card saved for ${updatedInfant.infantName}.`);
    renderPage(current?.role === "Mother / Parent" ? "forms" : "infants");
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

function bindFormsEvents() {
  const current = getCurrentUser();
  const motherName = current?.name || current?.fullName || "";
  const lowerName = motherName.toLowerCase().trim();

  document.getElementById("openMaternalFormModalBtn")?.addEventListener("click", () => {
    const myMaternal = state.maternalRecords.find(r => 
      (r.fullName && r.fullName.toLowerCase().trim() === lowerName) ||
      (r.user_id && current?.id && r.user_id === current.id) ||
      (r.email && current?.email && r.email.toLowerCase() === current.email.toLowerCase())
    );
    openPadreBurgosMaternalModal(myMaternal || { fullName: motherName, barangay: current?.barangay });
  });

  document.getElementById("openInfantFormModalBtn")?.addEventListener("click", () => {
    openModal("Register Child Immunization Record", `
      <form id="parentInfantModalForm" class="grid gap-3 p-1">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Infant Full Name *</label>
          <input type="text" id="infModalFullName" class="input-field" placeholder="Child's complete name" required>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
            <input type="date" id="infModalDob" class="input-field" required>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Sex *</label>
            <select id="infModalSex" class="input-field">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Mother / Parent Name</label>
            <input type="text" id="infModalParentName" class="input-field" value="${escapeHtml(motherName)}" required>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Barangay Clinic *</label>
            <select id="infModalBarangay" class="input-field">
              ${barangays.map(b => `<option value="${escapeHtml(b)}" ${current?.barangay === b ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Immunization Status</label>
          <select id="infModalImmunization" class="input-field">
            <option value="Incomplete">Incomplete (Ongoing Routine Doses)</option>
            <option value="Fully Immunized Child (FIC)">Fully Immunized Child (FIC - 0-11 mos)</option>
            <option value="Completely Immunized Child (CIC)">Completely Immunized Child (CIC - 12+ mos)</option>
          </select>
        </div>

        <button class="primary-btn full-btn mt-2 flex items-center justify-center gap-1.5 py-2.5" type="submit">
          <span class="material-symbols-outlined text-lg">add_circle</span>
          <span>Register Child Immunization Record</span>
        </button>
      </form>
    `);

    document.getElementById("parentInfantModalForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const infantName = document.getElementById("infModalFullName").value.trim();
      const birthdate = document.getElementById("infModalDob").value || null;
      const sex = document.getElementById("infModalSex").value;
      const parentName = document.getElementById("infModalParentName").value.trim();
      const barangay = document.getElementById("infModalBarangay").value;
      const immunizationStatus = document.getElementById("infModalImmunization").value;

      let ageMonths = 0;
      if (birthdate) {
        const dob = new Date(birthdate);
        const now = new Date();
        ageMonths = Math.max(0, (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth()));
      }

      const newInfant = {
        id: `inf_${Date.now()}`,
        user_id: current?.id || null,
        infantName,
        birthdate,
        ageMonths,
        parentName,
        motherName: parentName,
        barangay,
        immunizationStatus,
        verification_status: "Pending Verification",
        assignedNurse: "RHU Staff",
        formDetails: {
          sex,
          registrationDate: new Date().toISOString().split("T")[0]
        }
      };

      await persistRecord("infantRecords", newInfant);
      closeModal();
      toast("Child Immunization Record submitted for Nurse Verification!");
      renderPage("forms");
    });
  });

  document.querySelectorAll(".open-infant-card-modal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const inf = state.infantRecords.find(i => i.id === id);
      if (inf) openDigitalImmunizationCardModal(inf);
    });
  });
}

function openPadreBurgosMaternalModal(record = {}) {
  const currentRec = record || {};

  const html = `
    <form id="pbMaternalModalForm" class="space-y-4">
      ${renderPadreBurgosMaternalFormHtml(currentRec)}
      <div class="flex items-center justify-end gap-2 border-t pt-3 mt-2">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Cancel</button>
        <button type="submit" class="primary-btn bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold py-1.5 px-4 rounded flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">save</span>
          <span>Save Physical Maternal Record</span>
        </button>
      </div>
    </form>
  `;

  openModal(`DOH Physical Maternal Record - ${escapeHtml(currentRec.fullName || 'New Record')}`, html);

  document.getElementById("pbMaternalModalForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const current = getCurrentUser();

    const fullName = document.getElementById("pb_fullName")?.value.trim() || currentRec.fullName || "Mother Patient";
    const lmp = document.getElementById("pb_lmpDate")?.value || null;
    const edd = document.getElementById("pb_edcDate")?.value || null;
    const address = document.getElementById("pb_address")?.value.trim() || "";

    const formDetails = {
      ...(currentRec.formDetails || {}),
      bloodType: document.getElementById("pb_bloodType")?.value || "",
      ageCategory: document.getElementById("pb_ageCategory")?.value || "18-34",
      heightCm: document.getElementById("pb_heightCm")?.value || "",
      weightKg: document.getElementById("pb_weightKg")?.value || "",
      bmi: document.getElementById("pb_bmi")?.value || "",
      td1Date: document.getElementById("pb_td1Date")?.value || null,
      td2Date: document.getElementById("pb_td2Date")?.value || null,
      td3Date: document.getElementById("pb_td3Date")?.value || null,
      td4Date: document.getElementById("pb_td4Date")?.value || null,
      td5Date: document.getElementById("pb_td5Date")?.value || null,
      obG: document.getElementById("pb_obG")?.value || "1",
      obP: document.getElementById("pb_obP")?.value || "0",
      obT: document.getElementById("pb_obT")?.value || "0",
      obPreterm: document.getElementById("pb_obPreterm")?.value || "0",
      obA: document.getElementById("pb_obA")?.value || "0",
      obL: document.getElementById("pb_obL")?.value || "0",
      caesarean: document.getElementById("pb_caesarean")?.value || "NO",
      stillbirth: document.getElementById("pb_stillbirth")?.value || "NO",
      postpartumHemorrhage: document.getElementById("pb_postpartumHemorrhage")?.value || "NO",
      consecutiveMiscarriages: document.getElementById("pb_consecutiveMiscarriages")?.value || "NO",
      probTb: document.getElementById("pb_probTb")?.value || "NO",
      probHeart: document.getElementById("pb_probHeart")?.value || "NO",
      probDiabetes: document.getElementById("pb_probDiabetes")?.value || "NO",
      probAsthma: document.getElementById("pb_probAsthma")?.value || "NO",
      probGoiter: document.getElementById("pb_probGoiter")?.value || "NO",
      probHypertension: document.getElementById("pb_probHypertension")?.value || "NO",
      ppExclusiveBreastfeeding: document.getElementById("pb_ppExclusiveBreastfeeding")?.value || "NO",
      ppIntendsFp: document.getElementById("pb_ppIntendsFp")?.value || "NO",
      ppFever: document.getElementById("pb_ppFever")?.value || "NO",
      ppFoulDischarge: document.getElementById("pb_ppFoulDischarge")?.value || "NO",
      ppExcessiveBleeding: document.getElementById("pb_ppExcessiveBleeding")?.value || "NO",
      ppPallor: document.getElementById("pb_ppPallor")?.value || "NO",
      ppCordOk: document.getElementById("pb_ppCordOk")?.value || "YES",
      ppVitA: document.getElementById("pb_ppVitA")?.value || "NO",
      referralPhysician: document.getElementById("pb_referralPhysician")?.value.trim() || "",
      nurseObservations: document.getElementById("pb_nurseObservations")?.value.trim() || "",
      hospitalDeliveryRecommended: document.getElementById("pb_hospitalDeliveryRecommended")?.value || "NO"
    };

    let checkupsCount = 0;
    for (let i = 1; i <= 9; i++) {
      const vD = document.getElementById(`pb_vDate_${i}`)?.value || null;
      formDetails[`vDate_${i}`] = vD;
      formDetails[`vAog_${i}`] = document.getElementById(`pb_vAog_${i}`)?.value.trim() || '';
      formDetails[`vBp_${i}`] = document.getElementById(`pb_vBp_${i}`)?.value.trim() || '';
      formDetails[`vWeight_${i}`] = document.getElementById(`pb_vWeight_${i}`)?.value.trim() || '';
      if (vD) checkupsCount++;
    }

    const updatedRec = {
      ...currentRec,
      id: currentRec.id || `mat_${Date.now()}`,
      fullName,
      lmp: lmp || currentRec.lmp,
      edd: edd || currentRec.edd,
      address: address || currentRec.address,
      barangay: currentRec.barangay || current?.barangay || "Basiao (Poblacion)",
      checkupsCompleted: Math.max(currentRec.checkupsCompleted || 0, checkupsCount),
      verification_status: currentRec.verification_status || (current?.role === "Nurse / Midwife" ? "Verified" : "Pending Verification"),
      formDetails
    };

    await persistRecord("maternalRecords", updatedRec);
    closeModal();
    toast(`Padre Burgos RHU Maternal Record saved for ${updatedRec.fullName}.`);
    renderPage(current?.role === "Mother / Parent" ? "forms" : "maternal");
  });
}

function bindReportsEvents() {
  document.getElementById("generateReportBtn")?.addEventListener("click", async () => {
    const current = getCurrentUser();
    const targetBgy = (selectedBarangay === "All Barangays" || !selectedBarangay) ? (current?.barangay || "Basiao (Poblacion)") : selectedBarangay;
    const currMonth = new Date().toISOString().slice(0, 7);

    const mRecs = state.maternalRecords.filter(r => targetBgy === "All Barangays" || !targetBgy || r.barangay === targetBgy);
    const iRecs = state.infantRecords.filter(r => targetBgy === "All Barangays" || !targetBgy || r.barangay === targetBgy);

    const mcReport = {
      id: `rep_mc_${Date.now()}`,
      type: "MC",
      month: currMonth,
      barangay: targetBgy,
      total: mRecs.length,
      newCount: mRecs.filter(r => r.created_at && r.created_at.startsWith(currMonth)).length || mRecs.length,
      completeOrDelivered: mRecs.filter(r => r.pregnancyStatus === "Delivered" || (r.checkupsCompleted || 0) >= 8).length,
      incompleteOrHighRisk: mRecs.filter(r => (r.riskLevel || "").toLowerCase().includes("high")).length,
      preparedBy: current?.fullName || current?.name || "RHU Health Staff",
      dateSubmitted: new Date().toISOString().split("T")[0],
      status: "Submitted"
    };

    const ccReport = {
      id: `rep_cc_${Date.now()}`,
      type: "CC",
      month: currMonth,
      barangay: targetBgy,
      total: iRecs.length,
      newCount: iRecs.filter(r => r.created_at && r.created_at.startsWith(currMonth)).length || iRecs.length,
      completeOrDelivered: iRecs.filter(i => (i.immunizationStatus || "").includes("FIC")).length,
      incompleteOrHighRisk: iRecs.filter(i => (i.immunizationStatus || "").includes("Incomplete")).length,
      preparedBy: current?.fullName || current?.name || "RHU Health Staff",
      dateSubmitted: new Date().toISOString().split("T")[0],
      status: "Submitted"
    };

    await persistRecord("monthlyReports", mcReport);
    await persistRecord("monthlyReports", ccReport);

    toast(`Successfully generated MC and CC monthly reports for ${targetBgy}.`);
    renderPage("reports");
  });

  document.querySelectorAll(".export-excel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const repId = btn.getAttribute("data-id");
      const rep = state.monthlyReports.find(r => r.id === repId);
      if (!rep) return;

      const records = rep.type === "MC"
        ? state.maternalRecords.filter(r => rep.barangay === "All Barangays" || !rep.barangay || r.barangay === rep.barangay)
        : state.infantRecords.filter(r => rep.barangay === "All Barangays" || !rep.barangay || r.barangay === rep.barangay);

      exportMcCcReportToExcel(rep.type, rep.barangay, rep.month, records, rep);
    });
  });

  document.querySelectorAll(".delete-report-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const repId = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this report record?")) {
        await deleteRecord("monthlyReports", repId);
        toast("Report deleted.");
        renderPage("reports");
      }
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
