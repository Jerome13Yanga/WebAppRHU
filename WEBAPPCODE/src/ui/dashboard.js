/**
 * Dashboard UI Module (Healthcare Staff & Mother/Parent Views)
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { renderRiskBadge, renderImmunizationBadge, renderProgressBar } from './components.js';

function chartSvg(width, height, body) {
  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Analytics chart" class="responsive-svg" style="overflow: hidden; max-width: 100%; width: 100%; display: block;">${body}</svg>`;
}

function renderLineChart(containerId, data, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const series = options.series || Object.keys(data[0] || {}).filter((key) => key !== "label");
  const width = 500;
  const height = 220;
  const padLeft = 42;
  const padRight = 42;
  const padTop = 36;
  const padBottom = 34;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const max = Math.max(1, ...data.flatMap((row) => series.map((name) => Number(row[name] || 0))));
  const colors = ["#2e7d32", "#d32f2f", "#ed6c02"];
  const step = chartWidth / Math.max(1, data.length - 1);
  const lines = series.map((name, index) => {
    const points = data.map((row, i) => `${padLeft + i * step},${height - padBottom - (chartHeight * Number(row[name] || 0)) / max}`).join(" ");
    const dots = data.map((row, i) => {
      const x = padLeft + i * step;
      const val = Number(row[name] || 0);
      const y = height - padBottom - (chartHeight * val) / max;
      const valText = val > 0 ? `<text x="${x}" y="${Math.max(14, y - 7)}" text-anchor="middle" class="chart-label value-label">${val}</text>` : "";
      return `<circle cx="${x}" cy="${y}" r="4.5" fill="${colors[index]}"><title>${escapeHtml(row.label)} ${escapeHtml(name)}: ${val}</title></circle>${valText}`;
    }).join("");
    return `<polyline fill="none" stroke="${colors[index]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points}"></polyline>${dots}`;
  }).join("");
  const labels = data.map((row, index) => `<text x="${padLeft + index * step}" y="${height - 10}" text-anchor="middle" class="chart-label">${escapeHtml(row.label)}</text>`).join("");
  
  let currentX = padLeft;
  const legendHtml = series.map((name, index) => {
    const itemX = currentX;
    currentX += Math.max(76, String(name || "").length * 7 + 22);
    return `<g transform="translate(${itemX},18)"><circle r="4.5" fill="${colors[index % colors.length]}"></circle><text x="9" y="4" class="chart-label">${escapeHtml(name)}</text></g>`;
  }).join("");

  const grid = [0, 1, 2, 3].map((i) => {
    const y = 36 + ((height - 36 - 30) / 3) * i;
    return `<line x1="${padLeft}" x2="${width - padRight}" y1="${y}" y2="${y}" class="grid-line"></line>`;
  }).join("");

  el.innerHTML = chartSvg(width, height, `${grid}${lines}${labels}${legendHtml}`);
}

function renderDonutChart(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const total = Math.max(0, data.reduce((sum, item) => sum + Number(item.value || 0), 0));
  const radius = 50;
  const circumference = Math.PI * 2 * radius;
  const colors = ["#2e7d32", "#ed6c02", "#d32f2f", "#1976d2", "#9c27b0", "#00bcd4"];
  let offset = 0;
  const rings = data.map((item, index) => {
    const val = Number(item.value || 0);
    const length = total > 0 ? (val / total) * circumference : 0;
    const ring = `<circle cx="75" cy="75" r="${radius}" fill="none" stroke="${colors[index % colors.length]}" stroke-width="18" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 75 75)"><title>${escapeHtml(item.label)}: ${val}</title></circle>`;
    offset += length;
    return ring;
  }).join("");
  const items = data.map((item, index) => `<span class="legend-pill"><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(item.label)}: <strong>${escapeHtml(item.value)}</strong></span>`).join("");
  el.innerHTML = `
    <div class="donut-layout">
      <div class="donut-svg-wrap">
        ${chartSvg(150, 150, `<circle cx="75" cy="75" r="${radius}" fill="none" stroke="#e8eef3" stroke-width="18"></circle>${rings}<text x="75" y="71" text-anchor="middle" class="donut-total">${total}</text><text x="75" y="88" text-anchor="middle" class="chart-label">Total</text>`)}
      </div>
      <div class="chart-legend vertical">${items}</div>
    </div>`;
}

export function renderDashboardView(state = {}, currentUser = {}, selectedBarangay = "", visibleBarangays = [], searchTerm = "") {
  if (currentUser?.role === "Mother / Parent") {
    return renderParentDashboardView(state, currentUser);
  }

  const maternalRecords = Array.isArray(state?.maternalRecords) ? state.maternalRecords : [];
  const infantRecords = Array.isArray(state?.infantRecords) ? state.infantRecords : [];
  const checkupSchedules = Array.isArray(state?.checkupSchedules) ? state.checkupSchedules : [];

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

  const lowRiskCount = maternal.filter(r => (r.riskLevel || '').toLowerCase().includes('low') || (r.riskLevel || '').toLowerCase().includes('normal')).length;
  const modRiskCount = maternal.filter(r => (r.riskLevel || '').toLowerCase().includes('mod') || (r.riskLevel || '').toLowerCase().includes('elevated')).length;
  const riskData = [
    { label: "Low Risk", value: lowRiskCount || Math.max(0, maternal.length - highRiskCount - modRiskCount) },
    { label: "Moderate Risk", value: modRiskCount },
    { label: "High Risk", value: highRiskCount }
  ];

  setTimeout(() => {
    renderDonutChart("riskDonutChart", riskData);
    renderLineChart("checkupTrendChart", [
      { label: "Mar", Completed: 12, Missed: 2, Upcoming: 5 },
      { label: "Apr", Completed: 18, Missed: 1, Upcoming: 8 },
      { label: "May", Completed: 15, Missed: 3, Upcoming: 10 },
      { label: "Jun", Completed: 22, Missed: 0, Upcoming: 14 }
    ], { series: ["Completed", "Missed", "Upcoming"] });
  }, 50);

  return `
    <div class="dashboard-grid">
      <!-- Quick Stats Metrics Cards -->
      <div class="stat-card">
        <div class="stat-icon icon-blue">
          <span class="material-symbols-outlined text-blue-600 text-2xl">health_and_safety</span>
        </div>
        <div class="stat-content">
          <h3>${maternal.length}</h3>
          <p>Maternal Patients</p>
          <span class="stat-meta">${highRiskCount} High Risk Flagged</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon icon-green">
          <span class="material-symbols-outlined text-emerald-600 text-2xl">child_care</span>
        </div>
        <div class="stat-content">
          <h3>${infants.length}</h3>
          <p>Infants Monitored</p>
          <span class="stat-meta">${overdueVaccineCount} Pending / Incomplete</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon icon-amber">
          <span class="material-symbols-outlined text-amber-600 text-2xl">event</span>
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
        <span class="material-symbols-outlined text-red-600 text-xl shrink-0 mt-0.5">warning</span>
        <div>
          <div class="alert-title font-semibold">High-Risk Maternal Alert</div>
          <p class="text-sm">There are ${highRiskCount} pregnant mothers flagged for high-risk obstetric/medical factors in ${escapeHtml(targetBarangay || 'your assigned barangay')}. Immediate follow-up is recommended.</p>
        </div>
      </div>
    ` : ''}

    <div class="chart-grid mb-6">
      <div class="card card-pad chart-card">
        <div class="section-head mb-2"><div><h3 class="text-base font-bold">Monthly Check-up Trend</h3><p class="text-xs text-slate-500">Completed, missed, and upcoming</p></div></div>
        <div id="checkupTrendChart" class="chart-box"></div>
      </div>
      <div class="card card-pad chart-card">
        <div class="section-head mb-2"><div><h3 class="text-base font-bold">Pregnancy Risk Level</h3><p class="text-xs text-slate-500">Risk distribution</p></div></div>
        <div id="riskDonutChart" class="chart-box donut-box"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Maternal Records Table -->
      <div class="panel">
        <div class="panel-head flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 font-bold">
            <span class="material-symbols-outlined text-blue-600 text-lg">health_and_safety</span>
            <span>Maternal Care Summary</span>
          </h3>
          <span class="badge badge-info">${escapeHtml(targetBarangay || 'All')}</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>EDD</th>
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
        <div class="panel-head flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 font-bold">
            <span class="material-symbols-outlined text-emerald-600 text-lg">child_care</span>
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
  const motherName = currentUser?.name || currentUser?.fullName || 'Mother / Parent';
  const maternalRecords = Array.isArray(state?.maternalRecords) ? state.maternalRecords : [];
  const infantRecords = Array.isArray(state?.infantRecords) ? state.infantRecords : [];
  const checkupSchedules = Array.isArray(state?.checkupSchedules) ? state.checkupSchedules : [];
  const reminders = Array.isArray(state?.reminders) ? state.reminders : [];

  const lowerName = motherName.toLowerCase().trim();
  const maternalRec = maternalRecords.find(r => 
    (r.fullName && r.fullName.toLowerCase().trim() === lowerName) || 
    (r.user_id && currentUser?.id && r.user_id === currentUser.id) ||
    (r.email && currentUser?.email && r.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  const myInfants = infantRecords.filter(i => 
    (i.parentName && i.parentName.toLowerCase().trim() === lowerName) || 
    (i.motherName && i.motherName.toLowerCase().trim() === lowerName) ||
    (i.user_id && currentUser?.id && i.user_id === currentUser.id)
  );

  const mySchedules = checkupSchedules.filter(s => 
    (s.patientName && s.patientName.toLowerCase().trim() === lowerName) ||
    (maternalRec && s.patientName && s.patientName.toLowerCase() === maternalRec.fullName?.toLowerCase())
  );

  const myReminders = reminders.filter(r => 
    !r.targetRole || r.targetRole === "Mother / Parent" || r.barangay === currentUser?.barangay
  );

  return `
    <div class="welcome-banner p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl mb-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <span>Welcome back, ${escapeHtml(motherName)}!</span>
          <span class="material-symbols-outlined text-amber-300 text-xl">auto_awesome</span>
        </h2>
        <p class="text-blue-100 text-sm mt-1">Barangay: <strong>${escapeHtml(currentUser?.barangay || 'Padre Burgos')}</strong> | Monitor your prenatal visits and child immunizations.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="primary-btn sm-btn bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition" onclick="document.querySelector('[data-page=schedules]')?.click()">
          Request Appointment
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Maternal Profile Card -->
      <div class="panel">
        <div class="panel-head flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 font-bold text-slate-800">
            <span class="material-symbols-outlined text-blue-600 text-xl">health_and_safety</span>
            <span>Maternal Record Status</span>
          </h3>
          ${maternalRec ? renderRiskBadge(maternalRec.riskLevel) : ''}
        </div>
        ${maternalRec ? `
          <div class="record-details-card">
            <p><strong>Full Name:</strong> ${escapeHtml(maternalRec.fullName)}</p>
            <p><strong>Pregnancy Status:</strong> ${escapeHtml(maternalRec.pregnancyStatus || 'Active')}</p>
            <p><strong>EDD (Expected Delivery Date):</strong> ${formatDate(maternalRec.edd)}</p>
            <p><strong>Assigned Nurse / Midwife:</strong> ${escapeHtml(maternalRec.assignedNurse || 'RHU Staff')}</p>
            <p class="mt-2 font-semibold">Prenatal Visits Completed (8ANC):</p>
            ${renderProgressBar(maternalRec.checkupsCompleted || 0, 8)}
          </div>
        ` : `
          <div class="p-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p class="text-slate-600 text-sm mb-2">No active maternal record linked yet.</p>
            <p class="text-xs text-slate-500">Contact your Barangay Nurse or register details in clinic forms.</p>
          </div>
        `}
      </div>

      <!-- Infant Care Card -->
      <div class="panel">
        <div class="panel-head flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 font-bold text-slate-800">
            <span class="material-symbols-outlined text-emerald-600 text-xl">child_care</span>
            <span>Registered Infants (${myInfants.length})</span>
          </h3>
        </div>
        ${myInfants.length === 0 ? `
          <div class="p-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p class="text-slate-600 text-sm">No infant records registered under your name.</p>
          </div>
        ` : `
          <ul class="infant-list">
            ${myInfants.map(inf => `
              <li class="infant-item flex items-center justify-between gap-3">
                <div>
                  <strong>${escapeHtml(inf.infantName)}</strong>
                  <div class="text-xs text-slate-500 mt-0.5">${inf.ageMonths || 0} months old | DOB: ${formatDate(inf.birthdate)}</div>
                </div>
                <div>${renderImmunizationBadge(inf.immunizationStatus)}</div>
              </li>
            `).join('')}
          </ul>
        `}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Checkup Appointments -->
      <div class="panel">
        <div class="panel-head flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 font-bold text-slate-800">
            <span class="material-symbols-outlined text-purple-600 text-xl">event</span>
            <span>My Scheduled Appointments</span>
          </h3>
        </div>
        ${mySchedules.length === 0 ? `
          <p class="text-sm text-slate-500 italic">No upcoming appointments. Click <strong>Request Appointment</strong> to schedule a visit.</p>
        ` : `
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Care Type</th>
                  <th>Date & Time</th>
                  <th>Barangay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${mySchedules.slice(0, 5).map(s => `
                  <tr>
                    <td><strong>${escapeHtml(s.type === 'MC' ? 'Maternal Care' : 'Child Immunization')}</strong></td>
                    <td>${formatDate(s.date)} ${escapeHtml(s.time || '')}</td>
                    <td>${escapeHtml(s.barangay)}</td>
                    <td><span class="badge ${s.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${escapeHtml(s.status || 'Pending')}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Health Reminders -->
      <div class="panel">
        <div class="panel-head flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 font-bold text-slate-800">
            <span class="material-symbols-outlined text-amber-600 text-xl">notifications</span>
            <span>Health & Vaccine Reminders</span>
          </h3>
        </div>
        ${myReminders.length === 0 ? `
          <p class="text-sm text-slate-500 italic">No active health reminders for your clinic.</p>
        ` : `
          <div class="grid gap-2">
            ${myReminders.slice(0, 4).map(r => `
              <div class="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs flex items-start gap-2.5">
                <span class="material-symbols-outlined text-amber-600 text-base mt-0.5">info</span>
                <div>
                  <strong class="text-slate-800">${escapeHtml(r.title || 'Clinic Notice')}</strong>
                  <p class="text-slate-600 mt-0.5">${escapeHtml(r.message || r.content || '')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}
