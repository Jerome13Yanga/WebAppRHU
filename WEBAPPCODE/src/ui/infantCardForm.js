/**
 * Digitized DOH Physical Child Immunization Card (TODO LIGTAS) Form Component
 * Matches the official DOH Todo Ligtas Immunization Card 1-to-1 with clean responsive UI layout.
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';

export function renderTodoLigtasImmunizationCardHtml(infant = {}) {
  const d = infant.formDetails || {};

  return `
    <div class="todo-ligtas-card-container space-y-4 max-h-[80vh] overflow-y-auto pr-1 text-xs text-slate-800">
      <!-- HEADER BANNER -->
      <div class="bg-gradient-to-r from-indigo-900 to-slate-900 text-white text-center py-3 px-4 font-bold text-sm tracking-wider uppercase rounded-xl shadow-sm">
        IMMUNIZATION CARD (TODO LIGTAS)
      </div>

      <!-- PATIENT INFORMATION GRID -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold text-indigo-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-indigo-700 text-base">child_care</span>
          <span>Child & Family Identification</span>
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="md:col-span-2">
            <label class="block font-semibold mb-1 text-slate-700">Child's Full Name *</label>
            <input type="text" id="tl_child_name" class="input-field py-1.5 text-xs" value="${escapeHtml(infant.infantName || '')}" required placeholder="Full Name (Last, First, Middle)">
          </div>

          <div>
            <label class="block font-semibold mb-1 text-slate-700">Date of Birth *</label>
            <input type="date" id="tl_dob" class="input-field py-1.5 text-xs" value="${infant.birthdate || ''}" required>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Mother's Full Name</label>
            <input type="text" id="tl_mother_name" class="input-field py-1.5 text-xs" value="${escapeHtml(infant.motherName || infant.parentName || '')}" placeholder="Full Name">
          </div>

          <div>
            <label class="block font-semibold mb-1 text-slate-700">Place of Birth</label>
            <input type="text" id="tl_birth_place" class="input-field py-1.5 text-xs" value="${escapeHtml(d.placeOfBirth || '')}" placeholder="Hospital / Facility / Address">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Father's Full Name</label>
            <input type="text" id="tl_father_name" class="input-field py-1.5 text-xs" value="${escapeHtml(d.fatherName || '')}" placeholder="Full Name">
          </div>

          <div class="md:col-span-2">
            <label class="block font-semibold mb-1 text-slate-700">Complete Home Address</label>
            <input type="text" id="tl_address" class="input-field py-1.5 text-xs" value="${escapeHtml(infant.address || d.address || '')}">
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold mb-1 text-slate-700">Birth Height (cm)</label>
              <input type="text" id="tl_birth_height" class="input-field py-1.5 text-xs" value="${escapeHtml(d.birthHeight || '50')}">
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700">Birth Weight (kg)</label>
              <input type="text" id="tl_birth_weight" class="input-field py-1.5 text-xs" value="${escapeHtml(d.birthWeight || '3.0')}">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold mb-1 text-slate-700">Sex</label>
              <select id="tl_sex" class="input-field py-1.5 text-xs">
                <option value="Male" ${d.sex === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${d.sex === 'Female' ? 'selected' : ''}>Female</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700">Contact No.</label>
              <input type="text" id="tl_contact_no" class="input-field py-1.5 text-xs" value="${escapeHtml(d.contactNo || '')}">
            </div>
          </div>
        </div>
      </div>

      <!-- IMMUNIZATION VACCINE TABLE -->
      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 class="font-bold text-indigo-900 uppercase border-b border-slate-200 pb-2 text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-indigo-700 text-base">vaccines</span>
          <span>Routine Immunization Log (Bakuna Table)</span>
        </h4>
        
        <div class="table-container overflow-x-auto">
          <table class="data-table text-xs min-w-[700px]">
            <thead>
              <tr class="bg-indigo-950 text-white text-center">
                <th class="w-[25%] text-left">BAKUNA (Vaccine)</th>
                <th class="w-[20%] text-left">DOSES</th>
                <th class="w-[35%] text-center">PETSA NG BAKUNA (mm/dd/yy)</th>
                <th class="w-[20%] text-left">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold text-slate-800">BCG Vaccine</td>
                <td class="text-slate-600">Pagkapanganak</td>
                <td><input type="date" id="tl_bcg_date" class="input-field py-1 text-xs" value="${d.bcgDate || d.bcgWithin24hDate || ''}"></td>
                <td><input type="text" id="tl_bcg_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.bcgRemarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Hepatitis B Vaccine</td>
                <td class="text-slate-600">Pagkapanganak</td>
                <td><input type="date" id="tl_hepb_date" class="input-field py-1 text-xs" value="${d.hepatitisBDate || d.hepaBWithin24hDate || ''}"></td>
                <td><input type="text" id="tl_hepb_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.hepaBRemarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Pentavalent Vaccine<br><span class="text-[10px] font-normal text-slate-500">(DPT-Hep B-HIB)</span></td>
                <td class="text-slate-600">1 ½, 2 ½, 3 ½ Buwan</td>
                <td class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">1:</span>
                    <input type="date" id="tl_penta_1" class="input-field py-1 text-xs flex-1" value="${d.pentavalentDose1Date || ''}">
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">2:</span>
                    <input type="date" id="tl_penta_2" class="input-field py-1 text-xs flex-1" value="${d.pentavalentDose2Date || ''}">
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">3:</span>
                    <input type="date" id="tl_penta_3" class="input-field py-1 text-xs flex-1" value="${d.pentavalentDose3Date || ''}">
                  </div>
                </td>
                <td><input type="text" id="tl_penta_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.pentaRemarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Oral Polio Vaccine (OPV)</td>
                <td class="text-slate-600">1 ½, 2 ½, 3 ½ Buwan</td>
                <td class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">1:</span>
                    <input type="date" id="tl_opv_1" class="input-field py-1 text-xs flex-1" value="${d.opvDose1Date || ''}">
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">2:</span>
                    <input type="date" id="tl_opv_2" class="input-field py-1 text-xs flex-1" value="${d.opvDose2Date || ''}">
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">3:</span>
                    <input type="date" id="tl_opv_3" class="input-field py-1 text-xs flex-1" value="${d.opvDose3Date || ''}">
                  </div>
                </td>
                <td><input type="text" id="tl_opv_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.opvRemarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Inactivated Polio Vaccine (IPV)</td>
                <td class="text-slate-600">3 ½ & 9 Buwan</td>
                <td class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">1:</span>
                    <input type="date" id="tl_ipv_1" class="input-field py-1 text-xs flex-1" value="${d.ipvDose1Date || d.ipvDate || ''}">
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">2:</span>
                    <input type="date" id="tl_ipv_2" class="input-field py-1 text-xs flex-1" value="${d.ipvDose2Date || ''}">
                  </div>
                </td>
                <td><input type="text" id="tl_ipv_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.ipvRemarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Pneumococcal Conjugate Vaccine (PCV)</td>
                <td class="text-slate-600">1 ½, 2 ½, 3 ½ Buwan</td>
                <td class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">1:</span>
                    <input type="date" id="tl_pcv_1" class="input-field py-1 text-xs flex-1" value="${d.pcvDose1Date || ''}">
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">2:</span>
                    <input type="date" id="tl_pcv_2" class="input-field py-1 text-xs flex-1" value="${d.pcvDose2Date || ''}">
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">3:</span>
                    <input type="date" id="tl_pcv_3" class="input-field py-1 text-xs flex-1" value="${d.pcvDose3Date || ''}">
                  </div>
                </td>
                <td><input type="text" id="tl_pcv_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.pcvRemarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Measles, Mumps, Rubella (MMR)</td>
                <td class="text-slate-600">9 Buwan & 1 Taon</td>
                <td class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">1:</span>
                    <input type="date" id="tl_mmr_1" class="input-field py-1 text-xs flex-1" value="${d.mmrDose1Date || ''}">
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 font-bold text-indigo-900">2:</span>
                    <input type="date" id="tl_mmr_2" class="input-field py-1 text-xs flex-1" value="${d.mmrDose2Date || ''}">
                  </div>
                </td>
                <td><input type="text" id="tl_mmr_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.mmrRemarks || '')}"></td>
              </tr>

              <!-- SCHOOL AGED CHILDREN -->
              <tr class="bg-indigo-900 text-white font-bold text-center">
                <td colspan="4" class="py-1.5 uppercase tracking-wide">SCHOOL AGED CHILDREN</td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Measles Containing Vaccine (MCV) MR/MMR</td>
                <td class="text-slate-600">(Grade 1)</td>
                <td><input type="date" id="tl_mcv_g1" class="input-field py-1 text-xs" value="${d.mcvG1Date || ''}"></td>
                <td><input type="text" id="tl_mcv_g1_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.mcvG1Remarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Measles Containing Vaccine (MCV) MR/MMR</td>
                <td class="text-slate-600">(Grade 7)</td>
                <td class="space-y-1.5">
                  <div class="flex items-center gap-2"><span class="w-4 font-bold text-indigo-900">1:</span><input type="date" id="tl_mcv_g7_1" class="input-field py-1 text-xs flex-1" value="${d.mcvG71Date || ''}"></div>
                  <div class="flex items-center gap-2"><span class="w-4 font-bold text-indigo-900">2:</span><input type="date" id="tl_mcv_g7_2" class="input-field py-1 text-xs flex-1" value="${d.mcvG72Date || ''}"></div>
                </td>
                <td><input type="text" id="tl_mcv_g7_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.mcvG7Remarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Tetanus Diphtheria (TD)</td>
                <td class="text-slate-600">(Grade 1 & 7)</td>
                <td class="space-y-1.5">
                  <div class="flex items-center gap-2"><span class="w-4 font-bold text-indigo-900">1:</span><input type="date" id="tl_td_1" class="input-field py-1 text-xs flex-1" value="${d.td1ChildDate || ''}"></div>
                  <div class="flex items-center gap-2"><span class="w-4 font-bold text-indigo-900">2:</span><input type="date" id="tl_td_2" class="input-field py-1 text-xs flex-1" value="${d.td2ChildDate || ''}"></div>
                </td>
                <td><input type="text" id="tl_td_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.tdRemarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Human Papillomavirus Vaccine (HPV)</td>
                <td class="text-slate-600">(Grade 4 - Babae, 9-14 Yrs)</td>
                <td class="space-y-1.5">
                  <div class="flex items-center gap-2"><span class="w-4 font-bold text-indigo-900">1:</span><input type="date" id="tl_hpv_1" class="input-field py-1 text-xs flex-1" value="${d.hpv1Date || ''}"></div>
                  <div class="flex items-center gap-2"><span class="w-4 font-bold text-indigo-900">2:</span><input type="date" id="tl_hpv_2" class="input-field py-1 text-xs flex-1" value="${d.hpv2Date || ''}"></div>
                </td>
                <td><input type="text" id="tl_hpv_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.hpvRemarks || '')}"></td>
              </tr>

              <!-- SENIOR CITIZEN -->
              <tr class="bg-indigo-900 text-white font-bold text-center">
                <td colspan="4" class="py-1.5 uppercase tracking-wide">SENIOR CITIZEN</td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Influenza Vaccine</td>
                <td class="text-slate-600">Annual</td>
                <td><input type="date" id="tl_flu_date" class="input-field py-1 text-xs" value="${d.fluDate || ''}"></td>
                <td><input type="text" id="tl_flu_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.fluRemarks || '')}"></td>
              </tr>
              <tr>
                <td class="font-bold text-slate-800">Pneumococcal Vaccine</td>
                <td class="text-slate-600">As recommended</td>
                <td><input type="date" id="tl_pneumo_date" class="input-field py-1 text-xs" value="${d.pneumoDate || ''}"></td>
                <td><input type="text" id="tl_pneumo_rem" class="input-field py-1 text-xs" value="${escapeHtml(d.pneumoRemarks || '')}"></td>
              </tr>

              <!-- OTHER VACCINES -->
              <tr class="bg-indigo-900 text-white font-bold text-center">
                <td colspan="4" class="py-1.5 uppercase tracking-wide">IBA PANG MGA BAKUNA (Other Vaccines)</td>
              </tr>
              <tr>
                <td><input type="text" id="tl_other_vac_1" class="input-field py-1 text-xs" placeholder="Vaccine Name 1" value="${escapeHtml(d.otherVac1Name || '')}"></td>
                <td><input type="text" id="tl_other_dose_1" class="input-field py-1 text-xs" placeholder="Dose" value="${escapeHtml(d.otherVac1Dose || '')}"></td>
                <td><input type="date" id="tl_other_date_1" class="input-field py-1 text-xs" value="${d.otherVac1Date || ''}"></td>
                <td><input type="text" id="tl_other_rem_1" class="input-field py-1 text-xs" value="${escapeHtml(d.otherVac1Remarks || '')}"></td>
              </tr>
              <tr>
                <td><input type="text" id="tl_other_vac_2" class="input-field py-1 text-xs" placeholder="Vaccine Name 2" value="${escapeHtml(d.otherVac2Name || '')}"></td>
                <td><input type="text" id="tl_other_dose_2" class="input-field py-1 text-xs" placeholder="Dose" value="${escapeHtml(d.otherVac2Dose || '')}"></td>
                <td><input type="date" id="tl_other_date_2" class="input-field py-1 text-xs" value="${d.otherVac2Date || ''}"></td>
                <td><input type="text" id="tl_other_rem_2" class="input-field py-1 text-xs" value="${escapeHtml(d.otherVac2Remarks || '')}"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
