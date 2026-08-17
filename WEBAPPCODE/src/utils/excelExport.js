/**
 * DOH Monthly Reports & Target Client List (TCL) ExcelJS Generator Engine
 */

export async function exportMcCcReportToExcel(reportType, barangay, month, records, stats) {
  if (typeof ExcelJS === "undefined") {
    alert("ExcelJS library is loading or missing. Please ensure internet connection or local library script.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RHU Health Monitoring System";
  workbook.lastModifiedBy = "Padre Burgos RHU Health Monitor";
  workbook.created = new Date();

  const isMC = reportType === "MC";
  const sheetTitle = isMC 
    ? `Maternal Care Target Client List - ${barangay}` 
    : `Child Immunization Target Client List - ${barangay}`;

  const sheet = workbook.addWorksheet(isMC ? "Maternal Care TCL" : "Child Immunization TCL");

  // Title Headers
  sheet.mergeCells("A1:N1");
  sheet.getCell("A1").value = "RURAL HEALTH UNIT - PADRE BURGOS, QUEZON";
  sheet.getCell("A1").font = { name: "Arial", size: 14, bold: true, color: { argb: "FF2778AD" } };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.mergeCells("A2:N2");
  sheet.getCell("A2").value = sheetTitle.toUpperCase();
  sheet.getCell("A2").font = { name: "Arial", size: 12, bold: true };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.mergeCells("A3:N3");
  sheet.getCell("A3").value = `Reporting Month: ${month} | Date Generated: ${new Date().toLocaleDateString()}`;
  sheet.getCell("A3").font = { name: "Arial", size: 10, italic: true };
  sheet.getCell("A3").alignment = { horizontal: "center" };

  sheet.addRow([]);

  if (isMC) {
    // Maternal Care Table Headers
    const headers = [
      "No.", "Registration Date", "Family Serial No.", "Full Name", "Age", "Barangay / Address", 
      "Contact Number", "LMP", "EDD", "Pregnancy Status", "ANC Visits Completed", "Risk Level", "Assigned Nurse", "Notes"
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2778AD" } };
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });

    records.forEach((rec, idx) => {
      const row = sheet.addRow([
        idx + 1,
        rec.formDetails?.registrationDate || rec.lmp || "N/A",
        rec.formDetails?.familySerialNumber || "N/A",
        rec.fullName || "N/A",
        rec.age || "N/A",
        rec.barangay || rec.address || "N/A",
        rec.contact || "N/A",
        rec.lmp || "N/A",
        rec.edd || "N/A",
        rec.pregnancyStatus || "Active",
        rec.checkupsCompleted || 0,
        rec.riskLevel || "Normal",
        rec.assignedNurse || "Unassigned",
        rec.notes || ""
      ]);
      if (rec.riskLevel === "High Risk" || rec.riskLevel === "High") {
        row.getCell(12).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDECEC" } };
        row.getCell(12).font = { color: { argb: "FFC24145" }, bold: true };
      }
    });

  } else {
    // Child Immunization Table Headers
    const headers = [
      "No.", "Registration Date", "Family Serial No.", "Infant Name", "Parent / Mother Name", "Sex",
      "Birthdate", "Age (Months)", "Barangay / Address", "BCG", "Hepa B", "Pentavalent 3", "OPV 3 / IPV", "FIC Status", "Assigned Nurse"
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F9D74" } };
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });

    records.forEach((rec, idx) => {
      const details = rec.formDetails || {};
      sheet.addRow([
        idx + 1,
        details.registrationDate || rec.birthdate || "N/A",
        details.familySerialNumber || "N/A",
        rec.infantName || "N/A",
        rec.parentName || "N/A",
        details.sex || "N/A",
        rec.birthdate || "N/A",
        rec.ageMonths || 0,
        rec.barangay || rec.address || "N/A",
        details.bcgDate || "Pending",
        details.hepatitisBDate || "Pending",
        details.pentavalentDose3Date || "Pending",
        details.opvDose3Date || details.ipvDate || "Pending",
        rec.immunizationStatus || "Incomplete",
        rec.assignedNurse || "Unassigned"
      ]);
    });
  }

  // Adjust column widths
  sheet.columns.forEach((column) => {
    column.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const filename = `${reportType}_TCL_${barangay.replace(/[^a-zA-Z0-9]/g, "_")}_${month}.xlsx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
