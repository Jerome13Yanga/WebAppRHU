/**
 * Reminders & Advisories View
 * Provides role-specific reminders:
 * - Mother / Parent & Mobile APK: Clean, friendly patient alerts, appointment reminders,
 *   child vaccine milestone trackers, and DOH health advisories (NO clinical tables or browser push errors).
 * - Healthcare Staff: Clinical follow-up queues, today's walk-ins, and high-risk monitoring.
 * Padre Burgos RHU Maternal & Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { isParent, isNurse, isMho, isAdmin, isMatchingParentRecord, isScheduleForParent } from '../auth.js';
import { isNotificationSupported, isNotificationPermissionGrantedSync } from '../utils/notifications.js';
import { isNativeMobileApp } from '../config.js';

export function renderRemindersView(state, currentUser) {
  const isUserParent = isParent(currentUser);
  const isApk = isNativeMobileApp();

  if (isUserParent || isApk) {
    return renderParentRemindersView(state, currentUser, isApk);
  }
  return renderStaffRemindersView(state, currentUser);
}

// ============================================================================
// 1. MOTHER / PARENT & MOBILE APK VIEW
// ============================================================================
function renderParentRemindersView(state, currentUser, isApk) {
  const notifGranted = isNotificationPermissionGrantedSync();
  const parentName = (currentUser?.name || currentUser?.fullName || '').toLowerCase().trim();
  const myMaternal = (state.maternalRecords || []).find(r => isMatchingParentRecord(r, currentUser));
  const myInfants = (state.infantRecords || []).filter(i =>
    isMatchingParentRecord(i, currentUser) || (myMaternal && i.maternalRecordId === myMaternal.id)
  );

  // Schedules matching mother or her children
  const mySchedules = (state.checkupSchedules || []).filter(s => isScheduleForParent(s, currentUser, state));

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySchedules = mySchedules.filter(s => s.date === todayStr);
  const upcomingSchedules = mySchedules.filter(s => s.date && s.date > todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const overdueSchedules = mySchedules.filter(s => s.date && s.date < todayStr && s.status !== 'Completed' && s.status !== 'Done');

  // Standard DOH vaccine schedule milestones
  const vaccineMilestones = [
    { name: 'BCG Vaccine', dose: 'Birth dose', minWeeks: 0, key: 'bcgDate' },
    { name: 'Hepatitis B', dose: 'Within 24 hours of birth', minWeeks: 0, key: 'hepatitisBDate' },
    { name: 'Pentavalent 1st Dose', dose: '1½ months (6 weeks)', minWeeks: 6, key: 'pentavalentDose1Date' },
    { name: 'OPV 1st Dose', dose: '1½ months (6 weeks)', minWeeks: 6, key: 'opvDose1Date' },
    { name: 'PCV 1st Dose', dose: '1½ months (6 weeks)', minWeeks: 6, key: 'pcvDose1Date' },
    { name: 'Pentavalent 2nd Dose', dose: '2½ months (10 weeks)', minWeeks: 10, key: 'pentavalentDose2Date' },
    { name: 'OPV 2nd Dose', dose: '2½ months (10 weeks)', minWeeks: 10, key: 'opvDose2Date' },
    { name: 'PCV 2nd Dose', dose: '2½ months (10 weeks)', minWeeks: 10, key: 'pcvDose2Date' },
    { name: 'Pentavalent 3rd Dose', dose: '3½ months (14 weeks)', minWeeks: 14, key: 'pentavalentDose3Date' },
    { name: 'OPV 3rd Dose', dose: '3½ months (14 weeks)', minWeeks: 14, key: 'opvDose3Date' },
    { name: 'IPV 1st Dose', dose: '3½ months (14 weeks)', minWeeks: 14, key: 'ipvDose1Date' },
    { name: 'PCV 3rd Dose', dose: '3½ months (14 weeks)', minWeeks: 14, key: 'pcvDose3Date' },
    { name: 'MMR 1st Dose (Measles, Mumps, Rubella)', dose: '9 months', minWeeks: 39, key: 'mmrDose1Date' },
    { name: 'IPV 2nd Dose', dose: '9 months', minWeeks: 39, key: 'ipvDose2Date' },
    { name: 'MMR 2nd Dose', dose: '12 months (1 year)', minWeeks: 52, key: 'mmrDose2Date' }
  ];

  return `
    <div class="space-y-5 max-w-3xl mx-auto pb-6">
      <!-- Welcome Header Card -->
      <div class="panel bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-sky-200 p-5 rounded-2xl shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-2xl">notifications_active</span>
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900">Health Reminders & Advisories</h2>
            <p class="text-xs text-slate-600">Padre Burgos RHU personalized schedule alerts and health guidance for you and your family.</p>
          </div>
        </div>
      </div>

      <!-- Mobile / Push Notification Enablement Banner -->
      <div class="p-3.5 rounded-2xl border ${notifGranted ? 'border-emerald-200 bg-emerald-50/70' : 'border-sky-200 bg-sky-50/70'} text-xs flex items-center justify-between flex-wrap gap-2 shadow-2xs">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined ${notifGranted ? 'text-emerald-600' : 'text-sky-600'} text-xl">
            ${notifGranted ? 'notifications_active' : 'notifications'}
          </span>
          <div>
            <strong class="text-slate-900 text-xs block">${notifGranted ? 'Mobile Health Reminders Active' : 'Pop-up Mobile Alerts'}</strong>
            <span class="text-[11px] text-slate-600">
              ${notifGranted 
                ? 'Your device is set to receive reminder alerts for upcoming appointments and child vaccines.' 
                : 'Receive reminder pop-ups on your phone for upcoming check-ups & child vaccines.'}
            </span>
          </div>
        </div>
        <div>
          ${notifGranted ? `
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] px-2.5 py-1 rounded-xl font-semibold">
                <span class="material-symbols-outlined text-xs">check_circle</span>
                <span>Active</span>
              </span>
            </div>
          ` : `
            <button type="button" class="primary-btn sm-btn text-xs py-1.5 px-3 inline-flex items-center gap-1 shrink-0" id="enablePushNotificationsBtn">
              <span class="material-symbols-outlined text-sm">notifications</span>
              <span>Enable Alerts</span>
            </button>
          `}
        </div>
      </div>

      <!-- Overdue Appointments Notice (if any) -->
      ${overdueSchedules.length > 0 ? `
        <div class="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 text-xs shadow-2xs space-y-2">
          <div class="flex items-center gap-2 text-rose-800 font-bold">
            <span class="material-symbols-outlined text-rose-600 text-xl">event_busy</span>
            <span>Overdue Check-up Appointment (${overdueSchedules.length})</span>
          </div>
          <p class="text-rose-700 text-[11px]">
            You or your child have a scheduled visit that has passed. Please visit Padre Burgos RHU or your Barangay Health Station as soon as possible to follow up.
          </p>
          <div class="space-y-1.5 pt-1">
            ${overdueSchedules.map(s => `
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-100 text-xs">
                <span class="font-bold text-slate-800">${escapeHtml(s.patientName)}</span>
                <span class="text-rose-600 font-semibold">${formatDate(s.date)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Today's Appointments -->
      ${todaySchedules.length > 0 ? `
        <div class="panel p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <div class="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200">
            <h3 class="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-xl">today</span>
              <span>Check-up Appointment Scheduled Today!</span>
            </h3>
            <span class="badge bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">Today</span>
          </div>
          <div class="space-y-2">
            ${todaySchedules.map(s => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-100 text-xs shadow-2xs">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-emerald-600 text-lg">schedule</span>
                  <div>
                    <strong class="text-slate-900 block">${escapeHtml(s.patientName)}</strong>
                    <span class="text-slate-500 text-[11px]">${s.type === 'MC' ? 'Maternal Prenatal Care' : 'Child Health & Immunization'}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-emerald-700 block">${s.time || '08:30 AM'}</span>
                  <span class="text-[10px] text-slate-500">Padre Burgos RHU</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Upcoming Check-up Appointments -->
      <div class="panel p-5 rounded-2xl border border-line bg-surface shadow-xs">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-line">
          <h3 class="text-sm font-bold text-text flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-primary text-xl">event_upcoming</span>
            <span>Upcoming Scheduled Appointments</span>
          </h3>
          <button type="button" class="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1" data-nav-page="schedules">
            <span>View All</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        ${upcomingSchedules.length === 0 ? `
          <div class="text-center py-5 text-text-muted text-xs">
            <span class="material-symbols-outlined text-3xl text-slate-300 block mb-1">calendar_month</span>
            <p class="font-semibold text-text">No Upcoming Appointments</p>
            <p class="text-[11px] mt-0.5 mb-3">You can request or view check-up appointments for you or your child.</p>
            <button type="button" class="primary-btn sm-btn text-xs py-2 px-4 inline-flex items-center gap-1.5 open-request-appointment-modal-btn" id="reminderRequestAppointmentBtn" data-action="request-checkup">
              <span class="material-symbols-outlined text-sm">calendar_add_on</span>
              <span>Request Check-up Appointment</span>
            </button>
          </div>
        ` : `
          <div class="space-y-2">
            ${upcomingSchedules.slice(0, 5).map(s => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-surface-alt border border-line text-xs">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-brand-primary text-lg">calendar_month</span>
                  <div>
                    <strong class="text-text block">${escapeHtml(s.patientName)}</strong>
                    <span class="text-text-muted text-[11px]">${s.type === 'MC' ? 'Maternal Care (8ANC)' : 'Child Health & Immunization'}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-brand-primary block">${formatDate(s.date)}</span>
                  <span class="text-[11px] text-text-muted">${s.time || '08:30 AM'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Child Immunization Reminders (Clean Mobile Cards, No Wide Tables) -->
      ${myInfants.length > 0 ? `
        <div class="panel p-5 rounded-2xl border border-indigo-100 bg-surface shadow-xs">
          <div class="flex items-center justify-between mb-3 pb-2 border-b border-line">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600 text-xl">vaccines</span>
              <h3 class="text-sm font-bold text-text">Child Vaccine Milestones (Todo Ligtas)</h3>
            </div>
            <span class="badge badge-info text-[10px]">${myInfants.length} child record(s)</span>
          </div>

          <div class="space-y-3">
            ${myInfants.map(inf => {
              const formDetails = inf.formDetails || {};
              const birthTime = inf.birthdate ? new Date(inf.birthdate).getTime() : 0;
              const ageWeeks = birthTime ? Math.max(0, Math.floor((Date.now() - birthTime) / (1000 * 60 * 60 * 24 * 7))) : 0;
              const isFIC = (inf.immunizationStatus || '').includes('FIC') || (inf.immunizationStatus || '').includes('Fully');
              const nextVaccine = vaccineMilestones.find(v => !formDetails[v.key] && !inf[v.key]);

              return `
                <div class="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs">
                  <div class="flex items-center justify-between mb-1.5">
                    <strong class="text-slate-900 text-xs font-bold">${escapeHtml(inf.infantName)}</strong>
                    <span class="badge ${isFIC ? 'badge-complete' : 'badge-pending'} text-[10px]">
                      ${escapeHtml(inf.immunizationStatus || (isFIC ? 'Fully Immunized (FIC)' : 'Vaccines Ongoing'))}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-600 mb-2">
                    <span>Age: ${inf.ageMonths || 0} months (${ageWeeks} weeks) • Birthday: ${formatDate(inf.birthdate)}</span>
                  </div>
                  <div class="p-2.5 rounded-lg bg-white border border-indigo-100 flex items-center justify-between gap-2">
                    <div>
                      <span class="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">Next Recommended Dose:</span>
                      <strong class="text-xs text-slate-800">${nextVaccine ? escapeHtml(nextVaccine.name) : 'All primary childhood vaccines up to date!'}</strong>
                      ${nextVaccine ? `<p class="text-[11px] text-slate-500 mt-0.5">${nextVaccine.dose}</p>` : ''}
                    </div>
                    <span class="material-symbols-outlined text-indigo-500 text-xl shrink-0">
                      ${nextVaccine ? 'schedule' : 'verified'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Quick RHU Emergency & Clinic Contact Button -->
      <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <strong class="text-slate-900 text-xs font-bold block">Need Assistance or Have Questions?</strong>
          <span class="text-[11px] text-slate-600">Padre Burgos Rural Health Unit and Barangay Health Stations are ready to help.</span>
        </div>
        <button type="button" class="secondary-btn sm-btn text-xs py-1.5 px-3 inline-flex items-center gap-1.5" data-nav-page="contacts">
          <span class="material-symbols-outlined text-sm text-brand-primary">phone_in_talk</span>
          <span>View Clinic Contacts</span>
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// 2. HEALTHCARE STAFF VIEW (Admin, MHO, Nurse/Midwife)
// ============================================================================
function renderStaffRemindersView(state, currentUser) {
  const schedules = state.checkupSchedules || [];
  const maternal = state.maternalRecords || [];
  const infants = state.infantRecords || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const userBgy = currentUser?.barangay || '';
  const isUserNurse = isNurse(currentUser);
  const notifSupported = isNotificationSupported();
  const notifGranted = isNotificationPermissionGrantedSync();

  // Filter schedules based on nurse barangay
  let filteredSchedules = schedules;
  if (isUserNurse && userBgy) {
    filteredSchedules = schedules.filter(s => s.barangay === userBgy);
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
  if (isUserNurse && userBgy) {
    followUpInfants = followUpInfants.filter(i => i.barangay === userBgy);
  }

  // High-risk maternal alerts
  let highRiskMaternal = maternal.filter(r =>
    (r.riskLevel || '').toLowerCase().includes('high') ||
    (r.riskLevel || '').toLowerCase().includes('elevated')
  );
  if (isUserNurse && userBgy) {
    highRiskMaternal = highRiskMaternal.filter(r => r.barangay === userBgy);
  }

  // Health advisories for clinical staff
  const advisories = [];
  if (overdueSchedules.length > 0) {
    advisories.push({
      type: 'warning',
      icon: 'schedule',
      title: 'Overdue Appointments',
      text: `${overdueSchedules.length} checkup appointment${overdueSchedules.length > 1 ? 's are' : ' is'} past the scheduled date. Please coordinate with Barangay Health Workers for patient follow-up.`
    });
  }
  if (highRiskMaternal.length > 0) {
    advisories.push({
      type: 'caution',
      icon: 'warning',
      title: 'High-Risk Pregnancies',
      text: `${highRiskMaternal.length} maternal record${highRiskMaternal.length > 1 ? 's are' : ' is'} flagged as high-risk. Ensure close prenatal monitoring and emergency delivery planning.`
    });
  }
  if (followUpInfants.length > 0) {
    advisories.push({
      type: 'info',
      icon: 'vaccines',
      title: 'Incomplete Immunization Records',
      text: `${followUpInfants.length} child${followUpInfants.length > 1 ? 'ren have' : ' has'} pending vaccine doses. Review Target Client List (TCL) and schedule catch-up immunization.`
    });
  }
  if (todaySchedules.length > 0) {
    advisories.push({
      type: 'success',
      icon: 'event_available',
      title: 'Appointments Today',
      text: `${todaySchedules.length} checkup${todaySchedules.length > 1 ? 's are' : ' is'} scheduled for today. Prepare clinical consultation records and vaccine supplies.`
    });
  }
  if (advisories.length === 0) {
    advisories.push({
      type: 'success',
      icon: 'check_circle',
      title: 'All Clear',
      text: 'No urgent reminders or overdue advisories at this time. All records are up to date.'
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
    <div class="space-y-6 max-w-4xl mx-auto pb-6">
      <!-- Web Push Notification Banner (Web Browser Staff Only) -->
      ${notifSupported ? `
        <div class="p-4 rounded-2xl border ${notifGranted ? 'bg-sky-50/80 border-sky-200' : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-blue-200'} shadow-2xs">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined ${notifGranted ? 'text-sky-600' : 'text-blue-600'} text-2xl mt-0.5">
                ${notifGranted ? 'notifications_active' : 'notifications'}
              </span>
              <div>
                <strong class="text-xs font-bold text-slate-900 block">
                  ${notifGranted ? 'Staff Push Notifications Active' : 'Enable Immunization & Checkup Push Alerts'}
                </strong>
                <p class="text-[11px] text-slate-600 mt-0.5">
                  ${notifGranted 
                    ? 'Browser push notifications are active for daily clinical checkup and immunization milestones.'
                    : 'Receive desktop alerts on this browser when scheduled visits or high-priority immunizations are due.'}
                </p>
              </div>
            </div>
            <div>
              ${notifGranted ? `
                <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] px-3 py-1.5 rounded-xl font-semibold">
                  <span class="material-symbols-outlined text-xs">check_circle</span>
                  <span>Active</span>
                </span>
              ` : `
                <button type="button" class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5 shadow-sm" id="enablePushNotificationsBtn">
                  <span class="material-symbols-outlined text-base">notifications</span>
                  <span>Enable Alerts</span>
                </button>
              `}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Clinical Advisories -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-text flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-600 text-lg">campaign</span>
          <span>Clinical Operational Advisories</span>
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

      <!-- Overdue Checkups Queue -->
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
                    <span class="text-text-muted">${s.type === 'MC' ? 'Maternal Care' : 'Child Immunization'}${s.barangay ? ' • ' + escapeHtml(s.barangay) : ''}</span>
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
          <span>Today's Appointments Roster</span>
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
                    <span class="text-text-muted">${s.type === 'MC' ? 'Maternal Care' : 'Child Immunization'}${s.barangay ? ' • ' + escapeHtml(s.barangay) : ''}</span>
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
                    <span class="text-text-muted">${s.type === 'MC' ? 'Maternal Care' : 'Child Immunization'}${s.barangay ? ' • ' + escapeHtml(s.barangay) : ''}</span>
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

      <!-- Clinical Immunization Follow-Up List (Staff Only) -->
      ${followUpInfants.length > 0 ? `
        <div class="panel p-5 rounded-2xl border border-indigo-200 bg-surface">
          <h3 class="text-sm font-bold text-text flex items-center gap-2 mb-3 pb-2 border-b border-line">
            <span class="material-symbols-outlined text-indigo-600 text-lg">vaccines</span>
            <span>Barangay Immunization Follow-Up Queue</span>
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

      <!-- High-Risk Maternal Clinical Monitoring (Staff Only) -->
      ${highRiskMaternal.length > 0 ? `
        <div class="panel p-5 rounded-2xl border border-red-200 bg-surface">
          <h3 class="text-sm font-bold text-text flex items-center gap-2 mb-3 pb-2 border-b border-line">
            <span class="material-symbols-outlined text-red-600 text-lg">emergency</span>
            <span>High-Risk Maternal Clinical Monitoring</span>
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
