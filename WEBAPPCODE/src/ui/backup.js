/**
 * Backup, Recovery & Emergency Contacts UI Module
 * Padre Burgos RHU Maternal & Infant Health Monitoring System
 */
import { escapeHtml } from '../utils/sanitize.js';
import { isAdmin, isNurse, isParent, isMho, isMatchingParentRecord } from '../auth.js';
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

  let userBarangay = currentUser?.barangay || '';
  if (userIsParent && (!userBarangay || userBarangay === 'All Barangays')) {
    const myMaternal = (state.maternalRecords || []).find(r => isMatchingParentRecord(r, currentUser));
    const myInfant = (state.infantRecords || []).find(i => isMatchingParentRecord(i, currentUser));
    userBarangay = myMaternal?.barangay || myInfant?.barangay || '';
  }

  const rawContacts = state.emergencyContacts || [];
  const contactsMap = {};
  rawContacts.forEach(c => {
    if (c && c.barangay) {
      contactsMap[c.barangay] = c;
    }
  });

  // Calculate statistics
  const configuredCount = defaultBarangays.filter(b => Boolean(contactsMap[b]?.contactNumber)).length;
  const stationContact = userBarangay ? contactsMap[userBarangay] : null;

  // --------------------------------------------------------------------------
  // 1. NURSE / MIDWIFE VIEW: ONLY THEIR ASSIGNED BARANGAY
  // --------------------------------------------------------------------------
  const isSingleNurseView = userIsNurse && !userIsAdmin && Boolean(userBarangay) && userBarangay !== 'All Barangays';
  if (isSingleNurseView) {
    return `
      <div class="space-y-6 max-w-3xl mx-auto pb-10">
        <!-- Page Header -->
        <div class="pb-4 border-b border-slate-200">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] px-2.5 py-0.5 rounded-md font-semibold">
              <span class="material-symbols-outlined text-xs">local_hospital</span>
              <span>Assigned Health Station</span>
            </span>
            <span class="text-xs text-slate-500 font-medium">Municipality of Padre Burgos</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-600 text-2xl">contact_phone</span>
            <span>${escapeHtml(userBarangay)} Emergency Contact</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Manage your health station's direct phone number, clinic location, and emergency hotlines for mothers and patients.</p>
        </div>

        <!-- Nurse's Station Card -->
        <div class="contact-card-item rounded-2xl border-2 border-emerald-500 shadow-md ring-2 ring-emerald-100 bg-white overflow-hidden" data-barangay-name="${escapeHtml(userBarangay.toLowerCase())}">
          <div class="p-6">
            <div class="flex items-start justify-between gap-2 mb-4">
              <div>
                <span class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Your Station</span>
                <h3 class="font-extrabold text-slate-900 text-lg sm:text-xl">${escapeHtml(userBarangay)}</h3>
                <p class="text-xs text-slate-500 font-medium">Barangay Health Station</p>
              </div>
              <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full">
                <span class="material-symbols-outlined text-xs">verified</span>
                <span>Assigned Station</span>
              </span>
            </div>

            <div class="space-y-4 pt-4 border-t border-slate-100 text-xs">
              <!-- Assigned Nurse / Midwife -->
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-blue-600 text-xl shrink-0 mt-0.5">person</span>
                <div class="flex-1">
                  <span class="text-[11px] text-slate-400 block font-medium">Assigned Nurse / Midwife</span>
                  <strong class="text-slate-900 text-sm">${escapeHtml(stationContact?.nurseName || currentUser?.name || 'Not Set')}</strong>
                </div>
              </div>

              <!-- Direct Station Phone -->
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-emerald-600 text-xl shrink-0 mt-0.5">phone_in_talk</span>
                <div class="flex-1">
                  <span class="text-[11px] text-slate-400 block font-medium">Direct Contact Number</span>
                  ${stationContact?.contactNumber ? `
                    <a href="tel:${escapeHtml(stationContact.contactNumber)}" class="text-emerald-700 font-extrabold text-base hover:underline inline-flex items-center gap-1">
                      <span>${escapeHtml(stationContact.contactNumber)}</span>
                      <span class="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ` : `
                    <span class="text-amber-700 font-semibold italic text-xs">Contact number not set yet — Click Edit Emergency Contact below to configure</span>
                  `}
                </div>
              </div>

              <!-- Clinic Location -->
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-indigo-600 text-xl shrink-0 mt-0.5">location_on</span>
                <div class="flex-1">
                  <span class="text-[11px] text-slate-400 block font-medium">Station Location</span>
                  <span class="text-slate-800 font-medium text-sm">${escapeHtml(stationContact?.clinicLocation || `${userBarangay} Barangay Health Station`)}</span>
                </div>
              </div>

              <!-- 24/7 Hotline -->
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-red-600 text-xl shrink-0 mt-0.5">emergency</span>
                <div class="flex-1">
                  <span class="text-[11px] text-slate-400 block font-medium">24/7 Emergency Hotline</span>
                  <span class="text-slate-800 font-medium text-sm">${escapeHtml(stationContact?.hotline || 'RHU Padre Burgos: (042) 717-3211')}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Single Clear Action Button -->
          <div class="p-4 bg-emerald-50/60 border-t border-emerald-100 flex items-center justify-between">
            <button type="button" class="w-full primary-btn text-sm py-2.5 flex items-center justify-center gap-2 shadow-xs" data-action="edit-contact" data-barangay="${escapeHtml(userBarangay)}">
              <span class="material-symbols-outlined text-base">edit</span>
              <span>${stationContact?.contactNumber ? 'Edit Emergency Contact' : 'Set Emergency Contact Now'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. MOTHER / PARENT VIEW: STRICTLY ONLY HER RESIDENCE BARANGAY (NO OTHER BRGY)
  // --------------------------------------------------------------------------
  if (userIsParent) {
    return `
      <div class="space-y-6 max-w-2xl mx-auto pb-10">
        <!-- Page Header -->
        <div class="pb-4 border-b border-slate-200">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1 bg-sky-100 text-sky-800 border border-sky-300 text-[11px] px-2.5 py-0.5 rounded-md font-semibold">
              <span class="material-symbols-outlined text-xs">local_hospital</span>
              <span>Your Barangay Health Station</span>
            </span>
            <span class="text-xs text-slate-500 font-medium">Padre Burgos Maternal & Infant Care</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-600 text-2xl">contact_phone</span>
            <span>Emergency Contacts</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Emergency hotline and direct contact details for your assigned barangay midwife and health station.</p>
        </div>

        ${userBarangay ? `
          <!-- Mother's Assigned Barangay Station Card Only -->
          <div class="contact-card-item rounded-2xl border-2 border-emerald-500 shadow-md ring-2 ring-emerald-100 bg-white overflow-hidden">
            <div class="p-6">
              <div class="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Your Residence Barangay</span>
                  <h3 class="font-extrabold text-slate-900 text-lg sm:text-xl">${escapeHtml(userBarangay)}</h3>
                  <p class="text-xs text-slate-500 font-medium">Barangay Health Station</p>
                </div>
                <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full">
                  <span class="material-symbols-outlined text-xs">verified</span>
                  <span>Assigned Station</span>
                </span>
              </div>

              <div class="space-y-4 pt-4 border-t border-slate-100 text-xs">
                <!-- Assigned Nurse / Midwife -->
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-blue-600 text-xl shrink-0 mt-0.5">person</span>
                  <div class="flex-1">
                    <span class="text-[11px] text-slate-400 block font-medium">Assigned Midwife / Health Worker</span>
                    <strong class="text-slate-900 text-sm">${escapeHtml(stationContact?.nurseName || 'Barangay Health Station Midwife')}</strong>
                  </div>
                </div>

                <!-- Direct Station Contact -->
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-emerald-600 text-xl shrink-0 mt-0.5">phone_in_talk</span>
                  <div class="flex-1">
                    <span class="text-[11px] text-slate-400 block font-medium">Direct Station Contact</span>
                    ${stationContact?.contactNumber ? `
                      <a href="tel:${escapeHtml(stationContact.contactNumber)}" class="text-emerald-700 font-extrabold text-base hover:underline inline-flex items-center gap-1">
                        <span>${escapeHtml(stationContact.contactNumber)}</span>
                        <span class="material-symbols-outlined text-xs">call</span>
                      </a>
                    ` : `
                      <span class="text-slate-400 italic">Direct number not yet listed by station midwife</span>
                    `}
                  </div>
                </div>

                <!-- Station Location -->
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-indigo-600 text-xl shrink-0 mt-0.5">location_on</span>
                  <div class="flex-1">
                    <span class="text-[11px] text-slate-400 block font-medium">Station Location</span>
                    <span class="text-slate-800 font-medium text-sm">${escapeHtml(stationContact?.clinicLocation || `${userBarangay} Barangay Health Station`)}</span>
                  </div>
                </div>

                <!-- 24/7 Hotline -->
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-red-600 text-xl shrink-0 mt-0.5">emergency</span>
                  <div class="flex-1">
                    <span class="text-[11px] text-slate-400 block font-medium">24/7 Emergency Hotline</span>
                    <span class="text-slate-800 font-medium text-sm">${escapeHtml(stationContact?.hotline || 'RHU Padre Burgos: (042) 717-3211')}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Call Action Footer -->
            <div class="p-4 bg-emerald-50/60 border-t border-emerald-100 flex items-center justify-between gap-3">
              ${stationContact?.contactNumber ? `
                <a href="tel:${escapeHtml(stationContact.contactNumber)}" class="w-full primary-btn text-sm py-2.5 flex items-center justify-center gap-2 shadow-xs">
                  <span class="material-symbols-outlined text-base">call</span>
                  <span>Call Station Midwife (${escapeHtml(stationContact.contactNumber)})</span>
                </a>
              ` : `
                <a href="tel:0427173211" class="w-full primary-btn text-sm py-2.5 flex items-center justify-center gap-2 shadow-xs">
                  <span class="material-symbols-outlined text-base">call</span>
                  <span>Call RHU Main Hotline: (042) 717-3211</span>
                </a>
              `}
            </div>
          </div>
        ` : `
          <!-- Fallback when barangay is not specified -->
          <div class="panel text-center py-8">
            <span class="material-symbols-outlined text-4xl text-slate-300 block mb-2">location_off</span>
            <h3 class="font-bold text-slate-800 mb-1">Barangay Not Set</h3>
            <p class="text-xs text-slate-500 mb-4 max-w-sm mx-auto">Please select your residence barangay in your account profile to display your assigned station contact.</p>
            <a href="tel:0427173211" class="primary-btn inline-flex items-center gap-1.5 text-xs py-2 px-4">
              <span class="material-symbols-outlined text-sm">call</span>
              <span>Call RHU Main Hotline: (042) 717-3211</span>
            </a>
          </div>
        `}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 3. ADMIN & MHO VIEW: FULL 22-BARANGAY DIRECTORY
  // --------------------------------------------------------------------------
  let sortedBarangays = [...defaultBarangays];
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
            <span>Municipal Health Directory (All 22 Stations)</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Directory of health worker contact numbers and 24/7 hotlines across all 22 barangays.</p>
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

