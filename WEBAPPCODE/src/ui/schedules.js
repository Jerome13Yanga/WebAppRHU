/**
 * Check-up Schedules UI Module
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { isNurse, isParent, isMatchingParentRecord } from '../auth.js';

export function renderSchedulesView(state, selectedBarangay = "All Barangays", currentUser = null) {
  const isUserParent = isParent(currentUser);
  const isUserNurse = isNurse(currentUser);
  const parentName = (currentUser?.name || currentUser?.fullName || '').toLowerCase().trim();

  let schedules = state.checkupSchedules || [];
  if (isUserParent) {
    const myMaternal = (state.maternalRecords || []).find(r => isMatchingParentRecord(r, currentUser));
    const myInfants = (state.infantRecords || []).filter(i =>
      isMatchingParentRecord(i, currentUser) || (myMaternal && i.maternalRecordId === myMaternal.id)
    );
    schedules = schedules.filter(s =>
      isMatchingParentRecord({ patientName: s.patientName }, currentUser) ||
      (s.patientName && s.patientName.toLowerCase().trim() === parentName) ||
      myInfants.some(inf => inf.infantName && s.patientName && s.patientName.toLowerCase().trim() === inf.infantName.toLowerCase().trim())
    );
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

      <button class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5" id="addScheduleBtn">
        <span class="material-symbols-outlined text-base">${isUserParent ? 'calendar_add_on' : 'add_circle'}</span>
        <span>${isUserParent ? 'Request Check-up Appointment' : 'Schedule Check-up'}</span>
      </button>
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
              <tr>
                <td colspan="${isUserParent ? 6 : 7}" class="text-center py-8 text-text-muted">
                  <span class="material-symbols-outlined text-3xl text-slate-300 block mb-1">event_available</span>
                  <p class="font-semibold text-text mb-1">No Check-up Appointments Scheduled</p>
                  <p class="text-xs mb-3">${isUserParent ? 'You can request an appointment for your prenatal check-up or your child\'s immunization.' : 'No scheduled checkups found for this barangay station.'}</p>
                  ${isUserParent ? `
                    <button type="button" class="primary-btn sm-btn text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5" id="emptyScheduleRequestBtn">
                      <span class="material-symbols-outlined text-sm">calendar_add_on</span>
                      <span>Request Check-up Appointment</span>
                    </button>
                  ` : ''}
                </td>
              </tr>
            ` : schedules.map(s => `
              <tr>
                <td><strong>${escapeHtml(s.patientName)}</strong></td>
                <td><span class="badge badge-info text-[10px]">${s.type === 'MC' ? 'Maternal Prenatal' : 'Child Immunization'}</span></td>
                <td>${escapeHtml(s.barangay)}</td>
                <td><strong class="text-brand-primary">${formatDate(s.date)}</strong> at ${escapeHtml(s.time || '08:30 AM')}</td>
                <td>${escapeHtml(s.assignedNurse || 'RHU Midwife')}</td>
                <td>
                  <span class="badge ${s.status === 'Completed' || s.status === 'Done' ? 'badge-complete' : (s.status === 'Requested' ? 'badge-pending' : 'badge-info')} text-[10px]">
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
