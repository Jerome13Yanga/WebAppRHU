/**
 * Monthly DOH Reports (MC & CC) & Target Client List Excel Exporter Module
 */
import { escapeHtml, formatDate } from '../utils/sanitize.js';
import { reportTypeLabel } from '../config.js';

export function renderReportsView(state, selectedBarangay) {
  const reports = state.monthlyReports.filter(r => !selectedBarangay || r.barangay === selectedBarangay);

  return `
    <div class="page-header flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-outlined text-purple-600 text-2xl">analytics</span>
          <span>DOH Monthly Reports & Target Client Lists</span>
        </h2>
        <p class="text-sm text-slate-500">Maternal Care (MC) and Child Immunization (CC) Indicators | Barangay: <strong>${escapeHtml(selectedBarangay || 'All')}</strong></p>
      </div>
      <div class="header-actions">
        <button class="primary-btn flex items-center gap-1.5" id="generateReportBtn">
          <span class="material-symbols-outlined text-lg">note_add</span>
          <span>Auto-Generate Report</span>
        </button>
      </div>
    </div>

    <div class="panel">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Report Type</th>
              <th>Month</th>
              <th>Barangay</th>
              <th>Total Clients</th>
              <th>New Registered</th>
              <th>Completed / Delivered</th>
              <th>High Risk / Incomplete</th>
              <th>Prepared By</th>
              <th>Submitted Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${reports.length === 0 ? `
              <tr><td colspan="10" class="text-center text-muted">No monthly reports generated yet for ${escapeHtml(selectedBarangay || 'all barangays')}. Click <strong>Auto-Generate Report</strong> to compile stats.</td></tr>
            ` : reports.map(rep => `
              <tr>
                <td><strong>${escapeHtml(reportTypeLabel(rep.type))}</strong></td>
                <td>${escapeHtml(rep.month)}</td>
                <td>${escapeHtml(rep.barangay)}</td>
                <td>${rep.total || 0}</td>
                <td>${rep.newCount || 0}</td>
                <td><span class="badge badge-success">${rep.completeOrDelivered || 0}</span></td>
                <td><span class="badge badge-warning">${rep.incompleteOrHighRisk || 0}</span></td>
                <td>${escapeHtml(rep.preparedBy || 'RHU Staff')}</td>
                <td>${formatDate(rep.dateSubmitted)}</td>
                <td class="space-x-1">
                  <button class="primary-btn sm-btn export-excel-btn inline-flex items-center gap-1" data-id="${escapeHtml(rep.id)}">
                    <span class="material-symbols-outlined text-base">description</span>
                    <span>Export Excel</span>
                  </button>
                  <button class="icon-btn delete-report-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(rep.id)}" title="Delete">
                    <span class="material-symbols-outlined text-red-600 text-lg">delete</span>
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
