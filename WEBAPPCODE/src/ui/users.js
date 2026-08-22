/**
 * User & Staff Roles Management UI Module
 */
import { escapeHtml } from '../utils/sanitize.js';
import { renderRolePill } from './components.js';

export function renderUsersView(state) {
  const users = state.users || [];

  return `
    <div class="page-header flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-600 text-2xl">group</span>
          <span>Users and Roles Management</span>
        </h2>
        <p class="text-sm text-slate-500">Manage healthcare staff accounts (MHO, Nurses, Doctors) and Parent access (${users.length} total users)</p>
      </div>
      <button class="primary-btn flex items-center gap-1.5" id="addStaffBtn">
        <span class="material-symbols-outlined text-lg">person_add</span>
        <span>Add Staff Account</span>
      </button>
    </div>

    <div class="panel">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email / Username</th>
              <th>System Role</th>
              <th>Barangay Assignment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.length === 0 ? `
              <tr><td colspan="5" class="text-center text-muted">No users registered yet.</td></tr>
            ` : users.map(u => `
              <tr>
                <td><strong>${escapeHtml(u.name)}</strong></td>
                <td>${escapeHtml(u.email)}</td>
                <td>${renderRolePill(u.role)}</td>
                <td>${escapeHtml(u.barangay)}</td>
                <td class="space-x-1">
                  <button class="icon-btn edit-user-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(u.id)}" title="Edit">
                    <span class="material-symbols-outlined text-blue-600 text-lg">edit</span>
                  </button>
                  ${u.role !== 'Administrator' ? `
                    <button class="icon-btn delete-user-btn p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center" data-id="${escapeHtml(u.id)}" title="Delete">
                      <span class="material-symbols-outlined text-red-600 text-lg">delete</span>
                    </button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
