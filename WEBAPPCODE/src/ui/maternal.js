/**
 * Maternal Care Records UI Module
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { renderRiskBadge, renderProgressBar } from './components.js';

export function renderMaternalView(state, selectedBarangay) {
  const records = state.maternalRecords.filter(r => !selectedBarangay || r.barangay === selectedBarangay);

  return `
    <div class="page-header flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">health_and_safety</span>
          <span>Maternal Care Records</span>
        </h2>
        <p class="text-sm text-slate-500">Barangay: <strong>${escapeHtml(selectedBarangay || 'All')}</strong> (${records.length} patients)</p>
      </div>
      <button class="primary-btn flex items-center gap-1.5" id="addMaternalBtn">
        <span class="material-symbols-outlined text-lg">add_circle</span>
        <span>Add Maternal Record</span>
      </button>
    </div>

    <div class="panel">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Barangay</th>
              <th>LMP / EDD</th>
              <th>Risk Level</th>
              <th>Visits Completed</th>
              <th>Verification Status</th>
              <th>Assigned Nurse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.length === 0 ? `
              <tr><td colspan="9" class="text-center text-muted">No maternal records found for ${escapeHtml(selectedBarangay || 'all barangays')}.</td></tr>
            ` : records.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.fullName)}</strong><br><small>${escapeHtml(r.contact || 'No contact')}</small></td>
                <td>${r.age || 'N/A'}</td>
                <td>${escapeHtml(r.barangay)}</td>
                <td><small>LMP: ${formatDate(r.lmp)}<br>EDD: ${formatDate(r.edd)}</small></td>
                <td>${renderRiskBadge(r.riskLevel)}</td>
                <td>${renderProgressBar(r.checkupsCompleted || 0, 8)}</td>
                <td>
                  <span class="badge ${r.verification_status === 'Verified' ? 'badge-success' : 'badge-warning'}">
                    <span class="badge-dot"></span>${escapeHtml(r.verification_status || 'Pending Verification')}
                  </span>
                </td>
                <td>${escapeHtml(r.assignedNurse || 'Unassigned')}</td>
                <td class="space-x-1">
                  ${r.verification_status !== 'Verified' ? `
                    <button class="primary-btn sm-btn verify-maternal-btn inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded" data-id="${escapeHtml(r.id)}" title="Verify Health Record">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      <span>Verify</span>
                    </button>
                  ` : ''}
                  <button class="primary-btn sm-btn open-prenatal-clinical-modal-btn inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs" data-id="${escapeHtml(r.id)}" title="Open Prenatal Clinical Record">
                    <span class="material-symbols-outlined text-sm">clinical_notes</span>
                    <span>Clinical Record</span>
                  </button>
                  <button class="icon-btn edit-maternal-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(r.id)}" title="Edit Padre Burgos Form">
                    <span class="material-symbols-outlined text-blue-600 text-lg">edit</span>
                  </button>
                  <button class="icon-btn delete-maternal-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(r.id)}" title="Delete">
                    <span class="material-symbols-outlined text-red-600 text-lg">delete</span>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
