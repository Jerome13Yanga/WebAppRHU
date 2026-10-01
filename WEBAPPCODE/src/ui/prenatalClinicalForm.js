/**
 * Digitized DOH Physical Prenatal Clinical Record Form Component (Nurse/Midwife Side)
 * Digitizes the official DOH Prenatal Clinical Record form 1-to-1.
 * Updated per RHU nurse requirements:
 *  - Visit 1 to Visit 9 (no trimester groupings)
 *  - Added FH, RR, O2 Sat vitals
 *  - Added Contact Number, Family Planning Method
 *  - Renamed conditions (Rheumatic Heart Disease, Blood Transfusion, Renal Disease, Multiple Pregnancy)
 *  - Added Syncope, Abdominal Pain, Constipation, Bleeding, Others
 *  - Premature Rupture → Premature Rupture of Membrane Color (with input)
 *  - Missing FHT → Missing Heart Rate
 *  - Added Abnormal Presentation
 *  - High Risk / Not High Risk status with auto-flag to Doctor
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';

export function renderPrenatalClinicalRecordHtml(record = {}) {
  const d = record.formDetails || {};

  const nameParts = (record.fullName || '').split(' ');
  const surname = d.surname || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : record.fullName || '');
  const firstName = d.firstName || (nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '');

  const check = (val) => val ? 'checked' : '';

  // High risk status (from formDetails or top-level riskLevel)
  const isHighRisk = d.highRiskStatus === 'HIGH_RISK' ||
    (record.riskLevel && record.riskLevel.toLowerCase().includes('high'));

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

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Age</label>
            <input type="number" id="pc_age" class="input-field py-1.5 text-xs" value="${record.age || d.age || ''}">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Contact Number</label>
            <input type="text" id="pc_contact_number" class="input-field py-1.5 text-xs" value="${escapeHtml(d.contactNumber || record.contact || '')}" placeholder="09XX-XXX-XXXX">
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
          <span>Menstrual &amp; Obstetrical History</span>
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
        <div class="flex items-center gap-1 text-[11px] text-blue-700 font-medium md:hidden mt-2 mb-1">
          <span class="material-symbols-outlined text-sm">swipe</span>
          <span>Swipe horizontally to view full obstetric table</span>
        </div>
        <div class="table-container overflow-x-auto mt-1">
          <table class="data-table text-xs" style="min-width: 720px; width: 100%;">
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
            <label class="checkbox-label"><input type="checkbox" id="pc_med_transfusion" ${check(d.medTransfusion)}> <span>Blood Transfusion</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_renal" ${check(d.medRenal)}> <span>Renal Disease</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_med_rhd" ${check(d.medRhd)}> <span>Rheumatic Heart Disease</span></label>
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
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_multi" ${check(d.famMulti)}> <span>Multiple Pregnancy</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_tb" ${check(d.famTb)}> <span>TB</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_heart" ${check(d.famHeart)}> <span>Heart Disease</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_dystocia" ${check(d.famDystocia)}> <span>Dystocia</span></label>
            <label class="checkbox-label"><input type="checkbox" id="pc_fam_psych" ${check(d.famPsych)}> <span>Psychiatric</span></label>
          </div>
        </div>
      </div>

      <!-- SECTION 3B: FAMILY PLANNING METHOD -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-blue-700 text-base">family_restroom</span>
          <span>Family Planning</span>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Family Planning Method</label>
            <select id="pc_fp_method" class="input-field py-1.5 text-xs">
              <option value="">Select Method</option>
              <option value="Pills" ${d.fpMethod === 'Pills' ? 'selected' : ''}>Pills</option>
              <option value="Rhythm / Calendar" ${d.fpMethod === 'Rhythm / Calendar' ? 'selected' : ''}>Rhythm / Calendar</option>
              <option value="Foam / Jelly" ${d.fpMethod === 'Foam / Jelly' ? 'selected' : ''}>Foam / Jelly</option>
              <option value="Condom" ${d.fpMethod === 'Condom' ? 'selected' : ''}>Condom</option>
              <option value="IUD" ${d.fpMethod === 'IUD' ? 'selected' : ''}>IUD</option>
              <option value="Injectable" ${d.fpMethod === 'Injectable' ? 'selected' : ''}>Injectable</option>
              <option value="Implant" ${d.fpMethod === 'Implant' ? 'selected' : ''}>Implant</option>
              <option value="BTL" ${d.fpMethod === 'BTL' ? 'selected' : ''}>BTL (Bilateral Tubal Ligation)</option>
              <option value="NSV" ${d.fpMethod === 'NSV' ? 'selected' : ''}>NSV (Vasectomy)</option>
              <option value="LAM" ${d.fpMethod === 'LAM' ? 'selected' : ''}>LAM</option>
              <option value="SDM" ${d.fpMethod === 'SDM' ? 'selected' : ''}>SDM</option>
              <option value="Abstinence" ${d.fpMethod === 'Abstinence' ? 'selected' : ''}>Abstinence</option>
              <option value="None" ${d.fpMethod === 'None' ? 'selected' : ''}>None</option>
              <option value="Other" ${d.fpMethod === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">FP Method Notes / Other</label>
            <input type="text" id="pc_fp_method_notes" class="input-field py-1.5 text-xs" value="${escapeHtml(d.fpMethodNotes || '')}" placeholder="Other FP method or notes...">
          </div>
        </div>
      </div>

      <!-- SECTION 4: PRESENT PROBLEMS & RISK FACTORS -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-blue-700 text-base">warning</span>
          <span>Present Problems &amp; Risk Factors</span>
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_nausea" ${check(d.probNausea)}> <span>Nausea/Vomiting</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_bleeding_v" ${check(d.probBleeding)}> <span>Vaginal Bleeding</span></label>
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
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_syncope" ${check(d.probSyncope)}> <span>Syncope</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_abdominal" ${check(d.probAbdominal)}> <span>Abdominal Pain</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_constipation" ${check(d.probConstipation)}> <span>Constipation</span></label>
          <label class="checkbox-label"><input type="checkbox" id="pc_prob_bleeding_gen" ${check(d.probBleedingGen)}> <span>Bleeding</span></label>
        </div>
        <div class="pt-1">
          <label class="block font-semibold text-slate-700 mb-1">Others:</label>
          <input type="text" id="pc_prob_others" class="input-field py-1 text-xs" value="${escapeHtml(d.probOthers || '')}" placeholder="Other symptoms or problems...">
        </div>

        <div class="space-y-1.5 pt-2 border-t border-slate-100">
          <label class="block font-bold text-slate-800">Risk Factor(s) Present:</label>
          <input type="text" id="pc_risk_1" class="input-field py-1 text-xs" placeholder="1. Risk factor..." value="${escapeHtml(d.risk_1 || '')}">
          <input type="text" id="pc_risk_2" class="input-field py-1 text-xs" placeholder="2. Risk factor..." value="${escapeHtml(d.risk_2 || '')}">
          <input type="text" id="pc_risk_3" class="input-field py-1 text-xs" placeholder="3. Risk factor..." value="${escapeHtml(d.risk_3 || '')}">
        </div>
      </div>

      <!-- SECTION 5: PRENATAL VISIT LOGS (Visit 1 to Visit 9) -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-4">
        <h4 class="font-bold text-blue-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-blue-700 text-base">clinical_notes</span>
          <span>Prenatal Visit Logs &amp; Clinical Monitoring (Visit 1 – Visit 9)</span>
        </h4>

        <div class="space-y-4">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(vNum => `
            <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-info text-xs font-bold py-1 px-2.5">Visit ${vNum}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <label for="pc_vDate_${vNum}" class="text-xs font-bold text-slate-700 whitespace-nowrap">Visit Date:</label>
                  <input type="date" id="pc_vDate_${vNum}" class="input-field py-1 px-2 text-xs w-36" value="${d[`vDate_${vNum}`] || ''}">
                </div>
              </div>

              <!-- Measurements Grid -->
              <div>
                <div class="text-[11px] font-bold text-blue-950 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-blue-700">vital_signs</span>
                  <span>Physical Measurements &amp; Vitals</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 text-xs">
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">AOG:</span>
                    <input type="text" id="pc_vAog_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vAog_${vNum}`] || '')}" placeholder="wks">
                  </div>
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">BP:</span>
                    <input type="text" id="pc_vBp_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vBp_${vNum}`] || '')}" placeholder="120/80">
                  </div>
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">PR:</span>
                    <input type="text" id="pc_vPr_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vPr_${vNum}`] || '')}" placeholder="bpm">
                  </div>
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">RR:</span>
                    <input type="text" id="pc_vRr_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vRr_${vNum}`] || '')}" placeholder="bpm">
                  </div>
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">O2:</span>
                    <input type="text" id="pc_vO2sat_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vO2sat_${vNum}`] || '')}" placeholder="%">
                  </div>
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">WT:</span>
                    <input type="text" id="pc_vWt_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vWeight_${vNum}`] || d[`vWt_${vNum}`] || '')}" placeholder="kg">
                  </div>
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">FH:</span>
                    <input type="text" id="pc_vFh_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vFh_${vNum}`] || '')}" placeholder="cm">
                  </div>
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">FHT:</span>
                    <input type="text" id="pc_vFht_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vFht_${vNum}`] || '')}" placeholder="bpm">
                  </div>
                  <div class="flex items-center justify-between gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span class="font-semibold text-slate-600">Temp:</span>
                    <input type="text" id="pc_vTemp_${vNum}" class="input-field py-0.5 px-1 text-xs w-14 text-center" value="${escapeHtml(d[`vTemp_${vNum}`] || '')}" placeholder="°C">
                  </div>
                </div>
              </div>

              <!-- Symptoms & Findings and Treatment Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div class="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div class="text-[11px] font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-blue-700">warning</span>
                    <span>Symptoms &amp; Clinical Findings</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_bleeding_${vNum}" ${check(d[`sym_bleeding_${vNum}`])}> <span>Vaginal Bleeding</span></label>
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_bp_${vNum}" ${check(d[`sym_bp_${vNum}`])}> <span>Elevated BP</span></label>
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_rupture_${vNum}" ${check(d[`sym_rupture_${vNum}`])}> <span>Premature Rupture of Membrane Color</span></label>
                    <div class="flex items-center gap-1 pl-4">
                      <label class="text-xs text-slate-600 whitespace-nowrap">Color:</label>
                      <input type="text" id="pc_sym_rupture_color_${vNum}" class="input-field py-0.5 px-1 text-xs flex-1" value="${escapeHtml(d[`sym_rupture_color_${vNum}`] || '')}" placeholder="e.g. Clear, Bloody...">
                    </div>
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_fever_${vNum}" ${check(d[`sym_fever_${vNum}`])}> <span>Fever</span></label>
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_pallor_${vNum}" ${check(d[`sym_pallor_${vNum}`])}> <span>Pallor</span></label>
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_vision_${vNum}" ${check(d[`sym_vision_${vNum}`])}> <span>Blurring Vision</span></label>
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_edema_${vNum}" ${check(d[`sym_edema_${vNum}`])}> <span>Edema</span></label>
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_fht_${vNum}" ${check(d[`sym_fht_${vNum}`])}> <span>Missing Heart Rate</span></label>
                    <label class="checkbox-label"><input type="checkbox" id="pc_sym_abn_pres_${vNum}" ${check(d[`sym_abn_pres_${vNum}`])}> <span>Abnormal Presentation</span></label>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <!-- Treatments section with High Risk status -->
                  <div class="text-[11px] font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1 mb-1">
                    <span class="material-symbols-outlined text-sm text-blue-700">medication</span>
                    <span>Treatment / Actions / Remarks</span>
                  </div>

                  <!-- HIGH RISK STATUS BADGE -->
                  <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-3">
                    <span class="text-xs font-bold text-slate-800">Maternal Risk Status (Visit ${vNum}):</span>
                    <div class="flex gap-2">
                      <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="pc_risk_status_${vNum}" id="pc_risk_high_${vNum}" value="HIGH_RISK" ${d[`riskStatus_${vNum}`] === 'HIGH_RISK' ? 'checked' : ''} class="accent-red-600">
                        <span class="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">🔴 High Risk</span>
                      </label>
                      <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="pc_risk_status_${vNum}" id="pc_risk_normal_${vNum}" value="NOT_HIGH_RISK" ${d[`riskStatus_${vNum}`] === 'NOT_HIGH_RISK' || !d[`riskStatus_${vNum}`] ? 'checked' : ''} class="accent-emerald-600">
                        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">🟢 Not High Risk</span>
                      </label>
                    </div>
                  </div>

                  <textarea id="pc_remarks_${vNum}" class="input-field py-2 px-2.5 text-xs w-full min-h-[85px]" placeholder="Clinical notes, medications prescribed, advice...">${escapeHtml(d[`remarks_${vNum}`] || '')}</textarea>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECTION 6: OVERALL HIGH RISK STATUS -->
      <div class="border-2 ${isHighRisk ? 'border-red-400 bg-red-50' : 'border-emerald-300 bg-emerald-50'} rounded-xl p-4 shadow-sm space-y-3">
        <h4 class="font-bold uppercase text-xs flex items-center gap-1.5 ${isHighRisk ? 'text-red-900' : 'text-emerald-900'}">
          <span class="material-symbols-outlined text-base">${isHighRisk ? 'emergency' : 'shield_with_heart'}</span>
          <span>Overall Maternal Risk Classification</span>
        </h4>
        <div class="flex items-center gap-4 flex-wrap">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="pc_overall_risk" id="pc_overall_high" value="HIGH_RISK" ${isHighRisk ? 'checked' : ''} class="accent-red-600" onchange="document.getElementById('pc_risk_flag_notice').classList.toggle('hidden', this.value !== 'HIGH_RISK')">
            <span class="text-sm font-bold text-red-700 bg-red-100 border-2 border-red-400 px-4 py-2 rounded-xl flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">emergency</span>
              HIGH RISK — Flag to Doctor
            </span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="pc_overall_risk" id="pc_overall_normal" value="NOT_HIGH_RISK" ${!isHighRisk ? 'checked' : ''} class="accent-emerald-600" onchange="document.getElementById('pc_risk_flag_notice').classList.toggle('hidden', this.value !== 'HIGH_RISK')">
            <span class="text-sm font-bold text-emerald-700 bg-emerald-100 border-2 border-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">shield_with_heart</span>
              NOT HIGH RISK — Normal Monitoring
            </span>
          </label>
        </div>
        <div id="pc_risk_flag_notice" class="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg text-xs text-red-800 flex items-start gap-2 ${isHighRisk ? '' : 'hidden'}">
          <span class="material-symbols-outlined text-base mt-0.5 shrink-0">info</span>
          <span><strong>High Risk Flag Active:</strong> This mother's record will be automatically forwarded to the Doctor's Barangay Monitoring dashboard for immediate physician-level review and monitoring.</span>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">High Risk Reason / Notes:</label>
          <textarea id="pc_high_risk_notes" class="input-field py-1.5 text-xs w-full min-h-[60px]" placeholder="Specify reason for high risk classification...">${escapeHtml(d.highRiskNotes || '')}</textarea>
        </div>
      </div>
      </div>
    </div>
  `;
}
