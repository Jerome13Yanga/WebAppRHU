/**
 * Backup, Recovery & Emergency Contacts UI Module
 */
import { escapeHtml } from '../utils/sanitize.js';

export function renderBackupView(state) {
  const meta = state.backupMeta;

  return `
    <div class="page-header mb-6">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <i data-lucide="hard-drive-download" class="w-6 h-6 text-blue-600"></i>
          <span>Backup and Data Recovery</span>
        </h2>
        <p class="text-sm text-slate-500">Export JSON backups of all health records or restore system snapshots.</p>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <h3 class="flex items-center gap-2 mb-3">
          <i data-lucide="download-cloud" class="w-5 h-5 text-blue-600"></i>
          <span>Export System Backup</span>
        </h3>
        <p class="text-sm text-slate-600 mb-4">Download a complete JSON snapshot containing maternal records, infant records, schedules, and monthly reports.</p>
        <button class="primary-btn flex items-center gap-2" id="exportBackupBtn">
          <i data-lucide="download" class="w-4 h-4"></i>
          <span>Download Full Backup (.json)</span>
        </button>
        ${meta ? `<p class="help-note mt-2">Last local backup: ${new Date(meta.date).toLocaleString()}</p>` : ''}
      </div>

      <div class="panel">
        <h3 class="flex items-center gap-2 mb-3">
          <i data-lucide="upload-cloud" class="w-5 h-5 text-emerald-600"></i>
          <span>Restore System Backup</span>
        </h3>
        <p class="text-sm text-slate-600 mb-4">Restore maternal and infant health data from a previously downloaded backup file.</p>
        <button class="ghost-btn flex items-center gap-2" id="triggerRestoreBtn">
          <i data-lucide="folder-open" class="w-4 h-4"></i>
          <span>Select Backup File to Restore</span>
        </button>
      </div>
    </div>
  `;
}

export function renderContactsView(state) {
  const contacts = state.emergencyContacts || [];

  return `
    <div class="page-header mb-6">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <i data-lucide="phone-call" class="w-6 h-6 text-emerald-600"></i>
          <span>Barangay Health Workers & Emergency Contacts</span>
        </h2>
        <p class="text-sm text-slate-500">Direct contacts for assigned barangay nurses, health stations, and emergency hotlines.</p>
      </div>
    </div>

    <div class="dashboard-grid">
      ${contacts.length === 0 ? `
        <div class="panel">
          <p class="text-muted">No emergency contacts listed yet. Admin can configure barangay nurse contacts in Settings.</p>
        </div>
      ` : contacts.map(c => `
        <div class="contact-card">
          <div class="contact-header">
            <h3>${escapeHtml(c.nurseName)}</h3>
            <span class="badge badge-info">${escapeHtml(c.barangay)}</span>
          </div>
          <p class="flex items-center gap-2 text-sm text-slate-700 mt-2">
            <i data-lucide="phone" class="w-4 h-4 text-blue-600 shrink-0"></i>
            <span><strong>Contact Number:</strong> ${escapeHtml(c.contactNumber || 'N/A')}</span>
          </p>
          <p class="flex items-center gap-2 text-sm text-slate-700 mt-2">
            <i data-lucide="hospital" class="w-4 h-4 text-emerald-600 shrink-0"></i>
            <span><strong>Clinic Location:</strong> ${escapeHtml(c.clinicLocation || 'Barangay Health Station')}</span>
          </p>
          <p class="flex items-center gap-2 text-sm text-slate-700 mt-2">
            <i data-lucide="siren" class="w-4 h-4 text-red-600 shrink-0"></i>
            <span><strong>Emergency Hotline:</strong> ${escapeHtml(c.hotline || 'RHU Padre Burgos Hotline')}</span>
          </p>
        </div>
      `).join('')}
    </div>
  `;
}
