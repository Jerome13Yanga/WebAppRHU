/**
 * Infant Records & Immunization Tracking UI Module
 * Padre Burgos RHU Maternal & Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { renderImmunizationBadge } from './components.js';
import { isNurse, isParent, isMho, isAdmin } from '../auth.js';

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

export function renderInfantsView(state, selectedBarangay = "All Barangays", currentUser = null) {
  const isUserNurse = isNurse(currentUser);
  const isUserParent = isParent(currentUser);

  let records = state.infantRecords || [];

  if (isUserParent) {
    records = records.filter(i => isMatchingParentRecord(i, currentUser));
  } else if (isUserNurse && currentUser?.barangay) {
    records = records.filter(r => r.barangay === currentUser.barangay);
  } else if (selectedBarangay && selectedBarangay !== "All Barangays") {
    records = records.filter(r => r.barangay === selectedBarangay);
  }

  return `
    <div class="page-header flex items-center justify-between flex-wrap gap-3 mb-4">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2 text-text">
          <span class="material-symbols-outlined text-indigo-600 text-2xl">child_care</span>
          <span>Infant & Child Immunization Records</span>
        </h2>
        <p class="text-xs text-text-muted">
          ${isUserParent ? 'Your children’s digitized DOH Todo Ligtas health cards' : `Barangay Station: ${escapeHtml(isUserNurse ? currentUser.barangay : selectedBarangay)} (${records.length} children)`}
        </p>
      </div>

      <button class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5" id="addInfantBtn">
        <span class="material-symbols-outlined text-base">person_add</span>
        <span>${isUserParent ? 'Register My Child' : 'Register Child Health Record'}</span>
      </button>
    </div>

    <div class="panel">
      <div class="table-container overflow-x-auto">
        <table class="data-table text-xs">
          <thead>
            <tr>
              <th>Child Full Name</th>
              <th>Mother / Parent</th>
              <th>Age (Months)</th>
              <th>Birthdate</th>
              <th>Barangay</th>
              <th>Immunization Status</th>
              <th>Assigned Provider</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.length === 0 ? `
              <tr><td colspan="8" class="text-center py-6 text-text-muted">No child immunization records found.</td></tr>
            ` : records.map(i => `
              <tr>
                <td><strong>${escapeHtml(i.infantName)}</strong></td>
                <td>${escapeHtml(i.parentName || i.motherName || 'N/A')}</td>
                <td>${i.ageMonths || 0} mo</td>
                <td>${formatDate(i.birthdate)}</td>
                <td><span class="badge badge-info text-[11px]">${escapeHtml(i.barangay)}</span></td>
                <td>${renderImmunizationBadge(i.immunizationStatus)}</td>
                <td class="text-text-muted">${escapeHtml(i.assignedNurse || 'RHU Staff')}</td>
                <td class="space-x-1 whitespace-nowrap">
                  <button type="button" class="primary-btn sm-btn view-card-btn text-[11px] py-1 px-2.5" data-id="${escapeHtml(i.id)}" title="Open DOH Todo Ligtas Card">
                    <span class="material-symbols-outlined text-sm">badge</span>
                    <span>Todo Ligtas Card</span>
                  </button>
                  ${!isUserParent ? `
                    <button type="button" class="secondary-btn sm-btn edit-infant-btn text-[11px] py-1 px-2" data-id="${escapeHtml(i.id)}" title="Edit Infant Details">
                      <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    ${isAdmin(currentUser) || isNurse(currentUser) ? `
                      <button type="button" class="icon-btn delete-infant-btn p-1 text-red-600 hover:bg-red-50" data-id="${escapeHtml(i.id)}" title="Delete">
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
