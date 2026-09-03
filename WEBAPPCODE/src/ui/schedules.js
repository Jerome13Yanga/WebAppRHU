/**
 * Check-up Schedules UI Module
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { isNurse, isParent, isMatchingParentRecord } from '../auth.js';

export function renderSchedulesView(state, selectedBarangay = "All Barangays", currentUser = null, searchTerm = "") {
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
      (s.userId && (s.userId === currentUser?.id || s.userId === currentUser?.authUserId)) ||
      (s.user_id && (s.user_id === currentUser?.id || s.user_id === currentUser?.authUserId)) ||
      (s.maternalRecordId && myMaternal && s.maternalRecordId === myMaternal.id) ||
      (s.infantRecordId && myInfants.some(inf => inf.id === s.infantRecordId)) ||
      isMatchingParentRecord({ patientName: s.patientName, parentName: s.parentName, fullName: s.patientName }, currentUser) ||
      (s.patientName && s.patientName.toLowerCase().trim() === parentName) ||
      (s.parentName && s.parentName.toLowerCase().trim() === parentName) ||
      myInfants.some(inf => inf.infantName && s.patientName && s.patientName.toLowerCase().trim() === inf.infantName.toLowerCase().trim())
    );
  } else if (isUserNurse && currentUser?.barangay) {
    schedules = schedules.filter(s => s.barangay === currentUser.barangay);
  } else if (selectedBarangay && selectedBarangay !== "All Barangays") {
    schedules = schedules.filter(s => s.barangay === selectedBarangay);
  }

  // Apply search query filter
  if (searchTerm) {
    const q = searchTerm.toLowerCase().trim();
    schedules = schedules.filter(s =>
      (s.patientName && s.patientName.toLowerCase().includes(q)) ||
      (s.parentName && s.parentName.toLowerCase().includes(q)) ||
      (s.barangay && s.barangay.toLowerCase().includes(q)) ||
      (s.type && s.type.toLowerCase().includes(q)) ||
      (s.assignedNurse && s.assignedNurse.toLowerCase().includes(q)) ||
      (s.status && s.status.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    );
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

    <!-- Search and Filter Toolbar -->
    <div class="flex items-center justify-between gap-3 mb-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
      <div class="relative flex-1 max-w-md">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
        <input type="search" id="scheduleSearchInput" placeholder="Search appointments by patient, barangay, status, provider..." value="${escapeHtml(searchTerm)}" class="input-field pl-9 py-1.5 text-xs w-full">
      </div>
      <div class="text-xs text-slate-500 font-medium px-2 shrink-0">
        ${searchTerm ? `Found <strong>${schedules.length}</strong> matching visits` : `Total: <strong>${schedules.length}</strong> visits`}
      </div>
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
                  <p class="font-semibold text-text mb-1">${searchTerm ? 'No matching check-up appointments found.' : 'No Check-up Appointments Scheduled'}</p>
                  <p class="text-xs mb-3">${searchTerm ? `No appointments matched "${escapeHtml(searchTerm)}". Try clearing your search.` : (isUserParent ? 'You can request an appointment for your prenatal check-up or your child\'s immunization.' : 'No scheduled checkups found for this barangay station.')}</p>
                  ${isUserParent && !searchTerm ? `
                    <button type="button" class="primary-btn sm-btn text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5" id="emptyScheduleRequestBtn">
                      <span class="material-symbols-outlined text-sm">calendar_add_on</span>
                      <span>Request Check-up Appointment</span>
                    </button>
                  ` : ''}
                </td>
              </tr>
            ` : schedules.map(s => `
              <tr class="schedule-record-row">
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
