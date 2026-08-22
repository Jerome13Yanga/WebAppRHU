/**
 * Infant Records & Immunization Tracking UI Module
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { renderImmunizationBadge } from './components.js';

export function renderInfantsView(state, selectedBarangay) {
  const records = state.infantRecords.filter(r => !selectedBarangay || r.barangay === selectedBarangay);

  return `
    <div class="page-header flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-outlined text-emerald-600 text-2xl">child_care</span>
          <span>Infant Immunization & Health Records</span>
        </h2>
        <p class="text-sm text-slate-500">Barangay: <strong>${escapeHtml(selectedBarangay || 'All')}</strong> (${records.length} infants)</p>
      </div>
      <button class="primary-btn flex items-center gap-1.5" id="addInfantBtn">
        <span class="material-symbols-outlined text-lg">add_circle</span>
        <span>Add Infant Record</span>
      </button>
    </div>

    <div class="panel">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Infant Name</th>
              <th>Parent / Mother Name</th>
              <th>Age (Months)</th>
              <th>Birthdate</th>
              <th>Barangay</th>
              <th>Immunization Status</th>
              <th>Verification Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.length === 0 ? `
              <tr><td colspan="8" class="text-center text-muted">No infant records found for ${escapeHtml(selectedBarangay || 'all barangays')}.</td></tr>
            ` : records.map(i => `
              <tr>
                <td><strong>${escapeHtml(i.infantName)}</strong></td>
                <td>${escapeHtml(i.parentName || i.motherName || 'N/A')}</td>
                <td>${i.ageMonths || 0} mo</td>
                <td>${formatDate(i.birthdate)}</td>
                <td>${escapeHtml(i.barangay)}</td>
                <td>${renderImmunizationBadge(i.immunizationStatus)}</td>
                <td>
                  <span class="badge ${i.verification_status === 'Verified' ? 'badge-success' : 'badge-warning'}">
                    <span class="badge-dot"></span>${escapeHtml(i.verification_status || 'Pending Verification')}
                  </span>
                </td>
                <td class="space-x-1">
                  ${i.verification_status !== 'Verified' ? `
                    <button class="primary-btn sm-btn verify-infant-btn inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded" data-id="${escapeHtml(i.id)}" title="Verify Health Record">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      <span>Verify</span>
                    </button>
                  ` : ''}
                  <button class="primary-btn sm-btn view-card-btn inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded" data-id="${escapeHtml(i.id)}" title="Digital Immunization Card">
                    <span class="material-symbols-outlined text-sm">medical_information</span>
                    <span>Card</span>
                  </button>
                  <button class="icon-btn edit-infant-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(i.id)}" title="Edit">
                    <span class="material-symbols-outlined text-blue-600 text-lg">edit</span>
                  </button>
                  <button class="icon-btn delete-infant-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(i.id)}" title="Delete">
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
