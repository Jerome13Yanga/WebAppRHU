/**
 * Maternal Care Records UI Module
 * Padre Burgos RHU Maternal & Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { renderRiskBadge, renderProgressBar } from './components.js';
import { isNurse, isParent, isDoctor, isMho, isAdmin } from '../auth.js';

function isMatchingParentRecord(record, currentUser) {
  if (!currentUser || !record) return false;
  if (record.user_id && record.user_id === currentUser.id) return true;
  if (currentUser.motherId && (record.id === currentUser.motherId || record.maternalRecordId === currentUser.motherId)) return true;

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

export function renderMaternalView(state, selectedBarangay = "All Barangays", currentUser = null) {
  const isUserNurse = isNurse(currentUser);
  const isUserParent = isParent(currentUser);

  let records = state.maternalRecords || [];

  if (isUserParent) {
    records = records.filter(r => isMatchingParentRecord(r, currentUser));
  } else if (isUserNurse && currentUser?.barangay) {
    records = records.filter(r => r.barangay === currentUser.barangay);
  } else if (selectedBarangay && selectedBarangay !== "All Barangays") {
    records = records.filter(r => r.barangay === selectedBarangay);
  }

  return `
    <div class="page-header flex items-center justify-between flex-wrap gap-3 mb-4">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2 text-text">
          <span class="material-symbols-outlined text-pink-600 text-2xl">pregnant_woman</span>
          <span>Maternal Care Records</span>
        </h2>
        <p class="text-xs text-text-muted">
          ${isUserParent ? 'Your personal pregnancy timeline and health records' : `Barangay Station: ${escapeHtml(isUserNurse ? currentUser.barangay : selectedBarangay)} (${records.length} patients)`}
        </p>
      </div>

      ${!isUserParent ? `
        <button class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5" id="addMaternalBtn">
          <span class="material-symbols-outlined text-base">person_add</span>
          <span>Register Pregnant Mother</span>
        </button>
      ` : ''}
    </div>

    <div class="panel">
      <div class="table-container overflow-x-auto">
        <table class="data-table text-xs">
          <thead>
            <tr>
              <th>Patient Full Name</th>
              <th>Age</th>
              <th>Barangay</th>
              <th>LMP / EDD</th>
              <th>Risk Level</th>
              <th>8ANC Progress</th>
              <th>Assigned Midwife</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.length === 0 ? `
              <tr><td colspan="8" class="text-center py-6 text-text-muted">No maternal records found.</td></tr>
            ` : records.map(r => `
              <tr>
                <td>
                  <strong>${escapeHtml(r.fullName)}</strong>
                  <div class="text-[11px] text-text-muted">${escapeHtml(r.contact || 'No contact')}</div>
                </td>
                <td>${r.age || 'N/A'}</td>
                <td><span class="badge badge-info text-[11px]">${escapeHtml(r.barangay)}</span></td>
                <td>
                  <div class="text-[11px]">
                    <div>LMP: ${formatDate(r.lmp)}</div>
                    <div>EDD: <strong>${formatDate(r.edd)}</strong></div>
                  </div>
                </td>
                <td>${renderRiskBadge(r.riskLevel)}</td>
                <td class="w-40">${renderProgressBar(r.checkupsCompleted || 0, 8)}</td>
                <td class="text-text-muted">${escapeHtml(r.assignedNurse || 'RHU Staff')}</td>
                <td class="space-x-1 whitespace-nowrap">
                  <button type="button" class="primary-btn sm-btn open-prenatal-clinical-modal-btn text-[11px] py-1 px-2.5" data-id="${escapeHtml(r.id)}" title="Open Prenatal Clinical Record">
                    <span class="material-symbols-outlined text-sm">clinical_notes</span>
                    <span>Clinical Form</span>
                  </button>
                  <button type="button" class="secondary-btn sm-btn edit-maternal-btn text-[11px] py-1 px-2.5" data-id="${escapeHtml(r.id)}" title="DOH Maternal Card">
                    <span class="material-symbols-outlined text-sm">edit_document</span>
                    <span>Card</span>
                  </button>
                  ${!isUserParent ? `
                    <button type="button" class="primary-btn sm-btn record-visit-maternal-btn bg-pink-700 hover:bg-pink-800 text-white text-[11px] py-1 px-2.5" data-id="${escapeHtml(r.id)}" title="Record Checkup Visit">
                      <span class="material-symbols-outlined text-sm">add</span>
                      <span>Visit</span>
                    </button>
                    ${isAdmin(currentUser) || isNurse(currentUser) ? `
                      <button type="button" class="icon-btn delete-maternal-btn p-1 text-red-600 hover:bg-red-50" data-id="${escapeHtml(r.id)}" title="Delete">
                        <span class="material-symbols-outlined text-base">delete</span>
                      </button>
                    ` : ''}
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
