/**
 * Web Push & Native Notification Service
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */

import { toast, formatDate } from './sanitize.js';
import { isParent } from '../auth.js';

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
}

export function isNotificationGranted() {
  return isNotificationSupported() && Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    toast('Notifications are not supported on this browser or platform.', true);
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
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
  if (!isNotificationGranted()) return false;

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
    // Fallback to standard Window Notification if SW is not ready
    new Notification(title, finalOptions);
    return true;
  } catch (err) {
    console.warn('Native notification failed, falling back:', err);
    try {
      new Notification(title, finalOptions);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Scan state for upcoming infant immunization milestones and appointments,
 * and dispatch native push notifications if not already notified today.
 */
export async function checkImmunizationAndScheduleReminders(state, currentUser) {
  if (!currentUser || !isNotificationGranted()) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const lastCheckDate = localStorage.getItem('rhu_last_notif_check_date');
  const notifiedKeys = JSON.parse(localStorage.getItem('rhu_notified_keys') || '[]');

  const isUserParent = isParent(currentUser);
  const parentName = (currentUser.name || currentUser.fullName || '').toLowerCase().trim();

  let myInfants = state.infantRecords || [];
  let mySchedules = state.checkupSchedules || [];

  if (isUserParent) {
    myInfants = myInfants.filter(i => (i.parentName || i.motherName || '').toLowerCase().trim() === parentName);
    mySchedules = mySchedules.filter(s => (s.patientName || '').toLowerCase().trim() === parentName);
  }

  const newNotifications = [];

  // 1. Check Upcoming & Overdue Checkup Schedules
  mySchedules.forEach(schedule => {
    if (!schedule.date || schedule.status === 'Completed' || schedule.status === 'Cancelled') return;
    
    const schedKey = `sched_${schedule.id}_${schedule.date}`;
    if (notifiedKeys.includes(schedKey)) return;

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
        if (!notifiedKeys.includes(vacKey)) {
          newNotifications.push({
            key: vacKey,
            title: `💉 Immunization Due: ${nextVac.name}`,
            body: `${childName} is due for ${nextVac.name}. Please visit Padre Burgos RHU or your Barangay Health Station.`,
            tag: `vac-${infant.id}`
          });
        }
      }
    }
  });

  // Dispatch notifications sequentially (up to 3 per check to avoid flooding)
  for (const notif of newNotifications.slice(0, 3)) {
    await sendNativeNotification(notif.title, {
      body: notif.body,
      tag: notif.tag,
      data: { url: './' }
    });
    notifiedKeys.push(notif.key);
  }

  // Save state
  localStorage.setItem('rhu_last_notif_check_date', todayStr);
  localStorage.setItem('rhu_notified_keys', JSON.stringify(notifiedKeys.slice(-50)));
}
