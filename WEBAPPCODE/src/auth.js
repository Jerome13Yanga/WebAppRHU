/**
 * Authentication & User Session Management Module
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { db, isOnlineMode, loadCollection, saveCollection, cleanRemoteRow } from './db.js';
import { embeddedAdminEmails, TABLES, SUPABASE_URL } from './config.js';
import { toast } from './utils/sanitize.js';

let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}

export function isAdmin(user = currentUser) {
  return user?.role === 'Administrator' || embeddedAdminEmails.includes(String(user?.email || '').toLowerCase());
}

export function isDoctor(user = currentUser) {
  return user?.role === 'Doctor';
}

export function isMho(user = currentUser) {
  return user?.role === 'MHO';
}

export function isNurse(user = currentUser) {
  return user?.role === 'Nurse / Midwife' || user?.role === 'Nurse' || user?.role === 'Midwife';
}

export function isParent(user = currentUser) {
  return user?.role === 'Mother / Parent';
}

export function isStaff(user = currentUser) {
  return !isParent(user);
}

export async function createManagedAuthAccount(row, password) {
  if (!isOnlineMode()) {
    toast("Created staff account in local store.", false);
    return;
  }
  const { data: sessionData } = await db.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error("Missing active administrator access token.");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-create-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      email: row.email,
      password,
      role: row.role,
      name: row.name,
      barangay: row.barangay,
      motherId: row.motherId || ""
    })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Edge function could not create staff account.");
  }
  return result.profile;
}

export async function getOrCreateCurrentProfile(authUser, overrides = {}) {
  const email = String(authUser.email || "").toLowerCase();
  const meta = authUser.user_metadata || {};
  let users = await loadCollection('users', []);
  let found = users.find((u) => u.authUserId === authUser.id || (u.email && u.email.toLowerCase() === email));

  if (!found) {
    const isEmbeddedAdmin = embeddedAdminEmails.includes(email);
    found = {
      id: authUser.id,
      authUserId: authUser.id,
      name: meta.name || email.split("@")[0] || "User",
      email,
      username: email,
      role: isEmbeddedAdmin ? "Administrator" : meta.role || "Mother / Parent",
      barangay: meta.barangay || "Basiao (Poblacion)",
      motherId: meta.motherId || "",
      createdAt: new Date().toISOString()
    };
  }

  found = { ...found, ...overrides, authUserId: authUser.id, email };
  const idx = users.findIndex((u) => u.id === found.id || (u.email && u.email.toLowerCase() === email));
  if (idx >= 0) users[idx] = found;
  else users.push(found);

  await saveCollection('users', users);
  if (isOnlineMode()) {
    const { error } = await db.from(TABLES.users).upsert(cleanRemoteRow("users", found), { onConflict: "id" });
    if (error) console.error("Profile upsert error:", error);
  }
  return found;
}
