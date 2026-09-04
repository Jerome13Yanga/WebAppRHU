/**
 * Authentication & User Session Management Module
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { db, isOnlineMode, loadCollection, saveCollection, cleanRemoteRow } from './db.js';
import { embeddedAdminEmails, TABLES, isNativeMobileApp } from './config.js';
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

export function isMho(user = currentUser) {
  return user?.role === 'MHO';
}

export function isNurse(user = currentUser) {
  return user?.role === 'Nurse / Midwife' || user?.role === 'Nurse' || user?.role === 'Midwife';
}

export function isParent(user = currentUser) {
  if (isNativeMobileApp()) return true;
  if (!user) return false;
  const r = String(user.role || '').toLowerCase().trim();
  return r === 'mother / parent' || r === 'parent' || r === 'mother' || r.includes('parent') || r.includes('mother');
}

export function isStaff(user = currentUser) {
  return !isParent(user);
}

export function isNamesMatching(nameA, nameB) {
  if (!nameA || !nameB) return false;
  const a = String(nameA).toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').trim();
  const b = String(nameB).toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').trim();
  if (a === b) return true;
  if (!a || !b) return false;

  const cleanPrefix = (str) => str.replace(/^baby\s+(?:boy\s+|girl\s+)?/i, '').replace(/^(?:boy|girl)\s+/i, '').trim();
  const cleanA = cleanPrefix(a);
  const cleanB = cleanPrefix(b);
  if (cleanA && cleanB && cleanA === cleanB) return true;

  if (cleanA && cleanB) {
    if (cleanA.length >= 3 && cleanB.includes(cleanA)) return true;
    if (cleanB.length >= 3 && cleanA.includes(cleanB)) return true;
  }

  const tokensA = (cleanA || a).split(/\s+/).filter(w => w.length >= 3);
  const tokensB = (cleanB || b).split(/\s+/).filter(w => w.length >= 3);
  if (tokensA.length > 0 && tokensB.length > 0) {
    const common = tokensA.filter(w => tokensB.includes(w));
    if (common.length >= 2) return true;
    if (common.length === 1 && (tokensA.length === 1 || tokensB.length === 1) && common[0].length >= 4) return true;
  }

  return false;
}

export function isMatchingParentRecord(record, user = currentUser) {
  if (!user || !record) return false;
  if (record.user_id && record.user_id === user.id) return true;
  if (user.motherId && (record.id === user.motherId || record.maternalRecordId === user.motherId || record.motherId === user.motherId)) return true;

  const targetName = (user.name || user.fullName || '').trim();
  if (!targetName) return false;

  const recName = (record.fullName || record.parentName || record.motherName || record.patientName || '').trim();
  if (!recName) return false;

  return isNamesMatching(targetName, recName);
}

export function isScheduleForParent(schedule, user = currentUser, state = {}) {
  if (!user || !schedule) return false;
  if (!isParent(user)) return false;

  const targetUserId = user.id || user.authUserId || '';
  const motherName = (user.name || user.fullName || '').trim();

  // 1. Direct user_id or userId match
  if (targetUserId && (schedule.userId === targetUserId || schedule.user_id === targetUserId)) {
    return true;
  }

  // 2. Extract parentName from schedule or from embedded note tag e.g. "[Parent: ...]"
  let schedParentName = (schedule.parentName || '').trim();
  if (!schedParentName && schedule.notes) {
    const pMatch = schedule.notes.match(/\[(?:Parent|Mother):\s*([^\]]+)\]/i);
    if (pMatch) schedParentName = pMatch[1].trim();
  }

  // 3. Match against mother's maternal record
  const maternalRecords = state.maternalRecords || [];
  const myMaternal = maternalRecords.find(r => isMatchingParentRecord(r, user));
  if (myMaternal) {
    if (schedule.maternalRecordId && schedule.maternalRecordId === myMaternal.id) return true;
    if (schedule.patientName && isNamesMatching(schedule.patientName, myMaternal.fullName)) return true;
    if (schedParentName && isNamesMatching(schedParentName, myMaternal.fullName)) return true;
    if (schedule.notes && schedule.notes.includes(myMaternal.id)) return true;
  }

  // 4. Match against mother's infant records (both registered and linked in state)
  const infantRecords = state.infantRecords || [];
  const myInfants = infantRecords.filter(i =>
    isMatchingParentRecord(i, user) ||
    (myMaternal && i.maternalRecordId === myMaternal.id) ||
    (motherName && isNamesMatching(i.parentName || i.motherName, motherName)) ||
    (myMaternal?.fullName && isNamesMatching(i.parentName || i.motherName, myMaternal.fullName))
  );

  for (const inf of myInfants) {
    if (schedule.infantRecordId && schedule.infantRecordId === inf.id) return true;
    if (schedule.patientName && isNamesMatching(schedule.patientName, inf.infantName)) return true;
    if (schedule.notes && schedule.notes.includes(inf.id)) return true;
  }

  // 5. Match by parentName against mother's name
  if (schedParentName && motherName && isNamesMatching(schedParentName, motherName)) {
    return true;
  }

  // 6. Match by patientName against mother's name (for Maternal checkups)
  if (schedule.patientName && motherName && isNamesMatching(schedule.patientName, motherName)) {
    return true;
  }

  // 7. General isMatchingParentRecord fallback
  if (isMatchingParentRecord({ patientName: schedule.patientName, parentName: schedParentName || schedule.parentName, fullName: schedule.patientName }, user)) {
    return true;
  }

  return false;
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
