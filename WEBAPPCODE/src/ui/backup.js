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
          <span class="material-symbols-outlined text-blue-600 text-2xl">settings_backup_restore</span>
          <span>Backup and Data Recovery</span>
        </h2>
        <p class="text-sm text-slate-500">Export JSON backups of all health records or restore system snapshots.</p>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <h3 class="flex items-center gap-2 mb-3">
          <span class="material-symbols-outlined text-blue-600 text-xl">cloud_download</span>
          <span>Export System Backup</span>
        </h3>
        <p class="text-sm text-slate-600 mb-4">Download a complete JSON snapshot containing maternal records, infant records, schedules, and monthly reports.</p>
        <button class="primary-btn flex items-center gap-2" id="exportBackupBtn">
          <span class="material-symbols-outlined text-lg">download</span>
          <span>Download Full Backup (.json)</span>
        </button>
        ${meta ? `<p class="help-note mt-2">Last local backup: ${new Date(meta.date).toLocaleString()}</p>` : ''}
      </div>

      <div class="panel">
        <h3 class="flex items-center gap-2 mb-3">
          <span class="material-symbols-outlined text-emerald-600 text-xl">cloud_upload</span>
          <span>Restore System Backup</span>
        </h3>
        <p class="text-sm text-slate-600 mb-4">Restore maternal and infant health data from a previously downloaded backup file.</p>
        <button class="ghost-btn flex items-center gap-2" id="triggerRestoreBtn">
          <span class="material-symbols-outlined text-lg">folder</span>
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
          <span class="material-symbols-outlined text-emerald-600 text-2xl">call</span>
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
            <span class="material-symbols-outlined text-blue-600 text-lg shrink-0">phone</span>
            <span><strong>Contact Number:</strong> ${escapeHtml(c.contactNumber || 'N/A')}</span>
          </p>
          <p class="flex items-center gap-2 text-sm text-slate-700 mt-2">
            <span class="material-symbols-outlined text-emerald-600 text-lg shrink-0">local_hospital</span>
            <span><strong>Clinic Location:</strong> ${escapeHtml(c.clinicLocation || 'Barangay Health Station')}</span>
          </p>
          <p class="flex items-center gap-2 text-sm text-slate-700 mt-2">
            <span class="material-symbols-outlined text-red-600 text-lg shrink-0">warning</span>
            <span><strong>Emergency Hotline:</strong> ${escapeHtml(c.hotline || 'RHU Padre Burgos Hotline')}</span>
          </p>
        </div>
      `).join('')}
    </div>
  `;
}
