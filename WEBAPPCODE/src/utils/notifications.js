/**
 * Web Push & Native Notification Service
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */

import { toast, formatDate, escapeHtml } from './sanitize.js';
import { isParent, isMatchingParentRecord, isScheduleForParent } from '../auth.js';
import { openModal, closeModal } from '../ui/components.js';

function getNativePlugin() {
  if (typeof window !== 'undefined') {
    if (window.Capacitor?.Plugins?.LocalNotifications) {
      return window.Capacitor.Plugins.LocalNotifications;
    }
    if (typeof window.Capacitor?.registerPlugin === 'function') {
      try {
        const plugin = window.Capacitor.registerPlugin('LocalNotifications');
        if (plugin) return plugin;
      } catch (e) {
        // ignore
      }
    }
    if (window.LocalNotifications) {
      return window.LocalNotifications;
    }
  }
  return null;
}

export function isNotificationSupported() {
  if (getNativePlugin()) return true;
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isNotificationPermissionGrantedSync() {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('rhu_notif_permission_granted') === 'true') return true;
  if ('Notification' in window && Notification.permission === 'granted') return true;
  return false;
}

export async function getNotificationPermission() {
  const plugin = getNativePlugin();
  if (plugin) {
    try {
      const res = await plugin.checkPermissions();
      return res.display; // 'granted', 'denied', 'prompt'
    } catch (e) {
      return 'unsupported';
    }
  }
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
}

export async function isNotificationGranted() {
  const plugin = getNativePlugin();
  if (plugin) {
    try {
      const res = await plugin.checkPermissions();
      const granted = res.display === 'granted';
      if (granted) localStorage.setItem('rhu_notif_permission_granted', 'true');
      return granted;
    } catch (e) {
      return false;
    }
  }
  const granted = isNotificationSupported() && Notification.permission === 'granted';
  if (granted) localStorage.setItem('rhu_notif_permission_granted', 'true');
  return granted;
}

export async function requestNotificationPermission() {
  const plugin = getNativePlugin();
  if (plugin) {
    try {
      const res = await plugin.requestPermissions();
      if (res.display === 'granted') {
        localStorage.setItem('rhu_notif_permission_granted', 'true');
        toast('Mobile notifications enabled! You will receive check-up and vaccine alerts.');
        await sendNativeNotification('RHU Health Notifications Active', {
          body: 'Padre Burgos RHU will keep you updated on maternal appointments and child immunization schedules.'
        });
        return true;
      }
      toast('Notification permission was not granted.', true);
      return false;
    } catch (err) {
      console.warn('Capacitor requestPermissions error:', err);
      return false;
    }
  }

  if (!isNotificationSupported()) {
    toast('Notifications are not supported on this browser or platform.', true);
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('rhu_notif_permission_granted', 'true');
      toast('Notifications enabled! You will receive immunization & checkup alerts.');
      await sendNativeNotification('RHU Health Notifications Active', {
        body: 'Padre Burgos RHU will keep you updated on upcoming maternal and child checkup schedules.',
        icon: './icon-192.png',
        badge: './icon-32.png',
        tag: 'rhu-welcome-notif'
      });
      return true;
    } else if (permission === 'denied') {
      toast('Notification permission was blocked in browser settings.', true);
      return false;
    }
    return false;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export async function sendNativeNotification(title, options = {}) {
  const plugin = getNativePlugin();
  if (plugin) {
    try {
      let perm = await plugin.checkPermissions();
      if (perm && perm.display === 'prompt') {
        perm = await plugin.requestPermissions();
      }
      if (!perm || perm.display === 'granted') {
        await plugin.schedule({
          notifications: [
            {
              title: title,
              body: options.body || '',
              id: Math.floor(Math.random() * 1000000) + 1,
              schedule: { at: new Date(Date.now() + 300) },
              sound: null,
              attachments: null,
              actionTypeId: '',
              extra: null
            }
          ]
        });
        localStorage.setItem('rhu_notif_permission_granted', 'true');
        return true;
      }
    } catch (err) {
      console.warn('LocalNotifications.schedule error, falling back:', err);
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const defaultOptions = {
      icon: './icon-192.png',
      badge: './icon-32.png',
      vibrate: [200, 100, 200],
      renotify: true,
      data: { url: './' },
      actions: [
        { action: 'open', title: 'View Details' },
        { action: 'close', title: 'Dismiss' }
      ]
    };
    const finalOptions = { ...defaultOptions, ...options };
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, finalOptions);
          return true;
        }
      }
      new Notification(title, finalOptions);
      return true;
    } catch (err) {
      console.warn('Native web notification failed:', err);
    }
  }
  return false;
}

/**
 * Displays an in-app visual pop-up reminder modal on mobile or web
 * so that users never miss important clinical dates upon opening the app.
 */
export function checkAndShowInAppReminderPopup(notifications) {
  if (!notifications || notifications.length === 0) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const lastPopupDate = sessionStorage.getItem('rhu_reminder_popup_date');
  if (lastPopupDate === todayStr) return; // Show once per session

  sessionStorage.setItem('rhu_reminder_popup_date', todayStr);

  const bodyHtml = `
    <div class="space-y-3 text-xs">
      <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
        <span class="material-symbols-outlined text-emerald-600 text-2xl shrink-0">notifications_active</span>
        <div>
          <strong class="text-sm font-bold block mb-0.5">Upcoming Health Reminders</strong>
          <p class="text-[11px] text-emerald-800">You have important maternal and child health schedules:</p>
        </div>
      </div>
      <div class="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        ${notifications.map(n => `
          <div class="p-3 bg-surface border border-line rounded-xl shadow-2xs">
            <strong class="text-text block font-bold mb-1">${escapeHtml(n.title)}</strong>
            <p class="text-text-muted text-[11px] leading-relaxed">${escapeHtml(n.body)}</p>
          </div>
        `).join('')}
      </div>
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-line">
        <button type="button" class="primary-btn sm-btn text-xs py-1.5 px-4" onclick="closeModal()">
          Understood, Close
        </button>
      </div>
    </div>
  `;

  openModal("Health Reminders & Updates", bodyHtml);
}

/**
 * Scan state for upcoming infant immunization milestones and appointments,
 * and dispatch native push notifications + in-app reminders.
 */
export async function checkImmunizationAndScheduleReminders(state, currentUser) {
  if (!currentUser) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const notifiedKeys = JSON.parse(localStorage.getItem('rhu_notified_keys') || '[]');

  const isUserParent = isParent(currentUser);
  const parentName = (currentUser.name || currentUser.fullName || '').toLowerCase().trim();

  let myInfants = state.infantRecords || [];
  let mySchedules = state.checkupSchedules || [];

  if (isUserParent) {
    const myMaternal = (state.maternalRecords || []).find(r => isMatchingParentRecord(r, currentUser));
    myInfants = myInfants.filter(i => isMatchingParentRecord(i, currentUser) || (myMaternal && i.maternalRecordId === myMaternal.id));
    mySchedules = mySchedules.filter(s => isScheduleForParent(s, currentUser, state));
  }

  const newNotifications = [];

  // 1. Check Upcoming & Overdue Checkup Schedules
  mySchedules.forEach(schedule => {
    if (!schedule.date || schedule.status === 'Completed' || schedule.status === 'Cancelled') return;
    
    const schedKey = `sched_${schedule.id}_${schedule.date}`;

    if (schedule.date === todayStr) {
      newNotifications.push({
        key: schedKey,
        title: `📅 Check-up Appointment Today!`,
        body: `Reminder: Checkup for ${schedule.patientName} is scheduled today (${formatDate(schedule.date)}) at ${schedule.time || 'RHU Clinic'}.`,
        tag: `sched-${schedule.id}`
      });
    } else {
      const daysDiff = Math.ceil((new Date(schedule.date) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0 && daysDiff <= 3) {
        newNotifications.push({
          key: schedKey,
          title: `📅 Upcoming Check-up in ${daysDiff} Day${daysDiff > 1 ? 's' : ''}`,
          body: `Checkup for ${schedule.patientName} is on ${formatDate(schedule.date)} (${schedule.time || 'RHU Clinic'}).`,
          tag: `sched-${schedule.id}`
        });
      }
    }
  });

  // 2. Check Infant Immunization Milestones
  myInfants.forEach(infant => {
    const childName = infant.infantName || 'Your child';
    const formDetails = infant.formDetails || {};

    // Standard DOH vaccine schedule milestones
    const vaccines = [
      { name: 'BCG Vaccine', given: Boolean(formDetails.bcgDate || infant.bcgDate), minAgeWeeks: 0 },
      { name: 'Hepatitis B (Birth dose)', given: Boolean(formDetails.hepatitisBDate || infant.hepatitisBDate), minAgeWeeks: 0 },
      { name: 'Pentavalent 1st Dose', given: Boolean(formDetails.pentavalentDose1Date), minAgeWeeks: 6 },
      { name: 'Pentavalent 2nd Dose', given: Boolean(formDetails.pentavalentDose2Date), minAgeWeeks: 10 },
      { name: 'Pentavalent 3rd Dose', given: Boolean(formDetails.pentavalentDose3Date), minAgeWeeks: 14 },
      { name: 'OPV 1st Dose', given: Boolean(formDetails.opvDose1Date), minAgeWeeks: 6 },
      { name: 'OPV 2nd Dose', given: Boolean(formDetails.opvDose2Date), minAgeWeeks: 10 },
      { name: 'OPV 3rd Dose', given: Boolean(formDetails.opvDose3Date), minAgeWeeks: 14 },
      { name: 'MMR 1st Dose (9 Months)', given: Boolean(formDetails.mmrDose1Date), minAgeWeeks: 39 },
      { name: 'MMR 2nd Dose (12 Months)', given: Boolean(formDetails.mmrDose2Date), minAgeWeeks: 52 }
    ];

    if (infant.birthdate) {
      const birthTime = new Date(infant.birthdate).getTime();
      const nowTime = new Date().getTime();
      const ageWeeks = Math.floor((nowTime - birthTime) / (1000 * 60 * 60 * 24 * 7));

      const pendingVaccines = vaccines.filter(v => !v.given && ageWeeks >= v.minAgeWeeks);

      if (pendingVaccines.length > 0) {
        const nextVac = pendingVaccines[0];
        const vacKey = `vac_${infant.id}_${nextVac.name}_${todayStr}`;
        newNotifications.push({
          key: vacKey,
          title: `💉 Immunization Due: ${nextVac.name}`,
          body: `${childName} is due for ${nextVac.name}. Please visit Padre Burgos RHU or your Barangay Health Station.`,
          tag: `vac-${infant.id}`
        });
      }
    }
  });

  // 1. Show in-app visual pop-up modal if there are active reminders
  checkAndShowInAppReminderPopup(newNotifications);

  // 2. Dispatch native system / push notifications (if not already sent today)
  for (const notif of newNotifications.slice(0, 3)) {
    if (!notifiedKeys.includes(notif.key)) {
      await sendNativeNotification(notif.title, {
        body: notif.body,
        tag: notif.tag,
        data: { url: './' }
      });
      notifiedKeys.push(notif.key);
    }
  }

  // Save state
  localStorage.setItem('rhu_last_notif_check_date', todayStr);
  localStorage.setItem('rhu_notified_keys', JSON.stringify(notifiedKeys.slice(-50)));
}
