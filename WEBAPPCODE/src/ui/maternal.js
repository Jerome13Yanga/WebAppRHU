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
          <i data-lucide="heart-pulse" class="w-6 h-6 text-blue-600"></i>
          <span>Maternal Care Records</span>
        </h2>
        <p class="text-sm text-slate-500">Barangay: <strong>${escapeHtml(selectedBarangay || 'All')}</strong> (${records.length} patients)</p>
      </div>
      <button class="primary-btn flex items-center gap-1.5" id="addMaternalBtn">
        <i data-lucide="plus-circle" class="w-4 h-4"></i>
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
              <th>Assigned Nurse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.length === 0 ? `
              <tr><td colspan="8" class="text-center text-muted">No maternal records found for ${escapeHtml(selectedBarangay || 'all barangays')}.</td></tr>
            ` : records.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.fullName)}</strong><br><small>${escapeHtml(r.contact || 'No contact')}</small></td>
                <td>${r.age || 'N/A'}</td>
                <td>${escapeHtml(r.barangay)}</td>
                <td><small>LMP: ${formatDate(r.lmp)}<br>EDD: ${formatDate(r.edd)}</small></td>
                <td>${renderRiskBadge(r.riskLevel)}</td>
                <td>${renderProgressBar(r.checkupsCompleted || 0, 8)}</td>
                <td>${escapeHtml(r.assignedNurse || 'Unassigned')}</td>
                <td class="space-x-1">
                  <button class="icon-btn edit-maternal-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(r.id)}" title="Edit">
                    <i data-lucide="edit-3" class="w-4 h-4 text-blue-600"></i>
                  </button>
                  <button class="icon-btn delete-maternal-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(r.id)}" title="Delete">
                    <i data-lucide="trash-2" class="w-4 h-4 text-red-600"></i>
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
