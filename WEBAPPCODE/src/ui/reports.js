/**
 * Monthly DOH Reports (MC & CC) & Target Client List Excel Exporter Module
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { reportTypeLabel } from '../config.js';

export function renderReportsView(state, selectedBarangay = "All Barangays", selectedMonth = "08", selectedYear = "2026") {
  const currentPeriod = `${selectedYear}-${selectedMonth}`;

  const matchBgy = (rBgy, tBgy) => {
    if (!tBgy || tBgy === "All Barangays") return true;
    if (!rBgy) return true;
    const a = String(rBgy).toLowerCase().trim();
    const b = String(tBgy).toLowerCase().trim();
    return a === b || a.includes(b) || b.includes(a);
  };

  const reports = (state.monthlyReports || []).filter(r =>
    matchBgy(r.barangay, selectedBarangay) &&
    (!r.month || r.month === currentPeriod || r.month.startsWith(selectedYear))
  );

  const months = [
    { value: "01", name: "January" },
    { value: "02", name: "February" },
    { value: "03", name: "March" },
    { value: "04", name: "April" },
    { value: "05", name: "May" },
    { value: "06", name: "June" },
    { value: "07", name: "July" },
    { value: "08", name: "August" },
    { value: "09", name: "September" },
    { value: "10", name: "October" },
    { value: "11", name: "November" },
    { value: "12", name: "December" }
  ];

  const years = ["2024", "2025", "2026", "2027", "2028"];

  return `
    <div class="page-header flex items-center justify-between flex-wrap gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2 text-text">
          <span class="material-symbols-outlined text-purple-600 text-2xl">analytics</span>
          <span>Official DOH Monthly Reports (MC & CC)</span>
        </h2>
        <p class="text-xs text-text-muted">Target Client Lists & Indicator Summaries for Padre Burgos RHU</p>
      </div>

      <!-- Interactive Month / Year Selector & Generate Button -->
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-1.5 bg-surface border border-line p-1 rounded-lg">
          <select id="reportMonthSelect" class="text-xs py-1 px-2 border-0 bg-transparent font-semibold text-text focus:ring-0">
            ${months.map(m => `<option value="${m.value}" ${m.value === selectedMonth ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
          <select id="reportYearSelect" class="text-xs py-1 px-2 border-0 bg-transparent font-semibold text-text focus:ring-0">
            ${years.map(y => `<option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
        </div>

        <button class="primary-btn flex items-center gap-1.5 text-xs py-2 px-3.5" id="generateReportBtn">
          <span class="material-symbols-outlined text-base">auto_fix_high</span>
          <span>Generate Monthly Report</span>
        </button>
      </div>
    </div>

    <div class="panel">
      <div class="flex items-center justify-between mb-3 pb-2 border-b border-line">
        <h3 class="text-sm font-bold text-text flex items-center gap-2">
          <span class="material-symbols-outlined text-purple-600 text-lg">assessment</span>
          <span>Generated Reports for ${months.find(m => m.value === selectedMonth)?.name} ${selectedYear} (${escapeHtml(selectedBarangay)})</span>
        </h3>
        <span class="text-xs text-text-muted">${reports.length} report/s compiled</span>
      </div>

      <div class="table-container overflow-x-auto">
        <table class="data-table text-xs">
          <thead>
            <tr>
              <th>Report Category</th>
              <th>Reporting Period</th>
              <th>Barangay Station</th>
              <th>Total Clients</th>
              <th>Newly Registered</th>
              <th>Completed / FIC</th>
              <th>High Risk / Incomplete</th>
              <th>Prepared By</th>
              <th>Submission Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${reports.length === 0 ? `
              <tr>
                <td colspan="10" class="text-center py-8 text-text-muted">
                  No reports compiled yet for <strong>${months.find(m => m.value === selectedMonth)?.name} ${selectedYear}</strong>. Click <strong>Generate Monthly Report</strong> to compile stats automatically.
                </td>
              </tr>
            ` : reports.map(rep => `
              <tr>
                <td><strong>${escapeHtml(reportTypeLabel(rep.type))}</strong></td>
                <td class="font-bold text-brand-primary">${escapeHtml(rep.month || currentPeriod)}</td>
                <td><span class="badge badge-info text-[10px]">${escapeHtml(rep.barangay)}</span></td>
                <td><strong>${rep.total || 0}</strong></td>
                <td>${rep.newCount || 0}</td>
                <td><span class="badge badge-complete text-[10px]">${rep.completeOrDelivered || 0}</span></td>
                <td><span class="badge badge-pending text-[10px]">${rep.incompleteOrHighRisk || 0}</span></td>
                <td class="text-text-muted">${escapeHtml(rep.preparedBy || 'RHU Staff')}</td>
                <td>
                  <span class="badge ${rep.status === 'Completed' || rep.status === 'Reviewed' ? 'badge-complete' : 'badge-pending'} text-[10px]">
                    ${escapeHtml(rep.status || 'Submitted')}
                  </span>
                </td>
                <td class="space-x-1 whitespace-nowrap">
                  <button type="button" class="primary-btn sm-btn export-excel-btn text-[11px] py-1 px-2.5 inline-flex items-center gap-1" data-id="${escapeHtml(rep.id)}" title="Export Target Client List to Excel">
                    <span class="material-symbols-outlined text-sm">download</span>
                    <span>Excel</span>
                  </button>
                  <button type="button" class="icon-btn delete-report-btn p-1 text-red-600 hover:bg-red-50" data-id="${escapeHtml(rep.id)}" title="Delete">
                    <span class="material-symbols-outlined text-base">delete</span>
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
