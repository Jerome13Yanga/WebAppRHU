/**
 * Check-up Schedules UI Module
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { isNurse, isParent } from '../auth.js';

export function renderSchedulesView(state, selectedBarangay = "All Barangays", currentUser = null) {
  const isUserParent = isParent(currentUser);
  const isUserNurse = isNurse(currentUser);
  const parentName = (currentUser?.name || currentUser?.fullName || '').toLowerCase().trim();

  let schedules = state.checkupSchedules || [];
  if (isUserParent) {
    schedules = schedules.filter(s => s.patientName && s.patientName.toLowerCase().trim() === parentName);
  } else if (isUserNurse && currentUser?.barangay) {
    schedules = schedules.filter(s => s.barangay === currentUser.barangay);
  } else if (selectedBarangay && selectedBarangay !== "All Barangays") {
    schedules = schedules.filter(s => s.barangay === selectedBarangay);
  }

  // Sort by date ascending
  schedules.sort((a, b) => new Date(a.date || '2099-01-01') - new Date(b.date || '2099-01-01'));

  return `
    <div class="page-header flex items-center justify-between flex-wrap gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2 text-text">
          <span class="material-symbols-outlined text-amber-600 text-2xl">event_available</span>
          <span>Check-up Appointments & Schedules</span>
        </h2>
        <p class="text-xs text-text-muted">
          ${isUserParent ? 'Your scheduled prenatal and pediatric clinical visits' : `Barangay Station: ${escapeHtml(isUserNurse ? currentUser.barangay : selectedBarangay)} (${schedules.length} scheduled visits)`}
        </p>
      </div>

      ${!isUserParent ? `
        <button class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5" id="addScheduleBtn">
          <span class="material-symbols-outlined text-base">add_circle</span>
          <span>Schedule Check-up</span>
        </button>
      ` : ''}
    </div>

    <div class="panel">
      <div class="table-container overflow-x-auto">
        <table class="data-table text-xs">
          <thead>
            <tr>
              <th>Patient Full Name</th>
              <th>Care Category</th>
              <th>Barangay Station</th>
              <th>Scheduled Date & Time</th>
              <th>Assigned Provider</th>
              <th>Status</th>
              ${!isUserParent ? '<th>Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${schedules.length === 0 ? `
              <tr><td colspan="7" class="text-center py-6 text-text-muted">No appointments scheduled for this station.</td></tr>
            ` : schedules.map(s => `
              <tr>
                <td><strong>${escapeHtml(s.patientName)}</strong></td>
                <td><span class="badge badge-info text-[10px]">${s.type === 'MC' ? 'Maternal Prenatal' : 'Child Immunization'}</span></td>
                <td>${escapeHtml(s.barangay)}</td>
                <td><strong class="text-brand-primary">${formatDate(s.date)}</strong> at ${escapeHtml(s.time || '08:30 AM')}</td>
                <td class="text-text-muted">${escapeHtml(s.assignedNurse || 'RHU Midwife')}</td>
                <td>
                  <span class="badge ${s.status === 'Completed' ? 'badge-complete' : 'badge-pending'} text-[10px]">
                    ${escapeHtml(s.status || 'Scheduled')}
                  </span>
                </td>
                ${!isUserParent ? `
                  <td>
                    <button type="button" class="icon-btn delete-schedule-btn p-1 text-red-600 hover:bg-red-50" data-id="${escapeHtml(s.id)}" title="Cancel Schedule">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
