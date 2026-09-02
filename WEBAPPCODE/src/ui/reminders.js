/**
 * Reminders & Advisories View
 * Displays health reminders, upcoming schedules, immunization follow-ups,
 * and maternal/infant health advisories.
 * Padre Burgos RHU Maternal & Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { isParent, isNurse, isMho, isAdmin, getCurrentUser } from '../auth.js';
import { isNotificationSupported, isNotificationGranted, getNotificationPermission } from '../utils/notifications.js';

export function renderRemindersView(state, currentUser) {
  const schedules = state.checkupSchedules || [];
  const maternal = state.maternalRecords || [];
  const infants = state.infantRecords || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const userBgy = currentUser?.barangay || '';
  const isUserParent = isParent(currentUser);
  const isUserNurse = isNurse(currentUser);
  const notifSupported = isNotificationSupported();
  const notifGranted = isNotificationGranted();
  const notifPermission = getNotificationPermission();

  // Filter schedules based on role
  let filteredSchedules = schedules;
  if (isUserNurse) {
    filteredSchedules = schedules.filter(s => s.barangay === userBgy);
  } else if (isUserParent) {
    const parentName = (currentUser?.name || currentUser?.fullName || '').toLowerCase().trim();
    filteredSchedules = schedules.filter(s =>
      s.patientName && s.patientName.toLowerCase().trim() === parentName
    );
  }

  // Split into upcoming, today, and overdue
  const todaySchedules = filteredSchedules.filter(s => s.date === todayStr);
  const upcomingSchedules = filteredSchedules.filter(s => s.date && s.date > todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const overdueSchedules = filteredSchedules.filter(s => s.date && s.date < todayStr && s.status !== 'Completed' && s.status !== 'Done');

  // Immunization follow-ups: infants with incomplete immunization
  let followUpInfants = infants.filter(i =>
    !(i.immunizationStatus || '').includes('FIC') &&
    !(i.immunizationStatus || '').includes('Fully')
  );
  if (isUserNurse) {
    followUpInfants = followUpInfants.filter(i => i.barangay === userBgy);
  } else if (isUserParent) {
    const parentName = (currentUser?.name || currentUser?.fullName || '').toLowerCase().trim();
    followUpInfants = followUpInfants.filter(i =>
      (i.parentName || i.motherName || '').toLowerCase().trim() === parentName
    );
  }

  // High-risk maternal alerts
  let highRiskMaternal = maternal.filter(r =>
    (r.riskLevel || '').toLowerCase().includes('high') ||
    (r.riskLevel || '').toLowerCase().includes('elevated')
  );
  if (isUserNurse) {
    highRiskMaternal = highRiskMaternal.filter(r => r.barangay === userBgy);
  } else if (isUserParent) {
    const parentName = (currentUser?.name || currentUser?.fullName || '').toLowerCase().trim();
    highRiskMaternal = highRiskMaternal.filter(r =>
      (r.fullName || '').toLowerCase().trim() === parentName
    );
  }

  // Health advisories - contextual tips based on data
  const advisories = [];
  if (overdueSchedules.length > 0) {
    advisories.push({
      type: 'warning',
      icon: 'schedule',
      title: 'Overdue Appointments',
      text: `${overdueSchedules.length} checkup appointment${overdueSchedules.length > 1 ? 's are' : ' is'} past the scheduled date. Please follow up with the patient${overdueSchedules.length > 1 ? 's' : ''}.`
    });
  }
  if (highRiskMaternal.length > 0) {
    advisories.push({
      type: 'caution',
      icon: 'warning',
      title: 'High-Risk Pregnancies',
      text: `${highRiskMaternal.length} maternal record${highRiskMaternal.length > 1 ? 's are' : ' is'} flagged as high-risk. Ensure closer monitoring and timely prenatal visits.`
    });
  }
  if (followUpInfants.length > 0) {
    advisories.push({
      type: 'info',
      icon: 'vaccines',
      title: 'Incomplete Immunization Records',
      text: `${followUpInfants.length} child${followUpInfants.length > 1 ? 'ren have' : ' has'} incomplete immunization status. Review and schedule follow-up vaccines.`
    });
  }
  if (todaySchedules.length > 0) {
    advisories.push({
      type: 'success',
      icon: 'event_available',
      title: 'Appointments Today',
      text: `${todaySchedules.length} checkup${todaySchedules.length > 1 ? 's are' : ' is'} scheduled for today. Prepare patient records for walk-in visits.`
    });
  }
  if (advisories.length === 0) {
    advisories.push({
      type: 'success',
      icon: 'check_circle',
      title: 'All Clear',
      text: 'No urgent reminders or advisories at this time. All records are up to date.'
    });
  }

  const badgeClass = (type) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'caution': return 'bg-red-50 border-red-200 text-red-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };
  const iconColor = (type) => {
    switch (type) {
      case 'warning': return 'text-amber-600';
      case 'caution': return 'text-red-600';
      case 'info': return 'text-blue-600';
      case 'success': return 'text-emerald-600';
      default: return 'text-slate-600';
    }
  };

  return `
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Native Web Push Notification Banner -->
      <div class="p-4 rounded-2xl border ${notifGranted ? 'bg-sky-50/80 border-sky-200' : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-blue-200'} shadow-2xs">
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined ${notifGranted ? 'text-sky-600' : 'text-blue-600'} text-2xl mt-0.5">
              ${notifGranted ? 'notifications_active' : 'notifications'}
            </span>
            <div>
              <strong class="text-xs font-bold text-slate-900 block">
                ${notifGranted ? 'Native Push Notifications Active' : 'Enable Immunization & Checkup Push Notifications'}
              </strong>
              <p class="text-[11px] text-slate-600 mt-0.5">
                ${notifGranted 
                  ? 'Your device will receive automatic native alerts when infant vaccines or maternal prenatal appointments are due.'
                  : 'Receive direct native pop-up alerts on this device for upcoming child vaccines, ANC checkups, and clinic announcements.'}
              </p>
            </div>
          </div>
          <div>
            ${notifGranted ? `
              <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] px-3 py-1.5 rounded-xl font-semibold">
                <span class="material-symbols-outlined text-xs">check_circle</span>
                <span>Active</span>
              </span>
            ` : notifSupported ? `
              <button type="button" class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5 shadow-sm" id="enablePushNotificationsBtn">
                <span class="material-symbols-outlined text-base">notifications</span>
                <span>Enable Alerts</span>
              </button>
            ` : `
              <span class="text-[11px] text-slate-400 font-medium">Push not supported on this browser</span>
            `}
          </div>
        </div>
      </div>

      <!-- Health Advisories -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-text flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-600 text-lg">campaign</span>
          <span>Health Advisories</span>
        </h3>
        ${advisories.map(a => `
          <div class="flex items-start gap-3 p-3.5 rounded-xl border ${badgeClass(a.type)}">
            <span class="material-symbols-outlined ${iconColor(a.type)} text-xl mt-0.5">${a.icon}</span>
            <div>
              <strong class="text-xs font-bold block mb-0.5">${escapeHtml(a.title)}</strong>
              <p class="text-[11px] leading-relaxed opacity-90">${escapeHtml(a.text)}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Overdue Checkups -->
      ${overdueSchedules.length > 0 ? `
        <div class="panel p-5 rounded-2xl border border-red-200 bg-surface">
          <h3 class="text-sm font-bold text-text flex items-center gap-2 mb-3 pb-2 border-b border-line">
            <span class="material-symbols-outlined text-red-600 text-lg">event_busy</span>
            <span>Overdue Appointments</span>
            <span class="ml-auto badge bg-red-100 text-red-700 border border-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold">${overdueSchedules.length}</span>
          </h3>
          <div class="space-y-2">
            ${overdueSchedules.slice(0, 10).map(s => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-red-50/60 border border-red-100 text-xs">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-red-500 text-lg">calendar_month</span>
                  <div>
                    <strong class="text-text block">${escapeHtml(s.patientName || 'Unknown')}</strong>
                    <span class="text-text-muted">${s.type === 'MC' ? 'Maternal Prenatal Care' : 'Child Health & Immunization'}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-red-600 block">${formatDate(s.date)}</span>
                  <span class="text-[10px] text-red-500 font-semibold">OVERDUE</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Today's Appointments -->
      <div class="panel p-5 rounded-2xl border border-emerald-200 bg-surface">
        <h3 class="text-sm font-bold text-text flex items-center gap-2 mb-3 pb-2 border-b border-line">
          <span class="material-symbols-outlined text-emerald-600 text-lg">today</span>
          <span>Today's Appointments</span>
          <span class="ml-auto badge bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">${todaySchedules.length}</span>
        </h3>
        ${todaySchedules.length === 0 ? `
          <p class="text-xs text-text-muted text-center py-6">No appointments scheduled for today.</p>
        ` : `
          <div class="space-y-2">
            ${todaySchedules.map(s => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-emerald-600 text-lg">calendar_month</span>
                  <div>
                    <strong class="text-text block">${escapeHtml(s.patientName || 'Unknown')}</strong>
                    <span class="text-text-muted">${s.type === 'MC' ? 'Maternal Prenatal Care' : 'Child Health & Immunization'}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-emerald-700 block">${s.time || '08:30 AM'}</span>
                  <span class="text-[10px] text-emerald-600 font-semibold">TODAY</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Upcoming Appointments -->
      <div class="panel p-5 rounded-2xl border border-line bg-surface">
        <h3 class="text-sm font-bold text-text flex items-center gap-2 mb-3 pb-2 border-b border-line">
          <span class="material-symbols-outlined text-blue-600 text-lg">event_upcoming</span>
          <span>Upcoming Appointments</span>
          <span class="ml-auto badge bg-blue-100 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold">${upcomingSchedules.length}</span>
        </h3>
        ${upcomingSchedules.length === 0 ? `
          <p class="text-xs text-text-muted text-center py-6">No upcoming appointments scheduled.</p>
        ` : `
          <div class="space-y-2">
            ${upcomingSchedules.slice(0, 15).map(s => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-surface-alt border border-line text-xs">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-blue-500 text-lg">calendar_month</span>
                  <div>
                    <strong class="text-text block">${escapeHtml(s.patientName || 'Unknown')}</strong>
                    <span class="text-text-muted">${s.type === 'MC' ? 'Maternal Prenatal Care' : 'Child Health & Immunization'}${s.barangay ? ' • ' + escapeHtml(s.barangay) : ''}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-blue-700 block">${formatDate(s.date)}</span>
                  <span class="text-[11px] text-text-muted">${s.time || '08:30 AM'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Immunization Follow-Up List -->
      ${followUpInfants.length > 0 ? `
        <div class="panel p-5 rounded-2xl border border-indigo-200 bg-surface">
          <h3 class="text-sm font-bold text-text flex items-center gap-2 mb-3 pb-2 border-b border-line">
            <span class="material-symbols-outlined text-indigo-600 text-lg">vaccines</span>
            <span>Immunization Follow-Up</span>
            <span class="ml-auto badge bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] px-2 py-0.5 rounded-full font-bold">${followUpInfants.length}</span>
          </h3>
          <div class="table-container overflow-x-auto">
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th>Child Name</th>
                  <th>Age</th>
                  <th>Mother</th>
                  <th>Barangay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${followUpInfants.slice(0, 15).map(i => `
                  <tr>
                    <td class="font-bold text-text">${escapeHtml(i.infantName || '-')}</td>
                    <td>${i.ageMonths || 0} mos</td>
                    <td class="text-text-muted">${escapeHtml(i.parentName || i.motherName || '-')}</td>
                    <td><span class="badge badge-info text-[10px]">${escapeHtml(i.barangay || '-')}</span></td>
                    <td>
                      <span class="badge badge-pending text-[10px]">
                        ${escapeHtml(i.immunizationStatus || 'Incomplete')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- High-Risk Maternal Monitoring -->
      ${highRiskMaternal.length > 0 ? `
        <div class="panel p-5 rounded-2xl border border-red-200 bg-surface">
          <h3 class="text-sm font-bold text-text flex items-center gap-2 mb-3 pb-2 border-b border-line">
            <span class="material-symbols-outlined text-red-600 text-lg">emergency</span>
            <span>High-Risk Maternal Monitoring</span>
            <span class="ml-auto badge bg-red-100 text-red-700 border border-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold">${highRiskMaternal.length}</span>
          </h3>
          <div class="table-container overflow-x-auto">
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th>Mother Name</th>
                  <th>Age</th>
                  <th>Barangay</th>
                  <th>EDD</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                ${highRiskMaternal.map(m => `
                  <tr>
                    <td class="font-bold text-text">${escapeHtml(m.fullName || '-')}</td>
                    <td>${m.age || '-'}</td>
                    <td><span class="badge badge-info text-[10px]">${escapeHtml(m.barangay || '-')}</span></td>
                    <td>${formatDate(m.edd)}</td>
                    <td><span class="badge bg-red-100 text-red-700 border border-red-200 text-[10px]">${escapeHtml(m.riskLevel || 'High')}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
