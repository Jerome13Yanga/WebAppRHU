/**
 * Checkup History UI Module (Append-Only Visit Tracking & Physical Printouts)
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { isNurse, isParent, isMho, isAdmin } from '../auth.js';

export function renderCheckupHistoryView(state, currentUser, selectedBarangay = "All Barangays") {
  const isUserNurse = isNurse(currentUser);
  const isUserParent = isParent(currentUser);

  let maternalHistory = state.maternalCheckupHistory || [];
  let infantHistory = state.infantCheckupHistory || [];

  if (isUserParent) {
    const parentName = (currentUser?.name || '').toLowerCase().trim();
    maternalHistory = maternalHistory.filter(h =>
      (h.patientName && h.patientName.toLowerCase().trim() === parentName) ||
      (h.user_id && h.user_id === currentUser.id)
    );
    infantHistory = infantHistory.filter(h =>
      (h.parentName && h.parentName.toLowerCase().trim() === parentName) ||
      (h.user_id && h.user_id === currentUser.id)
    );
  } else if (isUserNurse && currentUser?.barangay) {
    maternalHistory = maternalHistory.filter(h => h.barangay === currentUser.barangay);
    infantHistory = infantHistory.filter(h => h.barangay === currentUser.barangay);
  } else if (selectedBarangay && selectedBarangay !== "All Barangays") {
    maternalHistory = maternalHistory.filter(h => h.barangay === selectedBarangay);
    infantHistory = infantHistory.filter(h => h.barangay === selectedBarangay);
  }

  // Sort descending by date
  maternalHistory.sort((a, b) => new Date(b.checkupDate || b.createdAt) - new Date(a.checkupDate || a.createdAt));
  infantHistory.sort((a, b) => new Date(b.checkupDate || b.createdAt) - new Date(a.checkupDate || a.createdAt));

  return `
    <div class="page-header flex items-center justify-between flex-wrap gap-3 mb-4">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2 text-text">
          <span class="material-symbols-outlined text-brand-primary text-2xl">history</span>
          <span>Clinical Checkup Visit History</span>
        </h2>
        <p class="text-xs text-text-muted">
          ${isUserParent ? 'Your complete chronological prenatal & child visit records' : 'Append-only chronological clinical logs for Padre Burgos RHU'}
        </p>
      </div>

      <div class="flex items-center gap-2">
        ${!isUserParent ? `
          <button class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5" id="recordNewCheckupBtn">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>Record New Checkup Visit</span>
          </button>
        ` : ''}
      </div>
    </div>

    <!-- History Tab Switcher -->
    <div class="flex items-center gap-2 mb-4 border-b border-line pb-2">
      <button type="button" class="primary-btn sm-btn" id="tabMaternalHistoryBtn">
        <span class="material-symbols-outlined text-base">pregnant_woman</span>
        <span>Maternal Prenatal Visits (${maternalHistory.length})</span>
      </button>
      <button type="button" class="ghost-btn sm-btn" id="tabInfantHistoryBtn">
        <span class="material-symbols-outlined text-base">child_care</span>
        <span>Infant & Child Visits (${infantHistory.length})</span>
      </button>
    </div>

    <!-- Maternal Checkup History Panel -->
    <div id="maternalHistorySection" class="panel">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-text flex items-center gap-1.5">
          <span class="material-symbols-outlined text-pink-600 text-lg">favorite</span>
          <span>Maternal Care Visit Logs</span>
        </h3>
        <span class="text-xs text-text-muted">${maternalHistory.length} total visits recorded</span>
      </div>

      <div class="table-container overflow-x-auto">
        <table class="data-table text-xs">
          <thead>
            <tr>
              <th>Visit Date</th>
              <th>Patient Name</th>
              <th>Barangay</th>
              <th>AOG (Wks)</th>
              <th>BP (mmHg)</th>
              <th>Weight</th>
              <th>Assessment & Findings</th>
              <th>Treatment / Meds</th>
              <th>Attending Provider</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${maternalHistory.length === 0 ? `
              <tr><td colspan="10" class="text-center py-6 text-text-muted">No maternal checkup history recorded yet.</td></tr>
            ` : maternalHistory.map(h => `
              <tr>
                <td class="font-bold text-brand-primary whitespace-nowrap">${formatDate(h.checkupDate || h.createdAt)}</td>
                <td><strong>${escapeHtml(h.patientName)}</strong></td>
                <td><span class="badge badge-info text-[11px]">${escapeHtml(h.barangay)}</span></td>
                <td>${escapeHtml(h.aogWeeks || '-')}</td>
                <td><strong class="text-text">${escapeHtml(h.bloodPressure || '-')}</strong></td>
                <td>${escapeHtml(h.weightKg ? h.weightKg + ' kg' : '-')}</td>
                <td class="max-w-xs truncate" title="${escapeHtml(h.assessment || '')}">${escapeHtml(h.assessment || '-')}</td>
                <td>${escapeHtml(h.treatmentIntervention || '-')}</td>
                <td class="text-text-muted whitespace-nowrap">${escapeHtml(h.recordedBy || 'RHU Staff')}</td>
                <td>
                  <button type="button" class="icon-btn print-single-history-btn" data-type="maternal" data-id="${escapeHtml(h.id)}" title="Print Clinical Visit Record">
                    <span class="material-symbols-outlined text-base">print</span>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Infant Checkup History Panel (Hidden initially) -->
    <div id="infantHistorySection" class="panel hidden">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-text flex items-center gap-1.5">
          <span class="material-symbols-outlined text-indigo-600 text-lg">child_care</span>
          <span>Infant & Child Health Checkup Logs</span>
        </h3>
        <span class="text-xs text-text-muted">${infantHistory.length} total visits recorded</span>
      </div>

      <div class="table-container overflow-x-auto">
        <table class="data-table text-xs">
          <thead>
            <tr>
              <th>Visit Date</th>
              <th>Infant Name</th>
              <th>Parent / Mother</th>
              <th>Barangay</th>
              <th>Weight (kg)</th>
              <th>Height (cm)</th>
              <th>Immunization Given</th>
              <th>Developmental Notes</th>
              <th>Attending Provider</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${infantHistory.length === 0 ? `
              <tr><td colspan="10" class="text-center py-6 text-text-muted">No infant checkup history recorded yet.</td></tr>
            ` : infantHistory.map(h => `
              <tr>
                <td class="font-bold text-brand-primary whitespace-nowrap">${formatDate(h.checkupDate || h.createdAt)}</td>
                <td><strong>${escapeHtml(h.infantName)}</strong></td>
                <td>${escapeHtml(h.parentName || '-')}</td>
                <td><span class="badge badge-info text-[11px]">${escapeHtml(h.barangay)}</span></td>
                <td>${escapeHtml(h.weightKg ? h.weightKg + ' kg' : '-')}</td>
                <td>${escapeHtml(h.heightCm ? h.heightCm + ' cm' : '-')}</td>
                <td><span class="font-semibold text-emerald-700">${escapeHtml(h.immunizationGiven || 'Routine Monitoring')}</span></td>
                <td class="max-w-xs truncate" title="${escapeHtml(h.assessment || '')}">${escapeHtml(h.assessment || '-')}</td>
                <td class="text-text-muted whitespace-nowrap">${escapeHtml(h.recordedBy || 'RHU Staff')}</td>
                <td>
                  <button type="button" class="icon-btn print-single-history-btn" data-type="infant" data-id="${escapeHtml(h.id)}" title="Print Clinical Visit Record">
                    <span class="material-symbols-outlined text-base">print</span>
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

/**
 * Generates an official, publication-ready clinical checkup printout for Padre Burgos RHU
 */
export function generatePrintableCheckupHistoryHtml(record, type = "maternal") {
  const isMat = type === "maternal";
  const now = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

  return `
    <div class="printable-clinical-sheet bg-white text-slate-900 p-8 max-w-3xl mx-auto border border-slate-300 rounded-lg shadow-sm">
      <!-- HEADER & BRANDING -->
      <div class="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
        <div class="flex items-center gap-4">
          <img src="logo.jpg" alt="Padre Burgos Logo" class="w-16 h-16 object-contain rounded-full border border-slate-200"
            onerror="this.style.display='none'">
          <div>
            <h4 class="text-xs uppercase tracking-wider font-semibold text-slate-600">Republic of the Philippines • Province of Quezon</h4>
            <h2 class="text-base font-bold uppercase text-slate-900 tracking-wide">MUNICIPAL HEALTH OFFICE — PADRE BURGOS</h2>
            <p class="text-[11px] text-slate-600 font-medium">Rural Health Unit (RHU) • Maternal & Child Health Division</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-[10px] font-bold uppercase bg-slate-900 text-white px-2.5 py-1 rounded">Official Clinical Record</span>
          <p class="text-[11px] text-slate-500 mt-1">Date Printed: ${now}</p>
        </div>
      </div>

      <!-- TITLE -->
      <div class="text-center mb-6">
        <h3 class="text-sm font-extrabold uppercase tracking-widest text-slate-900 border-y border-slate-200 py-1.5 bg-slate-50">
          ${isMat ? 'INDIVIDUAL MATERNAL PRENATAL CLINICAL RECORD' : 'CHILD HEALTH & IMMUNIZATION CLINICAL RECORD'}
        </h3>
      </div>

      <!-- PATIENT METADATA -->
      <div class="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded border border-slate-200">
        <div>
          <p class="mb-1"><strong class="text-slate-600">Patient Name:</strong> <span class="font-bold text-slate-900 text-sm">${escapeHtml(record.patientName || record.infantName || 'N/A')}</span></p>
          <p class="mb-1"><strong class="text-slate-600">Barangay Residence:</strong> <span class="font-semibold text-slate-800">${escapeHtml(record.barangay || 'Padre Burgos')}</span></p>
          ${!isMat ? `<p class="mb-1"><strong class="text-slate-600">Parent / Mother:</strong> <span class="font-semibold text-slate-800">${escapeHtml(record.parentName || 'N/A')}</span></p>` : ''}
        </div>
        <div>
          <p class="mb-1"><strong class="text-slate-600">Visit / Examination Date:</strong> <span class="font-bold text-blue-900">${formatDate(record.checkupDate || record.createdAt)}</span></p>
          <p class="mb-1"><strong class="text-slate-600">Attending Healthcare Provider:</strong> <span class="font-semibold text-slate-800">${escapeHtml(record.recordedBy || 'RHU Health Staff')}</span></p>
          <p class="mb-1"><strong class="text-slate-600">Next Scheduled Visit:</strong> <span class="font-semibold text-emerald-800">${record.nextCheckupDate ? formatDate(record.nextCheckupDate) : 'As Advised'}</span></p>
        </div>
      </div>

      <!-- CLINICAL MEASUREMENTS TABLE -->
      <div class="mb-6">
        <h4 class="text-xs font-bold uppercase text-slate-800 mb-2 border-b border-slate-200 pb-1">1. Clinical Measurements & Vital Signs</h4>
        <table class="w-full text-xs border border-slate-300">
          <thead class="bg-slate-100 font-bold text-slate-800 text-center">
            <tr>
              ${isMat ? `
                <th class="border p-2">AOG (Weeks)</th>
                <th class="border p-2">Blood Pressure (mmHg)</th>
                <th class="border p-2">Weight (kg)</th>
                <th class="border p-2">Fundic Height (cm)</th>
                <th class="border p-2">Fetal Heart Rate (bpm)</th>
              ` : `
                <th class="border p-2">Weight (kg)</th>
                <th class="border p-2">Height / Length (cm)</th>
                <th class="border p-2">Immunization Administered</th>
              `}
            </tr>
          </thead>
          <tbody class="text-center font-medium">
            <tr>
              ${isMat ? `
                <td class="border p-2">${escapeHtml(record.aogWeeks || 'N/A')}</td>
                <td class="border p-2 font-bold text-blue-900">${escapeHtml(record.bloodPressure || 'N/A')}</td>
                <td class="border p-2">${escapeHtml(record.weightKg ? record.weightKg + ' kg' : 'N/A')}</td>
                <td class="border p-2">${escapeHtml(record.fundicHeight ? record.fundicHeight + ' cm' : 'N/A')}</td>
                <td class="border p-2">${escapeHtml(record.fetalHeartRate ? record.fetalHeartRate + ' bpm' : 'N/A')}</td>
              ` : `
                <td class="border p-2 font-bold">${escapeHtml(record.weightKg ? record.weightKg + ' kg' : 'N/A')}</td>
                <td class="border p-2">${escapeHtml(record.heightCm ? record.heightCm + ' cm' : 'N/A')}</td>
                <td class="border p-2 font-semibold text-emerald-800">${escapeHtml(record.immunizationGiven || 'Routine Visit')}</td>
              `}
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CLINICAL ASSESSMENT & PLAN -->
      <div class="mb-6 space-y-3">
        <h4 class="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1">2. Clinical Assessment, Diagnosis & Treatment</h4>
        <div class="border border-slate-200 p-3 rounded bg-white">
          <p class="text-[11px] font-bold text-slate-600 uppercase mb-1">Clinical Findings & Assessment Notes:</p>
          <p class="text-xs text-slate-800 leading-relaxed">${escapeHtml(record.assessment || 'No abnormal clinical findings documented.')}</p>
        </div>

        ${record.treatmentIntervention ? `
          <div class="border border-slate-200 p-3 rounded bg-white">
            <p class="text-[11px] font-bold text-slate-600 uppercase mb-1">Prescribed Medication / Micronutrient Supplements / Intervention:</p>
            <p class="text-xs text-slate-800 font-semibold">${escapeHtml(record.treatmentIntervention)}</p>
          </div>
        ` : ''}
      </div>

      <!-- SIGNATURE BLOCK -->
      <div class="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 mt-8 text-center text-xs">
        <div>
          <div class="border-b border-slate-800 w-48 mx-auto pb-6"></div>
          <p class="font-bold text-slate-900 mt-1">${escapeHtml(record.recordedBy || 'Healthcare Provider')}</p>
          <p class="text-[11px] text-slate-500">Examining Midwife / Nurse / Physician</p>
        </div>
        <div>
          <div class="border-b border-slate-800 w-48 mx-auto pb-6"></div>
          <p class="font-bold text-slate-900 mt-1">Municipal Health Officer (MHO)</p>
          <p class="text-[11px] text-slate-500">Padre Burgos Rural Health Unit</p>
        </div>
      </div>
    </div>
  `;
}
