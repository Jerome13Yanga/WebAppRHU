/**
 * Digitized DOH Physical Prenatal Clinical Record Form Component (Nurse/Midwife Side)
 * Digitizes the official DOH Prenatal Clinical Record form 1-to-1.
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';

export function renderPrenatalClinicalRecordHtml(record = {}) {
  const d = record.formDetails || {};

  const nameParts = (record.fullName || '').split(' ');
  const surname = d.surname || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : record.fullName || '');
  const firstName = d.firstName || (nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '');

  const check = (val) => val ? 'checked' : '';

  return `
    <div class="prenatal-clinical-record-container space-y-4 max-h-[80vh] overflow-y-auto pr-1 text-xs text-slate-800">
      <!-- HEADER BANNER -->
      <div class="bg-gradient-to-r from-blue-900 to-slate-900 text-white text-center py-3 px-4 font-bold text-sm tracking-wider uppercase rounded-xl shadow-sm">
        PRENATAL CLINICAL RECORD
      </div>

      <!-- SECTION 1: PATIENT IDENTIFICATION -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-blue-700 text-base">person</span>
          <span>Patient Information</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="lg:col-span-2">
            <label class="block font-semibold mb-1 text-slate-700">Surname *</label>
            <input type="text" id="pc_surname" class="input-field py-1.5 text-xs" value="${escapeHtml(surname)}">
          </div>
          <div class="lg:col-span-2">
            <label class="block font-semibold mb-1 text-slate-700">First Name *</label>
            <input type="text" id="pc_first_name" class="input-field py-1.5 text-xs" value="${escapeHtml(firstName)}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">M.I.</label>
            <input type="text" id="pc_mi" class="input-field py-1.5 text-xs text-center" value="${escapeHtml(d.mi || '')}">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Age</label>
            <input type="number" id="pc_age" class="input-field py-1.5 text-xs" value="${record.age || d.age || ''}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Occupation</label>
            <input type="text" id="pc_occupation" class="input-field py-1.5 text-xs" value="${escapeHtml(d.occupation || '')}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Name of Husband</label>
            <input type="text" id="pc_husband_name" class="input-field py-1.5 text-xs" value="${escapeHtml(d.husbandName || '')}">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div class="sm:col-span-2">
            <label class="block font-semibold mb-1 text-slate-700">Address</label>
            <input type="text" id="pc_address" class="input-field py-1.5 text-xs" value="${escapeHtml(record.address || d.address || '')}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Birthday</label>
            <input type="date" id="pc_birthday" class="input-field py-1.5 text-xs" value="${d.birthday || ''}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Civil Status (C.S.)</label>
            <input type="text" id="pc_civil_status" class="input-field py-1.5 text-xs" value="${escapeHtml(d.civilStatus || 'Married')}">
          </div>
        </div>
      </div>

      <!-- SECTION 2: MENSTRUAL & OBSTETRICAL HISTORY -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-blue-700 text-base">water_drop</span>
          <span>Menstrual & Obstetrical History</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Age of Menarche</label>
            <input type="text" id="pc_menarche" class="input-field py-1.5 text-xs" value="${escapeHtml(d.menarche || '12')}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Flow</label>
            <div class="flex items-center gap-3 pt-2">
              <label class="checkbox-label"><input type="checkbox" id="pc_flow_scant" ${check(d.flowScant)}> <span>Scant</span></label>
              <label class="checkbox-label"><input type="checkbox" id="pc_flow_mod" ${check(d.flowMod)}> <span>Mod</span></label>
              <label class="checkbox-label"><input type="checkbox" id="pc_flow_prof" ${check(d.flowProf)}> <span>Profuse</span></label>
            </div>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Duration (Days)</label>
            <input type="number" id="pc_duration" class="input-field py-1.5 text-xs" value="${d.durationDays || '3'}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Cycle in Days</label>
            <input type="text" id="pc_cycle_days" class="input-field py-1.5 text-xs" value="${escapeHtml(d.cycleDays || '28')}">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 border-t border-slate-200 pt-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Regular Mens?</label>
            <select id="pc_regular" class="input-field py-1.5 text-xs">
              <option value="YES" ${d.regularMens !== 'NO' ? 'selected' : ''}>YES</option>
              <option value="NO" ${d.regularMens === 'NO' ? 'selected' : ''}>NO</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Pain with Mens?</label>
            <select id="pc_pain" class="input-field py-1.5 text-xs">
              <option value="NO" ${d.painMens !== 'YES' ? 'selected' : ''}>NO</option>
              <option value="YES" ${d.painMens === 'YES' ? 'selected' : ''}>YES</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">LMP</label>
            <input type="date" id="pc_lmp" class="input-field py-1.5 text-xs" value="${record.lmp || d.lmp || ''}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">PMP</label>
            <input type="date" id="pc_pmp" class="input-field py-1.5 text-xs" value="${d.pmp || ''}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">EDC</label>
            <input type="date" id="pc_edc" class="input-field py-1.5 text-xs" value="${record.edd || d.edc || ''}">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200 pt-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Gravida</label>
            <input type="number" id="pc_gravida" class="input-field py-1.5 text-xs" value="${d.obG || d.gravida || '1'}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Para</label>
            <input type="number" id="pc_para" class="input-field py-1.5 text-xs" value="${d.obP || d.para || '0'}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">OB Code (T_ P_ A_ L_)</label>
            <input type="text" id="pc_ob_code" class="input-field py-1.5 text-xs" value="${escapeHtml(d.obCode || `T${d.obT||0} P${d.obPreterm||0} A${d.obA||0} L${d.obL||0}`)}">
          </div>
        </div>

        <!-- OB TABLE HISTORY -->
        <div class="table-container overflow-x-auto mt-3">
          <table class="data-table text-xs min-w-[750px]">
            <thead>
              <tr class="bg-blue-950 text-white text-center">
                <th>Tx.</th>
                <th>No.</th>
                <th>Year</th>
                <th>AOG</th>
                <th>Place of Confinement</th>
                <th>Complication</th>
                <th>Labor Duration</th>
                <th>Fetal Wt.</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${[1, 2, 3].map(n => `
                <tr>
                  <td class="text-center font-bold text-blue-900">${n}</td>
                  <td><input type="text" id="pc_ob_no_${n}" class="input-field py-1 text-xs" value="${escapeHtml(d[`ob_no_${n}`] || '')}"></td>
                  <td><input type="text" id="pc_ob_yr_${n}" class="input-field py-1 text-xs" value="${escapeHtml(d[`ob_yr_${n}`] || '')}"></td>
                  <td><input type="text" id="pc_ob_aog_${n}" class="input-field py-1 text-xs" value="${escapeHtml(d[`ob_aog_${n}`] || '')}"></td>
                  <td><input type="text" id="pc_ob_place_${n}" class="input-field py-1 text-xs" value="${escapeHtml(d[`ob_place_${n}`] || '')}"></td>
                  <td><input type="text" id="pc_ob_comp_${n}" class="input-field py-1 text-xs" value="${escapeHtml(d[`ob_comp_${n}`] || '')}"></td>
                  <td><input type="text" id="pc_ob_dur_${n}" class="input-field py-1 text-xs" value="${escapeHtml(d[`ob_dur_${n}`] || '')}"></td>
                  <td><input type="text" id="pc_ob_wt_${n}" class="input-field py-1 text-xs" value="${escapeHtml(d[`ob_wt_${n}`] || '')}"></td>
                  <td><input type="text" id="pc_ob_rem_${n}" class="input-field py-1 text-xs" value="${escapeHtml(d[`ob_rem_${n}`] || '')}"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 3: MEDICAL & FAMILY HISTORY -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- MEDICAL HISTORY -->
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
            <span class="material-symbols-outlined text-blue-700 text-base">monitor_heart</span>
            <span>Medical History</span>
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <label class="checkbox-label"><input type="checkbox" id="pc_med_dm" ${check(d.medDm)}> <span>Diabetes</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_heart" ${check(d.medHeart)}> <span>Heart Disease</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_tb" ${check(d.medTb)}> <span>TB</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_anemia" ${check(d.medAnemia)}> <span>Anemia</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_hpn" ${check(d.medHpn)}> <span>HPN</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_pneumo" ${check(d.medPneumo)}> <span>Pneumonia</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_allergy" ${check(d.medAllergy)}> <span>Allergy</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_transfusion" ${check(d.medTransfusion)}> <span>Transfusion</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_renal" ${check(d.medRenal)}> <span>Renal</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_rhd" ${check(d.medRhd)}> <span>Rheumatic</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_jaundice" ${check(d.medJaundice)}> <span>Jaundice</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_std" ${check(d.medStd)}> <span>STD</span></label>
          </div>
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <div><label class="block font-semibold text-slate-700 mb-1">Others (Medical):</label><input type="text" id="pc_med_others" class="input-field py-1 text-xs" value="${escapeHtml(d.medOthers || '')}"></div>
            <div><label class="block font-semibold text-slate-700 mb-1">Operation:</label><input type="text" id="pc_med_operation" class="input-field py-1 text-xs" value="${escapeHtml(d.medOperation || '')}"></div>
          </div>
        </div>

        <!-- FAMILY HISTORY -->
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
            <span class="material-symbols-outlined text-blue-700 text-base">family_history</span>
            <span>Family History</span>
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_hpn" ${check(d.famHpn)}> <span>HPN</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_dm" ${check(d.famDm)}> <span>DM</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_multi" ${check(d.famMulti)}> <span>Multiple Preg</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_tb" ${check(d.famTb)}> <span>TB</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_heart" ${check(d.famHeart)}> <span>Heart Disease</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_dystocia" ${check(d.famDystocia)}> <span>Dystocia</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_psych" ${check(d.famPsych)}> <span>Psychiatric</span></label>
          </div>
        </div>
      </div>

      <!-- SECTION 4: PRESENT PROBLEMS & RISK FACTORS -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-blue-700 text-base">warning</span>
          <span>Present Problems & Risk Factors</span>
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_nausea" ${check(d.probNausea)}> <span>Nausea/Vomiting</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_bleeding" ${check(d.probBleeding)}> <span>Vaginal Bleeding</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_pelvic" ${check(d.probPelvic)}> <span>Pelvic Pain</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_headache" ${check(d.probHeadache)}> <span>Headache</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_discharge" ${check(d.probDischarge)}> <span>Vaginal Discharge</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_edema" ${check(d.probEdema)}> <span>Edema</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_fatigue" ${check(d.probFatigue)}> <span>Easy Fatigability</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_visual" ${check(d.probVisual)}> <span>Visual Disturbance</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_fever" ${check(d.probFever)}> <span>Fever/Chills</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_dizziness" ${check(d.probDizziness)}> <span>Dizziness</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_hpn" ${check(d.probHpn)}> <span>HPN</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_backache" ${check(d.probBackache)}> <span>Backache</span></label>
        </div>

        <div class="space-y-1.5 pt-2 border-t border-slate-100">
          <label class="block font-bold text-slate-800">Risk Factor(s) Present:</label>
          <input type="text" id="pc_risk_1" class="input-field py-1 text-xs" placeholder="1. Risk factor..." value="${escapeHtml(d.risk_1 || '')}">
          <input type="text" id="pc_risk_2" class="input-field py-1 text-xs" placeholder="2. Risk factor..." value="${escapeHtml(d.risk_2 || '')}">
          <input type="text" id="pc_risk_3" class="input-field py-1 text-xs" placeholder="3. Risk factor..." value="${escapeHtml(d.risk_3 || '')}">
        </div>
      </div>

      <!-- SECTION 5: PRENATAL VISIT LOGS -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-blue-700 text-base">clinical_notes</span>
          <span>Prenatal Visit Logs & Clinical Monitoring</span>
        </h4>

        <div class="table-container overflow-x-auto">
          <table class="data-table text-xs min-w-[960px]">
            <thead>
              <tr class="bg-blue-950 text-white text-center">
                <th class="w-[320px] text-left">Visit Date & Physical Measurements</th>
                <th class="w-[380px] text-left">Symptoms & Clinical Findings</th>
                <th class="min-w-[260px] text-left">Treatment / Actions / Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${[1, 2, 3].map(vNum => `
                <tr>
                  <td class="space-y-2 p-3 align-top bg-slate-50/50">
                    <div class="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <span class="font-bold text-blue-900 text-xs">Visit ${vNum} Date:</span>
                      <input type="date" id="pc_vDate_${vNum}" class="input-field py-1 px-2 text-xs w-36" value="${d[`vDate_${vNum}`] || ''}">
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div class="flex items-center justify-between gap-1 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span class="font-semibold text-slate-600">AOG:</span>
                        <input type="text" id="pc_vAog_${vNum}" class="input-field py-0.5 px-1 text-xs w-16 text-center" value="${escapeHtml(d[`vAog_${vNum}`] || '')}" placeholder="wks">
                      </div>
                      <div class="flex items-center justify-between gap-1 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span class="font-semibold text-slate-600">BP:</span>
                        <input type="text" id="pc_vBp_${vNum}" class="input-field py-0.5 px-1 text-xs w-16 text-center" value="${escapeHtml(d[`vBp_${vNum}`] || '')}" placeholder="120/80">
                      </div>
                      <div class="flex items-center justify-between gap-1 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span class="font-semibold text-slate-600">PR:</span>
                        <input type="text" id="pc_vPr_${vNum}" class="input-field py-0.5 px-1 text-xs w-16 text-center" value="${escapeHtml(d[`vPr_${vNum}`] || '')}" placeholder="bpm">
                      </div>
                      <div class="flex items-center justify-between gap-1 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span class="font-semibold text-slate-600">WT:</span>
                        <input type="text" id="pc_vWt_${vNum}" class="input-field py-0.5 px-1 text-xs w-16 text-center" value="${escapeHtml(d[`vWeight_${vNum}`] || d[`vWt_${vNum}`] || '')}" placeholder="kg">
                      </div>
                      <div class="flex items-center justify-between gap-1 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span class="font-semibold text-slate-600">FHT:</span>
                        <input type="text" id="pc_vFht_${vNum}" class="input-field py-0.5 px-1 text-xs w-16 text-center" value="${escapeHtml(d[`vFht_${vNum}`] || '')}" placeholder="bpm">
                      </div>
                      <div class="flex items-center justify-between gap-1 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span class="font-semibold text-slate-600">Temp:</span>
                        <input type="text" id="pc_vTemp_${vNum}" class="input-field py-0.5 px-1 text-xs w-16 text-center" value="${escapeHtml(d[`vTemp_${vNum}`] || '')}" placeholder="°C">
                      </div>
                    </div>
                  </td>
                  <td class="p-3 align-top">
                    <div class="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
                      <label class="checkbox-label"><input type="checkbox" id="pc_sym_bleeding_${vNum}" ${check(d[`sym_bleeding_${vNum}`])}> <span>Vaginal Bleeding</span></label>
                      <label class="checkbox-label"><input type="checkbox" id="pc_sym_bp_${vNum}" ${check(d[`sym_bp_${vNum}`])}> <span>Elevated BP</span></label>
                      <label class="checkbox-label"><input type="checkbox" id="pc_sym_rupture_${vNum}" ${check(d[`sym_rupture_${vNum}`])}> <span>Premature Rupture</span></label>
                      <label class="checkbox-label"><input type="checkbox" id="pc_sym_fever_${vNum}" ${check(d[`sym_fever_${vNum}`])}> <span>Fever</span></label>
                      <label class="checkbox-label"><input type="checkbox" id="pc_sym_pallor_${vNum}" ${check(d[`sym_pallor_${vNum}`])}> <span>Pallor</span></label>
                      <label class="checkbox-label"><input type="checkbox" id="pc_sym_vision_${vNum}" ${check(d[`sym_vision_${vNum}`])}> <span>Blurring Vision</span></label>
                      <label class="checkbox-label"><input type="checkbox" id="pc_sym_edema_${vNum}" ${check(d[`sym_edema_${vNum}`])}> <span>Edema</span></label>
                      <label class="checkbox-label"><input type="checkbox" id="pc_sym_fht_${vNum}" ${check(d[`sym_fht_${vNum}`])}> <span>Missing FHT</span></label>
                    </div>
                  </td>
                  <td class="p-3 align-top">
                    <textarea id="pc_remarks_${vNum}" class="input-field py-2 px-2.5 text-xs w-full min-h-[105px]" placeholder="Clinical notes, medications prescribed, advice...">${escapeHtml(d[`remarks_${vNum}`] || '')}</textarea>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
