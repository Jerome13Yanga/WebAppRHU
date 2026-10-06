/**
 * Print / Save-as-PDF utility for Padre Burgos RHU
 * Generates faithful replicas of the physical DOH forms (reference photos):
 *   - Maternal Health Record  (2-page A4 portrait)
 *   - Immunization Card       (A4 landscape, Todo Ligtas format)
 *
 * Call openMaternalRecordPrintWindow(record) or openImmunizationCardPrintWindow(infant)
 * from anywhere in the app; a new tab will open and the browser Print dialog fires
 * automatically (user can choose "Save as PDF" from the printer list).
 */

const LOGO_SRC = 'padreburgos.jpeg';

/** Shared RHU letterhead */
function rhuHeader() {
  return `
    <div class="rhu-header">
      <img src="${LOGO_SRC}" alt="Padre Burgos Seal" class="rhu-logo"
           onerror="this.style.display='none'">
      <div class="rhu-header-text">
        <div class="rhu-sub">Republic of the Philippines</div>
        <div class="rhu-sub">Department of Health</div>
        <div class="rhu-unit">RURAL HEALTH UNIT</div>
        <div class="rhu-unit">MUNICIPAL HEALTH OFFICE</div>
        <div class="rhu-place">PADRE BURGOS, Quezon Province</div>
        <div class="rhu-contact">rhu.padreburgos@yahoo.com &bull; +63923446053</div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────────────────
   MATERNAL RECORD  (matches photos 1 & 2)
────────────────────────────────────────────────────────── */
export function openMaternalRecordPrintWindow(record = {}) {
  const d = record.formDetails || {};

  const nameParts = (record.fullName || '').split(' ');
  const surname = d.surname || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : record.fullName || '');
  const firstName = d.firstName || (nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '');
  const mi = d.mi || '';

  const isHighRisk = d.highRiskStatus === 'HIGH_RISK' ||
    (record.riskLevel && record.riskLevel.toLowerCase().includes('high'));

  const yn = (val) => {
    if (val === true) return 'YES';
    if (val === false) return 'NO';
    if (!val) return '';
    const v = String(val).toUpperCase();
    return v === 'YES' ? 'YES' : v === 'NO' ? 'NO' : val;
  };

  const fmtDate = (val) => {
    if (!val) return '';
    try {
      const dt = new Date(val);
      if (isNaN(dt.getTime())) return val;
      return dt.toLocaleDateString('en-PH', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch { return val || ''; }
  };

  const check = (val) => val ? '&#10003;' : '';

  const medicalHistoryList = [
    ['Diabetes', d.medDm],
    ['Heart Disease', d.medHeart],
    ['Tuberculosis (TB)', d.medTb],
    ['Anemia', d.medAnemia],
    ['Hypertension (HPN)', d.medHpn],
    ['Pneumonia', d.medPneumo],
    ['Allergy', d.medAllergy],
    ['Blood Transfusion', d.medTransfusion],
    ['Renal Disease', d.medRenal],
    ['Rheumatic Heart Disease', d.medRhd],
    ['Jaundice', d.medJaundice],
    ['STD', d.medStd]
  ];

  const familyHistoryList = [
    ['Hypertension (HPN)', d.famHpn],
    ['Diabetes (DM)', d.famDm],
    ['Multiple Pregnancy', d.famMulti],
    ['Tuberculosis (TB)', d.famTb],
    ['Heart Disease', d.famHeart],
    ['Dystocia', d.famDystocia],
    ['Psychiatric', d.famPsych]
  ];

  const presentProblemsList = [
    ['Nausea / Vomiting', d.probNausea],
    ['Vaginal Bleeding', d.probBleeding],
    ['Pelvic Pain', d.probPelvic],
    ['Headache', d.probHeadache],
    ['Vaginal Discharge', d.probDischarge],
    ['Edema', d.probEdema],
    ['Easy Fatigability', d.probFatigue],
    ['Visual Disturbance', d.probVisual],
    ['Fever / Chills', d.probFever],
    ['Dizziness', d.probDizziness],
    ['Hypertension (HPN)', d.probHpn],
    ['Backache', d.probBackache],
    ['Syncope', d.probSyncope],
    ['Abdominal Pain', d.probAbdominal],
    ['Constipation', d.probConstipation],
    ['Bleeding', d.probBleedingGen]
  ];

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>Prenatal Clinical Record – ${record.fullName || 'Patient'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,Helvetica,sans-serif;font-size:8pt;color:#000;background:#fff;}
@page{size:A4 portrait;margin:8mm 10mm;}
.page{width:100%;page-break-after:always;}
.page:last-child{page-break-after:auto;}
/* header */
.rhu-header{display:flex;align-items:center;gap:12px;margin-bottom:6px;padding-bottom:5px;border-bottom:2px solid #000;}
.rhu-logo{width:54px;height:54px;object-fit:contain;}
.rhu-header-text{flex:1;}
.rhu-sub{font-size:7pt;}
.rhu-unit{font-size:9.5pt;font-weight:bold;}
.rhu-place{font-size:8pt;font-weight:bold;}
.rhu-contact{font-size:6.5pt;}
/* section boxes */
.sbox{border:1.5px solid #000;margin-bottom:4px;}
.stitle{font-weight:bold;font-size:8pt;text-align:center;padding:2.5px 4px;
        text-transform:uppercase;letter-spacing:.4px;color:#fff;background:#0f172a;}
.stitle.orange{background:#1e3a8a;}
.stitle.red{background:#991b1b;}
.stitle.left{text-align:left;padding-left:6px;}
/* tables */
table{width:100%;border-collapse:collapse;}
td,th{border:1px solid #000;padding:2px 3px;vertical-align:middle;}
th{background:#f1f5f9;font-weight:bold;text-align:center;font-size:7pt;}
.rl{font-size:7pt;white-space:nowrap;}
.tc{text-align:center;font-size:7pt;}
.yc{width:32px;text-align:center;font-weight:bold;}
/* info grid */
.igrid{display:grid;grid-template-columns:repeat(4, 1fr);gap:4px;padding:4px;font-size:7.5pt;}
.ifield{display:flex;gap:4px;align-items:baseline;}
.ilabel{font-weight:bold;color:#334155;white-space:nowrap;}
.ival{border-bottom:1px dotted #64748b;flex:1;min-height:12px;font-weight:600;}
/* visit table */
.vtable th{font-size:6.5pt;padding:2px 1px;}
.vtable td{font-size:6.5pt;padding:1.5px 1px;text-align:center;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>

<!-- ===== PAGE 1: PATIENT PROFILE & HISTORIES ===== -->
<div class="page">
  ${rhuHeader()}

  <div class="sbox">
    <div class="stitle orange">DOH PRENATAL CLINICAL RECORD — PATIENT IDENTIFICATION</div>
    <div class="igrid">
      <div class="ifield" style="grid-column: span 2;"><span class="ilabel">Surname:</span><span class="ival">${surname}</span></div>
      <div class="ifield" style="grid-column: span 2;"><span class="ilabel">First Name:</span><span class="ival">${firstName}</span></div>
      <div class="ifield"><span class="ilabel">M.I.:</span><span class="ival">${mi}</span></div>
      <div class="ifield"><span class="ilabel">Age:</span><span class="ival">${record.age || d.age || ''}</span></div>
      <div class="ifield"><span class="ilabel">Contact:</span><span class="ival">${record.contact || d.contactNumber || ''}</span></div>
      <div class="ifield"><span class="ilabel">Civil Status:</span><span class="ival">${d.civilStatus || 'Married'}</span></div>
      <div class="ifield" style="grid-column: span 2;"><span class="ilabel">Husband Name:</span><span class="ival">${d.husbandName || ''}</span></div>
      <div class="ifield"><span class="ilabel">Occupation:</span><span class="ival">${d.occupation || ''}</span></div>
      <div class="ifield"><span class="ilabel">Birthday:</span><span class="ival">${fmtDate(d.birthday)}</span></div>
      <div class="ifield" style="grid-column: span 4;"><span class="ilabel">Address:</span><span class="ival">${record.address || d.address || ''} (${record.barangay || ''})</span></div>
    </div>
  </div>

  <div class="sbox">
    <div class="stitle left">MENSTRUAL & OBSTETRICAL HISTORY</div>
    <div class="igrid" style="grid-template-columns: repeat(6, 1fr);">
      <div class="ifield"><span class="ilabel">Menarche:</span><span class="ival">${d.menarche || ''}</span></div>
      <div class="ifield"><span class="ilabel">Duration:</span><span class="ival">${d.durationDays || ''} days</span></div>
      <div class="ifield"><span class="ilabel">Cycle:</span><span class="ival">${d.cycleDays || ''} days</span></div>
      <div class="ifield"><span class="ilabel">Regular:</span><span class="ival">${d.regularMens || 'YES'}</span></div>
      <div class="ifield"><span class="ilabel">Dysmenorrhea:</span><span class="ival">${d.painMens || 'NO'}</span></div>
      <div class="ifield"><span class="ilabel">OB Code:</span><span class="ival">${d.obCode || ''}</span></div>
      <div class="ifield" style="grid-column: span 2;"><span class="ilabel">LMP:</span><span class="ival">${fmtDate(record.lmp || d.lmp)}</span></div>
      <div class="ifield" style="grid-column: span 2;"><span class="ilabel">EDC / EDD:</span><span class="ival">${fmtDate(record.edd || d.edc)}</span></div>
      <div class="ifield"><span class="ilabel">Gravida:</span><span class="ival">${d.gravida || '1'}</span></div>
      <div class="ifield"><span class="ilabel">Para:</span><span class="ival">${d.para || '0'}</span></div>
    </div>
  </div>

  <!-- MEDICAL & FAMILY HISTORY GRID -->
  <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
    <div class="sbox" style="margin-bottom:0;">
      <div class="stitle left">MEDICAL HISTORY</div>
      <table>
        <tr><th>Condition</th><th class="yc">Status</th></tr>
        ${medicalHistoryList.map(([label, val]) => `
          <tr>
            <td class="rl">${label}</td>
            <td class="yc">${check(val)}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2" style="font-size:6.5pt; padding:2px;">
            <b>Others:</b> ${d.medOthers || 'None'} | <b>Operation:</b> ${d.medOperation || 'None'}
          </td>
        </tr>
      </table>
    </div>

    <div class="sbox" style="margin-bottom:0;">
      <div class="stitle left">FAMILY HISTORY</div>
      <table>
        <tr><th>Condition</th><th class="yc">Status</th></tr>
        ${familyHistoryList.map(([label, val]) => `
          <tr>
            <td class="rl">${label}</td>
            <td class="yc">${check(val)}</td>
          </tr>
        `).join('')}
      </table>

      <div class="stitle left" style="margin-top:4px;">FAMILY PLANNING METHOD</div>
      <div style="padding:4px; font-size:7.5pt;">
        <div><b>Method:</b> ${d.fpMethod || 'None / Not Selected'}</div>
        <div style="margin-top:2px;"><b>Notes:</b> ${d.fpMethodNotes || 'None'}</div>
      </div>
    </div>
  </div>

  <!-- PRESENT PROBLEMS & RISK FACTORS -->
  <div class="sbox">
    <div class="stitle left">PRESENT PROBLEMS & RISK FACTORS</div>
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 2px; padding: 3px;">
      ${presentProblemsList.map(([label, val]) => `
        <div style="font-size:7pt; display:flex; gap:3px; align-items:center;">
          <span>[${val ? '<b>&#10003;</b>' : '&nbsp;'}]</span>
          <span>${label}</span>
        </div>
      `).join('')}
    </div>
    <div style="padding:3px; border-top:1px solid #ccc; font-size:7pt;">
      <b>Other Symptoms:</b> ${d.probOthers || 'None'} &bull;
      <b>Risk Factors:</b> 1. ${d.risk_1 || 'None'} | 2. ${d.risk_2 || 'None'} | 3. ${d.risk_3 || 'None'}
    </div>
  </div>

  <!-- OVERALL RISK CLASSIFICATION -->
  <div class="sbox" style="border: 2px solid ${isHighRisk ? '#991b1b' : '#15803d'};">
    <div class="stitle ${isHighRisk ? 'red' : 'orange'}">OVERALL MATERNAL RISK CLASSIFICATION</div>
    <div style="padding:5px; font-size:8pt; display:flex; align-items:center; justify-content:space-between; gap:10px;">
      <div>
        <b>CLASSIFICATION:</b>
        <span style="font-weight:bold; color:${isHighRisk ? '#991b1b' : '#15803d'}; font-size:9pt; text-transform:uppercase;">
          ${isHighRisk ? '🔴 HIGH RISK — Flagged to Doctor / MHO' : '🟢 NOT HIGH RISK — Normal Monitoring'}
        </span>
      </div>
      <div><b>High Risk Notes / Reason:</b> ${d.highRiskNotes || 'None'}</div>
    </div>
  </div>
</div>

<!-- ===== PAGE 2: PRENATAL VISIT LOGS (VISIT 1 TO VISIT 9) ===== -->
<div class="page">
  ${rhuHeader()}

  <div class="sbox">
    <div class="stitle orange">PRENATAL CLINICAL MONITORING & VISIT LOGS (VISITS 1 – 9)</div>
    <table class="vtable">
      <thead>
        <tr>
          <th style="width:20%; text-align:left; padding-left:4px;">Clinical Parameter / Item</th>
          ${[1,2,3,4,5,6,7,8,9].map(n => `<th style="width:8.8%;">Visit ${n}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <!-- VISIT DATE -->
        <tr style="background:#f8fafc; font-weight:bold;">
          <td style="text-align:left; padding-left:4px;">Date of Visit</td>
          ${[1,2,3,4,5,6,7,8,9].map(n => `<td>${fmtDate(d[`vDate_${n}`])}</td>`).join('')}
        </tr>

        <!-- VITALS -->
        <tr><td colspan="10" style="background:#e2e8f0; font-weight:bold; text-align:left; padding-left:4px;">PHYSICAL MEASUREMENTS & VITALS</td></tr>
        <tr><td style="text-align:left; padding-left:4px;">AOG (Weeks)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vAog_${n}`] || ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Blood Pressure (BP)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vBp_${n}`] || ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Pulse Rate (PR)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vPr_${n}`] || ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Respiratory Rate (RR)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vRr_${n}`] || ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">O2 Saturation (%)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vO2sat_${n}`] || ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Weight (WT in kg)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vWt_${n}`] || d[`vWeight_${n}`] || ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Fundal Height (FH in cm)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vFh_${n}`] || ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Fetal Heart Rate (FHT)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vFht_${n}`] || ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Temperature (°C)</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`vTemp_${n}`] || ''}</td>`).join('')}</tr>

        <!-- SYMPTOMS & CLINICAL FINDINGS -->
        <tr><td colspan="10" style="background:#e2e8f0; font-weight:bold; text-align:left; padding-left:4px;">SYMPTOMS & CLINICAL FINDINGS</td></tr>
        <tr><td style="text-align:left; padding-left:4px;">Vaginal Bleeding</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${check(d[`sym_bleeding_${n}`])}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Elevated BP</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${check(d[`sym_bp_${n}`])}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Premature Rupture of Membrane Color</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${d[`sym_rupture_${n}`] ? (d[`sym_rupture_color_${n}`] || 'Yes') : ''}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Fever</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${check(d[`sym_fever_${n}`])}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Pallor</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${check(d[`sym_pallor_${n}`])}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Blurring Vision</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${check(d[`sym_vision_${n}`])}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Edema</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${check(d[`sym_edema_${n}`])}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Missing Heart Rate</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${check(d[`sym_fht_${n}`])}</td>`).join('')}</tr>
        <tr><td style="text-align:left; padding-left:4px;">Abnormal Presentation</td>${[1,2,3,4,5,6,7,8,9].map(n => `<td>${check(d[`sym_abn_pres_${n}`])}</td>`).join('')}</tr>

        <!-- HIGH RISK & TREATMENTS -->
        <tr><td colspan="10" style="background:#e2e8f0; font-weight:bold; text-align:left; padding-left:4px;">RISK CLASSIFICATION & TREATMENTS / REMARKS</td></tr>
        <tr>
          <td style="text-align:left; padding-left:4px;">Visit Risk Status</td>
          ${[1,2,3,4,5,6,7,8,9].map(n => {
            const st = d[`riskStatus_${n}`];
            return `<td style="font-weight:bold; color:${st === 'HIGH_RISK' ? '#991b1b' : '#15803d'}">${st === 'HIGH_RISK' ? 'HIGH' : st ? 'NORMAL' : ''}</td>`;
          }).join('')}
        </tr>
        <tr>
          <td style="text-align:left; padding-left:4px;">Treatments & Clinical Remarks</td>
          ${[1,2,3,4,5,6,7,8,9].map(n => `<td style="font-size:5.5pt; text-align:left; vertical-align:top;">${d[`remarks_${n}`] || ''}</td>`).join('')}
        </tr>
      </tbody>
    </table>
  </div>
</div>
</body></html>`;

  openPrintWindow(html, `Prenatal Clinical Record – ${record.fullName || 'Patient'}`);
}

/* ──────────────────────────────────────────────────────────
   IMMUNIZATION CARD  (matches photo 3 – Todo Ligtas layout)
────────────────────────────────────────────────────────── */
export function openImmunizationCardPrintWindow(infant = {}) {
  const d = infant.formDetails || {};

  const fmt = (val) => {
    if (!val) return '';
    try {
      const dt = new Date(val);
      if (isNaN(dt)) return val;
      return `${dt.getMonth()+1}-${dt.getDate()}-${String(dt.getFullYear()).slice(-2)}`;
    } catch { return val || ''; }
  };

  const dates = (...vals) => vals.filter(Boolean).join(' &nbsp; ');

  const vRow = (name, doses, dateCells, remarks) =>
    `<tr>
      <td class="vn">${name}</td>
      <td class="vd">${doses}</td>
      <td class="vc">${dateCells}</td>
      <td class="vr">${remarks}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>Immunization Card – ${infant.infantName || 'Child'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,Helvetica,sans-serif;font-size:8pt;color:#000;background:#fff;}
@page{size:A4 landscape;margin:8mm 10mm;}
.wrap{border:3px solid #1a237e;padding:5px;}
/* header */
.rhu-header{display:flex;align-items:center;gap:10px;margin-bottom:5px;padding-bottom:5px;border-bottom:2px solid #1a237e;}
.rhu-logo{width:56px;height:56px;object-fit:contain;}
.rhu-header-text{flex:1;text-align:center;}
.rhu-sub{font-size:7.5pt;}
.rhu-unit{font-size:9.5pt;font-weight:bold;}
.rhu-place{font-size:8pt;font-weight:bold;}
/* title band */
.card-title{background:#1565c0;color:#fff;font-size:18pt;font-weight:bold;letter-spacing:3px;
            text-align:center;padding:5px 0;text-transform:uppercase;margin-bottom:5px;}
/* patient info */
.pgrid{display:grid;grid-template-columns:1fr 1fr;border:1.5px solid #000;margin-bottom:4px;}
.pcol{padding:3px 5px;}
.pcol:first-child{border-right:1px solid #000;}
.pf{display:flex;gap:4px;margin-bottom:2px;font-size:7.5pt;}
.pl{font-weight:bold;min-width:86px;}
.pv{border-bottom:1px dotted #999;flex:1;min-height:12px;}
/* tables */
table{width:100%;border-collapse:collapse;}
td,th{border:1px solid #000;padding:1.5px 3px;vertical-align:middle;}
.th-orange{background:#e65100;color:#fff;font-weight:bold;text-align:center;font-size:8pt;}
.th-sec{background:#e65100;color:#fff;font-weight:bold;font-size:8pt;padding:2px 4px;}
.vn{font-weight:bold;font-size:7.5pt;width:23%;}
.vd{font-size:7.5pt;width:14%;color:#333;}
.vc{font-size:7.5pt;width:45%;}
.vr{font-size:7.5pt;width:18%;}
.footer{font-size:6.5pt;margin-top:5px;padding:2px 4px;border-top:1px solid #000;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>
<div class="wrap">

  <!-- HEADER -->
  <div class="rhu-header">
    <img src="${LOGO_SRC}" alt="Padre Burgos Seal" class="rhu-logo" onerror="this.style.display='none'">
    <div class="rhu-header-text">
      <div class="rhu-sub">Republic of the Philippines &bull; Department of Health</div>
      <div class="rhu-unit">RURAL HEALTH UNIT &ndash; MUNICIPAL HEALTH OFFICE</div>
      <div class="rhu-place">PADRE BURGOS, Quezon Province</div>
    </div>
    <!-- placeholder for DOH/Todo Ligtas seal -->
    <div style="width:56px;height:56px;border:1px dashed #aaa;display:flex;align-items:center;
                justify-content:center;font-size:5.5pt;text-align:center;color:#bbb;">
      DOH<br>Seal
    </div>
  </div>

  <div class="card-title">IMMUNIZATION CARD</div>

  <!-- PATIENT INFO -->
  <div class="pgrid">
    <div class="pcol">
      <div class="pf"><span class="pl">NAME:</span><span class="pv">${infant.infantName||''}</span></div>
      <div class="pf"><span class="pl">DATE OF BIRTH:</span><span class="pv">${infant.birthdate||''}</span></div>
      <div class="pf"><span class="pl">PLACE OF BIRTH:</span><span class="pv">${d.placeOfBirth||''}</span></div>
      <div class="pf"><span class="pl">ADDRESS:</span><span class="pv">${infant.address||d.address||''}</span></div>
    </div>
    <div class="pcol">
      <div class="pf"><span class="pl">MOTHER'S NAME:</span><span class="pv">${infant.motherName||infant.parentName||''}</span></div>
      <div class="pf"><span class="pl">FATHER'S NAME:</span><span class="pv">${d.fatherName||''}</span></div>
      <div class="pf"><span class="pl">BIRTH HEIGHT:</span><span class="pv">${d.birthHeight||''}</span></div>
      <div class="pf"><span class="pl">BIRTH WEIGHT:</span><span class="pv">${d.birthWeight||''}</span></div>
      <div class="pf">
        <span class="pl">SEX:</span>
        <span class="pv">&#9744; MALE &nbsp;&#9744; FEMALE
          <b>${d.sex ? '('+d.sex+')' : ''}</b></span>
      </div>
      <div class="pf"><span class="pl">CONTACT NO.:</span><span class="pv">${d.contactNo||''}</span></div>
    </div>
  </div>

  <!-- VACCINE TABLE -->
  <table>
    <thead>
      <tr>
        <th class="th-orange vn">BAKUNA (Vaccine)</th>
        <th class="th-orange vd">DOSES</th>
        <th class="th-orange vc">PETSA NG BAKUNA (mm/dd/yy)</th>
        <th class="th-orange vr">REMARKS</th>
      </tr>
    </thead>
    <tbody>
      ${vRow('BCG Vaccine','Pagkapanganak',
              fmt(d.bcgDate), d.bcgRemarks||'')}
      ${vRow('Hepatitis B Vaccine','Pagkapanganak',
              fmt(d.hepatitisBDate), d.hepaBRemarks||'')}
      ${vRow('Pentavalent Vaccine (DPT-Hep B-HIB)','1 1/2, 2 1/2, 3 1/2 Buwan',
              dates(fmt(d.pentavalentDose1Date),fmt(d.pentavalentDose2Date),fmt(d.pentavalentDose3Date)),
              d.pentaRemarks||'')}
      ${vRow('Oral Polio Vaccine (OPV)','1 1/2, 2 1/2, 3 1/2 Buwan',
              dates(fmt(d.opvDose1Date),fmt(d.opvDose2Date),fmt(d.opvDose3Date)),
              d.opvRemarks||'')}
      ${vRow('Inactivated Polio Vaccine (IPV)','3 1/2 &amp; 9 Buwan',
              dates(fmt(d.ipvDose1Date||d.ipvDate),fmt(d.ipvDose2Date)),
              d.ipvRemarks||'')}
      ${vRow('Pneumococcal Conjugate Vaccine (PCV)','1 1/2, 2 1/2, 3 1/2 Buwan',
              dates(fmt(d.pcvDose1Date),fmt(d.pcvDose2Date),fmt(d.pcvDose3Date)),
              d.pcvRemarks||'')}
      ${vRow('Measles, Mumps, Rubella Vaccine (MMR)','9 Buwan &amp; 1 Taon',
              dates(fmt(d.mmrDose1Date),fmt(d.mmrDose2Date)),
              d.mmrRemarks||'')}

      <tr><td colspan="4" class="th-sec">SCHOOL AGED CHILDREN</td></tr>
      ${vRow('Measles Containing Vaccine (MCV) MR/MMR','(Grade 1)',
              fmt(d.mcvG1Date)||'', d.mcvG1Remarks||'')}
      ${vRow('Measles Containing Vaccine (MCV) MR/MMR','(Grade 7)',
              dates(fmt(d.mcvG71Date),fmt(d.mcvG72Date)), d.mcvG7Remarks||'')}
      ${vRow('Tetanus Diphtheria (TD)','(Grade 1 &amp; 7)',
              dates(fmt(d.td1ChildDate),fmt(d.td2ChildDate)), d.tdRemarks||'')}
      ${vRow('Human Papillomavirus Vaccine','(Grade 4 - (Babae) 9-14 Taong Gulang)',
              dates(fmt(d.hpv1Date),fmt(d.hpv2Date)), d.hpvRemarks||'')}

      <tr><td colspan="4" class="th-sec">SENIOR CITIZEN</td></tr>
      ${vRow('Influenza Vaccine','', fmt(d.fluDate)||'', d.fluRemarks||'')}
      ${vRow('Pneumococcal Vaccine','', fmt(d.pneumoDate)||'', d.pneumoRemarks||'')}

      <tr><td colspan="4" class="th-sec">ISA PANG MGA BAKUNA</td></tr>
      <tr><td>1.</td><td colspan="3"></td></tr>
    </tbody>
  </table>

  <div class="footer">
    Sa column ng <b>Petsa ng Bakuna</b>, Isulat ang petsa ng pagbibigay ng bakuna ayon sa kung pang-ilang dose ito.
    Sa column ng <b>Remarks</b>, isulat ang petsa ng pagbalik para sa susunod na dose o anumang mahalagang impormasyon
    na maaaring makaapekto sa pagbabakuna ng bata.
  </div>
</div>
</body></html>`;

  openPrintWindow(html, `Immunization Card – ${infant.infantName || 'Child'}`);
}

/* ── internal helper ── */
function openPrintWindow(html, title = 'Print') {
  const win = window.open('', '_blank', 'width=950,height=750');
  if (!win) {
    alert('Pop-up blocked! Please allow pop-ups for this site and try again.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.document.title = title;
  // Wait for images (logo) to load before triggering the print dialog
  win.onload = () => setTimeout(() => win.print(), 500);
}
