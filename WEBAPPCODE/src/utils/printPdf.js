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

  const yn = (val) => {
    if (!val) return '';
    const v = String(val).toUpperCase();
    return v === 'YES' ? 'YES' : v === 'NO' ? 'NO' : val;
  };

  const fmtDate = (val) => {
    if (!val) return '';
    try {
      const dt = new Date(val);
      if (isNaN(dt)) return val;
      return dt.toLocaleDateString('en-PH', { year:'numeric', month:'2-digit', day:'2-digit' });
    } catch { return val || ''; }
  };

  const ppRows = [
    ['Exclusive Breastfeeding (Y/N)', yn(d.ppExclusiveBreastfeeding)],
    ['Intends to use Family Planning (Y/N)', yn(d.ppIntendsFp)],
    ['Fever >39C (Y/N)', yn(d.ppFever)],
    ['Foul Smelling Vaginal Discharge (Y/N)', yn(d.ppFoulDischarge)],
    ['Excessive Bleeding (Y/N)', yn(d.ppExcessiveBleeding)],
    ['Pallor (Y/N)', yn(d.ppPallor)],
    ['Cord OK?(Y/N)', yn(d.ppCordOk)],
  ];

  const healthProblems = [
    ['Tuberculosis (14 days +of cough)', 'probTb'],
    ['Heart Disease', 'probHeart'],
    ['Diabetes', 'probDiabetes'],
    ['Bronchial Asthma', 'probAsthma'],
    ['Goiter', 'probGoiter'],
    ['Hypertension', 'probHypertension'],
  ];

  const visitFields = [
    ['AOG in Months',          null],
    ['Date of Visit',          'vDate'],
    ['Vaginal Bleeding (Y/N)', null],
    ['Urinary Tract Infection',null],
    ['Weight in Kg',           'vWeight'],
    ['Blood Pressure',         'vBp'],
    ['BP 140/90 and above (Y/N)', null],
    ['Fever 39 and above (Y/N)',  null],
    ['Pallor (Y/N)',           null],
  ];

  const actionFields = [
    'Iron/Folate #',
    'Iodine Supplementation in High Risk Areas',
    'Calcium Carbonate #',
    'Mother intends to breastfeed?(Y/N)',
    'Advice on 4 danger signs (Y/N)',
    'Dental Check-up?(Y/N)',
    'Emergency plans and place of delivery (Y/N)',
    'Risk?(Y/N)',
    'Date of next visit',
  ];

  function visitRow(label, keyPrefix) {
    return `<tr>
      <td class="rl">${label}</td>
      ${[1,2,3,4,5,6,7,8,9].map(n => {
        const key = keyPrefix ? `${keyPrefix}_${n}` : null;
        const val = key && d[key] ? (key.startsWith('vDate') ? fmtDate(d[key]) : d[key]) : '';
        return `<td class="tc">${val}</td>`;
      }).join('')}
    </tr>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>Maternal Health Record – ${record.fullName || 'Patient'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,Helvetica,sans-serif;font-size:8.5pt;color:#000;background:#fff;}
@page{size:A4 portrait;margin:10mm 12mm;}
.page{width:100%;page-break-after:always;}
.page:last-child{page-break-after:auto;}
/* header */
.rhu-header{display:flex;align-items:center;gap:12px;margin-bottom:5px;padding-bottom:5px;border-bottom:2px solid #000;}
.rhu-logo{width:60px;height:60px;object-fit:contain;}
.rhu-header-text{flex:1;}
.rhu-sub{font-size:7.5pt;}
.rhu-unit{font-size:10pt;font-weight:bold;}
.rhu-place{font-size:8.5pt;font-weight:bold;}
.rhu-contact{font-size:7pt;}
/* section boxes */
.sbox{border:1.5px solid #000;margin-bottom:3px;}
.stitle{font-weight:bold;font-size:8.5pt;text-align:center;padding:2px 4px;
        text-transform:uppercase;letter-spacing:.4px;color:#fff;}
.stitle.orange{background:#c0392b;}
.stitle.dark{background:#555;}
.stitle.left{text-align:left;padding-left:6px;}
/* tables */
table{width:100%;border-collapse:collapse;}
td,th{border:1px solid #000;padding:1.5px 3px;vertical-align:middle;}
th{background:#f0f0f0;font-weight:bold;text-align:center;font-size:7.5pt;}
.rl{font-size:7.5pt;white-space:nowrap;min-width:130px;}
.tc{text-align:center;font-size:7.5pt;}
.yc{width:36px;text-align:center;font-weight:bold;}
.trim-th{background:#666;color:#fff;text-align:center;font-size:7pt;}
.act-hd{background:#ccc;font-weight:bold;}
/* personal info */
.info-row{display:flex;gap:6px;border-bottom:1px solid #ccc;padding:2px 4px;font-size:8pt;}
.il{font-weight:bold;min-width:76px;}
.iv{flex:1;border-bottom:1px dotted #999;min-height:13px;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>

<!-- ===== PAGE 1 ===== -->
<div class="page">
  ${rhuHeader()}

  <!-- PERSONAL INFORMATION -->
  <div class="sbox">
    <div class="stitle orange">PERSONAL INFORMATION</div>
    <div class="info-row"><span class="il">Blood Type:</span><span class="iv">${d.bloodType||''}</span></div>
    <div class="info-row"><span class="il">Name:</span><span class="iv">${record.fullName||''}</span></div>
    <div class="info-row"><span class="il">Address:</span><span class="iv">${record.address||''}</span></div>
  </div>

  <!-- TETANUS TOXOID -->
  <div class="sbox">
    <div class="stitle dark left">TETANUS TOXOID</div>
    <table>
      <tr>
        <th>Date Given</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th>
      </tr>
      <tr>
        <td>Age/Bday:</td>
        <td colspan="2" class="tc">Below 18</td>
        <td colspan="2" class="tc">18-34</td>
        <td class="tc">35+</td>
      </tr>
      <tr>
        <td>Td Dose Dates</td>
        ${[1,2,3,4,5].map(n=>`<td class="tc">${fmtDate(d[`td${n}Date`])||''}</td>`).join('')}
      </tr>
      <tr>
        <td>Height</td><td colspan="2">${d.heightCm||''} cm</td>
        <td>Weight</td><td colspan="2">${d.weightKg||''} kg</td>
      </tr>
      <tr>
        <td>Age Category</td><td colspan="2">${d.ageCategory||'18-34'}</td>
        <td>BMI</td><td colspan="2">${d.bmi||''}</td>
      </tr>
    </table>
  </div>

  <!-- OBSTETRICAL HISTORY -->
  <div class="sbox">
    <div class="stitle dark left">OBSTETRICAL HISTORY</div>
    <table>
      <tr>
        <td colspan="2">G_<b>${d.obG||'_'}</b>&nbsp;P_<b>${d.obP||'_'}</b>&nbsp;
            (T_<b>${d.obT||'_'}</b>&nbsp;P_<b>${d.obPreterm||'_'}</b>&nbsp;
            A_<b>${d.obA||'_'}</b>&nbsp;L_<b>${d.obL||'_'}</b>)</td>
      </tr>
      <tr><td>Previous Pregnancies</td><td>${d.previousPregnancies||''}</td></tr>
      <tr><td>Caesarean Section</td><td>${yn(d.caesarean)||''}</td></tr>
      <tr><td>Stillbirth</td><td>${yn(d.stillbirth)||''}</td></tr>
      <tr><td>Post-partum Hemorrhage</td><td>${yn(d.postpartumHemorrhage)||''}</td></tr>
      <tr>
        <td>3 Consecutive Miscarriages</td>
        <td>YES&nbsp;&nbsp;&nbsp;NO&nbsp;&nbsp;&nbsp;<b>${yn(d.consecutiveMiscarriages)||''}</b></td>
      </tr>
    </table>
  </div>

  <!-- PRESENT HEALTH PROBLEMS -->
  <div class="sbox">
    <div class="stitle dark">PRESENT HEALTH PROBLEMS</div>
    <table>
      <tr><th>Condition</th><th class="yc">NO</th><th class="yc">YES</th></tr>
      ${healthProblems.map(([label,key])=>{
        const v=yn(d[key]);
        return `<tr>
          <td>${label}</td>
          <td class="yc">${v==='NO'?'&#10003;':''}</td>
          <td class="yc">${v==='YES'?'&#10003;':''}</td>
        </tr>`;
      }).join('')}
    </table>
  </div>

  <!-- POST PARTUM -->
  <div class="sbox">
    <div class="stitle dark">POST PARTUM</div>
    <table>
      <tr>
        <th rowspan="2" style="width:32%">Timing of Post Partum Visit</th>
        <th colspan="3">HOME VISITS</th>
        <th rowspan="2">CLINIC VISIT</th>
      </tr>
      <tr><th>24 hrs</th><th>1 week</th><th>2-4 weeks</th></tr>
      <tr><td>Date of Visit</td><td></td><td></td><td></td><td></td></tr>
      ${ppRows.map(([label,val])=>`
        <tr>
          <td>${label}</td>
          <td colspan="3" class="tc">${val}</td>
          <td></td>
        </tr>`).join('')}
    </table>
  </div>

  <!-- POST PARTUM supplement -->
  <div class="sbox">
    <div class="stitle dark">POST PARTUM (Supplement)</div>
    <table>
      <tr>
        <td>Vitamin A 200,000 IU (Y/N)&nbsp;<b>${yn(d.ppVitA)||''}</b></td>
        <td>Iron / Folate / Date #&nbsp;<b>${fmtDate(d.ppIronDate)||''}</b>&nbsp;Qty:&nbsp;<b>${d.ppIronQty||''}</b></td>
      </tr>
    </table>
  </div>

  <!-- FAMILY PLANNING -->
  <div class="sbox">
    <div class="stitle dark">FAMILY PLANNING</div>
    <table>
      <tr><th>Date of Visit</th><th>Date of Follow-Up</th><th>Method</th><th>Quantity Given</th><th>Remarks</th></tr>
      <tr>
        <td>${fmtDate(d.ppFpDate)||''}</td>
        <td>${fmtDate(d.ppFpFollowUp)||''}</td>
        <td>${d.ppFpMethod||''}</td>
        <td></td><td></td>
      </tr>
      <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
      <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
    </table>
  </div>

  <!-- FOOTNOTE -->
  <div style="display:flex;gap:0;border:1px solid #000;margin-top:3px;font-size:7pt;">
    <div style="flex:1;padding:3px 5px;border-right:1px solid #000;">
      Refer to Physician/RHU (and follow-up)<br>
      <em>You may wish to consider a permanent method of Family Planning</em>
    </div>
    <div style="flex:1;padding:3px 5px;border-right:1px solid #000;">
      Close observation or action by midwife/nurse:<br>${d.nurseObservations||''}
    </div>
    <div style="flex:1;padding:3px 5px;">
      Hospital delivery recommended:&nbsp;<b>${yn(d.hospitalDeliveryRecommended)||''}</b>
    </div>
  </div>
</div>

<!-- ===== PAGE 2 – PRESENT PREGNANCY ===== -->
<div class="page">
  ${rhuHeader()}

  <div class="sbox">
    <div class="stitle orange">PRESENT PREGNANCY</div>
    <table>
      <tr>
        <th style="width:10%">LMP</th>
        <td>MONTH:&nbsp;&nbsp;DAY:&nbsp;&nbsp;YEAR:</td>
        <td rowspan="2" style="width:22%;text-align:center;font-size:7.5pt;">
          Refer to Hospital<br>Refer to Physician /RHU
        </td>
      </tr>
      <tr>
        <th>EDC</th>
        <td>MONTH: ${record.lmp ? new Date(record.lmp).toLocaleString('en-PH',{month:'long'}) : ''}&nbsp;
            DAY: ${record.lmp ? new Date(record.lmp).getDate() : ''}&nbsp;
            YEAR: ${record.lmp ? new Date(record.lmp).getFullYear() : ''}</td>
      </tr>
    </table>
  </div>

  <!-- TRIMESTER TABLE -->
  <div class="sbox">
    <table>
      <thead>
        <tr>
          <th rowspan="2" class="rl">Visit Item</th>
          <th class="trim-th" colspan="4">1st Trimester</th>
          <th class="trim-th" colspan="4">2nd Trimester</th>
          <th class="trim-th" colspan="1">3rd</th>
        </tr>
        <tr>
          ${[1,2,3,4,5,6,7,8,9].map(n=>`<th style="font-size:7pt;text-align:center;">${n}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${visitFields.map(([label,keyPfx])=>visitRow(label,keyPfx)).join('')}
        <tr>
          <td class="rl">Abnormal Fundal Height (Y/N)</td>
          <td></td><td></td><td></td><td></td>
          <td class="tc" style="font-size:6.5pt;">20 cm</td>
          <td class="tc" style="font-size:6.5pt;">21-24 cm</td>
          <td class="tc" style="font-size:6.5pt;">25-28 cM</td>
          <td class="tc" style="font-size:6.5pt;">28-30 cm</td>
          <td class="tc" style="font-size:6.5pt;">30-34 cm</td>
        </tr>
        ${['Abnormal Presentation (Y/N)','Missing Fetal Heartbeat (Y/N)',
           'Edema (Y/N)','Vaginal Infection (Y/N)',
           'Lab Test Results (e.g.HGB,Urine,VDRL)'].map(label=>
          `<tr><td class="rl">${label}</td>${[1,2,3,4,5,6,7,8,9].map(()=>'<td></td>').join('')}</tr>`
        ).join('')}

        <!-- ACTION -->
        <tr><td colspan="10" class="act-hd" style="text-align:left;padding-left:6px;">ACTION</td></tr>
        ${actionFields.map(label=>
          `<tr><td class="rl">${label}</td>${[1,2,3,4,5,6,7,8,9].map(()=>'<td></td>').join('')}</tr>`
        ).join('')}
      </tbody>
    </table>
  </div>

  <!-- LABORATORY -->
  <div class="sbox">
    <div class="stitle dark left">LABORATORY</div>
    <table>
      <tr><th style="width:50%">Type of Laboratory</th><th style="width:20%">Date</th><th>Remarks</th></tr>
      <tr><td>&nbsp;</td><td></td><td></td></tr>
      <tr><td>&nbsp;</td><td></td><td></td></tr>
      <tr><td>&nbsp;</td><td></td><td></td></tr>
      <tr><td>&nbsp;</td><td></td><td></td></tr>
    </table>
  </div>
</div>

</body></html>`;

  openPrintWindow(html, `Maternal Record – ${record.fullName || 'Patient'}`);
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
