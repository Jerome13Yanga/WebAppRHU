/**
 * Digitized DOH Physical Maternal Health Record Form Component
 * Matches Padre Burgos RHU physical maternal record form 1-to-1 with clean responsive UI layout.
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';

export function renderPadreBurgosMaternalFormHtml(record = {}) {
  const d = record.formDetails || {};

  const yesNoSelect = (id, val) => `
    <select id="${id}" class="w-24 text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shrink-0">
      <option value="NO" ${String(val).toUpperCase() === 'NO' || !val ? 'selected' : ''}>NO</option>
      <option value="YES" ${String(val).toUpperCase() === 'YES' ? 'selected' : ''}>YES</option>
    </select>
  `;

  return `
    <div class="padre-burgos-form-container space-y-5 max-h-[80vh] overflow-y-auto pr-1 text-xs text-slate-800">
      <!-- RHU Header -->
      <div class="bg-gradient-to-r from-amber-800 to-orange-900 text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <h3 class="font-bold text-sm uppercase tracking-wide">RHU Padre Burgos - Maternal Health Record</h3>
          <p class="text-[11px] text-amber-200 mt-0.5">Republic of the Philippines | Department of Health | Padre Burgos, Quezon</p>
        </div>
        <span class="badge bg-amber-300 text-slate-900 font-bold px-2.5 py-1 text-[11px] rounded-full">Official Form</span>
      </div>

      <!-- SECTION 1: PERSONAL INFORMATION -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold uppercase border-b border-slate-200 pb-2 text-xs text-amber-900 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-amber-700 text-base">person</span>
          <span>1. Personal Information & Physical Stats</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Patient Name *</label>
            <input type="text" id="pb_fullName" class="input-field py-1.5 text-xs" value="${escapeHtml(record.fullName || '')}" required>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Blood Type</label>
            <select id="pb_bloodType" class="input-field py-1.5 text-xs">
              <option value="">Select Blood Type</option>
              ${["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => `<option value="${bt}" ${d.bloodType === bt ? 'selected' : ''}>${bt}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Complete Address</label>
            <input type="text" id="pb_address" class="input-field py-1.5 text-xs" value="${escapeHtml(record.address || '')}">
          </div>
        </div>

        <!-- TETANUS TOXOID & ANTHROPOMETRY -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 border-t border-slate-200 pt-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Age Category</label>
            <select id="pb_ageCategory" class="input-field py-1.5 text-xs">
              <option value="Below 18" ${d.ageCategory === 'Below 18' ? 'selected' : ''}>Below 18</option>
              <option value="18-34" ${d.ageCategory === '18-34' || !d.ageCategory ? 'selected' : ''}>18-34</option>
              <option value="35+" ${d.ageCategory === '35+' ? 'selected' : ''}>35+</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Height (cm)</label>
            <input type="number" id="pb_heightCm" class="input-field py-1.5 text-xs" value="${d.heightCm || ''}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Weight (kg)</label>
            <input type="number" id="pb_weightKg" class="input-field py-1.5 text-xs" value="${d.weightKg || ''}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">BMI</label>
            <input type="text" id="pb_bmi" class="input-field py-1.5 text-xs" value="${d.bmi || ''}" placeholder="e.g. 21.5">
          </div>
        </div>

        <div class="mt-3 border-t border-slate-200 pt-3">
          <label class="block font-semibold mb-1.5 text-slate-800">Tetanus Toxoid Vaccine Dates (Td1 to Td5):</label>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
            ${[1, 2, 3, 4, 5].map(n => `
              <div class="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span class="text-[10px] font-bold text-amber-900 block mb-1">Td${n} Dose</span>
                <input type="date" id="pb_td${n}Date" class="input-field py-1 text-[11px]" value="${d[`td${n}Date`] || d[`tetanusDose${n}Date`] || ''}">
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- SECTION 2: OBSTETRICAL HISTORY & HEALTH PROBLEMS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- OBSTETRICAL HISTORY -->
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h4 class="font-bold uppercase border-b border-slate-200 pb-2 text-xs text-amber-900 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-amber-700 text-base">history_edu</span>
            <span>2. Obstetrical History</span>
          </h4>
          
          <div class="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl mb-3">
            <label class="block font-bold text-amber-900 mb-2 text-center text-xs">G_ P_ (T_ P_ A_ L_)</label>
            <div class="grid grid-cols-6 gap-1.5 text-center">
              <div>
                <span class="block text-[10px] font-bold text-amber-900 mb-1">G (Gravida)</span>
                <input type="number" id="pb_obG" class="input-field py-1 text-center font-bold text-xs" value="${d.obG || '1'}">
              </div>
              <div>
                <span class="block text-[10px] font-bold text-amber-900 mb-1">P (Para)</span>
                <input type="number" id="pb_obP" class="input-field py-1 text-center font-bold text-xs" value="${d.obP || '0'}">
              </div>
              <div>
                <span class="block text-[10px] font-bold text-amber-900 mb-1">T (Term)</span>
                <input type="number" id="pb_obT" class="input-field py-1 text-center font-bold text-xs" value="${d.obT || '0'}">
              </div>
              <div>
                <span class="block text-[10px] font-bold text-amber-900 mb-1">P (Preterm)</span>
                <input type="number" id="pb_obPreterm" class="input-field py-1 text-center font-bold text-xs" value="${d.obPreterm || '0'}">
              </div>
              <div>
                <span class="block text-[10px] font-bold text-amber-900 mb-1">A (Abortion)</span>
                <input type="number" id="pb_obA" class="input-field py-1 text-center font-bold text-xs" value="${d.obA || '0'}">
              </div>
              <div>
                <span class="block text-[10px] font-bold text-amber-900 mb-1">L (Living)</span>
                <input type="number" id="pb_obL" class="input-field py-1 text-center font-bold text-xs" value="${d.obL || '0'}">
              </div>
            </div>
          </div>

          <div class="divide-y divide-slate-100">
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Caesarean Section?</span>
              ${yesNoSelect('pb_caesarean', d.caesarean)}
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Stillbirth History?</span>
              ${yesNoSelect('pb_stillbirth', d.stillbirth)}
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Post-partum Hemorrhage?</span>
              ${yesNoSelect('pb_postpartumHemorrhage', d.postpartumHemorrhage)}
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">3 Consecutive Miscarriages?</span>
              ${yesNoSelect('pb_consecutiveMiscarriages', d.consecutiveMiscarriages)}
            </div>
          </div>
        </div>

        <!-- PRESENT HEALTH PROBLEMS -->
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h4 class="font-bold uppercase border-b border-slate-200 pb-2 text-xs text-amber-900 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-amber-700 text-base">medical_services</span>
            <span>3. Present Health Problems</span>
          </h4>
          
          <div class="divide-y divide-slate-100">
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Tuberculosis (14+ days cough)</span>
              ${yesNoSelect('pb_probTb', d.probTb)}
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Heart Disease</span>
              ${yesNoSelect('pb_probHeart', d.probHeart)}
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Diabetes</span>
              ${yesNoSelect('pb_probDiabetes', d.probDiabetes)}
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Bronchial Asthma</span>
              ${yesNoSelect('pb_probAsthma', d.probAsthma)}
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Goiter</span>
              ${yesNoSelect('pb_probGoiter', d.probGoiter)}
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5">
              <span class="font-medium text-slate-700">Hypertension</span>
              ${yesNoSelect('pb_probHypertension', d.probHypertension)}
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: PRESENT PREGNANCY (TRIMESTER VISITS 1 TO 9) -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 pb-2.5 flex-wrap gap-2">
          <h4 class="font-bold uppercase text-xs text-amber-900 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-amber-700 text-base">calendar_month</span>
            <span>4. Present Pregnancy & Trimester Visit Logs</span>
          </h4>
          <div class="flex items-center gap-3 font-semibold text-xs">
            <span>LMP: <input type="date" id="pb_lmpDate" class="input-field inline-block w-36 py-1 text-xs" value="${record.lmp || d.lmpDate || ''}"></span>
            <span>EDC (EDD): <input type="date" id="pb_edcDate" class="input-field inline-block w-36 py-1 text-xs" value="${record.edd || d.edcDate || ''}"></span>
          </div>
        </div>

        <div class="flex items-center gap-1 text-[11px] text-amber-800 font-medium md:hidden mb-1">
          <span class="material-symbols-outlined text-sm">swipe</span>
          <span>Swipe horizontally to view full visit logs</span>
        </div>
        <div class="table-container overflow-x-auto">
          <table class="data-table text-xs" style="min-width: 650px; width: 100%;">
            <thead>
              <tr class="bg-amber-900 text-white text-center">
                <th class="w-32">Visit Schedule</th>
                <th>Date of Visit</th>
                <th>AOG (Months)</th>
                <th>BP (mmHg)</th>
                <th>Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(vNum => `
                <tr class="${vNum % 2 === 0 ? 'bg-slate-50' : 'bg-white'}">
                  <td class="font-bold text-amber-900 text-center">
                    Visit ${vNum}
                    <div class="text-[10px] text-slate-500 font-normal">${vNum <= 3 ? '1st Trimester' : vNum <= 6 ? '2nd Trimester' : '3rd Trimester'}</div>
                  </td>
                  <td><input type="date" id="pb_vDate_${vNum}" class="input-field py-1 text-xs" value="${d[`vDate_${vNum}`] || ''}"></td>
                  <td><input type="text" id="pb_vAog_${vNum}" class="input-field py-1 text-xs text-center" placeholder="e.g. 3 mos" value="${escapeHtml(d[`vAog_${vNum}`] || '')}"></td>
                  <td><input type="text" id="pb_vBp_${vNum}" class="input-field py-1 text-xs text-center" placeholder="120/80" value="${escapeHtml(d[`vBp_${vNum}`] || '')}"></td>
                  <td><input type="text" id="pb_vWeight_${vNum}" class="input-field py-1 text-xs text-center" placeholder="kg" value="${escapeHtml(d[`vWeight_${vNum}`] || '')}"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 4: POSTPARTUM & FAMILY PLANNING -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h4 class="font-bold uppercase border-b border-slate-200 pb-2 text-xs text-amber-900 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-amber-700 text-base">baby_changing_station</span>
            <span>5. Postpartum Care Logs</span>
          </h4>
          <div class="divide-y divide-slate-100">
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5"><span class="font-medium text-slate-700">Exclusive Breastfeeding?</span>${yesNoSelect('pb_ppExclusiveBreastfeeding', d.ppExclusiveBreastfeeding)}</div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5"><span class="font-medium text-slate-700">Intends Family Planning?</span>${yesNoSelect('pb_ppIntendsFp', d.ppIntendsFp)}</div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5"><span class="font-medium text-slate-700">Fever &gt; 39°C?</span>${yesNoSelect('pb_ppFever', d.ppFever)}</div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5"><span class="font-medium text-slate-700">Foul Vaginal Discharge?</span>${yesNoSelect('pb_ppFoulDischarge', d.ppFoulDischarge)}</div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5"><span class="font-medium text-slate-700">Excessive Bleeding?</span>${yesNoSelect('pb_ppExcessiveBleeding', d.ppExcessiveBleeding)}</div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5"><span class="font-medium text-slate-700">Pallor?</span>${yesNoSelect('pb_ppPallor', d.ppPallor)}</div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5"><span class="font-medium text-slate-700">Cord OK?</span>${yesNoSelect('pb_ppCordOk', d.ppCordOk)}</div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5"><span class="font-medium text-slate-700">Vit A 200,000 IU Given?</span>${yesNoSelect('pb_ppVitA', d.ppVitA)}</div>
          </div>
        </div>

        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h4 class="font-bold uppercase border-b border-slate-200 pb-2 text-xs text-amber-900 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-amber-700 text-base">clinical_notes</span>
            <span>6. Clinical Referrals & Observations</span>
          </h4>
          <div class="space-y-3">
            <div>
              <label class="block font-semibold mb-1 text-slate-700">Refer to Physician / RHU Action</label>
              <textarea id="pb_referralPhysician" class="input-field py-1.5 text-xs" rows="2" placeholder="e.g. High BP follow up / permanent FP option advice">${escapeHtml(d.referralPhysician || '')}</textarea>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700">Midwife / Nurse Observations</label>
              <textarea id="pb_nurseObservations" class="input-field py-1.5 text-xs" rows="2" placeholder="Clinical notes...">${escapeHtml(d.nurseObservations || '')}</textarea>
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 items-center border-t border-slate-200 pt-3">
              <span class="font-bold text-red-700">Hospital Delivery Recommended?</span>
              ${yesNoSelect('pb_hospitalDeliveryRecommended', d.hospitalDeliveryRecommended)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
