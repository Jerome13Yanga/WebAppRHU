/**
 * Dashboard UI Module (Healthcare Staff & Mother/Parent Views)
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { renderRiskBadge, renderImmunizationBadge, renderProgressBar } from './components.js';

export function renderDashboardView(state = {}, currentUser = {}, selectedBarangay = "", visibleBarangays = [], searchTerm = "") {
  if (currentUser?.role === "Mother / Parent") {
    return renderParentDashboardView(state, currentUser);
  }

  const maternalRecords = Array.isArray(state?.maternalRecords) ? state.maternalRecords : [];
  const infantRecords = Array.isArray(state?.infantRecords) ? state.infantRecords : [];
  const checkupSchedules = Array.isArray(state?.checkupSchedules) ? state.checkupSchedules : [];

  // Filter records based on selected barangay or nurse scope
  const isNurse = currentUser?.role === "Nurse / Midwife";
  const targetBarangay = isNurse ? currentUser.barangay : selectedBarangay;

  let maternal = maternalRecords.filter(r => !targetBarangay || targetBarangay === "All Barangays" || r.barangay === targetBarangay);
  let infants = infantRecords.filter(r => !targetBarangay || targetBarangay === "All Barangays" || r.barangay === targetBarangay);
  let schedules = checkupSchedules.filter(r => !targetBarangay || targetBarangay === "All Barangays" || r.barangay === targetBarangay);

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    maternal = maternal.filter(r => (r.fullName || '').toLowerCase().includes(term) || (r.barangay || '').toLowerCase().includes(term));
    infants = infants.filter(r => (r.infantName || '').toLowerCase().includes(term) || (r.parentName || '').toLowerCase().includes(term));
  }

  const highRiskCount = maternal.filter(r => (r.riskLevel || '').toLowerCase().includes('high')).length;
  const overdueVaccineCount = infants.filter(r => (r.immunizationStatus || '').toLowerCase().includes('incomplete') || (r.immunizationStatus || '').toLowerCase().includes('overdue')).length;
  const upcomingSchedules = schedules.filter(s => s.status !== 'Completed');

  return `
    <div class="dashboard-grid">
      <!-- Quick Stats Metrics Cards -->
      <div class="stat-card">
        <div class="stat-icon icon-blue">
          <i data-lucide="heart-pulse" class="w-6 h-6 text-blue-600"></i>
        </div>
        <div class="stat-content">
          <h3>${maternal.length}</h3>
          <p>Maternal Patients</p>
          <span class="stat-meta">${highRiskCount} High Risk Flagged</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon icon-green">
          <i data-lucide="baby" class="w-6 h-6 text-emerald-600"></i>
        </div>
        <div class="stat-content">
          <h3>${infants.length}</h3>
          <p>Infants Monitored</p>
          <span class="stat-meta">${overdueVaccineCount} Pending / Incomplete</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon icon-amber">
          <i data-lucide="calendar" class="w-6 h-6 text-amber-600"></i>
        </div>
        <div class="stat-content">
          <h3>${upcomingSchedules.length}</h3>
          <p>Check-up Appointments</p>
          <span class="stat-meta">Barangay: ${escapeHtml(targetBarangay || 'All')}</span>
        </div>
      </div>
    </div>

    <!-- High Risk Alert Panel -->
    ${highRiskCount > 0 ? `
      <div class="alert-box alert-danger flex items-start gap-3">
        <i data-lucide="alert-triangle" class="w-5 h-5 text-red-600 shrink-0 mt-0.5"></i>
        <div>
          <div class="alert-title font-semibold">High-Risk Maternal Alert</div>
          <p class="text-sm">There are ${highRiskCount} pregnant mothers flagged for high-risk obstetric/medical factors in ${escapeHtml(targetBarangay || 'your assigned barangay')}. Immediate follow-up is recommended.</p>
        </div>
      </div>
    ` : ''}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
      <!-- Recent Maternal Records Table -->
      <div class="panel">
        <div class="panel-head flex items-center justify-between">
          <h3 class="flex items-center gap-2">
            <i data-lucide="heart-pulse" class="w-4 h-4 text-blue-600"></i>
            <span>Maternal Care Summary</span>
          </h3>
          <span class="badge badge-info">${escapeHtml(targetBarangay || 'All')}</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>LMP / EDD</th>
                <th>Risk Level</th>
                <th>Checkups</th>
              </tr>
            </thead>
            <tbody>
              ${maternal.length === 0 ? `<tr><td colspan="4" class="text-center text-muted">No maternal records found.</td></tr>` : 
                maternal.slice(0, 5).map(m => `
                  <tr>
                    <td><strong>${escapeHtml(m.fullName)}</strong><br><small>${escapeHtml(m.barangay)}</small></td>
                    <td><small>EDD: ${formatDate(m.edd)}</small></td>
                    <td>${renderRiskBadge(m.riskLevel)}</td>
                    <td>${renderProgressBar(m.checkupsCompleted || 0, 8)}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Infant Immunization Summary Table -->
      <div class="panel">
        <div class="panel-head flex items-center justify-between">
          <h3 class="flex items-center gap-2">
            <i data-lucide="baby" class="w-4 h-4 text-emerald-600"></i>
            <span>Infant Care Summary</span>
          </h3>
          <span class="badge badge-info">${escapeHtml(targetBarangay || 'All')}</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Infant Name</th>
                <th>Age</th>
                <th>Status</th>
                <th>Next Check-up</th>
              </tr>
            </thead>
            <tbody>
              ${infants.length === 0 ? `<tr><td colspan="4" class="text-center text-muted">No infant records found.</td></tr>` : 
                infants.slice(0, 5).map(i => `
                  <tr>
                    <td><strong>${escapeHtml(i.infantName)}</strong><br><small>Parent: ${escapeHtml(i.parentName || 'N/A')}</small></td>
                    <td>${i.ageMonths || 0} mo</td>
                    <td>${renderImmunizationBadge(i.immunizationStatus)}</td>
                    <td><small>${formatDate(i.nextCheckup)}</small></td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderParentDashboardView(state = {}, currentUser = {}) {
  const motherName = currentUser?.name || '';
  const maternalRecords = Array.isArray(state?.maternalRecords) ? state.maternalRecords : [];
  const infantRecords = Array.isArray(state?.infantRecords) ? state.infantRecords : [];

  const maternalRec = maternalRecords.find(r => r.fullName && r.fullName.toLowerCase() === motherName.toLowerCase());
  const myInfants = infantRecords.filter(i => i.parentName && i.parentName.toLowerCase() === motherName.toLowerCase());

  return `
    <div class="welcome-banner p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl mb-6 shadow-sm">
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <span>Welcome back, ${escapeHtml(motherName)}!</span>
        <i data-lucide="sparkles" class="w-5 h-5 text-amber-300"></i>
      </h2>
      <p class="text-blue-100 text-sm mt-1">Barangay: <strong>${escapeHtml(currentUser?.barangay || 'Padre Burgos')}</strong> | Keep track of your health visits and infant immunization schedules.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="panel">
        <h3 class="flex items-center gap-2 mb-4">
          <i data-lucide="heart-pulse" class="w-5 h-5 text-blue-600"></i>
          <span>Maternal Record Status</span>
        </h3>
        ${maternalRec ? `
          <div class="record-details-card">
            <p><strong>Status:</strong> ${escapeHtml(maternalRec.pregnancyStatus || 'Active')}</p>
            <p><strong>EDD (Expected Delivery Date):</strong> ${formatDate(maternalRec.edd)}</p>
            <p><strong>Assigned Nurse:</strong> ${escapeHtml(maternalRec.assignedNurse || 'RHU Staff')}</p>
            <p><strong>Prenatal Visits Completed:</strong></p>
            ${renderProgressBar(maternalRec.checkupsCompleted || 0, 8)}
          </div>
        ` : `
          <p class="text-muted">No active maternal record found. Submit your health form under <strong>My Health Forms</strong>.</p>
        `}
      </div>

      <div class="panel">
        <h3 class="flex items-center gap-2 mb-4">
          <i data-lucide="baby" class="w-5 h-5 text-emerald-600"></i>
          <span>Registered Infants (${myInfants.length})</span>
        </h3>
        ${myInfants.length === 0 ? `<p class="text-muted">No infants registered yet.</p>` : `
          <ul class="infant-list">
            ${myInfants.map(inf => `
              <li class="infant-item">
                <strong>${escapeHtml(inf.infantName)}</strong> (${inf.ageMonths || 0} months old)
                <br>Immunization: ${renderImmunizationBadge(inf.immunizationStatus)}
              </li>
            `).join('')}
          </ul>
        `}
      </div>
    </div>
  `;
}
