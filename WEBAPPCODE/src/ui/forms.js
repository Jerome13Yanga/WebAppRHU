/**
 * My Health Forms UI Module (Parent Health Forms Modal Launchers)
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { barangays } from '../config.js';

export function renderFormsView(state = {}, currentUser = {}) {
  const motherName = currentUser?.name || currentUser?.fullName || '';
  const lowerName = motherName.toLowerCase().trim();

  const maternalRecords = Array.isArray(state?.maternalRecords) ? state.maternalRecords : [];
  const infantRecords = Array.isArray(state?.infantRecords) ? state.infantRecords : [];

  const myMaternal = maternalRecords.find(r => 
    (r.fullName && r.fullName.toLowerCase().trim() === lowerName) ||
    (r.user_id && currentUser?.id && r.user_id === currentUser.id) ||
    (r.email && currentUser?.email && r.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  const myInfants = infantRecords.filter(i => 
    (i.parentName && i.parentName.toLowerCase().trim() === lowerName) || 
    (i.motherName && i.motherName.toLowerCase().trim() === lowerName) ||
    (i.user_id && currentUser?.id && i.user_id === currentUser.id)
  );

  return `
    <div class="page-header mb-6">
      <h2 class="text-xl font-bold flex items-center gap-2 text-slate-800">
        <span class="material-symbols-outlined text-blue-600 text-2xl">description</span>
        <span>My Health Forms</span>
      </h2>
      <p class="text-xs text-slate-500">Click a form button below to open the interactive digital health modal.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Maternal Health Form Card -->
      <div class="panel p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 shadow-sm hover:shadow transition">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-3 bg-amber-600 text-white rounded-xl shadow-sm">
            <span class="material-symbols-outlined text-2xl">pregnant_woman</span>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">Maternal Health Record</h3>
            <p class="text-xs text-amber-900 font-medium mt-0.5">DOH Padre Burgos RHU Maternal Form</p>
          </div>
        </div>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Digital record for pregnancy monitoring, Tetanus Toxoid, GTPAL Obstetrical History, Present Pregnancy (1st-3rd Tri visits), Postpartum care, and Family Planning.
        </p>
        <div class="flex items-center justify-between pt-2 border-t border-amber-200/60">
          <span class="badge ${myMaternal?.verification_status === 'Verified' ? 'badge-success' : 'badge-warning'}">
            ${myMaternal?.verification_status === 'Verified' ? 'Nurse Verified' : 'Pending Verification'}
          </span>
          <button class="primary-btn bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5" id="openMaternalFormModalBtn">
            <span class="material-symbols-outlined text-base">edit_note</span>
            <span>Open Maternal Form Modal</span>
          </button>
        </div>
      </div>

      <!-- Child Immunization Form Card -->
      <div class="panel p-6 bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 shadow-sm hover:shadow transition">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
            <span class="material-symbols-outlined text-2xl">child_care</span>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">Child Immunization Record</h3>
            <p class="text-xs text-emerald-900 font-medium mt-0.5">DOH Routine Vaccine Card</p>
          </div>
        </div>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Digital immunization card table tracking BCG, HepB, Pentavalent (1-3), OPV (1-3), IPV (1-2), PCV (1-3), MMR (1-2), and FIC/CIC milestones.
        </p>
        <div class="flex items-center justify-between pt-2 border-t border-emerald-200/60">
          <span class="badge badge-info">${myInfants.length} Infant(s) Registered</span>
          <button class="primary-btn bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5" id="openInfantFormModalBtn">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>Register Child Record</span>
          </button>
        </div>
      </div>
    </div>

    ${myInfants.length > 0 ? `
      <div class="panel">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-emerald-600 text-sm">badge</span>
          <span>Registered Child Immunization Cards</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          ${myInfants.map(inf => `
            <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
              <div>
                <strong class="text-sm text-slate-800 block">${escapeHtml(inf.infantName)}</strong>
                <div class="text-xs text-slate-500 mt-0.5">DOB: ${formatDate(inf.birthdate)} | ${inf.ageMonths || 0} mos</div>
              </div>
              <button class="primary-btn sm-btn open-infant-card-modal-btn bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-xs inline-flex items-center gap-1 shrink-0" data-id="${escapeHtml(inf.id)}">
                <span class="material-symbols-outlined text-sm">medical_information</span>
                <span>Open Card Modal</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}
