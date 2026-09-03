/**
 * Backup, Recovery & Emergency Contacts UI Module
 * Padre Burgos RHU Maternal & Infant Health Monitoring System
 */
import { escapeHtml } from '../utils/sanitize.js';
import { isAdmin, isNurse, isParent, isMho } from '../auth.js';
import { defaultBarangays } from '../config.js';

export function renderBackupView(state) {
  const meta = state.backupMeta;

  return `
    <div class="page-header mb-6">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">settings_backup_restore</span>
          <span>Backup and Data Recovery</span>
        </h2>
        <p class="text-sm text-slate-500">Export JSON backups of all health records or restore system snapshots.</p>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <h3 class="flex items-center gap-2 mb-3 font-semibold text-slate-900">
          <span class="material-symbols-outlined text-blue-600 text-xl">cloud_download</span>
          <span>Export System Backup</span>
        </h3>
        <p class="text-sm text-slate-600 mb-4">Download a complete JSON snapshot containing maternal records, infant records, schedules, and monthly reports.</p>
        <button class="primary-btn flex items-center gap-2" id="exportBackupBtn">
          <span class="material-symbols-outlined text-lg">download</span>
          <span>Download Full Backup (.json)</span>
        </button>
        ${meta ? `<p class="help-note mt-2 text-xs text-slate-500">Last local backup: ${new Date(meta.date).toLocaleString()} (${escapeHtml(meta.filename || 'snapshot')})</p>` : ''}
      </div>

      <div class="panel">
        <h3 class="flex items-center gap-2 mb-3 font-semibold text-slate-900">
          <span class="material-symbols-outlined text-emerald-600 text-xl">cloud_upload</span>
          <span>Restore System Backup</span>
        </h3>
        <p class="text-sm text-slate-600 mb-4">Restore maternal and infant health data from a previously downloaded backup file.</p>
        <button class="ghost-btn flex items-center gap-2" id="triggerRestoreBtn">
          <span class="material-symbols-outlined text-lg">folder_open</span>
          <span>Select Backup File to Restore</span>
        </button>
      </div>
    </div>
  `;
}

export function renderContactsView(state, currentUser, searchTerm = '') {
  const userIsAdmin = isAdmin(currentUser);
  const userIsNurse = isNurse(currentUser);
  const userIsParent = isParent(currentUser);
  const userIsMho = isMho(currentUser);
  const userBarangay = currentUser?.barangay || '';

  const rawContacts = state.emergencyContacts || [];
  const contactsMap = {};
  rawContacts.forEach(c => {
    if (c && c.barangay) {
      contactsMap[c.barangay] = c;
    }
  });

  // Calculate statistics
  const configuredCount = defaultBarangays.filter(b => Boolean(contactsMap[b]?.contactNumber)).length;
  const nurseStationContact = contactsMap[userBarangay];

  // For Nurse / Midwife: strictly show ONLY their assigned barangay. No other barangays.
  const isSingleNurseView = userIsNurse && !userIsAdmin && Boolean(userBarangay) && userBarangay !== 'All Barangays';

  // --------------------------------------------------------------------------
  // 1. NURSE / MIDWIFE VIEW: ONLY THEIR ASSIGNED BARANGAY + MUNICIPAL HOTLINES
  // --------------------------------------------------------------------------
  if (isSingleNurseView) {
    return `
      <div class="space-y-6 max-w-5xl mx-auto pb-10">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] px-2.5 py-0.5 rounded-md font-semibold">
                <span class="material-symbols-outlined text-xs">local_hospital</span>
                <span>Assigned Health Station</span>
              </span>
              <span class="text-xs text-slate-500 font-medium">Municipality of Padre Burgos</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-2xl">contact_phone</span>
              <span>${escapeHtml(userBarangay)} Emergency Contact & Hotline</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Manage your health station's direct phone number, clinic location, and emergency hotlines for mothers and patients.</p>
          </div>

          <div>
            <button type="button" class="primary-btn flex items-center gap-2 text-xs py-2 px-4 shadow-sm" data-action="edit-contact" data-barangay="${escapeHtml(userBarangay)}">
              <span class="material-symbols-outlined text-base">edit_square</span>
              <span>${nurseStationContact?.contactNumber ? 'Edit Station Contact' : 'Set Station Contact'}</span>
            </button>
          </div>
        </div>

        <!-- Role Action Banner -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-300 shadow-sm relative overflow-hidden">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                  <span class="material-symbols-outlined text-xs">verified</span>
                  <span>Your Assigned Station</span>
                </span>
                <span class="text-xs font-bold text-emerald-950">${escapeHtml(userBarangay)}</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">Station Contact & Hotline Settings</h3>
              <p class="text-xs text-slate-700 mt-1 max-w-2xl">
                You are registered as the healthcare staff for <strong>${escapeHtml(userBarangay)}</strong>.
                ${nurseStationContact?.contactNumber ? `
                  Current station contact: <strong>${escapeHtml(nurseStationContact.nurseName)}</strong> (${escapeHtml(nurseStationContact.contactNumber)}). Keep your number and clinic location updated so mothers and emergency teams can reach you promptly.
                ` : `
                  <span class="text-amber-800 font-semibold">Emergency contact details have not been set for ${escapeHtml(userBarangay)} yet. Please click below to configure your station's contact number and hotline.</span>
                `}
              </p>
            </div>
            <div class="shrink-0">
              <button type="button" class="primary-btn bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2 text-xs font-bold py-2.5 px-4 shadow-sm" data-action="edit-contact" data-barangay="${escapeHtml(userBarangay)}">
                <span class="material-symbols-outlined text-base">edit_square</span>
                <span>${nurseStationContact?.contactNumber ? 'Update Station Details' : 'Set Station Details Now'}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2-Card Layout: Nurse Station Card + Municipal Emergency Dispatch -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nurse's Station Card -->
          <div class="contact-card-item rounded-2xl border-2 border-emerald-500 shadow-md ring-2 ring-emerald-100 bg-white overflow-hidden flex flex-col justify-between" data-barangay-name="${escapeHtml(userBarangay.toLowerCase())}">
            <div class="p-5">
              <div class="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Your Station</span>
                  <h3 class="font-extrabold text-slate-900 text-base sm:text-lg">${escapeHtml(userBarangay)}</h3>
                  <p class="text-xs text-slate-500 font-medium">Barangay Health Station</p>
                </div>
                <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  <span class="material-symbols-outlined text-[12px]">verified</span>
                  <span>Assigned Station</span>
                </span>
              </div>

              <div class="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <!-- Assigned Nurse / Midwife -->
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-blue-600 text-xl shrink-0 mt-0.5">person</span>
                  <div class="flex-1">
                    <span class="text-[11px] text-slate-400 block font-medium">Assigned Nurse / Midwife</span>
                    <strong class="text-slate-900 text-sm">${escapeHtml(nurseStationContact?.nurseName || currentUser?.name || 'Not Set')}</strong>
                  </div>
                </div>

                <!-- Direct Station Phone -->
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-emerald-600 text-xl shrink-0 mt-0.5">phone_in_talk</span>
                  <div class="flex-1">
                    <span class="text-[11px] text-slate-400 block font-medium">Direct Contact Number</span>
                    ${nurseStationContact?.contactNumber ? `
                      <a href="tel:${escapeHtml(nurseStationContact.contactNumber)}" class="text-emerald-700 font-extrabold text-sm hover:underline inline-flex items-center gap-1">
                        <span>${escapeHtml(nurseStationContact.contactNumber)}</span>
                        <span class="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    ` : `
                      <span class="text-amber-700 font-semibold italic text-xs">Contact number not set yet — Click Edit below to configure</span>
                    `}
                  </div>
                </div>

                <!-- Clinic Location -->
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-indigo-600 text-xl shrink-0 mt-0.5">location_on</span>
                  <div class="flex-1">
                    <span class="text-[11px] text-slate-400 block font-medium">Station Location</span>
                    <span class="text-slate-800 font-medium">${escapeHtml(nurseStationContact?.clinicLocation || `${userBarangay} Barangay Health Station`)}</span>
                  </div>
                </div>

                <!-- 24/7 Hotline -->
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-red-600 text-xl shrink-0 mt-0.5">emergency</span>
                  <div class="flex-1">
                    <span class="text-[11px] text-slate-400 block font-medium">24/7 Emergency Hotline</span>
                    <span class="text-slate-800 font-medium">${escapeHtml(nurseStationContact?.hotline || 'RHU Padre Burgos: (042) 717-3211')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4 bg-emerald-50/60 border-t border-emerald-100 flex items-center justify-between">
              <button type="button" class="w-full primary-btn text-xs py-2 flex items-center justify-center gap-1.5 shadow-xs" data-action="edit-contact" data-barangay="${escapeHtml(userBarangay)}">
                <span class="material-symbols-outlined text-sm">edit</span>
                <span>${nurseStationContact?.contactNumber ? 'Edit Emergency Contact' : 'Set Emergency Contact Now'}</span>
              </button>
            </div>
          </div>

          <!-- Municipal Emergency Dispatch & Referral Directory -->
          <div class="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col justify-between">
            <div class="p-5">
              <div class="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span class="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">Municipal Support</span>
                  <h3 class="font-extrabold text-slate-900 text-base sm:text-lg">Padre Burgos Emergency Hotlines</h3>
                  <p class="text-xs text-slate-500 font-medium">Central RHU & Municipal First Responders</p>
                </div>
                <span class="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span class="material-symbols-outlined text-[12px]">call</span>
                  <span>24/7 Hotlines</span>
                </span>
              </div>

              <div class="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong class="text-slate-900 block font-semibold">RHU Main Health Center</strong>
                    <span class="text-[11px] text-slate-500">Maternal & Clinical Referrals</span>
                  </div>
                  <a href="tel:0427173211" class="text-brand-primary font-bold hover:underline inline-flex items-center gap-1">
                    <span>(042) 717-3211</span>
                    <span class="material-symbols-outlined text-xs">call</span>
                  </a>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong class="text-slate-900 block font-semibold">MDRRMO / Ambulance Rescue</strong>
                    <span class="text-[11px] text-slate-500">Emergency Patient Transport</span>
                  </div>
                  <a href="tel:09190000000" class="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
                    <span>0919-000-0000</span>
                    <span class="material-symbols-outlined text-xs">call</span>
                  </a>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong class="text-slate-900 block font-semibold">Padre Burgos PNP (Police)</strong>
                    <span class="text-[11px] text-slate-500">Community Safety & Assistance</span>
                  </div>
                  <a href="tel:09985985683" class="text-blue-700 font-bold hover:underline inline-flex items-center gap-1">
                    <span>0998-598-5683</span>
                    <span class="material-symbols-outlined text-xs">call</span>
                  </a>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong class="text-slate-900 block font-semibold">BFP Fire Station</strong>
                    <span class="text-[11px] text-slate-500">Emergency & Disaster Response</span>
                  </div>
                  <a href="tel:09338202790" class="text-red-700 font-bold hover:underline inline-flex items-center gap-1">
                    <span>0933-820-2790</span>
                    <span class="material-symbols-outlined text-xs">call</span>
                  </a>
                </div>
              </div>
            </div>

            <div class="p-3.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              In high-risk maternal emergencies, coordinate immediately with RHU Main for hospital delivery transport.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. ADMIN, MHO & PARENT VIEW: FULL DIRECTORY
  // --------------------------------------------------------------------------
  let sortedBarangays = [...defaultBarangays].sort((a, b) => {
    if (userBarangay) {
      if (a === userBarangay) return -1;
      if (b === userBarangay) return 1;
    }
    return a.localeCompare(b);
  });

  if (searchTerm) {
    const q = searchTerm.toLowerCase().trim();
    sortedBarangays = sortedBarangays.filter(bgy => {
      const c = contactsMap[bgy];
      return bgy.toLowerCase().includes(q) ||
        (c?.nurseName && c.nurseName.toLowerCase().includes(q)) ||
        (c?.clinicLocation && c.clinicLocation.toLowerCase().includes(q)) ||
        (c?.contactNumber && c.contactNumber.toLowerCase().includes(q)) ||
        (c?.hotline && c.hotline.toLowerCase().includes(q));
    });
  }

  return `
    <div class="space-y-6 max-w-7xl mx-auto pb-10">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] px-2.5 py-0.5 rounded-md font-semibold">
              <span class="material-symbols-outlined text-xs">local_hospital</span>
              <span>RHU Health Directory</span>
            </span>
            <span class="text-xs text-slate-500 font-medium">Municipality of Padre Burgos</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-600 text-2xl">contact_phone</span>
            <span>Barangay Health Workers & Emergency Contacts</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Direct contact numbers, health stations, and 24/7 hotlines for assigned barangay nurses and responders.</p>
        </div>

        <div class="flex items-center gap-2">
          ${userIsAdmin ? `
            <button type="button" class="primary-btn flex items-center gap-2 text-xs" data-action="add-contact">
              <span class="material-symbols-outlined text-base">add</span>
              <span>Configure Station Contact</span>
            </button>
          ` : ''}
        </div>
      </div>

      ${userIsParent && userBarangay ? `
        <div class="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-300 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">Your Residence Barangay</span>
              <h3 class="text-base font-extrabold text-slate-900">${escapeHtml(userBarangay)} Health Station</h3>
              <p class="text-xs text-slate-600 mt-0.5">Assigned Nurse/Midwife: <strong>${escapeHtml(contactsMap[userBarangay]?.nurseName || 'RHU Health Staff')}</strong></p>
            </div>
            <div>
              ${contactsMap[userBarangay]?.contactNumber ? `
                <a href="tel:${escapeHtml(contactsMap[userBarangay].contactNumber)}" class="primary-btn bg-sky-600 hover:bg-sky-700 flex items-center gap-2 text-xs py-2 px-4">
                  <span class="material-symbols-outlined text-base">call</span>
                  <span>Call Station (${escapeHtml(contactsMap[userBarangay].contactNumber)})</span>
                </a>
              ` : `
                <a href="tel:0427173211" class="ghost-btn flex items-center gap-2 text-xs">
                  <span class="material-symbols-outlined text-base">call</span>
                  <span>Call RHU Main: (042) 717-3211</span>
                </a>
              `}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input type="text" id="contactsSearchInput" placeholder="Search by barangay name, assigned nurse, or clinic location..." value="${escapeHtml(searchTerm)}" class="input-field pl-9 py-2 text-xs w-full">
        </div>
        <div class="text-xs text-slate-500 font-medium px-2 shrink-0">
          Showing <strong>${sortedBarangays.length}</strong> Barangay Health Stations (${configuredCount} configured)
        </div>
      </div>

      <!-- 22 Barangay Contact Cards Grid -->
      <div id="contactsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${sortedBarangays.map(bgy => {
          const c = contactsMap[bgy];
          const isUserStation = userBarangay && bgy.toLowerCase() === userBarangay.toLowerCase();
          const canEditThis = userIsAdmin;

          return `
            <div class="contact-card-item rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-white ${
              isUserStation
                ? 'border-2 border-emerald-500 shadow-md ring-2 ring-emerald-100'
                : 'border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300'
            }" data-barangay-name="${escapeHtml(bgy.toLowerCase())}" data-nurse-name="${escapeHtml((c?.nurseName || '').toLowerCase())}" data-clinic="${escapeHtml((c?.clinicLocation || '').toLowerCase())}">
              <div class="p-4 sm:p-5">
                <!-- Card Header -->
                <div class="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <span>${escapeHtml(bgy)}</span>
                    </h3>
                    <p class="text-[11px] text-slate-500 font-medium">Barangay Health Station</p>
                  </div>
                  <div>
                    ${isUserStation ? `
                      <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span class="material-symbols-outlined text-[12px]">star</span>
                        <span>Your Station</span>
                      </span>
                    ` : c?.contactNumber ? `
                      <span class="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <span class="material-symbols-outlined text-[12px]">check_circle</span>
                        <span>Active</span>
                      </span>
                    ` : `
                      <span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <span>Not Set</span>
                      </span>
                    `}
                  </div>
                </div>

                <!-- Card Body -->
                <div class="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                  <!-- Assigned Nurse / Midwife -->
                  <div class="flex items-start gap-2.5">
                    <span class="material-symbols-outlined text-blue-600 text-lg shrink-0 mt-0.5">person</span>
                    <div class="flex-1">
                      <span class="text-[11px] text-slate-400 block font-medium">Assigned Nurse / Midwife</span>
                      <strong class="text-slate-800 text-xs">${escapeHtml(c?.nurseName || 'Not Assigned')}</strong>
                    </div>
                  </div>

                  <!-- Direct Phone Number -->
                  <div class="flex items-start gap-2.5">
                    <span class="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">phone_in_talk</span>
                    <div class="flex-1">
                      <span class="text-[11px] text-slate-400 block font-medium">Direct Station Contact</span>
                      ${c?.contactNumber ? `
                        <a href="tel:${escapeHtml(c.contactNumber)}" class="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
                          <span>${escapeHtml(c.contactNumber)}</span>
                          <span class="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      ` : `
                        <span class="text-slate-400 italic">Contact number not specified</span>
                      `}
                    </div>
                  </div>

                  <!-- Clinic Location -->
                  <div class="flex items-start gap-2.5">
                    <span class="material-symbols-outlined text-indigo-600 text-lg shrink-0 mt-0.5">location_on</span>
                    <div class="flex-1">
                      <span class="text-[11px] text-slate-400 block font-medium">Station Location</span>
                      <span class="text-slate-700 font-medium">${escapeHtml(c?.clinicLocation || `${bgy} Barangay Health Station`)}</span>
                    </div>
                  </div>

                  <!-- 24/7 Hotline -->
                  <div class="flex items-start gap-2.5">
                    <span class="material-symbols-outlined text-red-600 text-lg shrink-0 mt-0.5">emergency</span>
                    <div class="flex-1">
                      <span class="text-[11px] text-slate-400 block font-medium">Emergency Hotline</span>
                      <span class="text-slate-700 font-medium">${escapeHtml(c?.hotline || 'RHU Padre Burgos: (042) 717-3211')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card Action Footer -->
              <div class="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                ${canEditThis ? `
                  <button type="button" class="w-full primary-btn text-xs py-1.5 flex items-center justify-center gap-1.5 shadow-2xs" data-action="edit-contact" data-barangay="${escapeHtml(bgy)}">
                    <span class="material-symbols-outlined text-sm">edit</span>
                    <span>${c?.contactNumber ? 'Edit Emergency Contact' : 'Set Emergency Contact'}</span>
                  </button>
                ` : userIsParent && c?.contactNumber ? `
                  <a href="tel:${escapeHtml(c.contactNumber)}" class="w-full secondary-btn text-xs py-1.5 flex items-center justify-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-emerald-600">call</span>
                    <span>Call Health Worker</span>
                  </a>
                ` : userIsParent ? `
                  <a href="tel:0427173211" class="w-full ghost-btn text-xs py-1.5 flex items-center justify-center gap-1.5">
                    <span class="material-symbols-outlined text-sm">call</span>
                    <span>Call RHU Main Hotline</span>
                  </a>
                ` : `
                  <span class="text-[11px] text-slate-400 text-center w-full py-1">
                    Managed by station staff
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

