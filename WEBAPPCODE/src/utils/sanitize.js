/**
 * Security & Sanitization Utilities for RHU Health Monitoring System
 */

/**
 * Escapes unsafe HTML characters to prevent Cross-Site Scripting (XSS) vulnerabilities.
 * @param {any} str Input value to sanitize
 * @returns {string} Safe HTML string
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const stringVal = String(str);
  return stringVal
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats date strings to clean localized text (e.g. YYYY-MM-DD or readable string)
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatDate(dateVal) {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return String(dateVal);
  }
}

/**
 * Creates toast notification element on screen
 * @param {string} msg 
 * @param {boolean} isError 
 */
export function toast(msg, isError = false) {
  const host = document.getElementById('toastHost');
  if (!host) return;
  const div = document.createElement('div');
  div.className = `toast ${isError ? 'toast-error' : 'toast-success'} flex items-center gap-2`;
  div.innerHTML = `<span class="material-symbols-outlined text-lg ${isError ? 'text-red-500' : 'text-emerald-500'} shrink-0">${isError ? 'warning' : 'check_circle'}</span><span>${escapeHtml(msg)}</span>`;
  host.appendChild(div);
  setTimeout(() => {
    div.classList.add('fade-out');
    setTimeout(() => div.remove(), 400);
  }, 3500);
}

export function cleanDisplayNotes(notes) {
  if (!notes) return '';
  return String(notes)
    .replace(/\[(?:Parent|Mother|InfantID|MaternalID|UserID):\s*[^\]]+\]/gi, '')
    .trim();
}
