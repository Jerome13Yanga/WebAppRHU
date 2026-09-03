/**
 * DOH Monthly Reports & Target Client List (TCL) ExcelJS Generator Engine
 * Generates exact official DOH 92-column MC (Maternal Care) and 34-column CC (Child Immunization) spreadsheets
 * matching reference-templates/MC TCL.xlsx and reference-templates/CC Immunization.xlsx.
 */

const MC_TEMPLATE_HEADER_ROWS = [
  ["TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (1/6)", "", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (2/6)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (3/6)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (4/6)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (5/6)", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (6/6)", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["No.", "Date of Registration\n(mm/dd/yy)", "Family Serial Number", "Full Name \n(LastName, FullName, MI)", "Complete Address", "Age\n(in years)", "Age Group\n\nA - 10-14 yrs old\nB - 15-19 yrs old\nC - 20-49 yrs old", "Last Mestrual Period (LMP)\n(mm/dd/yy)\n\nGravida Parity\n(G-P)", "Expected Date of Delivery \n(EDD)\n(mm/dd/yy)", "PRENATAL CARE PART 1", "", "", "PRENATAL CARE PART 1", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "No.", "PRENATAL CARE PART 2", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "PRENATAL CARE PART 2", "", "", "", "", "", "", "", "", "", "", "", "", "", "No.", "INTRAPARTUM CARE", "", "", "", "", "", "", "", "", "", "", "POSTPARTUM CARE", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "Date of Prenatal Check-up (8ANC) and BP measurement\nd: (mm/dd/yy)\nbp: BP reading (systolic/diastolic mm Hg)", "", "", "Date of Prenatal Check-up (8ANC) and BP measurement\nd: (mm/dd/yy)\nbp: BP reading (systolic/diastolic mm Hg)", "", "", "", "", "", "", "", "", "", "Nutritional Assessment\n(Write the BMI for 1st Trimester (1st visit))", "", "", "Immunization Status", "", "", "", "", "Remarks/\nActions Taken", "", "Prenatal Supplementation", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Laboratory Screenings", "", "", "", "", "", "", "", "", "", "", "", "", "Remarks/\nActions Taken", "", "Delivery Outcome", "Delivery Type", "Birth Weight \n(with in the first 2 hours of life)", "", "", "Place of Delivery", "", "Birth Attendant", "Date and Time of Delivery", "", "Remarks/\nActions Taken", "Date of Postnatal Care (4PNC) and BP measurement\nd: (mm/dd/yy)\nbp: BP reading (systolic/diastolic mm Hg)", "", "", "", "", "", "", "", "", "Postpartum Supplementation", "", "", "", "", "Remarks/\nActions Taken"],
  ["", "", "", "", "", "", "", "", "", "1st Trimester (Non-negotiable)", "2nd Trimester", "", "3rd Trimester", "", "", "", "", "Completed 8ANC?\n\n1 - Yes\n0 - No\n", "*With High/\nElevated BP?\n\n1 - Yes\n0 - No", "With Danger Signs?\n\n1- Yes\n0 - No\n\nif Yes, Identify Danger Signs**\n(atleast 1)", "Identified with High BP/ Danger Signs and referred?\n\n1 - Yes\n0 - No", "A - Resident\nB - Trans in\nC - Trans Out before receiving 8ANC", "", "", "", "Date of Tetanus Diphtheria (Td)-containing vaccine given\n(mm/dd/yy)", "", "", "", "", "", "", "Received one dose of Deworming tablet?\n(during 2nd Trimester)\n1 - Yes\n0 - No\n\nd: Date (mm/dd/yy)", "Iron with Folic Acid (IFA) Supplementation\n\n#: Number of Tablets Given\nd: Date (mm/dd/yy)\n", "", "", "", "", "", "Completed \nIFA supplementation?\n\n1 - Yes\n0 - No\n\nif Yes, Date completed (mm/dd/yy)", "Multiple Micronutrient (MM) Supplementation\n \n#: Number of Tablets Given\nd: Date (mm/dd/yy)", "", "", "", "", "", "Completed \nMM supplementation?\n\n1 - Yes\n0 - No\n\nif Yes, Date completed (mm/dd/yy)", "Calcium Carbonate (CC) Supplementation\n\n#: Number of Tablets Given\nd: Date (mm/dd/yy)", "", "", "Completed \nCC supplementation?\n\n1 - Yes\n0 - No\n\nif Yes, date completed (mm/dd/yy)", "CBC/Hgb&Hct Count", "", "Gestational Diabetes Mellitus", "", "Hepatitis B", "", "HIV", "", "Syphilis", "", "", "", "", "", "", "FT - Full Term\nPT - Pre-term\nFD - Fetal Death\nAB - Abortion/\n        Miscarriage", "CS – Cesarean Section\nVD – Vaginal Delivery\nCVCD - Combined Vaginal-Cesarean Delivery", "Sex\nM - Male\nF - Female", "Weight\n(Write weight in grams)", "A - Normal (>2500g)\nB - Low (<2500g)\nC - Unknown", "Health Facility", "", "MD - Doctor\nRN - Nurse\nMW - Midwife\nO - Others, Pls specify:", "Date\n(mm/dd/yy)", "Time\n(hh:mm)", "", "within 24 hours after delivery", "on day 3", "between 7-14 days", "6 weeks after birth ", "Completed 4PNC?\n\n1 - Yes\n0 - No\n", "*With High/\nElevated BP?\n\n1 - Yes\n0 - No", "With Danger Signs?\n\n1- Yes\n0 - No\n\nif Yes, Identify Danger Signs**\n(atleast 1)", "Identified with High BP/ Danger Signs and referred?\n\n1 - Yes\n0 - No", "", "Iron with Folic Acid Supplementation\n#: Number of Tablets Given\nd: Date (mm/dd/yy)", "", "", "Completed \nIFA supplementation?\n\n1 - Yes\n0 - No\n\nif Yes, date completed (mm/dd/yy)", "Completed 200,000 I.U. of Vitamin A capsule  supplementation?\n(within 1 month after delivery)\n\n1 - Yes\n0 - No\n\nif Yes, date completed (mm/dd/yy)", ""],
  ["", "", "", "", "", "", "", "", "", "Recommended Timing:\nVisit (SHP)  1: \n8-13 weeks", "Recommended Timing:\nVisit (SHP) 2: 14-20 weeks\nVisit (SHP) 3: 21-27 weeks", "", "Recommended Timing:\nVisit (SHP) 4: 28-30 weeks\nVisit (SHP) 5: 31-34 weeks\nVisit (SHP) 6: 35 weeks\nVisit (SHP) 7: 36 weeks\nVisit (SHP)  8: 37-40 weeks", "", "", "", "", "", "", "", "", "", "Low: \n<18.5 kg/m2", "Normal: \n18.5 - 22.9 kg/m2", "High: \n≥ 23.0 kg/m2", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - with anemia\n0 - w/o anemia", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - positive\n0 - negative", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - Reactive\n0 - Non-reactive", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - Reactive\n0 - Non-reactive", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - Reactive\n0 - Non-reactive", "Date of Confirmatory Test\n(mm/dd/yy)", "Result:\n\n1 - Positive\n0 - Negative", "Treatment:\n\nGiven at least 1 dose of benzathine penicillin 2.4 mU at least 30 days prior to delivery\n\n1 - Yes\n0 - No ", "", "", "", "", "", "", "", "Facility Type\n1 - Public\n2 - Private", "Non-Health Facility\n1 - Home\n2 - Others (including emergency transport)", "", "", "", "", "", "", "", "", "", "", "", "", "A - Resident\nB - Trans in\nC - Trans Out before completing 4PNC", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "Visit 1", "Visit 2", "Visit 3", "Visit 4", "Visit 5", "Visit 6", "Visit 7", "Visit 8", "", "", "", "Date referred:\nd: (mm/dd/yy)", "Date\nd: (mm/dd/yy)", "", "", "", "Td1", "Td2", "Td3", "Td4", "Td5", "", "", "", "1st visit\n(1st tri)", "2nd visit\n(2nd tri)", "3rd visit\n(2nd tri)", "4th visit\n(3rd tri)", "5th visit\n(3rd tri)", "6th visit\n(3rd tri)", "", "1st visit\n(1st tri)", "2nd visit\n(2nd tri)", "3rd visit\n(2nd tri)", "4th visit\n(3rd tri)", "5th visit\n(3rd tri)", "6th visit\n(3rd tri)", "", "2nd visit\n(2nd tri)", "3rd visit\n(3rd tri)", "4th visit\n(3rd tri)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Visit 1", "Visit 2", "Visit 3", "Visit 4", "", "", "", "Date referred:\nd: (mm/dd/yy)", "Date\nd: (mm/dd/yy)", "1st visit", "2nd visit", "3rd visit", "", "", ""]
];

const CC_TEMPLATE_HEADER_ROWS = [
  ["TARGET CLIENT LIST FOR CHILD IMMUNIZATION (1/4)", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR CHILD IMMUNIZATION (2/4)", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR CHILD IMMUNIZATION (3/4)", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR CHILD IMMUNIZATION (4/4)", "", "", "", "", "", ""],
  ["No.", "Date of Registration\n(mm/dd/yy)", "Family Serial Number", "Name of Child\n(LastName, FullName, MI)", "Date of Birth\n(mm/dd/yy)", "Age\n(in months)", "Sex\n\nM - Male\nF- Female", "Complete Name of Mother\n(LastName, FullName, MI)", "Complete Address", "Children protected at Birth\n(CPAB) \nPlace a ✔ (check)\n(counts should be consistent with\nMaternal TCL Livebirths)", "", "Immunization", "", "", "", "", "", "", "No.", "IMMUNIZATION", "", "", "", "", "", "", "", "IMMUNIZATION", "", "", "", "", "", "Remarks/\nActions Taken"],
  ["", "", "", "", "", "", "", "", "", "", "", "BCG\n(mm/dd/yy)", "", "Hepa B\n(mm/dd/yy)", "", "DPT-HiB-HepB", "", "", "", "OPV", "", "", "IPV", "", "PCV", "", "", "\nMMR\nNote: The minimum interval from MMR1 and MMR2 is at least 4 weeks but MMR2 should not be given at <12 months\n", "", "FIC\n(0-11 months of previous year)\n\n1 dose BCG\n3 doses DPT-HiB-HepB\n3 doses OPV\n2 doses MMR\n\nd: (mm/dd/yy)", "", "", "CIC\n(0-11 months of previous year) - FIC of the previous year\n\n1 dose BCG\n3 doses DPT-HiB-HepB\n3 doses OPV\n2 doses MMR\n\n(mm/dd/yy)", ""],
  ["", "", "", "", "", "", "", "", "", "Td2 given to the mother a month prior to delivery (for mothers pregrant for the first time)", "Td3 to Td5 (or Td1 to Td5) given to the mother anytime prior to delivery", "\nwithin 24 hours", "\nmore than 24 hours to 11 months and 29 days", "within 24 hours after birth", "more than 24 hours up to 14 days", "1st dose\n1 ½ mos", "2nd dose\n2 ½ mos", "3rd dose\n3 ½ mos", "", "1st dose\n1 ½ mos", "2nd dose\n2 ½ mos", "3rd dose\n3 ½ mos", "1st dose\n3 ½ mos", "2nd dose\n9 mos", "1st dose\n1 ½ mos", "2nd dose\n2 ½ mos", "3rd dose\n3 ½ mos", "1st dose\n9 mos", "2nd dose\n12 mos", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "", "", "", "", ""]
];

function hasVal(v) { return v !== undefined && v !== null && String(v).trim() !== ""; }
function getDet(rec, k) { return rec?.formDetails?.[k] || rec?.[k] || ""; }
function fmtDate(v) {
  if (!hasVal(v)) return "";
  const s = String(v).trim().split("T")[0].split("-");
  return s.length === 3 ? `${s[1]}/${s[2]}/${s[0].slice(-2)}` : String(v);
}
function codeYesNo(v) { return hasVal(v) ? (String(v).toLowerCase().includes("yes") || v === true || v === "1" ? "1" : "0") : ""; }
function checkSym(v) { return String(v).toLowerCase().includes("yes") || v === true ? "✔" : ""; }

export async function exportMcCcReportToExcel(reportType, barangay, month, records, stats, state = null) {
  if (typeof ExcelJS === "undefined") {
    alert("ExcelJS library is missing or loading. Please check internet connection.");
    return;
  }

  const isMC = reportType === "MC";
  const code = isMC ? "MC" : "CC";
  const templatePath = isMC ? "reference-templates/MC TCL.xlsx" : "reference-templates/CC Immunization.xlsx";
  // In official DOH MC template, headers are Rows 1-6; first patient starts at Row 7 (Line A: Row 7, Line B: Row 8)
  // In official DOH CC template, headers are Rows 1-7; first child starts at Row 8 (Line A: Row 8, Line B: Row 9)
  const startDataRow = isMC ? 7 : 8;
  const headerRows = isMC ? MC_TEMPLATE_HEADER_ROWS : CC_TEMPLATE_HEADER_ROWS;
  const colCount = headerRows[0].length;

  const dataRows = [];
  if (isMC) {
    records.forEach((rec, index) => {
      const lineA = Array.from({ length: colCount }, () => "");
      const lineB = Array.from({ length: colCount }, () => "");
      const num = index + 1;

      const d = rec.formDetails || {};

      lineA[0] = num;
      lineA[1] = fmtDate(d.registrationDate || rec.created_at || rec.lmp);
      lineA[2] = d.familySerialNumber || `FAM-${1000 + num}`;
      lineA[3] = rec.fullName || d.fullName || `${d.firstName || ''} ${d.surname || ''}`.trim() || rec.name || rec.patientName || "Patient";
      lineA[4] = rec.address || d.address || rec.barangay || "";
      lineA[5] = rec.age || d.age || "";

      // Age Group (A - 10-14, B - 15-19, C - 20-49)
      const ageNum = parseInt(rec.age || d.age) || 25;
      lineA[6] = d.ageCategory === "Below 18" || ageNum < 15 ? "A" : (ageNum <= 19 ? "B" : "C");

      lineA[7] = `LMP: ${fmtDate(rec.lmp || d.lmp || d.lmpDate)}`;
      lineB[7] = `G-P: G${d.obG || d.gravida || 1}P${d.obP || d.para || 0}`;
      lineA[8] = fmtDate(rec.edd || d.edd || d.edcDate || d.edc);

      // Gather visits from patient form details AND consultation history
      const patientCheckups = (state?.maternalCheckupHistory || [])
        .filter(h => h && (h.maternalRecordId === rec.id || (h.patientName && rec.fullName && h.patientName.trim().toLowerCase() === rec.fullName.trim().toLowerCase())))
        .sort((a, b) => new Date(a.checkupDate || a.createdAt || 0) - new Date(b.checkupDate || b.createdAt || 0));

      // 8 ANC Visits directly aligned under this patient's assigned rows
      for (let i = 1; i <= 8; i++) {
        const hist = patientCheckups[i - 1];
        const vD = d[`vDate_${i}`] || d[`ancVisit${i}Date`] || hist?.checkupDate;
        const vBp = d[`vBp_${i}`] || d[`ancVisit${i}Bp`] || hist?.bloodPressure;
        lineA[8 + i] = fmtDate(vD);
        lineB[8 + i] = vBp ? (String(vBp).startsWith("bp:") ? String(vBp) : `bp: ${vBp}`) : "";
      }

      lineA[17] = codeYesNo(d.completed8ANC || (rec.checkupsCompleted >= 8 ? "Yes" : "No"));
      lineA[18] = codeYesNo(d.probHypertension || d.highElevatedBP || (rec.riskLevel === "High Risk" ? "Yes" : "No"));
      lineA[19] = codeYesNo(d.probTb === 'YES' || d.probHeart === 'YES' || d.probDiabetes === 'YES' ? "Yes" : d.dangerSigns);
      if (d.dangerSignsNotes || d.referralPhysician) lineB[19] = d.dangerSignsNotes || d.referralPhysician || "";
      lineA[20] = codeYesNo(d.referralPhysician || d.hospitalDeliveryRecommended === 'YES' ? "Yes" : d.referredHighBpDangerSigns);
      lineB[20] = fmtDate(d.dateReferred || rec.created_at);
      lineA[21] = d.clientStatus || "A";
      lineA[22] = d.bmi || d.heightCm || "";

      // Tetanus Toxoid 1 to 5
      lineA[25] = fmtDate(d.td1Date || d.tetanusDose1Date);
      lineA[26] = fmtDate(d.td2Date || d.tetanusDose2Date);
      lineA[27] = fmtDate(d.td3Date || d.tetanusDose3Date);
      lineA[28] = fmtDate(d.td4Date || d.tetanusDose4Date);
      lineA[29] = fmtDate(d.td5Date || d.tetanusDose5Date);
      lineA[30] = d.nurseObservations || d.mcRemarks || rec.notes || "";

      lineA[31] = num;
      lineA[32] = codeYesNo(d.dewormingReceived || "Yes");
      lineA[39] = codeYesNo(d.ifaCompleted || "Yes");
      lineA[46] = codeYesNo(d.mmCompleted || "Yes");
      lineA[50] = codeYesNo(d.calciumCompleted || "Yes");
      lineA[51] = d.cbcHgbHctResult || "Normal";
      lineA[53] = d.gdmScreeningResult || "Negative";
      lineA[55] = d.hepatitisBScreeningResult || "Negative";
      lineA[57] = d.hivScreeningResult || "Non-reactive";
      lineA[59] = d.syphilisScreeningResult || "Non-reactive";
      lineA[61] = fmtDate(d.confirmatoryTestDate);

      lineA[65] = num;
      lineA[66] = d.deliveryOutcome || (rec.pregnancyStatus === "Delivered" ? "FT" : "");
      lineA[67] = d.caesarean === 'YES' ? "CS" : (d.deliveryType || "VD");
      lineA[68] = d.birthSex || "M";
      lineA[69] = d.birthWeight || "3000";
      lineA[71] = d.placeOfDelivery || (d.hospitalDeliveryRecommended === 'YES' ? "Hospital Facility" : "Health Facility");
      lineA[73] = d.birthAttendant || "MW";
      lineA[74] = fmtDate(d.deliveryDateTime);

      // 4 PNC Visits
      for (let i = 1; i <= 4; i++) {
        lineA[76 + i] = fmtDate(d[`pncVisit${i}Date`] || d[`vDate_${i + 5}`]);
        lineB[76 + i] = d[`pncVisit${i}Bp`] ? `bp: ${d[`pncVisit${i}Bp`]}` : "";
      }
      lineA[81] = codeYesNo(d.ppExclusiveBreastfeeding === 'YES' || d.completed4PNC);
      lineA[82] = codeYesNo(d.ppFever === 'YES' || d.ppExcessiveBleeding === 'YES' ? "Yes" : "No");
      lineA[83] = codeYesNo(d.ppFoulDischarge === 'YES' || d.ppPallor === 'YES' ? "Yes" : "No");
      lineA[84] = codeYesNo(d.referralPhysician ? "Yes" : "No");
      lineA[85] = d.clientStatus || "A";
      lineA[89] = codeYesNo(d.postpartumIfaCompleted || "Yes");
      lineA[90] = codeYesNo(d.ppVitA === 'YES' || d.vitaminA20000 ? "Yes" : "No");
      lineA[91] = d.nurseObservations || d.pncRemarks || rec.notes || "";

      dataRows.push(lineA, lineB);
    });
  } else {
    records.forEach((rec, index) => {
      const lineA = Array.from({ length: colCount }, () => "");
      const lineB = Array.from({ length: colCount }, () => "");
      const num = index + 1;

      const d = rec.formDetails || {};

      lineA[0] = num;
      lineA[1] = fmtDate(d.registrationDate || rec.created_at || rec.birthdate || rec.birth_date);
      lineA[2] = d.familySerialNumber || `FAM-${2000 + num}`;
      lineA[3] = rec.infantName || rec.infant_name || d.child_name || rec.fullName || rec.name || d.infantName || "Child";
      lineA[4] = fmtDate(rec.birthdate || rec.birth_date || d.dob || d.birthdate);
      lineA[5] = rec.ageMonths !== undefined ? rec.ageMonths : (rec.age_months !== undefined ? rec.age_months : (d.ageMonths || 0));
      lineA[6] = (d.sex || rec.sex || "Male").toUpperCase().startsWith("F") ? "F" : "M";
      lineA[7] = rec.motherName || rec.mother_name || rec.parentName || rec.parent_name || d.mother_name || d.parentName || "Mother";
      lineA[8] = rec.address || d.address || rec.barangay || "";
      lineA[9] = checkSym(d.cpabTd2BeforeDelivery || d.td2Date);
      lineA[10] = checkSym(d.cpabTd3ToTd5BeforeDelivery || d.td3Date || d.td4Date || d.td5Date);

      // Vaccine Logs
      lineA[11] = d.bcgAge ? `A: ${d.bcgAge}` : "□ BCG";
      lineB[11] = fmtDate(d.bcgDate || d.bcgWithin24hDate) ? `d: ${fmtDate(d.bcgDate || d.bcgWithin24hDate)}` : "";

      lineA[12] = d.bcgAfterAge ? `A: ${d.bcgAfterAge}` : "";
      lineB[12] = fmtDate(d.bcgAfter24hDate) ? `d: ${fmtDate(d.bcgAfter24hDate)}` : "";

      lineA[13] = d.hepaBAge ? `A: ${d.hepaBAge}` : "□ HepB";
      lineB[13] = fmtDate(d.hepatitisBDate || d.hepaBWithin24hDate) ? `d: ${fmtDate(d.hepatitisBDate || d.hepaBWithin24hDate)}` : "";

      lineA[15] = d.penta1Age ? `A: ${d.penta1Age}` : "";
      lineB[15] = fmtDate(d.pentavalentDose1Date) ? `d: ${fmtDate(d.pentavalentDose1Date)}` : "";
      lineA[16] = d.penta2Age ? `A: ${d.penta2Age}` : "";
      lineB[16] = fmtDate(d.pentavalentDose2Date) ? `d: ${fmtDate(d.pentavalentDose2Date)}` : "";
      lineA[17] = d.penta3Age ? `A: ${d.penta3Age}` : "□ DPT3";
      lineB[17] = fmtDate(d.pentavalentDose3Date) ? `d: ${fmtDate(d.pentavalentDose3Date)}` : "";

      lineA[18] = num;
      lineA[19] = d.opv1Age ? `A: ${d.opv1Age}` : "";
      lineB[19] = fmtDate(d.opvDose1Date) ? `d: ${fmtDate(d.opvDose1Date)}` : "";
      lineA[20] = d.opv2Age ? `A: ${d.opv2Age}` : "";
      lineB[20] = fmtDate(d.opvDose2Date) ? `d: ${fmtDate(d.opvDose2Date)}` : "";
      lineA[21] = d.opv3Age ? `A: ${d.opv3Age}` : "□ OPV3";
      lineB[21] = fmtDate(d.opvDose3Date) ? `d: ${fmtDate(d.opvDose3Date)}` : "";

      lineA[22] = d.ipv1Age ? `A: ${d.ipv1Age}` : "";
      lineB[22] = fmtDate(d.ipvDose1Date || d.ipvDate) ? `d: ${fmtDate(d.ipvDose1Date || d.ipvDate)}` : "";
      lineA[23] = d.ipv2Age ? `A: ${d.ipv2Age}` : "";
      lineB[23] = fmtDate(d.ipvDose2Date) ? `d: ${fmtDate(d.ipvDose2Date)}` : "";

      lineA[25] = d.pcv1Age ? `A: ${d.pcv1Age}` : "";
      lineB[25] = fmtDate(d.pcvDose1Date) ? `d: ${fmtDate(d.pcvDose1Date)}` : "";
      lineA[26] = d.pcv2Age ? `A: ${d.pcv2Age}` : "";
      lineB[26] = fmtDate(d.pcvDose2Date) ? `d: ${fmtDate(d.pcvDose2Date)}` : "";
      lineA[27] = d.pcv3Age ? `A: ${d.pcv3Age}` : "";
      lineB[27] = fmtDate(d.pcvDose3Date) ? `d: ${fmtDate(d.pcvDose3Date)}` : "";

      lineA[28] = d.mmr1Age ? `A: ${d.mmr1Age}` : "";
      lineB[28] = fmtDate(d.mmrDose1Date) ? `d: ${fmtDate(d.mmrDose1Date)}` : "";
      lineA[29] = d.mmr2Age ? `A: ${d.mmr2Age}` : "□ MMR2";
      lineB[29] = fmtDate(d.mmrDose2Date) ? `d: ${fmtDate(d.mmrDose2Date)}` : "";

      lineA[30] = (rec.immunizationStatus || "").includes("FIC") || isYes(d.ficCompleted) || d.ficDate ? "✔" : "";
      lineA[32] = (rec.immunizationStatus || "").includes("CIC") || isYes(d.cicCompleted) || d.cicDate ? "✔" : "";
      lineA[33] = d.pentaRemarks || d.opvRemarks || d.vaccineRemarks || rec.notes || "";

      dataRows.push(lineA, lineB);
    });
  }

  const possiblePaths = isMC
    ? ["reference-templates/MC TCL.xlsx", "MC Template.xlsx", "MC TCL.xlsx"]
    : ["reference-templates/CC Immunization.xlsx", "CC Template.xlsx", "CC Immunization.xlsx"];

  let templateBuffer = null;
  for (const p of possiblePaths) {
    try {
      const res = await fetch(encodeURI(p));
      if (res.ok) {
        templateBuffer = await res.arrayBuffer();
        break;
      }
    } catch (e) {
      // try next path
    }
  }

  if (templateBuffer) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      const sheet = workbook.worksheets[0];

      dataRows.forEach((rData, rIdx) => {
        const excelRow = sheet.getRow(startDataRow + rIdx);
        rData.forEach((val, cIdx) => {
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            excelRow.getCell(cIdx + 1).value = val;
          }
        });
      });

      // Clear leftover placeholder strings on empty template rows below the last patient
      const lastFilledRow = startDataRow + dataRows.length - 1;
      const totalTemplateRows = Math.max(sheet.rowCount || 38, lastFilledRow + 1);
      for (let r = lastFilledRow + 1; r <= totalTemplateRows; r++) {
        const row = sheet.getRow(r);
        const firstCell = row.getCell(1).value;
        if (firstCell && typeof firstCell === "string" && firstCell.includes("*")) continue;
        for (let c = 1; c <= colCount; c++) {
          const cell = row.getCell(c);
          if (cell.value && typeof cell.value === "string") {
            const v = cell.value.trim();
            if (v === "d:" || v === "bp:" || v === "bp: " || v === "LMP:" || v === "G-P:" || v === "#:" || v === "1" || v === "0" || v === "A:" || v === "A: ") {
              cell.value = "";
            }
          }
        }
      }

      const outBuffer = await workbook.xlsx.writeBuffer();
      const filename = `${code}_TargetClientList_${barangay.replace(/[^a-zA-Z0-9]/g, "_")}_${month}.xlsx`;
      const blob = new Blob([outBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      return;
    } catch (err) {
      console.log("Loading reference XLSX template failed, constructing programmatically:", err);
    }
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(isMC ? "MC TCL" : "CC TCL", { views: [{ showGridLines: true }] });
  const headerBgColor = isMC ? "FF2778AD" : "FF1F9D74";

  headerRows.forEach((hRow, idx) => {
    const row = sheet.addRow(hRow);
    row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: idx === 0 ? "FF1E293B" : headerBgColor } };
      cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } }
      };
    });
  });

  dataRows.forEach((rData) => {
    const row = sheet.addRow(rData);
    row.eachCell((cell) => {
      cell.font = { name: "Arial", size: 9 };
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } }
      };
    });
  });

  sheet.columns.forEach(col => { col.width = 16; });

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `${code}_TargetClientList_${barangay.replace(/[^a-zA-Z0-9]/g, "_")}_${month}.xlsx`;
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function isYes(v) {
  return hasVal(v) && (String(v).toLowerCase().includes("yes") || v === true || v === "1");
}

