/**
 * Role-Based Dashboards (Admin, Doctor, MHO, Nurse/Midwife, Parent)
 * Clean, light, modern healthcare aesthetic with crisp SVG pixel art accents.
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { isParent, isNurse, isMho, isDoctor, isAdmin } from '../auth.js';
import { renderPixelParentChild, renderPixelHeart, renderPixelCross, renderPixelRattle } from './pixelArt.js';

export function renderDashboardView(state, currentUser, selectedBarangay, visibleBarangaysList, searchTerm = '') {
  if (isAdmin(currentUser)) {
    return renderAdminDashboard(state, currentUser);
  }
  if (isDoctor(currentUser)) {
    return renderDoctorDashboard(state, currentUser, selectedBarangay, searchTerm);
  }
  if (isMho(currentUser)) {
    return renderMhoDashboard(state, currentUser, selectedBarangay, searchTerm);
  }
  if (isNurse(currentUser)) {
    return renderNurseDashboard(state, currentUser);
  }
  return renderParentDashboard(state, currentUser);
}

// -------------------------------------------------------------
// 1. ADMIN DASHBOARD
// -------------------------------------------------------------
function renderAdminDashboard(state, currentUser) {
  const users = state.users || [];
  const maternal = state.maternalRecords || [];
  const infants = state.infantRecords || [];
  const reports = state.monthlyReports || [];

  const nurses = users.filter(u => u.role === 'Nurse / Midwife' || u.role === 'Nurse' || u.role === 'Midwife');
  const doctors = users.filter(u => u.role === 'Doctor');
  const mhos = users.filter(u => u.role === 'MHO');
  const parents = users.filter(u => u.role === 'Mother / Parent');

  return `
    <div class="space-y-6">
      <!-- Admin Welcome Banner with Clean Light Aesthetic & Pixel Art -->
      <div class="panel bg-gradient-to-r from-sky-50 via-white to-indigo-50 border border-sky-200/80 p-6 shadow-sm relative overflow-hidden rounded-2xl">
        <div class="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-flex items-center gap-1 bg-sky-100 text-sky-800 border border-sky-300/60 text-[11px] px-2.5 py-0.5 rounded-md font-semibold tracking-wide">
                <span class="material-symbols-outlined text-xs">admin_panel_settings</span>
                <span>System Administration</span>
              </span>
              <span class="text-xs text-slate-500 font-medium">Padre Burgos RHU Central Command</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">System & Account Management</h2>
            <p class="text-xs text-slate-600 mt-1">Full administrative control over healthcare staff credentials, access permissions, and database operations.</p>
          </div>
          <div class="flex items-center gap-3 p-2 bg-white/80 rounded-xl border border-sky-100 shadow-2xs">
            ${renderPixelParentChild(44)}
          </div>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Total Accounts</span>
            <span class="material-symbols-outlined text-indigo-600 text-xl">group</span>
          </div>
          <strong class="text-2xl font-bold text-text">${users.length}</strong>
          <small class="text-[11px] text-text-muted mt-1 block">Active system users</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Nurses & Midwives</span>
            <span class="material-symbols-outlined text-emerald-600 text-xl">clinical_notes</span>
          </div>
          <strong class="text-2xl font-bold text-text">${nurses.length}</strong>
          <small class="text-[11px] text-emerald-600 font-semibold mt-1 block">Assigned to stations</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Doctors & MHO</span>
            <span class="material-symbols-outlined text-blue-600 text-xl">medical_services</span>
          </div>
          <strong class="text-2xl font-bold text-text">${doctors.length + mhos.length}</strong>
          <small class="text-[11px] text-blue-600 font-semibold mt-1 block">Clinical overseers</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Parent Accounts</span>
            <span class="material-symbols-outlined text-pink-600 text-xl">family_restroom</span>
          </div>
          <strong class="text-2xl font-bold text-text">${parents.length}</strong>
          <small class="text-[11px] text-pink-600 font-semibold mt-1 block">Registered mothers</small>
        </div>
      </div>

      <!-- Quick Actions & System User Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="panel lg:col-span-2">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-line">
            <h3 class="text-sm font-bold text-text flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600 text-lg">manage_accounts</span>
              <span>Recent User Accounts & Station Assignments</span>
            </h3>
            <span class="text-xs text-text-muted font-medium">${users.length} accounts</span>
          </div>
          <div class="table-container overflow-x-auto">
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th>Assigned Barangay</th>
                </tr>
              </thead>
              <tbody>
                ${users.slice(0, 6).map(u => `
                  <tr>
                    <td class="font-bold text-text">${escapeHtml(u.name || 'User')}</td>
                    <td class="text-text-muted">${escapeHtml(u.email || '-')}</td>
                    <td><span class="badge badge-info text-[10px]">${escapeHtml(u.role || 'Staff')}</span></td>
                    <td>${escapeHtml(u.barangay || 'All Barangays')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel space-y-4">
          <h3 class="text-sm font-bold text-text flex items-center gap-2 pb-2 border-b border-line">
            <span class="material-symbols-outlined text-emerald-600 text-lg">database</span>
            <span>Database Status & Tools</span>
          </h3>
          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-1 border-b border-line">
              <span class="text-text-muted">Maternal Records:</span>
              <strong class="text-text">${maternal.length} entries</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-line">
              <span class="text-text-muted">Infant Records:</span>
              <strong class="text-text">${infants.length} entries</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-line">
              <span class="text-text-muted">Monthly Reports:</span>
              <strong class="text-text">${reports.length} generated</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-line">
              <span class="text-text-muted">Padre Burgos Barangays:</span>
              <strong class="text-emerald-600 font-bold">22 Active Stations</strong>
            </div>
          </div>
          <div class="pt-2">
            <button type="button" class="primary-btn full-btn text-xs py-2" onclick="document.querySelector('[data-page=users]')?.click()">
              <span class="material-symbols-outlined text-sm">person_add</span>
              <span>Manage User Roles</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 2. DOCTOR DASHBOARD (Municipality-Wide Clinical Oversight)
// -------------------------------------------------------------
function renderDoctorDashboard(state, currentUser, selectedBarangay, searchTerm = '') {
  const matchBgy = (rBgy, tBgy) => {
    if (!tBgy || tBgy === "All Barangays") return true;
    if (!rBgy) return true;
    const a = String(rBgy).toLowerCase().trim();
    const b = String(tBgy).toLowerCase().trim();
    return a === b || a.includes(b) || b.includes(a);
  };

  const allMaternal = state.maternalRecords || [];
  const allInfants = state.infantRecords || [];
  const mRecs = allMaternal.filter(r => matchBgy(r.barangay, selectedBarangay));
  const iRecs = allInfants.filter(r => matchBgy(r.barangay, selectedBarangay));

  const highRisk = mRecs.filter(r => (r.riskLevel || "").toLowerCase().includes("high") || (r.riskLevel || "").toLowerCase().includes("elevated"));
  const ficCount = iRecs.filter(i => (i.immunizationStatus || "").includes("FIC") || (i.immunizationStatus || "").includes("Fully")).length;

  return `
    <div class="space-y-6">
      <!-- Doctor Banner with Clean Light Aesthetic & Pixel Art -->
      <div class="panel bg-gradient-to-r from-blue-50 via-white to-sky-50 border border-blue-200/80 p-6 shadow-sm rounded-2xl">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300/60 text-[11px] px-2.5 py-0.5 rounded-md font-semibold tracking-wide">
                <span class="material-symbols-outlined text-xs">stethoscope</span>
                <span>Doctor Oversight</span>
              </span>
              <span class="text-xs text-slate-500 font-medium">Padre Burgos Clinical Monitoring</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Physician Clinical Oversight Dashboard</h2>
            <p class="text-xs text-slate-600 mt-1">Cross-barangay clinical health indicators, high-risk triage, and maternal-infant trend monitoring across all 22 barangays.</p>
          </div>
          <div class="flex items-center gap-3 p-2 bg-white/80 rounded-xl border border-blue-100 shadow-2xs">
            ${renderPixelParentChild(44)}
          </div>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Total Pregnant Mothers</span>
            <span class="material-symbols-outlined text-pink-600 text-xl">pregnant_woman</span>
          </div>
          <strong class="text-2xl font-bold text-text">${mRecs.length}</strong>
          <small class="text-[11px] text-text-muted mt-1 block">Active across ${escapeHtml(selectedBarangay)}</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">High-Risk Cases</span>
            <span class="material-symbols-outlined text-red-600 text-xl">warning</span>
          </div>
          <strong class="text-2xl font-bold text-red-600">${highRisk.length}</strong>
          <small class="text-[11px] text-red-600 font-semibold mt-1 block">Requires physician monitoring</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Registered Children</span>
            <span class="material-symbols-outlined text-indigo-600 text-xl">child_care</span>
          </div>
          <strong class="text-2xl font-bold text-text">${iRecs.length}</strong>
          <small class="text-[11px] text-text-muted mt-1 block">0-14yo monitored children</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Fully Immunized (FIC)</span>
            <span class="material-symbols-outlined text-emerald-600 text-xl">shield_with_heart</span>
          </div>
          <strong class="text-2xl font-bold text-emerald-600">${ficCount}</strong>
          <small class="text-[11px] text-emerald-600 font-semibold mt-1 block">${iRecs.length > 0 ? Math.round((ficCount / iRecs.length) * 100) : 0}% coverage rate</small>
        </div>
      </div>

      <!-- High-Risk Maternal Priority Triage -->
      <div class="panel">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-line">
          <h3 class="text-sm font-bold text-text flex items-center gap-2">
            <span class="material-symbols-outlined text-red-600 text-lg">emergency</span>
            <span>High-Risk Maternal Patient Priority Queue</span>
          </h3>
          <span class="badge badge-high text-[10px]">${highRisk.length} Alert Cases</span>
        </div>
        <div class="table-container overflow-x-auto">
          <table class="data-table text-xs">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Barangay</th>
                <th>Age</th>
                <th>EDD (Expected Delivery)</th>
                <th>Risk Level</th>
                <th>Assigned Midwife</th>
                <th>Clinical Action</th>
              </tr>
            </thead>
            <tbody>
              ${highRisk.length === 0 ? `
                <tr><td colspan="7" class="text-center py-6 text-emerald-600 font-semibold">No high-risk maternal alerts for ${escapeHtml(selectedBarangay)}.</td></tr>
              ` : highRisk.map(r => `
                <tr>
                  <td class="font-bold text-text">${escapeHtml(r.fullName)}</td>
                  <td><span class="badge badge-info text-[10px]">${escapeHtml(r.barangay)}</span></td>
                  <td>${r.age || '-'}</td>
                  <td>${formatDate(r.edd)}</td>
                  <td><span class="badge badge-high text-[10px]">${escapeHtml(r.riskLevel || 'High Risk')}</span></td>
                  <td class="text-text-muted">${escapeHtml(r.assignedNurse || 'RHU Staff')}</td>
                  <td>
                    <button type="button" class="primary-btn sm-btn text-[11px] py-1 px-2.5" onclick="document.querySelector('[data-page=maternal]')?.click()">
                      Review Clinical Record
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 3. MHO DASHBOARD (Municipality-Wide Record & Submission Monitor)
// -------------------------------------------------------------
function renderMhoDashboard(state, currentUser, selectedBarangay, searchTerm = '') {
  const matchBgy = (rBgy, tBgy) => {
    if (!tBgy || tBgy === "All Barangays") return true;
    if (!rBgy) return true;
    const a = String(rBgy).toLowerCase().trim();
    const b = String(tBgy).toLowerCase().trim();
    return a === b || a.includes(b) || b.includes(a);
  };

  const maternal = (state.maternalRecords || []).filter(r => matchBgy(r.barangay, selectedBarangay));
  const infants = (state.infantRecords || []).filter(r => matchBgy(r.barangay, selectedBarangay));
  const reports = (state.monthlyReports || []).filter(r => matchBgy(r.barangay, selectedBarangay));

  const pendingReports = reports.filter(r => r.status === 'Draft' || r.status === 'Submitted' || r.status === 'Under Review');
  const reviewedReports = reports.filter(r => r.status === 'Reviewed' || r.status === 'Completed');

  return `
    <div class="space-y-6">
      <!-- MHO Banner with Clean Light Aesthetic & Pixel Art -->
      <div class="panel bg-gradient-to-r from-teal-50 via-white to-emerald-50 border border-teal-200/80 p-6 shadow-sm rounded-2xl">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-flex items-center gap-1 bg-teal-100 text-teal-800 border border-teal-300/60 text-[11px] px-2.5 py-0.5 rounded-md font-semibold tracking-wide">
                <span class="material-symbols-outlined text-xs">local_hospital</span>
                <span>MHO Administration</span>
              </span>
              <span class="text-xs text-slate-500 font-medium">Municipal Health Officer</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Barangay Records & Submission Monitor</h2>
            <p class="text-xs text-slate-600 mt-1">Review midwife clinical submissions, validate monthly DOH care reports, and monitor submission compliance.</p>
          </div>
          <div class="flex items-center gap-3 p-2 bg-white/80 rounded-xl border border-teal-100 shadow-2xs">
            ${renderPixelParentChild(44)}
          </div>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Total Maternal Records</span>
            <span class="material-symbols-outlined text-teal-600 text-xl">pregnant_woman</span>
          </div>
          <strong class="text-2xl font-bold text-text">${maternal.length}</strong>
          <small class="text-[11px] text-text-muted mt-1 block">Active across stations</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Total Infant Records</span>
            <span class="material-symbols-outlined text-indigo-600 text-xl">child_care</span>
          </div>
          <strong class="text-2xl font-bold text-text">${infants.length}</strong>
          <small class="text-[11px] text-text-muted mt-1 block">Pediatric records</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Submissions Pending Review</span>
            <span class="material-symbols-outlined text-amber-600 text-xl">pending_actions</span>
          </div>
          <strong class="text-2xl font-bold text-amber-600">${pendingReports.length}</strong>
          <small class="text-[11px] text-amber-600 font-semibold mt-1 block">Awaiting MHO sign-off</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Reviewed & Finalized</span>
            <span class="material-symbols-outlined text-emerald-600 text-xl">task_alt</span>
          </div>
          <strong class="text-2xl font-bold text-emerald-600">${reviewedReports.length}</strong>
          <small class="text-[11px] text-emerald-600 font-semibold mt-1 block">Completed DOH submissions</small>
        </div>
      </div>

      <!-- Submission Status Monitor -->
      <div class="panel">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-line">
          <h3 class="text-sm font-bold text-text flex items-center gap-2">
            <span class="material-symbols-outlined text-teal-600 text-lg">assessment</span>
            <span>Monthly Barangay Health Station Report Submissions</span>
          </h3>
          <button type="button" class="primary-btn sm-btn text-xs" onclick="document.querySelector('[data-page=reports]')?.click()">
            <span class="material-symbols-outlined text-sm">add_chart</span>
            <span>Generate Monthly Reports</span>
          </button>
        </div>
        <div class="table-container overflow-x-auto">
          <table class="data-table text-xs">
            <thead>
              <tr>
                <th>Report Type</th>
                <th>Barangay Station</th>
                <th>Reporting Period</th>
                <th>Total Patients</th>
                <th>Prepared By</th>
                <th>Submission Status</th>
              </tr>
            </thead>
            <tbody>
              ${reports.length === 0 ? `
                <tr><td colspan="6" class="text-center py-6 text-text-muted">No monthly report submissions recorded yet.</td></tr>
              ` : reports.slice(0, 8).map(r => `
                <tr>
                  <td><strong>${r.type === 'MC' ? 'MC - Maternal Care' : 'CC - Child Immunization'}</strong></td>
                  <td><span class="badge badge-info text-[10px]">${escapeHtml(r.barangay)}</span></td>
                  <td>${escapeHtml(r.month || '-')}</td>
                  <td>${r.total || 0} records</td>
                  <td class="text-text-muted">${escapeHtml(r.preparedBy || 'RHU Midwife')}</td>
                  <td>
                    <span class="badge ${r.status === 'Completed' || r.status === 'Reviewed' ? 'badge-complete' : 'badge-pending'} text-[10px]">
                      ${escapeHtml(r.status || 'Submitted')}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 4. NURSE / MIDWIFE DASHBOARD (Assigned Barangay Focus)
// -------------------------------------------------------------
function renderNurseDashboard(state, currentUser) {
  const bgy = currentUser?.barangay || "Basiao (Poblacion)";
  const maternal = (state.maternalRecords || []).filter(r => r.barangay === bgy);
  const infants = (state.infantRecords || []).filter(r => r.barangay === bgy);
  const schedules = (state.checkupSchedules || []).filter(s => s.barangay === bgy);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(s => s.date === todayStr);
  const upcomingSchedules = schedules.filter(s => s.date && s.date > todayStr);

  return `
    <div class="space-y-6">
      <!-- Nurse Banner with Clean Light Aesthetic & Pixel Art -->
      <div class="panel bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-200/80 p-6 shadow-sm rounded-2xl">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300/60 text-[11px] px-2.5 py-0.5 rounded-md font-semibold tracking-wide">
                <span class="material-symbols-outlined text-xs">health_and_safety</span>
                <span>Barangay Health Station</span>
              </span>
              <span class="text-xs text-slate-500 font-medium">Assigned: ${escapeHtml(bgy)}</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Barangay ${escapeHtml(bgy)} Clinical Station</h2>
            <p class="text-xs text-slate-600 mt-1">Managing maternal health records, newborn immunizations, and clinical appointments for ${escapeHtml(bgy)}.</p>
          </div>
          <div class="flex items-center gap-3 p-2 bg-white/80 rounded-xl border border-emerald-100 shadow-2xs">
            ${renderPixelParentChild(44)}
          </div>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Assigned Mothers</span>
            <span class="material-symbols-outlined text-pink-600 text-xl">pregnant_woman</span>
          </div>
          <strong class="text-2xl font-bold text-text">${maternal.length}</strong>
          <small class="text-[11px] text-pink-600 font-semibold mt-1 block">Registered in ${escapeHtml(bgy)}</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Assigned Children</span>
            <span class="material-symbols-outlined text-indigo-600 text-xl">child_care</span>
          </div>
          <strong class="text-2xl font-bold text-text">${infants.length}</strong>
          <small class="text-[11px] text-indigo-600 font-semibold mt-1 block">Routine & school-age</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Today's Checkups</span>
            <span class="material-symbols-outlined text-emerald-600 text-xl">today</span>
          </div>
          <strong class="text-2xl font-bold text-emerald-600">${todaySchedules.length}</strong>
          <small class="text-[11px] text-emerald-600 font-semibold mt-1 block">Scheduled for today</small>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-text-muted">Upcoming Visits</span>
            <span class="material-symbols-outlined text-amber-600 text-xl">calendar_month</span>
          </div>
          <strong class="text-2xl font-bold text-amber-600">${upcomingSchedules.length}</strong>
          <small class="text-[11px] text-amber-600 font-semibold mt-1 block">Future appointments</small>
        </div>
      </div>

      <!-- Quick Record & Appointment Queue -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="panel">
          <div class="flex items-center justify-between mb-3 pb-2 border-b border-line">
            <h3 class="text-sm font-bold text-text flex items-center gap-2">
              <span class="material-symbols-outlined text-pink-600 text-lg">pregnant_woman</span>
              <span>Recent Pregnant Mothers (${escapeHtml(bgy)})</span>
            </h3>
            <button type="button" class="ghost-btn sm-btn text-xs" onclick="document.querySelector('[data-page=maternal]')?.click()">View All</button>
          </div>
          <div class="table-container overflow-x-auto">
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th>Mother Name</th>
                  <th>Age</th>
                  <th>EDD</th>
                  <th>Visits</th>
                </tr>
              </thead>
              <tbody>
                ${maternal.slice(0, 5).map(m => `
                  <tr>
                    <td class="font-bold text-text">${escapeHtml(m.fullName)}</td>
                    <td>${m.age || '-'}</td>
                    <td>${formatDate(m.edd)}</td>
                    <td><span class="badge badge-info text-[10px]">${m.checkupsCompleted || 0} / 8</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <div class="flex items-center justify-between mb-3 pb-2 border-b border-line">
            <h3 class="text-sm font-bold text-text flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600 text-lg">child_care</span>
              <span>Recent Child Records (${escapeHtml(bgy)})</span>
            </h3>
            <button type="button" class="ghost-btn sm-btn text-xs" onclick="document.querySelector('[data-page=infants]')?.click()">View All</button>
          </div>
          <div class="table-container overflow-x-auto">
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th>Child Name</th>
                  <th>Age</th>
                  <th>Mother</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${infants.slice(0, 5).map(i => `
                  <tr>
                    <td class="font-bold text-text">${escapeHtml(i.infantName)}</td>
                    <td>${i.ageMonths || 0} mos</td>
                    <td class="text-text-muted">${escapeHtml(i.parentName || i.motherName || '-')}</td>
                    <td>
                      <span class="badge ${(i.immunizationStatus || '').includes('FIC') ? 'badge-complete' : 'badge-pending'} text-[10px]">
                        ${escapeHtml(i.immunizationStatus || 'Incomplete')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 5. PARENT / MOTHER MOBILE DASHBOARD (View-Only Portal)
// -------------------------------------------------------------
function isMatchingParentRecord(record, currentUser) {
  if (!currentUser || !record) return false;
  if (record.user_id && record.user_id === currentUser.id) return true;
  if (currentUser.motherId && (record.id === currentUser.motherId || record.maternalRecordId === currentUser.motherId || record.motherId === currentUser.motherId)) return true;

  const targetName = (currentUser.name || currentUser.fullName || '').toLowerCase().trim();
  if (!targetName) return false;

  const recName = (record.fullName || record.parentName || record.motherName || '').toLowerCase().trim();
  if (!recName) return false;

  if (recName === targetName) return true;
  if (recName.includes(targetName) || targetName.includes(recName)) return true;

  const parts = targetName.split(/\s+/).filter(p => p.length > 2);
  if (parts.length >= 2 && parts.every(p => recName.includes(p))) return true;

  return false;
}

function renderParentDashboard(state, currentUser) {
  const motherName = (currentUser?.name || currentUser?.fullName || '').toLowerCase().trim();
  
  // Robust maternal matching
  let myMaternal = (state.maternalRecords || []).find(r => isMatchingParentRecord(r, currentUser));
  if (!myMaternal && state.maternalRecords?.length > 0) {
    // If exact name match wasn't found, try matching by email or phone
    myMaternal = state.maternalRecords.find(r => r.contact && currentUser.contact && r.contact.replace(/\D/g, '') === currentUser.contact.replace(/\D/g, ''));
  }

  // Robust infant matching
  let myInfants = (state.infantRecords || []).filter(i => 
    isMatchingParentRecord(i, currentUser) || 
    (myMaternal && i.maternalRecordId === myMaternal.id)
  );

  const mySchedules = (state.checkupSchedules || []).filter(s =>
    (s.patientName && s.patientName.toLowerCase().trim() === motherName) ||
    (myInfants.some(inf => inf.infantName && s.patientName && s.patientName.toLowerCase().trim() === inf.infantName.toLowerCase().trim()))
  );

  const completedVisits = myMaternal?.checkupsCompleted || 0;
  const visitProgress = Math.min(100, Math.round((completedVisits / 8) * 100));

  return `
    <div class="space-y-5 max-w-3xl mx-auto">
      <!-- Mother Welcome Banner with Clean Light Aesthetic & Pixel Art -->
      <div class="panel bg-gradient-to-r from-pink-50 via-white to-rose-50 border border-pink-200/80 p-6 shadow-sm rounded-2xl relative overflow-hidden">
        <div class="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-flex items-center gap-1 bg-pink-100 text-pink-800 border border-pink-300/60 text-[11px] px-2.5 py-0.5 rounded-md font-semibold tracking-wide">
                <span class="material-symbols-outlined text-xs">favorite</span>
                <span>Mother & Child Health Portal</span>
              </span>
              <span class="text-xs text-slate-500 font-medium">Barangay ${escapeHtml(currentUser?.barangay || 'Padre Burgos')}</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Welcome, ${escapeHtml(currentUser?.name || 'Mother')}!</h2>
            <p class="text-xs text-slate-600 mt-1">Your personal maternal care timeline and digital child immunization health cards.</p>
          </div>
          <div class="flex items-center gap-3 p-2 bg-white/90 rounded-2xl border border-pink-100 shadow-2xs">
            ${renderPixelParentChild(52)}
          </div>
        </div>
      </div>

      <!-- Maternal Care Milestone Card -->
      <div class="panel p-5 rounded-2xl border border-pink-100 bg-surface">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-line">
          <h3 class="text-sm font-bold text-text flex items-center gap-2">
            <span class="material-symbols-outlined text-pink-600 text-xl">pregnant_woman</span>
            <span>My Maternal Care Record</span>
          </h3>
          <span class="badge badge-info text-xs">${escapeHtml(myMaternal?.riskLevel || 'Normal')}</span>
        </div>

        ${myMaternal ? `
          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-pink-50/60 p-3 rounded-xl border border-pink-100/80">
              <div>
                <span class="text-text-muted block text-[11px]">Expected Delivery (EDD):</span>
                <strong class="text-brand-primary text-xs">${formatDate(myMaternal.edd)}</strong>
              </div>
              <div>
                <span class="text-text-muted block text-[11px]">Last Period (LMP):</span>
                <strong class="text-text text-xs">${formatDate(myMaternal.lmp)}</strong>
              </div>
              <div>
                <span class="text-text-muted block text-[11px]">Completed Visits:</span>
                <strong class="text-emerald-700 text-xs">${completedVisits} of 8 ANC Visits</strong>
              </div>
              <div>
                <span class="text-text-muted block text-[11px]">Assigned Midwife:</span>
                <strong class="text-text text-xs">${escapeHtml(myMaternal.assignedNurse || 'RHU Midwife')}</strong>
              </div>
            </div>

            <!-- 8ANC Progress Bar -->
            <div class="space-y-1 pt-1">
              <div class="flex justify-between text-[11px] text-text-muted">
                <span>DOH 8-Antenatal Care Target:</span>
                <span class="font-bold text-text">${visitProgress}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div class="bg-gradient-to-r from-pink-500 to-rose-600 h-2.5 rounded-full transition-all duration-500" style="width: ${visitProgress}%"></div>
              </div>
            </div>

            <!-- Quick View Card Actions for Mother -->
            <div class="flex items-center gap-2 pt-2 border-t border-pink-100">
              <button type="button" class="primary-btn sm-btn open-prenatal-clinical-modal-btn text-xs py-1.5 px-3" data-id="${escapeHtml(myMaternal.id)}">
                <span class="material-symbols-outlined text-sm">clinical_notes</span>
                <span>View Clinical Record</span>
              </button>
              <button type="button" class="secondary-btn sm-btn edit-maternal-btn text-xs py-1.5 px-3" data-id="${escapeHtml(myMaternal.id)}">
                <span class="material-symbols-outlined text-sm">edit_document</span>
                <span>View DOH Maternal Card</span>
              </button>
            </div>
          </div>
        ` : `
          <div class="text-center py-6 text-text-muted text-xs">
            <p class="mb-1 font-semibold text-text">No Maternal Record on File Yet</p>
            <p>Your assigned Barangay Midwife will fill up and register your official DOH maternal record during your initial prenatal checkup.</p>
          </div>
        `}
      </div>

      <!-- Child Immunization Cards (Clickable) -->
      <div class="panel p-5 rounded-2xl border border-indigo-100 bg-surface">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-3 pb-2 border-b border-line">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-xl">child_care</span>
            <h3 class="text-sm font-bold text-text">My Children's Immunization Cards (Todo Ligtas)</h3>
            <span class="badge badge-info text-[10px]">${myInfants.length} registered</span>
          </div>
          <button type="button" class="primary-btn sm-btn text-xs py-1 px-3 flex items-center gap-1" id="parentAddChildBtn">
            <span class="material-symbols-outlined text-sm">add_circle</span>
            <span>Add Child</span>
          </button>
        </div>

        ${myInfants.length === 0 ? `
          <div class="text-center py-6 text-text-muted text-xs">
            <p class="mb-1 font-semibold text-text">No Child Records on File Yet</p>
            <p class="mb-3">You can register your newborn or child directly to start monitoring vaccinations and checkups.</p>
            <button type="button" class="primary-btn sm-btn text-xs py-1.5 px-3 inline-flex items-center gap-1" id="parentAddChildEmptyBtn">
              <span class="material-symbols-outlined text-sm">person_add</span>
              <span>Register My Child</span>
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${myInfants.map(inf => `
              <div class="p-4 rounded-xl border border-line bg-surface-alt hover:border-brand-primary cursor-pointer transition-all view-card-btn shadow-2xs" data-id="${escapeHtml(inf.id)}">
                <div class="flex items-center justify-between mb-2">
                  <strong class="text-sm text-text">${escapeHtml(inf.infantName)}</strong>
                  <span class="badge ${(inf.immunizationStatus || '').includes('FIC') ? 'badge-complete' : 'badge-pending'} text-[10px]">
                    ${escapeHtml(inf.immunizationStatus || 'Incomplete')}
                  </span>
                </div>
                <div class="text-xs text-text-muted space-y-1">
                  <div><strong>Birthday:</strong> ${formatDate(inf.birthdate)} (${inf.ageMonths || 0} mos)</div>
                  <div><strong>Barangay:</strong> ${escapeHtml(inf.barangay)}</div>
                </div>
                <div class="mt-3 pt-2 border-t border-line flex items-center justify-between text-brand-primary text-xs font-semibold">
                  <span>View DOH Immunization Card</span>
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Upcoming Checkup Schedules -->
      <div class="panel p-5 rounded-2xl border border-line bg-surface">
        <h3 class="text-sm font-bold text-text flex items-center gap-2 mb-3 pb-2 border-b border-line">
          <span class="material-symbols-outlined text-emerald-600 text-xl">event_available</span>
          <span>Upcoming Checkup Schedules & Reminders</span>
        </h3>
        ${mySchedules.length === 0 ? `
          <p class="text-xs text-text-muted text-center py-4">No upcoming appointments scheduled at this time.</p>
        ` : `
          <div class="space-y-2">
            ${mySchedules.map(s => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-surface-alt border border-line text-xs">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-brand-primary text-lg">calendar_month</span>
                  <div>
                    <strong class="text-text block">${escapeHtml(s.patientName)}</strong>
                    <span class="text-text-muted">${s.type === 'MC' ? 'Maternal Prenatal Care' : 'Child Health & Immunization'}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-emerald-700 block">${formatDate(s.date)}</span>
                  <span class="text-[11px] text-text-muted">${s.time || '08:30 AM'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}
