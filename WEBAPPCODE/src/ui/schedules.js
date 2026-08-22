/**
 * Check-up Schedules UI Module
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';

export function renderSchedulesView(state, selectedBarangay, currentUser) {
  const isParent = currentUser?.role === "Mother / Parent";
  const parentName = currentUser?.name || "";

  let schedules = state.checkupSchedules;
  if (isParent) {
    schedules = schedules.filter(s => s.patientName && s.patientName.toLowerCase() === parentName.toLowerCase());
  } else if (selectedBarangay) {
    schedules = schedules.filter(s => s.barangay === selectedBarangay);
  }

  return `
    <div class="page-header flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-600 text-2xl">event</span>
          <span>Check-up Schedules</span>
        </h2>
        <p class="text-sm text-slate-500">${isParent ? 'My Appointment Requests' : `Barangay: ${escapeHtml(selectedBarangay || 'All')}`} (${schedules.length} schedules)</p>
      </div>
      <button class="primary-btn flex items-center gap-1.5" id="addScheduleBtn">
        <span class="material-symbols-outlined text-lg">edit_calendar</span>
        <span>${isParent ? 'Request Check-up' : 'Schedule Appointment'}</span>
      </button>
    </div>

    <div class="panel">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Type</th>
              <th>Barangay</th>
              <th>Date & Time</th>
              <th>Assigned Nurse</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${schedules.length === 0 ? `
              <tr><td colspan="7" class="text-center text-muted">No check-up schedules found.</td></tr>
            ` : schedules.map(s => `
              <tr>
                <td><strong>${escapeHtml(s.patientName)}</strong></td>
                <td><span class="badge badge-info">${escapeHtml(s.type || 'MC')}</span></td>
                <td>${escapeHtml(s.barangay)}</td>
                <td>${formatDate(s.date)} ${s.time ? `at ${escapeHtml(s.time)}` : ''}</td>
                <td>${escapeHtml(s.assignedNurse || 'RHU Staff')}</td>
                <td><span class="badge ${s.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${escapeHtml(s.status || 'Pending')}</span></td>
                <td class="space-x-1">
                  <button class="icon-btn edit-schedule-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(s.id)}" title="Edit">
                    <span class="material-symbols-outlined text-blue-600 text-lg">edit</span>
                  </button>
                  <button class="icon-btn delete-schedule-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(s.id)}" title="Delete">
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
