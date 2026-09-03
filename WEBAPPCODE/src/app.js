/**
 * Main Application Orchestrator & Router (ES Module)
 * Padre Burgos RHU Maternal & Infant Health Monitoring System
 */
import { STORE_KEYS, pages, getDynamicBarangays, defaultBarangays, TABLES, isNativeMobileApp } from './config.js';
import { db, isOnlineMode, loadCollection, saveCollection, cleanRemoteRow } from './db.js';
import { initSyncEngine, queueOfflineAction, flushPendingSyncQueue } from './sync.js';
import { getCurrentUser, setCurrentUser, getOrCreateCurrentProfile, isParent, isNurse, isMho, isAdmin, isStaff } from './auth.js';
import { toast, escapeHtml, formatDate } from './utils/sanitize.js';
import { exportMcCcReportToExcel } from './utils/excelExport.js';
import { initTheme, toggleTheme } from './utils/theme.js';
import { renderRolePill, openModal, closeModal, refreshLucideIcons } from './ui/components.js';
import { renderDashboardView, renderBarangayMonitoringDashboard } from './ui/dashboard.js';
import { renderMaternalView } from './ui/maternal.js';
import { renderInfantsView } from './ui/infants.js';
import { renderCheckupHistoryView, generatePrintableCheckupHistoryHtml } from './ui/checkupHistory.js';
import { renderSchedulesView } from './ui/schedules.js';
import { renderReportsView } from './ui/reports.js';
import { renderPadreBurgosMaternalFormHtml } from './ui/maternalCardForm.js';
import { renderTodoLigtasImmunizationCardHtml } from './ui/infantCardForm.js';
import { renderPrenatalClinicalRecordHtml } from './ui/prenatalClinicalForm.js';
import { renderBackupView, renderContactsView } from './ui/backup.js';
import { renderRemindersView } from './ui/reminders.js';
import { requestNotificationPermission, checkImmunizationAndScheduleReminders, isNotificationGranted } from './utils/notifications.js';

let state = {
  users: [],
  currentUser: null,
  maternalRecords: [],
  infantRecords: [],
  maternalCheckupHistory: [],
  infantCheckupHistory: [],
  checkupSchedules: [],
  reminders: [],
  monthlyReports: [],
  emergencyContacts: [],
  backupMeta: null
};

let activePage = "dashboard";
let selectedBarangay = "All Barangays";
let selectedReportMonth = String(new Date().getMonth() + 1).padStart(2, '0');
let selectedReportYear = String(new Date().getFullYear());
let activeAuthMode = "webStaff"; // "webStaff" or "motherMobile"

function getActiveBarangays() {
  return getDynamicBarangays(state);
}

function visibleBarangays() {
  const current = getCurrentUser();
  const allBgy = getActiveBarangays();
  if (isNurse(current) && allBgy.includes(current.barangay)) {
    return [current.barangay];
  }
  return ["All Barangays", ...allBgy];
}

document.addEventListener("DOMContentLoaded", init);

async function init() {
  initTheme();
  initSyncEngine();

  // In .apk, default to Mother/Parent portal; In web, default to Healthcare Staff portal
  const isApk = isNativeMobileApp();
  if (isApk) {
    document.body.classList.add("is-native-apk");
    document.querySelectorAll(".apk-download-btn, #authApkDownloadSection, #sidebarApkDownload, #topbarApkDownload, #parentDashboardApkBanner").forEach(el => {
      el.remove();
    });
  }
  activeAuthMode = isApk ? "motherMobile" : "webStaff";
  updateAuthModeUI();

  hydrateAuthOptions();
  bindAuthEvents();
  bindShellEvents();
  bindPasswordVisibilityToggles();
  bindThemeToggleButtons();

  if (isOnlineMode()) {
    // Listen for Password Recovery events (e.g. from email links or token resets)
    db.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        toast("Password recovery verified. Set your new password below.");
        document.getElementById("loginForm")?.classList.add("hidden");
        document.getElementById("registerForm")?.classList.add("hidden");
        document.getElementById("staffRegisterForm")?.classList.add("hidden");
        const forgotForm = document.getElementById("forgotPasswordForm");
        if (forgotForm) {
          forgotForm.classList.remove("hidden");
          document.getElementById("forgotStep1")?.classList.add("hidden");
          document.getElementById("forgotStep2")?.classList.remove("hidden");
          if (session?.user?.email) {
            const confirmEmail = document.getElementById("forgotConfirmEmail");
            if (confirmEmail) confirmEmail.value = session.user.email;
          }
          // Hide OTP label when already verified via direct email link
          document.getElementById("forgotOtpLabel")?.classList.add("hidden");
        }
      }
    });

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
    try {
      const { data, error } = await db.from(table).select("*");
      if (!error && data) {
        state[key] = data;
        await saveCollection(key, data);
      }
    } catch (err) {
      // Gracefully fall back to local IndexedDB store
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
    try {
      const { error } = await db.from(TABLES[key]).upsert(cleanRemoteRow(key, row), { onConflict: "id" });
      if (error) {
        await queueOfflineAction(key, 'UPSERT', row);
      }
    } catch (err) {
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
    try {
      const { error } = await db.from(TABLES[key]).delete().eq('id', id);
      if (error) {
        await queueOfflineAction(key, 'DELETE', { id });
      }
    } catch (err) {
      await queueOfflineAction(key, 'DELETE', { id });
    }
  } else {
    await queueOfflineAction(key, 'DELETE', { id });
  }
}

function showAuth() {
  document.getElementById("authScreen")?.classList.remove("hidden");
  document.getElementById("appShell")?.classList.add("hidden");
  document.getElementById("loginForm")?.classList.remove("hidden");
  document.getElementById("forgotPasswordForm")?.classList.add("hidden");
  document.getElementById("registerForm")?.classList.add("hidden");
  document.getElementById("staffRegisterForm")?.classList.add("hidden");
  if (isNativeMobileApp()) {
    document.getElementById("authApkDownloadSection")?.remove();
    document.querySelectorAll(".apk-download-btn").forEach(el => el.remove());
  }
  updateAuthModeUI();
}

function showApp(userData) {
  document.getElementById("authScreen")?.classList.add("hidden");
  document.getElementById("appShell")?.classList.remove("hidden");

  // Manage APK download buttons: strictly remove inside native APK, show in Web App
  const isApk = isNativeMobileApp();
  const sidebarApk = document.getElementById("sidebarApkDownload");
  const topbarApk = document.getElementById("topbarApkDownload");
  const authApk = document.getElementById("authApkDownloadSection");
  if (isApk) {
    sidebarApk?.remove();
    topbarApk?.remove();
    authApk?.remove();
    document.querySelectorAll(".apk-download-btn, #parentDashboardApkBanner").forEach(el => el.remove());
  } else {
    sidebarApk?.classList.remove("hidden");
    topbarApk?.classList.remove("hidden");
  }

  const initials = (userData.name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const initialsEl = document.getElementById("userInitials");
  if (initialsEl) initialsEl.textContent = initials;

  const nameEl = document.getElementById("currentUserName");
  if (nameEl) nameEl.textContent = userData.name || userData.email;

  const metaEl = document.getElementById("currentUserMeta");
  if (metaEl) metaEl.textContent = `${userData.role} • ${userData.barangay || 'Padre Burgos'}`;

  const rolePillEl = document.getElementById("rolePill");
  if (rolePillEl) rolePillEl.innerHTML = renderRolePill(userData.role);

  // Hide system search for Mother / Parent
  const globalSearch = document.getElementById("globalSearch");
  if (globalSearch) {
    if (isParent(userData)) {
      globalSearch.classList.add("hidden");
    } else {
      globalSearch.classList.remove("hidden");
    }
  }

  // Trigger immunization & checkup appointment reminder check
  checkImmunizationAndScheduleReminders(state, userData).catch(err => console.warn('Reminder scan warning:', err));

  renderNav();
  renderPage(activePage);
}

function renderNav() {
  const current = getCurrentUser();
  const nav = document.getElementById("mainNav");
  if (!nav || !current) return;

  const allowed = pages.filter(p => p.roles.includes(current.role));
  nav.innerHTML = allowed.map(p => `
    <button class="nav-link ${p.id === activePage ? 'active' : ''}" data-page="${p.id}">
      <span class="material-symbols-outlined">${getMaterialIcon(p.id)}</span>
      <span>${p.label}</span>
    </button>
  `).join('');

  nav.querySelectorAll(".nav-link").forEach(btn => {
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
}

function getMaterialIcon(pageId) {
  const iconMap = {
    dashboard: "dashboard",
    maternal: "pregnant_woman",
    infants: "child_care",
    history: "history",
    schedules: "calendar_month",
    reminders: "notifications",
    barangay: "apartment",
    reports: "analytics",
    backup: "storage",
    contacts: "contact_phone",
    logout: "logout"
  };
  return iconMap[pageId] || "folder";
}

function renderPage(pageId) {
  const titleEl = document.getElementById("pageTitle");
  const contentEl = document.getElementById("content");
  const bSelect = document.getElementById("topbarBarangaySelect");
  if (!contentEl) return;

  const current = getCurrentUser();
  const vis = visibleBarangays();

  const isUserParent = isParent(current);
  const isUserNurse = isNurse(current);
  const showSelect = !isUserParent && !isUserNurse && vis.length > 1;

  if (bSelect) {
    if (!showSelect) {
      bSelect.classList.add("hidden");
    } else {
      bSelect.classList.remove("hidden");
      bSelect.innerHTML = vis.map(b => `<option value="${escapeHtml(b)}" ${b === selectedBarangay ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('');
    }
  }

  if (!vis.includes(selectedBarangay)) {
    selectedBarangay = vis[0] || "All Barangays";
  }

  const pg = pages.find(p => p.id === pageId);
  if (titleEl) titleEl.textContent = pg ? pg.label : "Dashboard";

  const searchInput = document.getElementById("globalSearch");
  const searchTerm = searchInput ? searchInput.value.trim() : "";

  switch (pageId) {
    case "dashboard":
      contentEl.innerHTML = renderDashboardView(state, current, selectedBarangay, vis, searchTerm);
      bindDashboardEvents();
      break;
    case "maternal":
      contentEl.innerHTML = renderMaternalView(state, selectedBarangay, current);
      bindMaternalEvents();
      break;
    case "infants":
      contentEl.innerHTML = renderInfantsView(state, selectedBarangay, current);
      bindInfantsEvents();
      break;
    case "history":
      contentEl.innerHTML = renderCheckupHistoryView(state, current, selectedBarangay);
      bindCheckupHistoryEvents();
      break;
    case "schedules":
      contentEl.innerHTML = renderSchedulesView(state, selectedBarangay, current);
      bindSchedulesEvents();
      break;
    case "reminders":
      contentEl.innerHTML = renderRemindersView(state, current);
      break;
    case "reports":
      contentEl.innerHTML = renderReportsView(state, selectedBarangay, selectedReportMonth, selectedReportYear);
      bindReportsEvents();
      break;
    case "barangay":
      contentEl.innerHTML = renderBarangayMonitoringDashboard(state, current, selectedBarangay, searchTerm);
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
}

function hydrateAuthOptions() {
  const bgyList = defaultBarangays;
  const regBgy = document.getElementById("regBarangay");
  if (regBgy) {
    regBgy.innerHTML = bgyList.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
  }
  const staffRegBgy = document.getElementById("staffRegBarangay");
  if (staffRegBgy) {
    staffRegBgy.innerHTML = bgyList.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
  }
}

function updateAuthModeUI() {
  const isApk = isNativeMobileApp();
  // Ensure mode strictly matches detected platform environment
  activeAuthMode = isApk ? "motherMobile" : "webStaff";

  const isMobile = activeAuthMode === "motherMobile";
  const switcher = document.getElementById("authAppSwitcher");
  const webBtn = document.getElementById("switchWebAppBtn");
  const mobBtn = document.getElementById("switchMobileAppBtn");
  const webActions = document.getElementById("webStaffAuthActions");
  const mobActions = document.getElementById("motherMobileAuthActions");
  const heading = document.getElementById("authHeading");
  const subtitle = document.getElementById("authSubtitle");
  const loginEmail = document.getElementById("loginEmail");
  const loginEmailLabelText = document.getElementById("loginEmailLabelText");
  const regForm = document.getElementById("registerForm");
  const staffRegForm = document.getElementById("staffRegisterForm");

  // Keep auth mode switcher strictly hidden in both Web and APK
  if (switcher) switcher.classList.add("hidden");
  const forgotForm = document.getElementById("forgotPasswordForm");
  if (forgotForm) forgotForm.classList.add("hidden");

  if (isMobile) {
    if (mobBtn) mobBtn.classList.add("active");
    if (webBtn) webBtn.classList.remove("active");
    if (mobActions) mobActions.classList.remove("hidden");
    if (webActions) webActions.classList.add("hidden");
    if (staffRegForm) staffRegForm.classList.add("hidden");
    if (heading) heading.textContent = "RHU Mother & Child Portal";
    if (subtitle) subtitle.textContent = "Padre Burgos RHU • Maternal & Infant Health Monitoring for Parents";
    if (loginEmailLabelText) loginEmailLabelText.textContent = "Mother / Parent Email Address";
    if (loginEmail) loginEmail.placeholder = "e.g. maria.santos@gmail.com";
  } else {
    if (webBtn) webBtn.classList.add("active");
    if (mobBtn) mobBtn.classList.remove("active");
    if (webActions) webActions.classList.remove("hidden");
    if (mobActions) mobActions.classList.add("hidden");
    if (regForm) regForm.classList.add("hidden");
    if (heading) heading.textContent = "RHU Healthcare Web Portal";
    if (subtitle) subtitle.textContent = "Authorized Portal for Nurses, Midwives, and MHO • Padre Burgos RHU";
    if (loginEmailLabelText) loginEmailLabelText.textContent = "Healthcare Staff Email Address";
    if (loginEmail) loginEmail.placeholder = "e.g. elena.ramos@rhu.gov or admin@rhu.gov";
  }
}

function bindAuthEvents() {
  // App Switcher buttons
  document.getElementById("switchWebAppBtn")?.addEventListener("click", () => {
    activeAuthMode = "webStaff";
    updateAuthModeUI();
    document.getElementById("registerForm")?.classList.add("hidden");
    document.getElementById("staffRegisterForm")?.classList.add("hidden");
    document.getElementById("loginForm")?.classList.remove("hidden");
  });

  document.getElementById("switchMobileAppBtn")?.addEventListener("click", () => {
    activeAuthMode = "motherMobile";
    updateAuthModeUI();
    document.getElementById("registerForm")?.classList.add("hidden");
    document.getElementById("staffRegisterForm")?.classList.add("hidden");
    document.getElementById("loginForm")?.classList.remove("hidden");
  });

  // Login Form
  document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
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
        const fallbackRole = activeAuthMode === "motherMobile" ? "Mother / Parent" : "Nurse / Midwife";
        user = { id: `usr_${Date.now()}`, name: email.split('@')[0], email, role: fallbackRole, barangay: defaultBarangays[0] };
      }
      setCurrentUser(user);
      showApp(user);
      toast("Signed in (Offline Mode).");
    }
  });

  // Show Mother Registration
  document.getElementById("showParentRegistration")?.addEventListener("click", () => {
    document.getElementById("loginForm")?.classList.add("hidden");
    document.getElementById("staffRegisterForm")?.classList.add("hidden");
    document.getElementById("registerForm")?.classList.remove("hidden");
  });

  document.getElementById("backToLogin")?.addEventListener("click", () => {
    document.getElementById("registerForm")?.classList.add("hidden");
    document.getElementById("loginForm")?.classList.remove("hidden");
  });

  // Show Staff Registration
  document.getElementById("showStaffRegistration")?.addEventListener("click", () => {
    document.getElementById("loginForm")?.classList.add("hidden");
    document.getElementById("registerForm")?.classList.add("hidden");
    document.getElementById("staffRegisterForm")?.classList.remove("hidden");
  });

  document.getElementById("backToLoginFromStaff")?.addEventListener("click", () => {
    document.getElementById("staffRegisterForm")?.classList.add("hidden");
    document.getElementById("loginForm")?.classList.remove("hidden");
  });

  // Show Forgot Password Form
  document.getElementById("showForgotPassword")?.addEventListener("click", () => {
    document.getElementById("loginForm")?.classList.add("hidden");
    document.getElementById("registerForm")?.classList.add("hidden");
    document.getElementById("staffRegisterForm")?.classList.add("hidden");
    const forgotForm = document.getElementById("forgotPasswordForm");
    if (forgotForm) {
      forgotForm.classList.remove("hidden");
      document.getElementById("forgotStep1")?.classList.remove("hidden");
      document.getElementById("forgotStep2")?.classList.add("hidden");
      document.getElementById("forgotOtpLabel")?.classList.remove("hidden");
      const loginEmailVal = document.getElementById("loginEmail")?.value.trim();
      if (loginEmailVal && loginEmailVal.includes("@")) {
        const forgotEmail = document.getElementById("forgotEmail");
        if (forgotEmail) forgotEmail.value = loginEmailVal;
      }
    }
  });

  document.getElementById("backToLoginFromForgot")?.addEventListener("click", () => {
    document.getElementById("forgotPasswordForm")?.classList.add("hidden");
    document.getElementById("loginForm")?.classList.remove("hidden");
  });

  document.getElementById("alreadyHaveCodeBtn")?.addEventListener("click", () => {
    const emailVal = document.getElementById("forgotEmail")?.value.trim();
    if (emailVal) {
      const confirmEmail = document.getElementById("forgotConfirmEmail");
      if (confirmEmail) confirmEmail.value = emailVal;
    }
    document.getElementById("forgotStep1")?.classList.add("hidden");
    document.getElementById("forgotStep2")?.classList.remove("hidden");
    document.getElementById("forgotOtpLabel")?.classList.remove("hidden");
  });

  // Send / Resend Reset Code handler
  const handleSendResetCode = async () => {
    const emailInput = document.getElementById("forgotEmail");
    const confirmEmailInput = document.getElementById("forgotConfirmEmail");
    const email = (emailInput?.value || confirmEmailInput?.value || "").trim();

    if (!email || !email.includes("@")) {
      toast("Please enter a valid registered email address.", true);
      return;
    }

    const sendBtn = document.getElementById("sendResetCodeBtn");
    const resendBtn = document.getElementById("resendResetCodeBtn");
    if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = "Sending Code..."; }
    if (resendBtn) { resendBtn.disabled = true; resendBtn.textContent = "Sending..."; }

    try {
      if (isOnlineMode()) {
        const { error } = await db.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname
        });
        if (error) {
          toast(`Failed to send code: ${error.message}`, true);
          return;
        }
        toast("Verification code sent! Please check your email inbox.");
      } else {
        toast("Verification code sent (Offline Mode). Check your email.");
      }

      if (confirmEmailInput) confirmEmailInput.value = email;
      document.getElementById("forgotStep1")?.classList.add("hidden");
      document.getElementById("forgotStep2")?.classList.remove("hidden");
      document.getElementById("forgotOtpLabel")?.classList.remove("hidden");
      document.getElementById("forgotOtp")?.focus();
    } catch (err) {
      toast(`Error sending reset code: ${err.message}`, true);
    } finally {
      if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = "Send Reset Code"; }
      if (resendBtn) { resendBtn.disabled = false; resendBtn.textContent = "Resend Code"; }
    }
  };

  document.getElementById("sendResetCodeBtn")?.addEventListener("click", handleSendResetCode);
  document.getElementById("resendResetCodeBtn")?.addEventListener("click", handleSendResetCode);

  // Submit Password Reset Form
  document.getElementById("forgotPasswordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotConfirmEmail")?.value.trim();
    const otp = document.getElementById("forgotOtp")?.value.trim();
    const newPass = document.getElementById("forgotNewPassword")?.value;
    const confirmPass = document.getElementById("forgotConfirmPassword")?.value;

    if (!email) {
      toast("Please enter your registered email address.", true);
      return;
    }
    if (!newPass || newPass.length < 6) {
      toast("New password must be at least 6 characters.", true);
      return;
    }
    if (newPass !== confirmPass) {
      toast("Passwords do not match. Please re-enter.", true);
      return;
    }

    const submitBtn = document.getElementById("submitResetPasswordBtn");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Saving New Password..."; }

    try {
      if (isOnlineMode()) {
        // Check if session is already established via magic link redirect
        const { data: sessData } = await db.auth.getSession();
        const hasActiveSession = Boolean(sessData?.session?.user);

        if (!hasActiveSession) {
          if (!otp) {
            toast("Please enter the 6-digit verification code from your email.", true);
            return;
          }
          // Verify recovery OTP
          const { data: verifyData, error: verifyErr } = await db.auth.verifyOtp({
            email,
            token: otp,
            type: "recovery"
          });
          if (verifyErr) {
            toast(`Invalid or expired code: ${verifyErr.message}`, true);
            return;
          }
        }

        // Set the new password
        const { data: updateData, error: updateErr } = await db.auth.updateUser({
          password: newPass
        });
        if (updateErr) {
          toast(`Could not update password: ${updateErr.message}`, true);
          return;
        }

        toast("Password updated successfully! Please sign in with your new password.");
        document.getElementById("forgotPasswordForm")?.reset();
        document.getElementById("forgotStep2")?.classList.add("hidden");
        document.getElementById("forgotStep1")?.classList.remove("hidden");
        document.getElementById("forgotPasswordForm")?.classList.add("hidden");
        document.getElementById("loginForm")?.classList.remove("hidden");
        const loginEmailInput = document.getElementById("loginEmail");
        if (loginEmailInput) loginEmailInput.value = email;
        const loginPassInput = document.getElementById("loginPassword");
        if (loginPassInput) loginPassInput.value = "";
      } else {
        toast("Password updated successfully (Offline Mode).");
        document.getElementById("forgotPasswordForm")?.reset();
        document.getElementById("forgotStep2")?.classList.add("hidden");
        document.getElementById("forgotStep1")?.classList.remove("hidden");
        document.getElementById("forgotPasswordForm")?.classList.add("hidden");
        document.getElementById("loginForm")?.classList.remove("hidden");
      }
    } catch (err) {
      toast(`Password reset error: ${err.message}`, true);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Reset & Save Password"; }
    }
  });

  // Mother Registration Submit
  document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
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
        toast("Parent account registration complete!");
      }
    } else {
      const profile = { id: `usr_${Date.now()}`, name, email, role: 'Mother / Parent', barangay };
      await persistRecord('users', profile);
      setCurrentUser(profile);
      showApp(profile);
      toast("Parent account registered (Offline Mode)!");
    }
  });

  // Staff Registration Submit
  document.getElementById("staffRegisterForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("staffRegName").value.trim();
    const email = document.getElementById("staffRegEmail").value.trim();
    const role = document.getElementById("staffRegRole").value;
    const barangay = document.getElementById("staffRegBarangay").value;
    const password = document.getElementById("staffRegPassword").value;
    const confirm = document.getElementById("staffRegConfirm").value;

    if (password !== confirm) {
      toast("Passwords do not match.", true);
      return;
    }

    if (isOnlineMode()) {
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: { data: { name, role, barangay } }
      });
      if (error) {
        toast(error.message, true);
        return;
      }
      if (data?.user) {
        const profile = await getOrCreateCurrentProfile(data.user, { name, role, barangay });
        setCurrentUser(profile);
        showApp(profile);
        toast(`Staff account created for ${name} (${role})!`);
      }
    } else {
      const profile = { id: `usr_${Date.now()}`, name, email, role, barangay };
      await persistRecord('users', profile);
      setCurrentUser(profile);
      showApp(profile);
      toast(`Staff account registered for ${name} (Offline Mode)!`);
    }
  });
}

function bindPasswordVisibilityToggles() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-password-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const targetId = btn.getAttribute("data-target");
    let input = targetId ? document.getElementById(targetId) : null;
    if (!input) {
      const wrap = btn.closest(".password-input-wrap");
      if (wrap) input = wrap.querySelector("input");
    }
    if (!input) return;

    const icon = btn.querySelector(".material-symbols-outlined") || btn.querySelector("span");
    if (input.type === "password") {
      input.type = "text";
      if (icon) icon.textContent = "visibility_off";
      btn.setAttribute("title", "Hide password");
      btn.setAttribute("aria-label", "Hide password");
    } else {
      input.type = "password";
      if (icon) icon.textContent = "visibility";
      btn.setAttribute("title", "Show password");
      btn.setAttribute("aria-label", "Show password");
    }
  });
}

function bindThemeToggleButtons() {
  document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleTheme();
    });
  });
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
  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  document.getElementById("modal")?.addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });

  document.getElementById("menuToggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const sidebar = document.getElementById("sidebar");
    if (sidebar?.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  document.getElementById("sidebarOverlay")?.addEventListener("click", closeSidebar);

  document.getElementById("topbarBarangaySelect")?.addEventListener("change", (e) => {
    selectedBarangay = e.target.value;
    renderPage(activePage);
  });

  document.getElementById("globalSearch")?.addEventListener("input", () => {
    renderPage(activePage);
  });

  // Enable Web Push Notifications event listener
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("#enablePushNotificationsBtn");
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span><span>Enabling...</span>`;
    const granted = await requestNotificationPermission();
    if (granted) {
      await checkImmunizationAndScheduleReminders(state, getCurrentUser());
    }
    renderPage(activePage);
  });

  // Delegated page navigation for in-card action buttons (e.g. data-nav-page="schedules")
  document.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-nav-page]");
    if (!navBtn) return;
    const targetPage = navBtn.getAttribute("data-nav-page");
    if (targetPage && pages.some(p => p.id === targetPage)) {
      closeSidebar();
      activePage = targetPage;
      renderNav();
      renderPage(activePage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

function handleLogout() {
  if (isOnlineMode()) db.auth.signOut();
  setCurrentUser(null);
  showAuth();
  toast("Logged out.");
}

// -------------------------------------------------------------
// Dashboard Event Handlers (Maternal & Infant View Triggers)
// -------------------------------------------------------------
function bindDashboardEvents() {
  const current = getCurrentUser();
  const isUserParent = isParent(current);

  document.getElementById("parentAddChildBtn")?.addEventListener("click", () => {
    openParentAddChildModal();
  });

  document.getElementById("parentAddChildEmptyBtn")?.addEventListener("click", () => {
    openParentAddChildModal();
  });

  document.getElementById("parentRegisterPregnancyBtn")?.addEventListener("click", () => {
    openParentPregnancyIntakeModal();
  });

  document.querySelectorAll(".view-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const inf = state.infantRecords.find(i => i.id === id);
      if (inf) {
        openDigitalImmunizationCardModal(inf, isUserParent);
      }
    });
  });

  document.querySelectorAll(".open-prenatal-clinical-modal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const rec = state.maternalRecords.find(r => r.id === id);
      if (rec) openPrenatalClinicalRecordModal(rec);
    });
  });

  document.querySelectorAll(".edit-maternal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const rec = state.maternalRecords.find(r => r.id === id);
      if (rec) openPadreBurgosMaternalModal(rec, isUserParent);
    });
  });
}

// -------------------------------------------------------------
// Checkup History Event Handlers & Modal Binders
// -------------------------------------------------------------
function bindCheckupHistoryEvents() {
  const maternalTabBtn = document.getElementById("tabMaternalHistoryBtn");
  const infantTabBtn = document.getElementById("tabInfantHistoryBtn");
  const matSec = document.getElementById("maternalHistorySection");
  const infSec = document.getElementById("infantHistorySection");

  maternalTabBtn?.addEventListener("click", () => {
    maternalTabBtn.classList.replace("ghost-btn", "primary-btn");
    infantTabBtn?.classList.replace("primary-btn", "ghost-btn");
    matSec?.classList.remove("hidden");
    infSec?.classList.add("hidden");
  });

  infantTabBtn?.addEventListener("click", () => {
    infantTabBtn.classList.replace("ghost-btn", "primary-btn");
    maternalTabBtn?.classList.replace("primary-btn", "ghost-btn");
    infSec?.classList.remove("hidden");
    matSec?.classList.add("hidden");
  });

  document.getElementById("recordNewCheckupBtn")?.addEventListener("click", () => {
    openRecordCheckupModal();
  });

  document.querySelectorAll(".print-single-history-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      const id = btn.getAttribute("data-id");
      const record = type === "maternal"
        ? state.maternalCheckupHistory.find(h => h.id === id)
        : state.infantCheckupHistory.find(h => h.id === id);

      if (record) {
        const printHtml = generatePrintableCheckupHistoryHtml(record, type);
        openModal("Official Clinical Checkup Record", `
          <div class="space-y-4">
            ${printHtml}
            <div class="flex items-center justify-end gap-2 border-t border-line pt-3 no-print">
              <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Close</button>
              <button type="button" class="primary-btn text-xs py-1.5 px-4 flex items-center gap-1.5" onclick="window.print()">
                <span class="material-symbols-outlined text-sm">print</span>
                <span>Print Physical Document</span>
              </button>
            </div>
          </div>
        `);
      }
    });
  });
}

function openRecordCheckupModal(targetMaternalId = null) {
  const current = getCurrentUser();

  const maternalOptions = state.maternalRecords.map(r => `
    <option value="${escapeHtml(r.id)}" ${targetMaternalId === r.id ? 'selected' : ''}>
      ${escapeHtml(r.fullName)} (${escapeHtml(r.barangay)})
    </option>
  `).join('');

  const infantOptions = state.infantRecords.map(i => `
    <option value="${escapeHtml(i.id)}">
      ${escapeHtml(i.infantName)} - Mother: ${escapeHtml(i.parentName || i.motherName || 'N/A')} (${escapeHtml(i.barangay)})
    </option>
  `).join('');

  openModal("Record Clinical Checkup Visit", `
    <form id="recordCheckupForm" class="space-y-4 text-xs">
      <div class="flex gap-4 border-b border-line pb-2">
        <label class="checkbox-label font-bold">
          <input type="radio" name="checkupCategory" value="maternal" checked id="chkCatMaternal">
          <span>Maternal Prenatal Visit</span>
        </label>
        <label class="checkbox-label font-bold">
          <input type="radio" name="checkupCategory" value="infant" id="chkCatInfant">
          <span>Infant / Child Visit</span>
        </label>
      </div>

      <!-- Maternal Visit Fields -->
      <div id="maternalVisitFields" class="space-y-3">
        <div>
          <label class="block font-semibold mb-1">Select Maternal Patient *</label>
          <select id="chkMaternalSelect" class="input-field" required>
            <option value="">-- Choose Pregnant Mother --</option>
            ${maternalOptions}
          </select>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label class="block font-semibold mb-1">Visit Date *</label>
            <input type="date" id="chkMatDate" class="input-field" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div>
            <label class="block font-semibold mb-1">AOG (Weeks)</label>
            <input type="text" id="chkMatAog" class="input-field" placeholder="e.g. 24 wks">
          </div>
          <div>
            <label class="block font-semibold mb-1">Blood Pressure *</label>
            <input type="text" id="chkMatBp" class="input-field" placeholder="e.g. 120/80" required>
          </div>
          <div>
            <label class="block font-semibold mb-1">Weight (kg)</label>
            <input type="text" id="chkMatWeight" class="input-field" placeholder="e.g. 58.5">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-semibold mb-1">Fundic Height (cm)</label>
            <input type="text" id="chkMatFundic" class="input-field" placeholder="e.g. 22 cm">
          </div>
          <div>
            <label class="block font-semibold mb-1">Fetal Heart Rate (bpm)</label>
            <input type="text" id="chkMatFetal" class="input-field" placeholder="e.g. 140 bpm">
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">Clinical Assessment & Findings *</label>
          <textarea id="chkMatAssessment" class="input-field h-16" placeholder="Document clinical assessment, fundal height, danger signs, fetal movement..." required></textarea>
        </div>

        <div>
          <label class="block font-semibold mb-1">Intervention / Medication Given</label>
          <input type="text" id="chkMatTreatment" class="input-field" placeholder="e.g. Iron Folate, Calcium Carbonate, Deworming tablet, Td booster">
        </div>

        <div>
          <label class="block font-semibold mb-1">Next Scheduled Checkup Date</label>
          <input type="date" id="chkMatNextDate" class="input-field">
        </div>
      </div>

      <!-- Infant Visit Fields (Hidden initially) -->
      <div id="infantVisitFields" class="space-y-3 hidden">
        <div>
          <label class="block font-semibold mb-1">Select Infant Record *</label>
          <select id="chkInfantSelect" class="input-field">
            <option value="">-- Choose Infant --</option>
            ${infantOptions}
          </select>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block font-semibold mb-1">Visit Date *</label>
            <input type="date" id="chkInfDate" class="input-field" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div>
            <label class="block font-semibold mb-1">Weight (kg) *</label>
            <input type="text" id="chkInfWeight" class="input-field" placeholder="e.g. 6.2">
          </div>
          <div>
            <label class="block font-semibold mb-1">Height / Length (cm)</label>
            <input type="text" id="chkInfHeight" class="input-field" placeholder="e.g. 64">
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">Immunization Administered Today</label>
          <input type="text" id="chkInfVaccine" class="input-field" placeholder="e.g. Pentavalent Dose 2, OPV 2, PCV 2">
        </div>

        <div>
          <label class="block font-semibold mb-1">Assessment & Growth Progress</label>
          <textarea id="chkInfAssessment" class="input-field h-16" placeholder="Document feeding, milestones, temperature, reflexes..."></textarea>
        </div>

        <div>
          <label class="block font-semibold mb-1">Next Scheduled Immunization Date</label>
          <input type="date" id="chkInfNextDate" class="input-field">
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-line pt-3">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Cancel</button>
        <button type="submit" class="primary-btn text-xs py-1.5 px-4 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">save</span>
          <span>Save Checkup Visit</span>
        </button>
      </div>
    </form>
  `);

  const chkMatRadio = document.getElementById("chkCatMaternal");
  const chkInfRadio = document.getElementById("chkCatInfant");
  const matFields = document.getElementById("maternalVisitFields");
  const infFields = document.getElementById("infantVisitFields");
  const matSel = document.getElementById("chkMaternalSelect");
  const infSel = document.getElementById("chkInfantSelect");

  chkMatRadio?.addEventListener("change", () => {
    matFields?.classList.remove("hidden");
    infFields?.classList.add("hidden");
    if (matSel) matSel.required = true;
    if (infSel) infSel.required = false;
  });

  chkInfRadio?.addEventListener("change", () => {
    infFields?.classList.remove("hidden");
    matFields?.classList.add("hidden");
    if (infSel) infSel.required = true;
    if (matSel) matSel.required = false;
  });

  document.getElementById("recordCheckupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const isMaternal = chkMatRadio?.checked;
    const recorderName = current?.fullName || current?.name || "Barangay Midwife";

    if (isMaternal) {
      const matId = document.getElementById("chkMaternalSelect").value;
      const matRec = state.maternalRecords.find(r => r.id === matId);
      if (!matRec) {
        toast("Please select a valid maternal record.", true);
        return;
      }

      const checkupDate = document.getElementById("chkMatDate").value;
      const nextCheckupDate = document.getElementById("chkMatNextDate").value || null;
      const bloodPressure = document.getElementById("chkMatBp").value.trim();

      const newHistoryEntry = {
        id: `mchk_${Date.now()}`,
        maternalRecordId: matRec.id,
        patientName: matRec.fullName,
        barangay: matRec.barangay,
        checkupDate,
        aogWeeks: document.getElementById("chkMatAog").value.trim(),
        bloodPressure,
        weightKg: document.getElementById("chkMatWeight").value.trim(),
        fundicHeight: document.getElementById("chkMatFundic").value.trim(),
        fetalHeartRate: document.getElementById("chkMatFetal").value.trim(),
        assessment: document.getElementById("chkMatAssessment").value.trim(),
        treatmentIntervention: document.getElementById("chkMatTreatment").value.trim(),
        nextCheckupDate,
        recordedBy: recorderName,
        createdAt: new Date().toISOString()
      };

      await persistRecord("maternalCheckupHistory", newHistoryEntry);

      const updatedMaternal = {
        ...matRec,
        checkupsCompleted: (matRec.checkupsCompleted || 0) + 1,
        formDetails: {
          ...(matRec.formDetails || {}),
          latestVisitDate: checkupDate,
          bloodPressure
        }
      };
      await persistRecord("maternalRecords", updatedMaternal);

      if (nextCheckupDate) {
        const newSched = {
          id: `sch_${Date.now()}`,
          patientName: matRec.fullName,
          type: "MC",
          barangay: matRec.barangay,
          date: nextCheckupDate,
          time: "08:30",
          status: "Scheduled",
          assignedNurse: recorderName
        };
        await persistRecord("checkupSchedules", newSched);
      }

      closeModal();
      toast(`Recorded checkup visit for ${matRec.fullName}.`);
      renderPage("history");
    } else {
      const infId = document.getElementById("chkInfantSelect").value;
      const infRec = state.infantRecords.find(i => i.id === infId);
      if (!infRec) {
        toast("Please select a valid infant record.", true);
        return;
      }

      const checkupDate = document.getElementById("chkInfDate").value;
      const nextCheckupDate = document.getElementById("chkInfNextDate").value || null;
      const immunizationGiven = document.getElementById("chkInfVaccine").value.trim();

      const newHistoryEntry = {
        id: `ichk_${Date.now()}`,
        infantRecordId: infRec.id,
        infantName: infRec.infantName,
        parentName: infRec.parentName || infRec.motherName || "Parent",
        barangay: infRec.barangay,
        checkupDate,
        weightKg: document.getElementById("chkInfWeight").value.trim(),
        heightCm: document.getElementById("chkInfHeight").value.trim(),
        immunizationGiven,
        assessment: document.getElementById("chkInfAssessment").value.trim(),
        nextCheckupDate,
        recordedBy: recorderName,
        createdAt: new Date().toISOString()
      };

      await persistRecord("infantCheckupHistory", newHistoryEntry);

      const updatedInfant = {
        ...infRec,
        lastCheckup: checkupDate,
        nextCheckup: nextCheckupDate
      };
      await persistRecord("infantRecords", updatedInfant);

      if (nextCheckupDate) {
        const newSched = {
          id: `sch_${Date.now()}`,
          patientName: infRec.infantName,
          type: "CC",
          barangay: infRec.barangay,
          date: nextCheckupDate,
          time: "08:30",
          status: "Scheduled",
          assignedNurse: recorderName
        };
        await persistRecord("checkupSchedules", newSched);
      }

      closeModal();
      toast(`Recorded checkup visit for ${infRec.infantName}.`);
      renderPage("history");
    }
  });
}

// -------------------------------------------------------------
// Maternal Care Module Binders
// -------------------------------------------------------------
function bindMaternalEvents() {
  document.getElementById("addMaternalBtn")?.addEventListener("click", () => {
    openPadreBurgosMaternalModal();
  });

  document.getElementById("parentRegisterPregnancyBtn")?.addEventListener("click", () => {
    openParentPregnancyIntakeModal();
  });

  document.getElementById("emptyParentRegisterPregnancyBtn")?.addEventListener("click", () => {
    openParentPregnancyIntakeModal();
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

  document.querySelectorAll(".record-visit-maternal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openRecordCheckupModal(id);
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

function openPrenatalClinicalRecordModal(record = {}) {
  const currentRec = record || {};
  const isUserParent = isParent(getCurrentUser());

  const html = `
    <form id="prenatalClinicalModalForm" class="space-y-4">
      ${renderPrenatalClinicalRecordHtml(currentRec)}
      <div class="flex items-center justify-between border-t border-line pt-3 mt-2 no-print">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3 flex items-center gap-1" onclick="window.print()">
          <span class="material-symbols-outlined text-sm">print</span>
          <span>Print Clinical Record</span>
        </button>
        <div class="flex items-center gap-2">
          <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Close</button>
          ${!isUserParent ? `
            <button type="submit" class="primary-btn text-xs font-semibold py-1.5 px-4 rounded flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">save</span>
              <span>Save Clinical Record</span>
            </button>
          ` : ''}
        </div>
      </div>
    </form>
  `;

  openModal(`Prenatal Clinical Record - ${escapeHtml(currentRec.fullName || 'Patient')}`, html);

  if (!isUserParent) {
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
        verification_status: "Verified",
        formDetails
      };

      await persistRecord("maternalRecords", updatedRec);
      closeModal();
      toast(`Prenatal Clinical Record saved for ${updatedRec.fullName}.`);
      renderPage("maternal");
    });
  }
}

function openPadreBurgosMaternalModal(record = {}, readOnly = false) {
  const currentRec = record || {};
  const isUserParent = isParent(getCurrentUser());
  const isReadOnly = readOnly || isUserParent;

  const html = `
    <form id="pbMaternalModalForm" class="space-y-4">
      ${renderPadreBurgosMaternalFormHtml(currentRec)}
      <div class="flex items-center justify-end gap-2 border-t border-line pt-3 mt-2 no-print">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Close</button>
        ${!isReadOnly ? `
          <button type="submit" class="primary-btn text-xs font-semibold py-1.5 px-4 rounded flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">save</span>
            <span>Save Maternal Record</span>
          </button>
        ` : ''}
      </div>
    </form>
  `;

  openModal(`DOH Maternal Record - ${escapeHtml(currentRec.fullName || 'New Record')}`, html);

  if (!isReadOnly) {
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
        obL: document.getElementById("pb_obL")?.value || "0"
      };

      const updatedRec = {
        ...currentRec,
        id: currentRec.id || `mat_${Date.now()}`,
        fullName,
        lmp: lmp || currentRec.lmp,
        edd: edd || currentRec.edd,
        address: address || currentRec.address,
        barangay: currentRec.barangay || current?.barangay || "Basiao (Poblacion)",
        verification_status: "Verified",
        assignedNurse: current?.fullName || current?.name || "RHU Midwife",
        formDetails
      };

      await persistRecord("maternalRecords", updatedRec);
      closeModal();
      toast(`Padre Burgos RHU Maternal Record saved for ${updatedRec.fullName}.`);
      renderPage("maternal");
    });
  }
}

// -------------------------------------------------------------
// Infant Records Module Binders & Immunization Card Modal
// -------------------------------------------------------------
function bindInfantsEvents() {
  document.getElementById("addInfantBtn")?.addEventListener("click", () => {
    const current = getCurrentUser();
    if (isParent(current)) {
      openParentAddChildModal();
    } else {
      openDigitalImmunizationCardModal({}, false);
    }
  });

  document.querySelectorAll(".view-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const inf = state.infantRecords.find(i => i.id === id);
      if (inf) {
        const isUserParent = isParent(getCurrentUser());
        openDigitalImmunizationCardModal(inf, isUserParent);
      }
    });
  });

  document.querySelectorAll(".edit-infant-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const inf = state.infantRecords.find(i => i.id === id);
      if (inf) openDigitalImmunizationCardModal(inf, false);
    });
  });

  document.querySelectorAll(".delete-infant-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this infant record?")) {
        await deleteRecord("infantRecords", id);
        toast("Record deleted.");
        renderPage("infants");
      }
    });
  });
}

function openParentAddChildModal() {
  const current = getCurrentUser();
  const motherName = current?.name || current?.fullName || "";
  const bgy = current?.barangay || "Basiao (Poblacion)";

  openModal("Register My Child / Infant", `
    <form id="parentAddChildForm" class="space-y-3 text-xs">
      <div class="p-3 bg-pink-50 border border-pink-200 rounded-xl mb-2 flex items-center gap-2">
        <span class="material-symbols-outlined text-pink-600 text-lg">child_care</span>
        <div>
          <strong class="text-slate-900 block text-xs">Child Health Registration</strong>
          <span class="text-[11px] text-slate-600">Register your child. Your assigned Barangay Midwife will verify the record and track immunizations.</span>
        </div>
      </div>

      <div>
        <label class="block font-semibold mb-1 text-slate-700">Child's Full Name *</label>
        <input type="text" id="pac_name" class="input-field" required placeholder="e.g. Juan Santos Dela Cruz">
      </div>

      <div class="two-col">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Date of Birth *</label>
          <input type="date" id="pac_dob" class="input-field" required value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Sex *</label>
          <select id="pac_sex" class="input-field" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div class="two-col">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Mother's Full Name</label>
          <input type="text" id="pac_mother" class="input-field bg-slate-50 font-medium" value="${escapeHtml(motherName)}" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Father's Full Name</label>
          <input type="text" id="pac_father" class="input-field" placeholder="Father's full name">
        </div>
      </div>

      <div class="two-col">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Birth Weight (kg)</label>
          <input type="text" id="pac_weight" class="input-field" placeholder="e.g. 3.2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Birth Height / Length (cm)</label>
          <input type="text" id="pac_height" class="input-field" placeholder="e.g. 50">
        </div>
      </div>

      <div>
        <label class="block font-semibold mb-1 text-slate-700">Place of Birth</label>
        <input type="text" id="pac_birthplace" class="input-field" placeholder="Hospital / Birthing Facility / Residence">
      </div>

      <div class="two-col">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Barangay Residence</label>
          <input type="text" id="pac_bgy" class="input-field bg-slate-50 font-medium" value="${escapeHtml(bgy)}" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Contact Number</label>
          <input type="tel" id="pac_contact" class="input-field" placeholder="09XXXXXXXXX">
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-line pt-3 mt-3">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Cancel</button>
        <button type="submit" class="primary-btn text-xs font-semibold py-1.5 px-4 flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">save</span>
          <span>Register Child</span>
        </button>
      </div>
    </form>
  `);

  document.getElementById("parentAddChildForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const infantName = document.getElementById("pac_name").value.trim();
    const birthdate = document.getElementById("pac_dob").value;
    const sex = document.getElementById("pac_sex").value;
    const fatherName = document.getElementById("pac_father").value.trim();
    const birthWeight = document.getElementById("pac_weight").value.trim() || "3.0";
    const birthHeight = document.getElementById("pac_height").value.trim() || "50";
    const placeOfBirth = document.getElementById("pac_birthplace").value.trim();
    const contactNo = document.getElementById("pac_contact").value.trim();

    let ageMonths = 0;
    if (birthdate) {
      const dob = new Date(birthdate);
      const now = new Date();
      ageMonths = Math.max(0, (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth()));
    }

    const newInfant = {
      id: `inf_${Date.now()}`,
      user_id: current.id,
      infantName,
      birthdate,
      ageMonths,
      parentName: motherName,
      motherName,
      barangay: bgy,
      contact: contactNo,
      immunizationStatus: "Incomplete",
      verification_status: "Verified",
      formDetails: {
        sex,
        fatherName,
        birthWeight,
        birthHeight,
        placeOfBirth,
        contactNo,
        motherName
      },
      created_at: new Date().toISOString()
    };

    await persistRecord("infantRecords", newInfant);
    closeModal();
    toast(`Successfully registered ${infantName}!`);
    renderPage(activePage);
  });
}

function openParentPregnancyIntakeModal() {
  const current = getCurrentUser();
  const bgyOptions = getActiveBarangays().map(b => `<option value="${escapeHtml(b)}" ${b === current?.barangay ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('');

  openModal("Register My Pregnancy Details", `
    <form id="parentPregnancyForm" class="space-y-3 text-xs">
      <div class="p-3 bg-pink-50 border border-pink-200 rounded-xl mb-2 flex items-center gap-2">
        <span class="material-symbols-outlined text-pink-600 text-xl">pregnant_woman</span>
        <div>
          <strong class="text-slate-900 block text-xs">Maternal Health Timeline Registration</strong>
          <span class="text-[11px] text-slate-600">Register your pregnancy dates to track your EDD, 8ANC clinical visits, and maternal guidance.</span>
        </div>
      </div>

      <div class="two-col">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Mother's Full Name *</label>
          <input type="text" id="ppFullName" class="input-field" required value="${escapeHtml(current?.name || '')}" placeholder="First, Middle, Last name">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Age (years) *</label>
          <input type="number" id="ppAge" class="input-field" min="10" max="65" required placeholder="e.g. 26">
        </div>
      </div>

      <div class="two-col">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Contact / Mobile Number *</label>
          <input type="tel" id="ppContact" class="input-field" required placeholder="09xxxxxxxxx">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Barangay Station *</label>
          <select id="ppBarangay" class="input-field">${bgyOptions}</select>
        </div>
      </div>

      <div>
        <label class="block font-semibold mb-1 text-slate-700">Complete Address / Sitio</label>
        <input type="text" id="ppAddress" class="input-field" placeholder="Sitio / Street / House No.">
      </div>

      <div class="two-col">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Last Menstrual Period (LMP) *</label>
          <input type="date" id="ppLmp" class="input-field" required>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Estimated Due Date (EDD)</label>
          <input type="date" id="ppEdd" class="input-field" title="Auto-calculated from LMP or doctor's ultrasound">
        </div>
      </div>

      <div class="two-col">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Number of Pregnancies (Gravida)</label>
          <input type="number" id="ppGravida" class="input-field" min="1" value="1" placeholder="e.g. 1 for first pregnancy">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Living Children (Para)</label>
          <input type="number" id="ppPara" class="input-field" min="0" value="0">
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-line pt-3 mt-3">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Cancel</button>
        <button type="submit" class="primary-btn text-xs font-semibold py-1.5 px-4 flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">save</span>
          <span>Register Pregnancy</span>
        </button>
      </div>
    </form>
  `);

  // Auto-calculate EDD from LMP (Naegele's rule: +280 days)
  document.getElementById("ppLmp")?.addEventListener("change", (e) => {
    const lmpVal = e.target.value;
    if (lmpVal) {
      const lmpDate = new Date(lmpVal);
      if (!isNaN(lmpDate.getTime())) {
        const eddDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        const eddInput = document.getElementById("ppEdd");
        if (eddInput) eddInput.value = eddDate.toISOString().split("T")[0];
      }
    }
  });

  document.getElementById("parentPregnancyForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("ppFullName").value.trim();
    const age = parseInt(document.getElementById("ppAge").value, 10) || null;
    const contact = document.getElementById("ppContact").value.trim();
    const barangay = document.getElementById("ppBarangay").value;
    const address = document.getElementById("ppAddress").value.trim();
    const lmp = document.getElementById("ppLmp").value;
    const edd = document.getElementById("ppEdd").value;
    const gravida = document.getElementById("ppGravida").value;
    const para = document.getElementById("ppPara").value;

    const newMaternalRec = {
      id: `mat_${Date.now()}`,
      user_id: current?.id,
      fullName,
      age,
      contact,
      barangay,
      address,
      lmp,
      edd,
      pregnancyStatus: "Active",
      checkupsCompleted: 0,
      riskLevel: "Normal",
      verification_status: "Pending Clinic Verification",
      assignedNurse: "Barangay Health Station Midwife",
      notes: `Self-registered via Mother Mobile App. Gravida ${gravida}, Para ${para}.`,
      formDetails: {
        gravida,
        para,
        selfRegistered: true,
        registrationDate: new Date().toISOString().split("T")[0]
      },
      created_at: new Date().toISOString()
    };

    await persistRecord("maternalRecords", newMaternalRec);

    if (current && !current.motherId) {
      const updatedUser = { ...current, motherId: newMaternalRec.id };
      setCurrentUser(updatedUser);
      await persistRecord("users", updatedUser);
    }

    closeModal();
    toast(`Pregnancy registered for ${fullName}! Your prenatal timeline is now active.`);
    renderPage(getCurrentPage());
  });
}

function openDigitalImmunizationCardModal(infant = {}, readOnly = false) {
  const currentRec = infant || {};
  const isUserParent = isParent(getCurrentUser());
  const isReadOnly = readOnly || isUserParent;

  const html = `
    <form id="todoLigtasModalForm" class="space-y-4">
      ${renderTodoLigtasImmunizationCardHtml(currentRec, isReadOnly)}
      <div class="flex items-center justify-between border-t border-line pt-3 mt-2 no-print">
        <button type="button" class="secondary-btn text-xs py-1.5 px-3 flex items-center gap-1" onclick="window.print()">
          <span class="material-symbols-outlined text-sm">print</span>
          <span>Print Physical Card</span>
        </button>
        <div class="flex items-center gap-2">
          <button type="button" class="secondary-btn text-xs py-1.5 px-3" onclick="closeModal()">Close</button>
          ${!isReadOnly ? `
            <button type="submit" class="primary-btn text-xs font-semibold py-1.5 px-4 rounded flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">save</span>
              <span>Save Immunization Card</span>
            </button>
          ` : ''}
        </div>
      </div>
    </form>
  `;

  openModal(`DOH Todo Ligtas Immunization Card - ${escapeHtml(currentRec.infantName || 'Child Record')}`, html);

  if (!isReadOnly) {
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
        pneumoRemarks: document.getElementById("tl_pneumo_rem")?.value.trim() || ""
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
        verification_status: "Verified",
        formDetails
      };

      await persistRecord("infantRecords", updatedInfant);
      closeModal();
      toast(`Todo Ligtas Immunization Card saved for ${updatedInfant.infantName}.`);
      renderPage("infants");
    });
  }
}

function openAddScheduleModal(current) {
  const isUserParent = isParent(current);
  const bgyOptions = getActiveBarangays().map(b => `<option value="${escapeHtml(b)}" ${b === current?.barangay ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('');

  if (isUserParent) {
    const myMaternal = (state.maternalRecords || []).find(r => isMatchingParentRecord(r, current));
    const myInfants = (state.infantRecords || []).filter(i =>
      isMatchingParentRecord(i, current) || (myMaternal && i.maternalRecordId === myMaternal.id)
    );

    const todayStr = new Date().toISOString().split('T')[0];

    const patientOptions = [
      `<option value="${escapeHtml(current.name)}" data-type="MC">${escapeHtml(current.name)} (Maternal Care / Self)</option>`,
      ...myInfants.map(inf => `<option value="${escapeHtml(inf.infantName)}" data-type="CC">${escapeHtml(inf.infantName)} (Child Immunization & Health)</option>`),
      `<option value="__custom__">Other Family Member...</option>`
    ].join('');

    openModal("Request Check-up Appointment", `
      <form id="schedForm" class="modal-form space-y-3 text-xs">
        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <p class="font-bold mb-0.5">Appointment Request</p>
          <p>Submit your preferred date for clinical consultation or child vaccination. Your assigned Barangay Midwife will review and confirm this schedule.</p>
        </div>

        <label>Who is this appointment for? *
          <select id="sPatientSelect" class="input-field">
            ${patientOptions}
          </select>
        </label>

        <div id="sPatientCustomWrap" class="hidden">
          <label>Patient Full Name *
            <input type="text" id="sPatientCustom" placeholder="Enter patient's full name">
          </label>
        </div>

        <label>Care Category
          <select id="sType" class="input-field">
            <option value="MC">MC - Maternal Prenatal Care</option>
            <option value="CC">CC - Child Immunization & Growth Monitoring</option>
          </select>
        </label>

        <label>Barangay Health Station
          <select id="sBarangay" class="input-field">${bgyOptions}</select>
        </label>

        <div class="two-col">
          <label>Preferred Date *
            <input type="date" id="sDate" required min="${todayStr}" value="${todayStr}">
          </label>
          <label>Preferred Time Slot
            <select id="sTime" class="input-field">
              <option value="08:00 AM">08:00 AM - Morning Clinic</option>
              <option value="09:30 AM" selected>09:30 AM - Morning Clinic</option>
              <option value="11:00 AM">11:00 AM - Late Morning</option>
              <option value="01:30 PM">01:30 PM - Afternoon Clinic</option>
              <option value="03:00 PM">03:00 PM - Afternoon Clinic</option>
            </select>
          </label>
        </div>

        <label>Purpose / Chief Complaint (Optional)
          <textarea id="sNotes" rows="2" placeholder="e.g. 2nd prenatal check-up, Penta 2 vaccination, vitamins refill..."></textarea>
        </label>

        <button class="primary-btn full-btn mt-2" type="submit">Submit Appointment Request</button>
      </form>
    `);

    const selectEl = document.getElementById("sPatientSelect");
    const customWrap = document.getElementById("sPatientCustomWrap");
    const typeSelect = document.getElementById("sType");

    selectEl?.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "__custom__") {
        customWrap?.classList.remove("hidden");
        document.getElementById("sPatientCustom")?.focus();
      } else {
        customWrap?.classList.add("hidden");
        const opt = e.target.selectedOptions[0];
        const assignedType = opt?.getAttribute("data-type");
        if (assignedType && typeSelect) {
          typeSelect.value = assignedType;
        }
      }
    });

    document.getElementById("schedForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      let patientName = selectEl ? selectEl.value : "";
      if (patientName === "__custom__") {
        patientName = (document.getElementById("sPatientCustom")?.value || "").trim();
        if (!patientName) {
          toast("Please enter patient name.", true);
          return;
        }
      }

      const notes = (document.getElementById("sNotes")?.value || "").trim();
      const newSched = {
        id: `sch_${Date.now()}`,
        patientName,
        type: document.getElementById("sType").value,
        barangay: document.getElementById("sBarangay").value,
        date: document.getElementById("sDate").value,
        time: document.getElementById("sTime").value,
        status: "Requested",
        notes,
        assignedNurse: "Barangay Health Station Midwife"
      };

      await persistRecord("checkupSchedules", newSched);
      closeModal();
      toast(`Appointment requested for ${patientName}! Your midwife will review this schedule.`);
      renderPage("schedules");
    });
    return;
  }

  // Staff Schedule Modal
  openModal("Schedule Check-up Appointment", `
    <form id="schedForm" class="modal-form space-y-3 text-xs">
      <label>Patient Name * <input type="text" id="sPatient" required placeholder="Patient full name"></label>
      <label>Care Type 
        <select id="sType" class="input-field">
          <option value="MC">MC - Maternal Care</option>
          <option value="CC">CC - Child Immunization</option>
        </select>
      </label>
      <label>Barangay Assignment 
        <select id="sBarangay" class="input-field">${bgyOptions}</select>
      </label>
      <div class="two-col">
        <label>Check-up Date * <input type="date" id="sDate" required value="${new Date().toISOString().split('T')[0]}"></label>
        <label>Time Slot <input type="time" id="sTime" value="08:30"></label>
      </div>
      <button class="primary-btn full-btn mt-2" type="submit">Confirm Check-up Schedule</button>
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
      status: "Scheduled",
      assignedNurse: current?.fullName || current?.name || "Barangay Midwife"
    };
    await persistRecord("checkupSchedules", newSched);
    closeModal();
    toast("Check-up appointment scheduled.");
    renderPage("schedules");
  });
}

// -------------------------------------------------------------
// Schedules Module Binders
// -------------------------------------------------------------
function bindSchedulesEvents() {
  const handleOpenScheduleModal = () => {
    const current = getCurrentUser();
    openAddScheduleModal(current);
  };

  document.getElementById("addScheduleBtn")?.addEventListener("click", handleOpenScheduleModal);
  document.getElementById("emptyScheduleRequestBtn")?.addEventListener("click", handleOpenScheduleModal);

  document.querySelectorAll(".delete-schedule-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to remove this checkup schedule?")) {
        await deleteRecord("checkupSchedules", id);
        toast("Schedule removed.");
        renderPage("schedules");
      }
    });
  });
}

// -------------------------------------------------------------
// Monthly Reports Module Binders
// -------------------------------------------------------------
function bindReportsEvents() {
  document.getElementById("reportMonthSelect")?.addEventListener("change", (e) => {
    selectedReportMonth = e.target.value;
    renderPage("reports");
  });

  document.getElementById("reportYearSelect")?.addEventListener("change", (e) => {
    selectedReportYear = e.target.value;
    renderPage("reports");
  });

  document.getElementById("generateReportBtn")?.addEventListener("click", async () => {
    const current = getCurrentUser();
    const targetBgy = selectedBarangay || "All Barangays";
    const currMonth = `${selectedReportYear}-${selectedReportMonth}`;

    const matchBgy = (rBgy, tBgy) => {
      if (!tBgy || tBgy === "All Barangays") return true;
      if (!rBgy) return true;
      const a = String(rBgy).toLowerCase().trim();
      const b = String(tBgy).toLowerCase().trim();
      return a === b || a.includes(b) || b.includes(a);
    };

    const mRecs = state.maternalRecords.filter(r => matchBgy(r.barangay, targetBgy));
    const iRecs = state.infantRecords.filter(r => matchBgy(r.barangay, targetBgy));

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

    toast(`Successfully generated MC (${mRecs.length}) and CC (${iRecs.length}) reports for ${currMonth} (${targetBgy}).`);
    renderPage("reports");
  });

  document.querySelectorAll(".export-excel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const repId = btn.getAttribute("data-id");
      const rep = state.monthlyReports.find(r => r.id === repId);
      if (!rep) return;

      const matchBgy = (rBgy, tBgy) => {
        if (!tBgy || tBgy === "All Barangays") return true;
        if (!rBgy) return true;
        const a = String(rBgy).toLowerCase().trim();
        const b = String(tBgy).toLowerCase().trim();
        return a === b || a.includes(b) || b.includes(a);
      };

      const records = rep.type === "MC"
        ? state.maternalRecords.filter(r => matchBgy(r.barangay, rep.barangay))
        : state.infantRecords.filter(r => matchBgy(r.barangay, rep.barangay));

      exportMcCcReportToExcel(rep.type, rep.barangay, rep.month, records, rep);
    });
  });

  document.querySelectorAll(".delete-report-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const repId = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this report?")) {
        await deleteRecord("monthlyReports", repId);
        toast("Report deleted.");
        renderPage("reports");
      }
    });
  });
}

// -------------------------------------------------------------
// Backup Module Binders
// -------------------------------------------------------------
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
