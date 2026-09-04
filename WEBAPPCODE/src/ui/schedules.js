/**
 * Check-up Schedules UI Module
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { escapeHtml, formatDate, cleanDisplayNotes } from '../utils/sanitize.js';
import { isNurse, isParent, isMatchingParentRecord, isScheduleForParent } from '../auth.js';

export function renderSchedulesView(state, selectedBarangay = "All Barangays", currentUser = null, searchTerm = "") {
  const isUserParent = isParent(currentUser);
  const isUserNurse = isNurse(currentUser);

  let schedules = state.checkupSchedules || [];
  if (isUserParent) {
    schedules = schedules.filter(s => isScheduleForParent(s, currentUser, state));
  } else if (isUserNurse && currentUser?.barangay) {
    schedules = schedules.filter(s => s.barangay === currentUser.barangay);
  } else if (selectedBarangay && selectedBarangay !== "All Barangays") {
    schedules = schedules.filter(s => s.barangay === selectedBarangay);
  }

  // Count pending appointment requests
  const pendingRequests = schedules.filter(s => s.status === 'Requested');
  const confirmedCount = schedules.filter(s => s.status === 'Confirmed' || s.status === 'Scheduled').length;
  const completedCount = schedules.filter(s => s.status === 'Completed' || s.status === 'Done').length;

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
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      (s.instructions && s.instructions.toLowerCase().includes(q))
    );
  }

  // Sort: Pending requests first, then by date ascending
  schedules.sort((a, b) => {
    if (a.status === 'Requested' && b.status !== 'Requested') return -1;
    if (a.status !== 'Requested' && b.status === 'Requested') return 1;
    return new Date(a.date || '2099-01-01') - new Date(b.date || '2099-01-01');
  });

  return `
    <div class="page-header flex items-center justify-between flex-wrap gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2 text-text">
          <span class="material-symbols-outlined text-amber-600 text-2xl">event_available</span>
          <span>Check-up Appointments & Schedules</span>
        </h2>
        <p class="text-xs text-text-muted">
          ${isUserParent ? 'Your scheduled prenatal consultations and routine child vaccinations' : `Barangay Station: ${escapeHtml(isUserNurse ? currentUser.barangay : selectedBarangay)} (${schedules.length} scheduled visits)`}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5 open-request-appointment-modal-btn" id="addScheduleBtn" data-action="${isUserParent ? 'request-checkup' : 'add-schedule'}">
          <span class="material-symbols-outlined text-base">${isUserParent ? 'calendar_add_on' : 'add_circle'}</span>
          <span>${isUserParent ? 'Request Check-up Appointment' : 'Schedule Check-up'}</span>
        </button>
      </div>
    </div>

    <!-- Staff Pending Requests Alert Banner -->
    ${!isUserParent && pendingRequests.length > 0 ? `
      <div class="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start sm:items-center gap-3">
          <span class="material-symbols-outlined text-amber-600 text-2xl shrink-0 mt-0.5 sm:mt-0">pending_actions</span>
          <div>
            <div class="flex items-center gap-2">
              <strong class="text-sm text-amber-950 font-bold">${pendingRequests.length} Appointment Request${pendingRequests.length > 1 ? 's' : ''} Awaiting Review</strong>
              <span class="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Action Needed</span>
            </div>
            <p class="text-xs text-amber-800 mt-0.5">Mothers from ${escapeHtml(isUserNurse ? currentUser.barangay : selectedBarangay)} submitted appointment requests. Review and approve their time slots below.</p>
          </div>
        </div>
        <button type="button" class="sched-filter-btn shrink-0 text-xs font-bold text-amber-950 bg-amber-200/90 hover:bg-amber-300 px-3.5 py-1.5 rounded-lg border border-amber-400 flex items-center justify-center gap-1.5 transition-colors" data-filter="Requested">
          <span class="material-symbols-outlined text-sm">visibility</span>
          <span>Filter Pending Only (${pendingRequests.length})</span>
        </button>
      </div>
    ` : ''}

    <!-- Search and Quick Filter Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
      <div class="search-box-wrap max-w-md">
        <span class="material-symbols-outlined search-icon">search</span>
        <input type="search" id="scheduleSearchInput" placeholder="Search appointments by patient, barangay, status, provider..." value="${escapeHtml(searchTerm)}" class="input-field text-xs">
      </div>
      
      <!-- Filter Status Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
        <button type="button" class="sched-filter-btn active px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-filter="all">All (${schedules.length})</button>
        ${pendingRequests.length > 0 ? `
          <button type="button" class="sched-filter-btn px-2.5 py-1 rounded-lg font-semibold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200" data-filter="Requested">Pending (${pendingRequests.length})</button>
        ` : ''}
        <button type="button" class="sched-filter-btn px-2.5 py-1 rounded-lg font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100" data-filter="Confirmed">Confirmed (${confirmedCount})</button>
        <button type="button" class="sched-filter-btn px-2.5 py-1 rounded-lg font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100" data-filter="Completed">Completed (${completedCount})</button>
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
              ${!isUserParent ? '<th class="text-right pr-4">Review & Actions</th>' : ''}
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
                    <button type="button" class="primary-btn sm-btn text-xs py-2 px-4 inline-flex items-center gap-1.5 open-request-appointment-modal-btn" id="emptyScheduleRequestBtn" data-action="request-checkup">
                      <span class="material-symbols-outlined text-sm">calendar_add_on</span>
                      <span>Request Check-up Appointment</span>
                    </button>
                  ` : ''}
                </td>
              </tr>
            ` : schedules.map(s => {
              const isPending = s.status === 'Requested';
              const isConfirmed = s.status === 'Confirmed' || s.status === 'Scheduled';
              const isCompleted = s.status === 'Completed' || s.status === 'Done';
              const isDeclined = s.status === 'Declined';

              return `
                <tr class="schedule-record-row ${isPending ? 'bg-amber-50/40 hover:bg-amber-50/70' : ''}" data-status="${escapeHtml(s.status || 'Scheduled')}">
                  <td>
                    <div class="flex items-center gap-2">
                      ${isPending ? `<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" title="Awaiting nurse approval"></span>` : ''}
                      <div>
                        <strong class="text-slate-900 block">${escapeHtml(s.patientName)}</strong>
                        ${s.parentName && s.parentName !== s.patientName ? `<span class="text-[11px] text-slate-500 block">Mother: ${escapeHtml(s.parentName)}</span>` : ''}
                        ${s.notes && cleanDisplayNotes(s.notes) ? `<span class="text-[11px] text-slate-500 block italic">Reason: "${escapeHtml(cleanDisplayNotes(s.notes))}"</span>` : ''}
                        ${s.instructions ? `<span class="text-[11px] text-emerald-700 block font-medium">Midwife Note: "${escapeHtml(s.instructions)}"</span>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${s.type === 'MC' ? 'badge-info' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'} text-[10px]">
                      ${s.type === 'MC' ? '🤰 Maternal Prenatal' : '👶 Child Immunization'}
                    </span>
                  </td>
                  <td>${escapeHtml(s.barangay)}</td>
                  <td>
                    <strong class="text-brand-primary block">${formatDate(s.date)}</strong>
                    <span class="text-[11px] text-slate-500">${escapeHtml(s.time || '08:30 AM')}</span>
                  </td>
                  <td>${escapeHtml(s.assignedNurse || 'Barangay Midwife')}</td>
                  <td>
                    ${isPending ? `
                      <span class="badge bg-amber-100 text-amber-800 border border-amber-300 font-semibold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">schedule</span>
                        <span>Pending Review</span>
                      </span>
                    ` : isConfirmed ? `
                      <span class="badge bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">check_circle</span>
                        <span>Confirmed</span>
                      </span>
                    ` : isCompleted ? `
                      <span class="badge bg-blue-100 text-blue-800 border border-blue-300 font-semibold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">verified</span>
                        <span>Completed</span>
                      </span>
                    ` : isDeclined ? `
                      <span class="badge bg-rose-100 text-rose-800 border border-rose-300 font-semibold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">cancel</span>
                        <span>Declined</span>
                      </span>
                    ` : `
                      <span class="badge badge-info text-[10px]">${escapeHtml(s.status || 'Scheduled')}</span>
                    `}
                  </td>
                  ${!isUserParent ? `
                    <td class="text-right pr-2">
                      <div class="inline-flex items-center gap-1.5 justify-end">
                        ${isPending ? `
                          <!-- Quick Approve Button -->
                          <button type="button" class="approve-schedule-btn px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors" data-id="${escapeHtml(s.id)}" data-name="${escapeHtml(s.patientName)}" title="Quick Approve appointment">
                            <span class="material-symbols-outlined text-xs">check_circle</span>
                            <span>Approve</span>
                          </button>
                          
                          <!-- Review Details Button -->
                          <button type="button" class="review-schedule-btn px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-colors" data-id="${escapeHtml(s.id)}" title="Review request, adjust time slot or add patient instructions">
                            <span class="material-symbols-outlined text-xs">edit_calendar</span>
                            <span>Review</span>
                          </button>
                        ` : `
                          <!-- Edit / Reschedule Button -->
                          <button type="button" class="review-schedule-btn p-1 text-slate-600 hover:bg-slate-100 hover:text-sky-700 rounded transition-colors" data-id="${escapeHtml(s.id)}" title="Edit / Reschedule visit">
                            <span class="material-symbols-outlined text-base">edit_calendar</span>
                          </button>

                          ${!isCompleted ? `
                            <!-- Mark Completed Button -->
                            <button type="button" class="mark-done-schedule-btn p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" data-id="${escapeHtml(s.id)}" title="Mark visit as completed">
                              <span class="material-symbols-outlined text-base">task_alt</span>
                            </button>
                          ` : ''}
                        `}

                        <!-- Cancel / Delete Schedule Button -->
                        <button type="button" class="icon-btn delete-schedule-btn p-1 text-red-600 hover:bg-red-50 rounded transition-colors" data-id="${escapeHtml(s.id)}" title="Cancel Schedule">
                          <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  ` : ''}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
