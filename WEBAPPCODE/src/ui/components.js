/**
 * Reusable UI Components & Formatters
 */
import { escapeHtml } from '../utils/sanitize.js';

export function renderRiskBadge(riskLevel) {
  const risk = (riskLevel || 'Normal').toLowerCase();
  let badgeClass = 'badge-success';
  if (risk.includes('high')) badgeClass = 'badge-danger';
  else if (risk.includes('elevated') || risk.includes('moderate')) badgeClass = 'badge-warning';

  return `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${escapeHtml(riskLevel || 'Normal')}</span>`;
}

export function renderImmunizationBadge(status) {
  const stat = (status || 'Incomplete').toLowerCase();
  let badgeClass = 'badge-warning';
  if (stat.includes('complete') || stat.includes('fully') || stat.includes('fic')) badgeClass = 'badge-success';
  else if (stat.includes('overdue') || stat.includes('missed')) badgeClass = 'badge-danger';

  return `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${escapeHtml(status || 'Incomplete')}</span>`;
}

export function renderRolePill(role) {
  let cls = 'role-parent';
  if (role === 'Administrator') cls = 'role-admin';
  else if (role === 'MHO') cls = 'role-mho';
  else if (role === 'Nurse / Midwife') cls = 'role-nurse';

  return `<span class="role-pill ${cls}">${escapeHtml(role || 'User')}</span>`;
}

export function renderProgressBar(completed, total) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  let barColor = 'var(--blue)';
  if (pct >= 100) barColor = 'var(--green)';
  else if (pct < 40) barColor = 'var(--amber)';

  return `
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="width: ${pct}%; background: ${barColor};"></div>
    </div>
    <small class="progress-bar-text">${completed} / ${total} (${pct}%)</small>
  `;
}

export function refreshLucideIcons() {
  if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

export function openModal(title, bodyHtml) {
  const modal = document.getElementById('modal');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;
  modal.classList.remove('hidden');
  refreshLucideIcons();
}

export function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('hidden');
}

// Expose globally for inline onclick handlers
if (typeof window !== 'undefined') {
  window.openModal = openModal;
  window.closeModal = closeModal;
}
