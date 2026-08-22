const STORE_KEYS = [
  "users",
  "currentUser",
  "maternalRecords",
  "infantRecords",
  "checkupSchedules",
  "reminders",
  "monthlyReports",
  "emergencyContacts",
  "backupMeta"
];

const roles = ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"];
const staffRoles = ["MHO", "Nurse / Midwife", "Doctor"];
const publicRegisterRole = "Mother / Parent";
const embeddedAdminEmails = ["admin@rhu.gov"];
const barangays = [
  "Basiao (Poblacion)",
  "Burgos (Poblacion)",
  "Cabuyao Norte",
  "Cabuyao Sur",
  "Campo (Poblacion)",
  "Danlagan",
  "Duhat",
  "Hinguiwin",
  "Kinagunan Ibaba",
  "Kinagunan Ilaya",
  "Lipata",
  "Marao",
  "Marquez",
  "Punta (Poblacion)",
  "Rizal",
  "San Isidro",
  "San Vicente",
  "Sipa",
  "Tulay Buhangin",
  "Villapaz",
  "Walay",
  "Yawe"
];

const reportTypes = ["MC", "CC"];
const reportTypeNames = {
  MC: "MC - Maternal Care Monthly Report",
  CC: "CC - Child Immunization Monthly Report",
  Maternal: "MC - Maternal Care Monthly Report",
  Infant: "CC - Child Immunization Monthly Report"
};

function reportTypeLabel(type) {
  return reportTypeNames[type] || type || "";
}

function reportTypeShort(type) {
  if (type === "Maternal") return "MC";
  if (type === "Infant") return "CC";
  return type || "";
}

const pages = [
  { id: "dashboard", label: "Dashboard", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">dashboard</span>', roles },
  { id: "maternal", label: "Maternal Records", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">health_and_safety</span>', roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "infants", label: "Infant Records", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">child_care</span>', roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "schedules", label: "Check-up Schedules", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">event</span>', roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"] },
  { id: "forms", label: "My Health Forms", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">description</span>', roles: ["Mother / Parent"] },
  { id: "reminders", label: "Reminders", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">notifications</span>', roles: ["Administrator", "Nurse / Midwife", "Mother / Parent"] },
  { id: "barangay", label: "Barangay Monitoring", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">location_city</span>', roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "reports", label: "Monthly Reports", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">analytics</span>', roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "users", label: "Users and Roles", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">group</span>', roles: ["Administrator"] },
  { id: "backup", label: "Backup and Recovery", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">settings_backup_restore</span>', roles: ["Administrator"] },
  { id: "contacts", label: "Emergency Contacts", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">call</span>', roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"] },
  { id: "logout", label: "Logout", icon: '<span class="material-symbols-outlined text-lg leading-none align-middle mr-2">logout</span>', roles }
];

// Supabase online setup
// 1) Create a Supabase project.
// 2) Run supabase-schema.sql in the Supabase SQL Editor.
// 3) Paste your Project URL and anon/public key below.
const SUPABASE_URL = "https://rkortcwwnrpvhrxikunb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrb3J0Y3d3bnJwdmhyeGlrdW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDk5NjMsImV4cCI6MjA5ODQyNTk2M30.hKXXe2sG7kBvFFeWmJO8qdTEfKPjMdQlT8HrjmhgPOM";

const TABLES = {
  users: "profiles",
  maternalRecords: "maternal_records",
  infantRecords: "infant_records",
  checkupSchedules: "checkup_schedules",
  reminders: "reminders",
  monthlyReports: "monthly_reports",
  emergencyContacts: "emergency_contacts"
};

const maternalDetailFields = [
  "registrationDate", "familySerialNumber", "bloodType", "birthday", "heightCm", "weightKg", "bmi", "ageGroup", "tetanusAgeCategory",
  "tetanusDose1Date", "tetanusDose2Date", "tetanusDose3Date", "tetanusDose4Date", "tetanusDose5Date",
  "obstetricGTPAL", "gravidaParity", "previousPregnancies", "caesareanSection", "stillbirth", "postpartumHemorrhage", "consecutiveMiscarriages",
  "tuberculosis", "heartDisease", "diabetes", "bronchialAsthma", "goiter", "hypertension",
  "aogMonths", "latestVisitDate", "vaginalBleeding", "urinaryTractInfection", "bloodPressure", "bp140Above", "highElevatedBP",
  "fever39Above", "pallor", "abnormalFundalHeight", "abnormalPresentation", "missingFetalHeartbeat", "edema",
  "vaginalInfection", "labTestResults", "completed8ANC", "dangerSigns", "dangerSignsIdentified", "referredHighBpDangerSigns", "dateReferred", "clientStatus",
  "ancVisit1Date", "ancVisit1Bp", "ancVisit2Date", "ancVisit2Bp", "ancVisit3Date", "ancVisit3Bp", "ancVisit4Date", "ancVisit4Bp",
  "ancVisit5Date", "ancVisit5Bp", "ancVisit6Date", "ancVisit6Bp", "ancVisit7Date", "ancVisit7Bp", "ancVisit8Date", "ancVisit8Bp",
  "dewormingReceived", "dewormingDate", "ironFolateNumber", "ironFolateDate", "ifaCompleted", "iodineHighRisk",
  "mmTabletsGiven", "mmDateGiven", "mmCompleted", "calciumCarbonateNumber", "calciumDateGiven", "calciumCompleted",
  "intendsBreastfeed", "dangerSignsAdvice", "dentalCheckup", "emergencyPlan", "placeOfDelivery", "maternalRisk",
  "nextVisitDate", "laboratoryType", "laboratoryDate", "laboratoryRemarks", "cbcHgbHctResult", "gdmScreeningResult", "hepatitisBScreeningResult", "hivScreeningResult",
  "syphilisScreeningResult", "syphilisConfirmatoryTestDate", "syphilisConfirmatoryResult", "syphilisTreatmentGiven",
  "deliveryOutcome", "deliveryType", "birthWeightFirst2Hours", "facilityType", "nonHealthFacility", "birthAttendant", "deliveryDateTime",
  "pncVisit1Date", "pncVisit1Bp", "pncVisit2Date", "pncVisit2Bp", "pncVisit3Date", "pncVisit3Bp", "pncVisit4Date", "pncVisit4Bp", "completed4PNC", "postpartumClientStatus",
  "postpartumVisitTiming", "postpartumVisitDate", "exclusiveBreastfeeding", "intendsFamilyPlanning", "postpartumFever",
  "foulSmellingDischarge", "excessiveBleeding", "postpartumPallor", "cordOk", "vitaminA20000",
  "familyPlanningDate", "familyPlanningMethod", "familyPlanningQuantity", "familyPlanningRemarks", "referPhysicianRhu",
  "closeObservation", "hospitalDeliveryRecommended"
];

const infantDetailFields = [
  "registrationDate", "familySerialNumber", "placeOfBirth", "motherName", "fatherName", "birthHeight", "birthWeight", "sex",
  "cpabTd2BeforeDelivery", "cpabTd3ToTd5BeforeDelivery",
  "bcgDate", "bcgWithin24hDate", "bcgAfter24hDate", "hepatitisBDate", "hepaBWithin24hDate", "hepaBAfter24hTo14DaysDate",
  "pentavalentDose1Date", "pentavalentDose2Date", "pentavalentDose3Date",
  "opvDose1Date", "opvDose2Date", "opvDose3Date", "ipvDate", "ipvDose1Date", "ipvDose2Date", "pcvDose1Date", "pcvDose2Date", "pcvDose3Date",
  "mmrDose1Date", "mmrDose2Date", "ficCompleted", "ficDate", "cicCompleted", "cicDate", "measlesSupplementalDate", "otherVaccines", "vaccineAgeRemarks", "vaccineRemarks", "remarksActionsTaken"
];

const parentMaternalClinicFields = [
  "bloodType", "birthday", "heightCm", "weightKg", "bmi", "tetanusAgeCategory",
  "tetanusDose1Date", "tetanusDose2Date", "tetanusDose3Date", "tetanusDose4Date", "tetanusDose5Date",
  "obstetricGTPAL", "previousPregnancies", "caesareanSection", "stillbirth", "postpartumHemorrhage", "consecutiveMiscarriages",
  "tuberculosis", "heartDisease", "diabetes", "bronchialAsthma", "goiter", "hypertension",
  "referHospital", "referPhysicianRhu", "aogMonths", "latestVisitDate", "vaginalBleeding", "urinaryTractInfection",
  "weightVisitKg", "bloodPressure", "bp140Above", "fever39Above", "pallor", "abnormalFundalHeight", "abnormalPresentation",
  "missingFetalHeartbeat", "edema", "vaginalInfection", "labTestResults", "ironFolateNumber", "ironFolateDate",
  "iodineHighRisk", "calciumCarbonateNumber", "calciumDateGiven", "intendsBreastfeed", "dangerSignsAdvice",
  "dentalCheckup", "emergencyPlan", "placeOfDelivery", "maternalRisk", "nextVisitDate", "laboratoryType", "laboratoryDate", "laboratoryRemarks",
  "postpartumVisitTiming", "postpartumVisitDate", "exclusiveBreastfeeding", "intendsFamilyPlanning", "postpartumFever",
  "foulSmellingDischarge", "excessiveBleeding", "postpartumPallor", "cordOk", "vitaminA20000", "postpartumIronFolateDate",
  "familyPlanningDate", "familyPlanningFollowUpDate", "familyPlanningMethod", "familyPlanningQuantity", "familyPlanningRemarks",
  "closeObservation", "hospitalDeliveryRecommended"
];



const prenatalRecordFields = [
  "initialPrenatalCheckupDate", "maidenName", "middleInitial", "occupation", "husbandName", "husbandContact", "menarcheAge",
  "mensesFlow", "mensesRegular", "mensesPain", "mensesDurationDays", "cycleInDays", "pmpDate", "edcFromCycle",
  "prenatalGravida", "prenatalPara", "prenatalObGTPAL", "prenatalObHistory", "medicalDiabetes", "medicalHypertension",
  "medicalRenalDisease", "medicalJaundice", "medicalHeartDisease", "medicalPneumonia", "medicalRheumaticHeartDisease",
  "medicalSti", "medicalTuberculosis", "medicalAsthma", "medicalBloodTransfusion", "medicalAllergy", "medicalOperation", "medicalOther",
  "familyHypertension", "familyTuberculosis", "familyDiabetes", "familyHeartDisease", "familyMultiplePregnancy", "familyPsychiatric",
  "familyGoiter", "familyCancer", "familyOther", "fpPills", "fpRhythm", "fpFoam", "fpCondom", "fpOther", "fpDiscontinuedDate", "fpDiscontinuedReason",
  "prenatalAog", "prenatalQuickeningDate", "prenatalHeight", "prenatalWeight", "prenatalBmi", "presentNauseaVomiting",
  "presentHeadache", "presentEdema", "presentVisualDisturbance", "presentDizziness", "presentSyncope", "presentAbdominalPain",
  "presentVaginalBleeding", "presentVaginalDischarge", "presentEasyFatigability", "presentFeverChills", "presentHypertension",
  "presentConstipation", "presentBackache", "presentPelvicPain", "presentBleeding", "presentOther", "riskFactor1", "riskFactor2", "riskFactor3", "riskFactor4", "riskFactor5",
  ...Array.from({ length: 8 }, (_, index) => {
    const n = index + 1;
    return [`prenatalVisit${n}Date`, `prenatalVisit${n}Aog`, `prenatalVisit${n}Bp`, `prenatalVisit${n}Weight`, `prenatalVisit${n}Fht`, `prenatalVisit${n}Fh`, `prenatalVisit${n}Temp`, `prenatalVisit${n}Rr`, `prenatalVisit${n}O2Sat`, `prenatalVisit${n}Symptoms`, `prenatalVisit${n}Notes`];
  }).flat()
];

const parentInfantClinicFields = [
  "registrationDate", "familySerialNumber", "placeOfBirth", "motherName", "fatherName", "birthHeight", "birthWeight", "sex",
  "birthContactNumber", "bcgDate", "hepatitisBDate", "pentavalentDose1Date", "pentavalentDose2Date", "pentavalentDose3Date",
  "opvDose1Date", "opvDose2Date", "opvDose3Date", "ipvDose1Date", "ipvDose2Date", "pcvDose1Date", "pcvDose2Date", "pcvDose3Date",
  "mmrDose1Date", "mmrDose2Date", "mcvMrGrade1Date", "mcvMmrGrade7Date", "tetanusDiphtheriaDate", "hpvDate",
  "influenzaDate", "pneumococcalDate", "otherVaccines", "vaccineRemarks", "remarksActionsTaken"
];

const REMOTE_KEYS = Object.keys(TABLES);
const isSupabaseConfigured = () =>
  typeof window.supabase !== "undefined" &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_YOUR") &&
  SUPABASE_ANON_KEY.length > 30 &&
  !SUPABASE_ANON_KEY.includes("PASTE_YOUR");

const db = isSupabaseConfigured() ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const isOnlineMode = () => Boolean(db);


let state = {};
let activePage = "dashboard";
let selectedBarangay = barangays[0];

function visibleBarangays() {
  const current = getCurrentUser();
  if (current?.role === "Nurse / Midwife" && barangays.includes(current.barangay)) return [current.barangay];
  return barangays;
}

function defaultVisibleBarangay() {
  return visibleBarangays()[0] || barangays[0];
}

document.addEventListener("DOMContentLoaded", init);

async function init() {
  hydrateAuthOptions();
  bindAuth();
  bindShell();

  if (isOnlineMode()) {
    const { data, error } = await db.auth.getSession();
    if (error) toast(error.message, true);
    if (data?.session?.user) {
      await loadState();
      const current = await getOrCreateCurrentProfile(data.session.user);
      save("currentUser", current);
      showApp(current);
      toast("Connected to Supabase.");
    } else {
      showAuth();
    }
    return;
  }

  loadState();
  const current = getCurrentUser();
  current ? showApp(current) : showAuth();
}

function emptyState() {
  return {
    users: [],
    currentUser: null,
    maternalRecords: [],
    infantRecords: [],
    checkupSchedules: [],
    reminders: [],
    monthlyReports: [],
    emergencyContacts: [],
    backupMeta: null
  };
}

async function loadState() {
  if (isOnlineMode()) {
    await loadRemoteState();
    state.currentUser = read("currentUser", null);
    state.backupMeta = read("backupMeta", null);
    return;
  }

  const empty = emptyState();
  STORE_KEYS.forEach((key) => {
    state[key] = read(key, empty[key]);
  });
}

async function loadRemoteState() {
  for (const [key, table] of Object.entries(TABLES)) {
    const { data, error } = await db.from(table).select("*");
    if (error) {
      console.error(`Supabase load error for ${table}:`, error);
      state[key] = [];
      toast(`Could not load ${table}. Check SQL/RLS setup.`, true);
      continue;
    }
    state[key] = data || [];
  }
}

function cleanRemoteRow(key, row) {
  const copy = { ...row };
  if (key === "users") delete copy.password;
  ["lmp", "edd", "birthdate", "lastCheckup", "nextCheckup", "date", "scheduleDate", "dateSubmitted"].forEach((field) => {
    if (copy[field] === "") copy[field] = null;
  });
  if (copy.time === "") copy.time = null;
  if (copy.authUserId === "") copy.authUserId = null;
  return copy;
}

async function persistRecord(key, row) {
  if (!isOnlineMode() || !TABLES[key]) {
    save(key, state[key]);
    return;
  }
  const { error } = await db.from(TABLES[key]).upsert(cleanRemoteRow(key, row), { onConflict: "id" });
  if (error) {
    console.error(error);
    toast(`Could not save to Supabase: ${error.message}`, true);
  }
}

async function persistCollection(key) {
  if (!isOnlineMode() || !TABLES[key]) {
    save(key, state[key]);
    return;
  }
  const rows = (state[key] || []).map((row) => cleanRemoteRow(key, row));
  if (!rows.length) return;
  const { error } = await db.from(TABLES[key]).upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(error);
    toast(`Could not sync ${TABLES[key]}: ${error.message}`, true);
  }
}

async function deleteRemoteRecord(key, id) {
  if (!isOnlineMode() || !TABLES[key]) return;
  const { error } = await db.from(TABLES[key]).delete().eq("id", id);
  if (error) {
    console.error(error);
    toast(`Could not delete from Supabase: ${error.message}`, true);
  }
}

function rememberRow(key, row, idKey) {
  state[key] = state[key] || [];
  const index = state[key].findIndex((item) => item[idKey] === row[idKey] || (item.email && row.email && String(item.email).toLowerCase() === String(row.email).toLowerCase()));
  if (index >= 0) state[key][index] = row;
  else state[key].unshift(row);
}

async function createManagedAuthAccount(row, password) {
  if (!isOnlineMode()) return row;
  if (!password || password.length < 8) throw new Error("Generated staff password must be at least 8 characters.");

  const payload = {
    name: row.name,
    email: row.email,
    password,
    role: row.role,
    barangay: row.barangay,
    motherId: row.motherId || ""
  };

  const { data, error } = await db.functions.invoke("admin-create-user", { body: payload });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data?.profile) throw new Error("No profile was returned by the admin-create-user function.");
  return data.profile;
}

async function getOrCreateCurrentProfile(authUser, overrides = {}) {
  const email = String(authUser.email || overrides.email || "").toLowerCase();
  state.users = state.users || [];
  let profile = state.users.find((u) => u.authUserId === authUser.id || String(u.email || "").toLowerCase() === email);

  if (profile) {
    if (!profile.authUserId) {
      profile = { ...profile, authUserId: authUser.id };
      const index = state.users.findIndex((u) => u.id === profile.id || String(u.email || "").toLowerCase() === email);
      if (index >= 0) state.users[index] = profile;
      await persistRecord("users", profile);
    }
    return profile;
  }

  const isEmbeddedAdmin = embeddedAdminEmails.includes(email);
  const safeRole = isEmbeddedAdmin ? "Administrator" : publicRegisterRole;
  profile = {
    id: authUser.id,
    authUserId: authUser.id,
    name: overrides.name || authUser.user_metadata?.name || email.split("@")[0] || "RHU User",
    email,
    username: email,
    role: overrides.role || authUser.user_metadata?.role || safeRole,
    barangay: overrides.barangay || authUser.user_metadata?.barangay || (isEmbeddedAdmin ? "Municipal Health Office" : barangays[0]),
    motherId: overrides.motherId || authUser.user_metadata?.motherId || "",
    createdAt: authUser.created_at || new Date().toISOString()
  };

  if (!isEmbeddedAdmin && profile.role !== publicRegisterRole) profile.role = publicRegisterRole;
  state.users.unshift(profile);
  await persistRecord("users", profile);
  return profile;
}


function user(id, name, email, role, barangay, motherId = "") {
  return { id, name, email, username: email, password: "", role, barangay, motherId, createdAt: new Date().toISOString() };
}

function mother(id, fullName, address, barangay, age, contact, lmp, edd, pregnancyStatus, checkupsCompleted, riskLevel, assignedNurse, notes) {
  return { id, fullName, address, barangay, age, contact, lmp, edd, pregnancyStatus, checkupsCompleted, riskLevel, assignedNurse, notes };
}

function infant(id, infantName, parentName, address, barangay, birthdate, ageMonths, contact, immunizationStatus, lastCheckup, nextCheckup, assignedNurse, notes) {
  return { id, infantName, parentName, address, barangay, birthdate, ageMonths, contact, immunizationStatus, lastCheckup, nextCheckup, assignedNurse, notes };
}

function schedule(id, patientName, type, barangay, date, time, assignedNurse, status, notes) {
  return { id, patientName, type, barangay, date, time, assignedNurse, status, notes };
}

function reminder(id, recipientName, contact, messageType, message, scheduleDate, status) {
  return { id, recipientName, contact, messageType, message, scheduleDate, status };
}

function report(id, type, month, barangay, total, newCount, completeOrDelivered, incompleteOrHighRisk, missedOrCompleted, completedOrMissed, preparedBy, dateSubmitted, status) {
  return { id, type, month, barangay, total, newCount, completeOrDelivered, incompleteOrHighRisk, missedOrCompleted, completedOrMissed, preparedBy, dateSubmitted, status };
}

function contact(nurseName, barangay, contactNumber, clinicLocation, hotline) {
  return { id: makeId("EC"), nurseName, barangay, contactNumber, clinicLocation, hotline };
}

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function persist(key) {
  if (isOnlineMode() && TABLES[key]) {
    persistCollection(key);
    return;
  }
  save(key, state[key]);
}

function getCurrentUser() {
  return read("currentUser", null);
}

function hydrateAuthOptions() {
  fillSelect("regBarangay", barangays);
}

function fillSelect(id, options, selected = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = options.map((opt) => `<option value="${escapeHtml(opt)}"${opt === selected ? " selected" : ""}>${escapeHtml(opt)}</option>`).join("");
}

function bindAuth() {
  const showRegister = document.getElementById("showParentRegistration");
  const backToLogin = document.getElementById("backToLogin");
  if (showRegister) {
    showRegister.addEventListener("click", () => {
      document.getElementById("loginForm").classList.add("hidden");
      document.getElementById("registerForm").classList.remove("hidden");
    });
  }
  if (backToLogin) {
    backToLogin.addEventListener("click", () => {
      document.getElementById("registerForm").classList.add("hidden");
      document.getElementById("loginForm").classList.remove("hidden");
    });
  }

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (isOnlineMode()) {
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) return toast(error.message, true);
      await loadState();
      const profile = await getOrCreateCurrentProfile(data.user, { email });
      save("currentUser", profile);
      showApp(profile);
      toast(`Welcome, ${profile.name}.`);
      return;
    }

    const found = state.users.find((u) => (u.email.toLowerCase() === email || u.username.toLowerCase() === email) && u.password === password);
    if (!found) return toast("Invalid login details. Sign in with your Supabase account or create a parent account.", true);
    save("currentUser", found);
    showApp(found);
    toast(`Welcome, ${found.name}.`);
  });

  document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    if (password !== confirm) return toast("Passwords do not match.", true);

    const profileData = {
      name: document.getElementById("regName").value.trim(),
      email,
      role: publicRegisterRole,
      barangay: document.getElementById("regBarangay").value,
      motherId: "",
      contact: document.getElementById("regContact")?.value.trim() || ""
    };

    if (isOnlineMode()) {
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: { data: profileData }
      });
      if (error) return toast(error.message, true);

      if (!data.session) {
        toast("Parent account created. Check your email to confirm, then sign in.");
        document.getElementById("registerForm").classList.add("hidden");
        document.getElementById("loginForm").classList.remove("hidden");
        return;
      }

      await loadState();
      const profile = await getOrCreateCurrentProfile(data.user, profileData);
      save("currentUser", profile);
      showApp(profile);
      toast("Parent account created successfully.");
      return;
    }

    if (state.users.some((u) => u.email.toLowerCase() === email)) return toast("That email is already registered.", true);
    const newUser = {
      id: makeId("U"),
      name: profileData.name,
      email,
      username: email,
      password,
      role: publicRegisterRole,
      barangay: profileData.barangay,
      motherId: "",
      createdAt: new Date().toISOString()
    };
    state.users.push(newUser);
    persist("users");
    save("currentUser", newUser);
    showApp(newUser);
    toast("Parent account created successfully.");
  });
}


let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.querySelectorAll(".pwa-install-btn").forEach((btn) => btn.classList.remove("hidden"));
});

function triggerPwaInstall() {
  if (!deferredPrompt) {
    toast("To install on mobile, tap your browser's share/menu button and select 'Add to Home Screen'.");
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      toast("Thank you for installing RHU Health App!");
    }
    deferredPrompt = null;
    document.querySelectorAll(".pwa-install-btn").forEach((btn) => btn.classList.add("hidden"));
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then(() => {
      console.log("RHU Health PWA Service Worker registered.");
    }).catch((err) => console.log("Service Worker registration failed:", err));
  });
}

let resizeChartTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeChartTimer);
  resizeChartTimer = setTimeout(() => {
    const shell = document.getElementById("appShell");
    if (shell && !shell.classList.contains("hidden")) {
      renderPage(activePage);
    }
  }, 250);
});

function closeRootSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.add("hidden");
}

function openRootSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.add("open");
  if (overlay) overlay.classList.remove("hidden");
}

function bindShell() {
  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const sidebar = document.getElementById("sidebar");
      if (sidebar?.classList.contains("open")) {
        closeRootSidebar();
      } else {
        openRootSidebar();
      }
    });
  }

  const overlay = document.getElementById("sidebarOverlay");
  if (overlay) {
    overlay.addEventListener("click", closeRootSidebar);
  }

  document.addEventListener("click", (e) => {
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    if (sidebar && sidebar.classList.contains("open")) {
      if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
        closeRootSidebar();
      }
    }
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modal").addEventListener("click", (event) => {
    if (event.target.id === "modal") closeModal();
  });
  document.getElementById("globalSearch").addEventListener("input", () => renderPage(activePage));
  document.getElementById("restoreFile").addEventListener("change", restoreBackupFile);
  document.querySelectorAll(".pwa-install-btn").forEach((btn) => {
    btn.addEventListener("click", triggerPwaInstall);
  });
  const bSelect = document.getElementById("topbarBarangaySelect");
  if (bSelect) {
    bSelect.addEventListener("change", (e) => {
      selectedBarangay = e.target.value;
      renderPage(activePage);
    });
  }
}

function showAuth() {
  document.getElementById("authScreen").classList.remove("hidden");
  document.getElementById("appShell").classList.add("hidden");
}

function showApp(userData) {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
  document.getElementById("rolePill").textContent = userData.role;
  document.getElementById("currentUserName").textContent = userData.name;
  document.getElementById("currentUserMeta").textContent = `${userData.role} • ${userData.barangay}`;
  document.getElementById("userInitials").textContent = initials(userData.name);
  renderNav();
  activePage = "dashboard";
  renderPage(activePage);
}

function renderNav() {
  const current = getCurrentUser();
  const groups = [
    ["Main", ["dashboard", "barangay"]],
    ["Records", ["maternal", "infants", "forms", "schedules"]],
    ["Communication", ["reminders", "contacts"]],
    ["Reports", ["reports"]],
    ["System", ["users", "backup", "logout"]]
  ];
  const allowed = pages.filter((page) => page.roles.includes(current.role));
  document.getElementById("mainNav").innerHTML = groups.map(([label, ids]) => {
    const links = allowed.filter((page) => ids.includes(page.id));
    if (!links.length) return "";
    return `<div class="nav-group"><span>${label}</span>${links.map((page) => `<button class="nav-link ${page.id === activePage ? "active" : ""}" data-page="${page.id}"><span>${page.icon}</span>${page.label}</button>`).join("")}</div>`;
  }).join("");

  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.page === "logout") return logout();
      activePage = btn.dataset.page;
      document.getElementById("sidebar").classList.remove("open");
      renderPage(activePage);
      renderNav();
    });
  });
}

function renderPage(page) {
  const titles = {
    dashboard: ["Dashboard", "Monitoring summary"],
    maternal: ["Maternal Records", "Pregnancy monitoring and risk tracking"],
    infants: ["Infant Records", "Immunization and check-up monitoring"],
    schedules: ["Check-up Schedules", "Maternal and infant appointments"],
    forms: ["My Health Forms", "Parent-submitted maternal and infant information"],
    reminders: ["Reminder System", "Check-up and follow-up reminders"],
    barangay: ["Barangay Monitoring", "Monthly records by barangay clinic"],
    reports: ["Monthly Reports", "MC maternal care and CC child immunization summaries"],
    users: ["Users and Roles", "Account and assignment management"],
    backup: ["Backup and Recovery", "LocalStorage data export and restore"],
    contacts: ["Emergency Contacts", "Nurse and midwife contact information"]
  };
  document.getElementById("pageTitle").textContent = titles[page][0];
  document.getElementById("pageSubtitle").textContent = titles[page][1];
  const bSelect = document.getElementById("topbarBarangaySelect");
  if (bSelect) {
    const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const isParentOrNurse = curUser && (curUser.role === "Mother / Parent" || curUser.role === "Nurse / Midwife");
    if (isParentOrNurse) {
      bSelect.classList.add("hidden");
    } else {
      bSelect.classList.remove("hidden");
      const opts = ["All Barangays", ...barangays];
      bSelect.innerHTML = opts.map((b) => `<option value="${escapeHtml(b)}" ${b === selectedBarangay ? 'selected' : ''}>${escapeHtml(b)}</option>`).join("");
    }
  }
  const renderers = { dashboard: renderDashboard, maternal: renderMaternal, infants: renderInfants, schedules: renderSchedules, forms: renderParentForms, reminders: renderReminders, barangay: renderBarangay, reports: renderReports, users: renderUsers, backup: renderBackup, contacts: renderContacts };
  renderers[page]();
  if (typeof window.lucide !== "undefined" && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}


function nurseMcCcDashboardQueue() {
  const current = getCurrentUser();
  if (current.role !== "Nurse / Midwife") return "";
  const mothers = scoped(state.maternalRecords).filter((m) => !isYes(getDetail(m, "mcCompleted"))).slice(0, 5);
  const infants = scoped(state.infantRecords).filter((i) => !isYes(getDetail(i, "ccCompleted"))).slice(0, 5);
  const motherRows = mothers.map((m) => `<div class="mini-item"><div><strong>${escapeHtml(m.fullName)}</strong><br><small>${escapeHtml(m.barangay)} • MC maternal care details needed</small></div><button class="secondary-btn" data-complete-mc="${escapeHtml(m.id)}">Complete MC</button></div>`).join("");
  const infantRows = infants.map((i) => `<div class="mini-item"><div><strong>${escapeHtml(i.infantName)}</strong><br><small>${escapeHtml(i.barangay)} • CC child immunization details needed</small></div><button class="secondary-btn" data-complete-cc="${escapeHtml(i.id)}">Complete CC</button></div>`).join("");
  return `
    <div class="card card-pad">
      <div class="section-head"><div><h3>MC/CC Completion Queue</h3><p>Complete the official template details before generating monthly reports.</p></div>${badge(current.barangay)}</div>
      <div class="patient-grid">
        <div><h4>MC Maternal Care</h4><div class="list-stack">${motherRows || empty("All maternal records have completed MC details.")}</div></div>
        <div><h4>CC Child Immunization</h4><div class="list-stack">${infantRows || empty("All infant records have completed CC details.")}</div></div>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const current = getCurrentUser();
  if (current.role === "Mother / Parent") return renderPatientDashboard();
  const stats = getDashboardStats();
  setContent(`
    <section class="section">
      ${renderAnalyticsCards(stats.cards)}
      ${nurseMcCcDashboardQueue()}
      <div class="chart-grid">
        <div class="card card-pad chart-card">
          <div class="section-head"><div><h3>Maternal and Infant Overview</h3><p>Barangay comparison</p></div></div>
          <div id="overviewChart" class="chart-box"></div>
        </div>
        <div class="card card-pad chart-card">
          <div class="section-head"><div><h3>Monthly Check-up Trend</h3><p>Completed, missed, and upcoming</p></div></div>
          <div id="checkupTrendChart" class="chart-box"></div>
        </div>
      </div>
      <div class="chart-grid compact">
        <div class="card card-pad chart-card">
          <div class="section-head"><div><h3>Pregnancy Risk Level</h3><p>Risk distribution</p></div></div>
          <div id="riskDonutChart" class="chart-box donut-box"></div>
        </div>
        <div class="card card-pad chart-card">
          <div class="section-head"><div><h3>Immunization Status</h3><p>Infant record distribution</p></div></div>
          <div id="immunizationDonutChart" class="chart-box donut-box"></div>
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Barangay Performance</h3><p>Pregnancy, infant, missed visit, and report indicators</p></div><button class="secondary-btn" data-jump="barangay">Open barangays</button></div>
        <div class="barangay-grid">${visibleBarangays().map(performanceCard).join("")}</div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Recent Monitoring Tables</h3><p>Records needing quick review</p></div><button class="secondary-btn" data-jump="reports">Open reports</button></div>
        ${recordTable(scoped(state.checkupSchedules).slice(0, 6), ["Patient", "Type", "Barangay", "Date", "Status"], (s) => [s.patientName, s.type, s.barangay, fmtDate(s.date), badge(s.status)])}
      </div>
    </section>
  `);
  renderBarChart("overviewChart", stats.overview, { series: ["Mothers", "Infants"] });
  renderLineChart("checkupTrendChart", stats.trend, { series: ["Completed", "Missed", "Upcoming"] });
  renderDonutChart("riskDonutChart", stats.risk);
  renderDonutChart("immunizationDonutChart", stats.immunization);
  bindJumpButtons();
  bindRowActions();
}

function renderPatientDashboard() {
  const current = getCurrentUser();
  const mother = currentMotherRecord();
  const infantRows = currentInfantRecords();
  const scheduleRows = patientSchedules();
  const reminderRows = patientReminders();

  if (!mother) {
    setContent(`
      <section class="section">
        <div class="card card-pad">
          <div class="section-head">
            <div><h3>Welcome, ${escapeHtml(current.name)}</h3><p>Complete your maternal profile first so nurses, doctors, and the MHO can review your information.</p></div>
            ${badge("Parent")}
          </div>
          ${empty("No maternal profile has been submitted yet.")}
          <div class="actions"><button class="primary-btn" data-jump="forms">Fill up health forms</button></div>
        </div>
        <div class="card card-pad">
          <div class="section-head"><div><h3>What you can do</h3><p>Parent accounts are for self-service only.</p></div></div>
          <div class="barangay-grid">
            <div class="mini-item"><div><strong>Submit forms</strong><br><small>Send your maternal and infant details for RHU review.</small></div>${badge("For Review")}</div>
            <div class="mini-item"><div><strong>Request schedule</strong><br><small>Request a preferred check-up date and time.</small></div>${badge("Requested")}</div>
            <div class="mini-item"><div><strong>View reminders</strong><br><small>Check reminders created by the clinic staff.</small></div>${badge("Reminder")}</div>
          </div>
        </div>
      </section>
    `);
    bindJumpButtons();
    return;
  }

  setContent(`
    <section class="section">
      <div class="patient-grid">
        <div class="card card-pad">
          <div class="section-head"><div><h3>Personal Maternal Profile</h3><p>${escapeHtml(mother.barangay)}</p></div>${badge(mother.pregnancyStatus || "For Review")}</div>
          ${profileRows([["Name", mother.fullName], ["Address", mother.address], ["Age", mother.age], ["Contact Number", mother.contact], ["Expected Delivery Date", fmtDate(mother.edd)], ["Check-ups Completed", mother.checkupsCompleted || 0]])}
          <div class="progress"><span style="width:${Math.min(100, (mother.checkupsCompleted || 0) * 12)}%"></span></div>
          <div class="actions"><button class="secondary-btn" data-jump="forms">Update forms</button><button class="primary-btn" data-jump="schedules">Request schedule</button></div>
        </div>
        <div class="card card-pad">
          <div class="section-head"><div><h3>Infant Profile</h3><p>Immunization record</p></div><button class="secondary-btn" data-jump="forms">Add / Update</button></div>
          ${infantRows.map((i) => `<div class="mini-item"><div><strong>${escapeHtml(i.infantName)}</strong><br><small>${fmtDate(i.birthdate)} • ${i.ageMonths || 0} months</small></div>${badge(i.immunizationStatus || "For Review")}</div>${profileRows([["Address", i.address], ["Contact Number", i.contact], ["Next Immunization Date", fmtDate(i.nextCheckup)]])}`).join("") || empty("No infant profile linked.")}
        </div>
      </div>
      <div class="patient-grid">
        <div class="card card-pad"><div class="section-head"><div><h3>Check-up Schedules</h3><p>Maternal and infant appointments</p></div><button class="primary-btn" data-jump="schedules">Request check-up</button></div><div class="list-stack">${scheduleRows.map(scheduleMini).join("") || empty("No schedules found.")}</div></div>
        <div class="card card-pad"><div class="section-head"><div><h3>Automated Reminders</h3><p>Upcoming, missed, and completed reminders</p></div></div><div class="list-stack">${reminderRows.map(reminderMini).join("") || empty("No reminders found.")}</div></div>
      </div>
    </section>
  `);
  bindJumpButtons();
}



function prenatalRecordFieldsHtml(record) {
  const yesNo = ["", "Yes", "No"];
  const visitRows = Array.from({ length: 8 }, (_, index) => {
    const n = index + 1;
    return `
      <div class="card card-pad prenatal-visit-card">
        <div class="section-head"><div><h3>Prenatal Visit ${n}</h3><p>Use this for the continuing prenatal visit log.</p></div></div>
        <div class="three-col">${inputOptional("Date", `prenatalVisit${n}Date`, detailValue(record, `prenatalVisit${n}Date`), "date")}${inputOptional("AOG", `prenatalVisit${n}Aog`, detailValue(record, `prenatalVisit${n}Aog`))}${inputOptional("BP", `prenatalVisit${n}Bp`, detailValue(record, `prenatalVisit${n}Bp`))}</div>
        <div class="three-col">${inputOptional("Weight", `prenatalVisit${n}Weight`, detailValue(record, `prenatalVisit${n}Weight`))}${inputOptional("FHT", `prenatalVisit${n}Fht`, detailValue(record, `prenatalVisit${n}Fht`))}${inputOptional("FH", `prenatalVisit${n}Fh`, detailValue(record, `prenatalVisit${n}Fh`))}</div>
        <div class="three-col">${inputOptional("Temperature", `prenatalVisit${n}Temp`, detailValue(record, `prenatalVisit${n}Temp`))}${inputOptional("RR", `prenatalVisit${n}Rr`, detailValue(record, `prenatalVisit${n}Rr`))}${inputOptional("O2 Sat", `prenatalVisit${n}O2Sat`, detailValue(record, `prenatalVisit${n}O2Sat`))}</div>
        ${textareaOptional("Checked symptoms / findings", `prenatalVisit${n}Symptoms`, detailValue(record, `prenatalVisit${n}Symptoms`))}
        ${textareaOptional("Remarks / nurse notes", `prenatalVisit${n}Notes`, detailValue(record, `prenatalVisit${n}Notes`))}
      </div>`;
  }).join("");

  return `
    ${formDivider("Prenatal Record - Initial Check-up", "Based on the RHU prenatal record form. Parents can fill what they know; Nurse/Midwife can assist or complete it later.")}
    <div class="three-col">${inputOptional("Initial Prenatal Check-up Date", "initialPrenatalCheckupDate", detailValue(record, "initialPrenatalCheckupDate"), "date")}${inputOptional("M.I.", "middleInitial", detailValue(record, "middleInitial"))}${inputOptional("Occupation", "occupation", detailValue(record, "occupation"))}</div>
    <div class="two-col">${inputOptional("Husband / Partner Name", "husbandName", detailValue(record, "husbandName"))}${inputOptional("Husband / Partner Contact", "husbandContact", detailValue(record, "husbandContact"))}</div>
    <div class="three-col">${inputOptional("Age of Menarche", "menarcheAge", detailValue(record, "menarcheAge"))}${selectOptional("Menses Regular?", "mensesRegular", yesNo, detailValue(record, "mensesRegular"))}${selectOptional("Dysmenorrhea / Pain?", "mensesPain", yesNo, detailValue(record, "mensesPain"))}</div>
    <div class="three-col">${inputOptional("Duration of Menses (days)", "mensesDurationDays", detailValue(record, "mensesDurationDays"))}${inputOptional("Cycle in Days", "cycleInDays", detailValue(record, "cycleInDays"))}${inputOptional("PMP Date", "pmpDate", detailValue(record, "pmpDate"), "date")}</div>
    <div class="three-col">${inputOptional("EDC", "edcFromCycle", detailValue(record, "edcFromCycle"), "date")}${inputOptional("Gravida", "prenatalGravida", detailValue(record, "prenatalGravida"))}${inputOptional("Para", "prenatalPara", detailValue(record, "prenatalPara"))}</div>
    ${textareaOptional("Obstetrical history notes", "prenatalObHistory", detailValue(record, "prenatalObHistory"))}

    ${formDivider("Medical History")}
    <div class="three-col">${selectOptional("Diabetes", "medicalDiabetes", yesNo, detailValue(record, "medicalDiabetes"))}${selectOptional("Hypertension", "medicalHypertension", yesNo, detailValue(record, "medicalHypertension"))}${selectOptional("Renal Disease", "medicalRenalDisease", yesNo, detailValue(record, "medicalRenalDisease"))}</div>
    <div class="three-col">${selectOptional("Jaundice", "medicalJaundice", yesNo, detailValue(record, "medicalJaundice"))}${selectOptional("Heart Disease", "medicalHeartDisease", yesNo, detailValue(record, "medicalHeartDisease"))}${selectOptional("Pneumonia", "medicalPneumonia", yesNo, detailValue(record, "medicalPneumonia"))}</div>
    <div class="three-col">${selectOptional("Rheumatic Heart Disease", "medicalRheumaticHeartDisease", yesNo, detailValue(record, "medicalRheumaticHeartDisease"))}${selectOptional("STI", "medicalSti", yesNo, detailValue(record, "medicalSti"))}${selectOptional("TB", "medicalTuberculosis", yesNo, detailValue(record, "medicalTuberculosis"))}</div>
    <div class="three-col">${selectOptional("Asthma", "medicalAsthma", yesNo, detailValue(record, "medicalAsthma"))}${selectOptional("Blood Transfusion", "medicalBloodTransfusion", yesNo, detailValue(record, "medicalBloodTransfusion"))}${inputOptional("Allergy", "medicalAllergy", detailValue(record, "medicalAllergy"))}</div>
    <div class="two-col">${inputOptional("Operation / Surgery", "medicalOperation", detailValue(record, "medicalOperation"))}${inputOptional("Other medical history", "medicalOther", detailValue(record, "medicalOther"))}</div>

    ${formDivider("Family History")}
    <div class="three-col">${selectOptional("Hypertension", "familyHypertension", yesNo, detailValue(record, "familyHypertension"))}${selectOptional("TB", "familyTuberculosis", yesNo, detailValue(record, "familyTuberculosis"))}${selectOptional("Diabetes", "familyDiabetes", yesNo, detailValue(record, "familyDiabetes"))}</div>
    <div class="three-col">${selectOptional("Heart Disease", "familyHeartDisease", yesNo, detailValue(record, "familyHeartDisease"))}${selectOptional("Multiple Pregnancy", "familyMultiplePregnancy", yesNo, detailValue(record, "familyMultiplePregnancy"))}${selectOptional("Psychiatric", "familyPsychiatric", yesNo, detailValue(record, "familyPsychiatric"))}</div>
    <div class="three-col">${selectOptional("Goiter", "familyGoiter", yesNo, detailValue(record, "familyGoiter"))}${selectOptional("Cancer", "familyCancer", yesNo, detailValue(record, "familyCancer"))}${inputOptional("Other family history", "familyOther", detailValue(record, "familyOther"))}</div>

    ${formDivider("Family Planning Method")}
    <div class="three-col">${selectOptional("Pills", "fpPills", yesNo, detailValue(record, "fpPills"))}${selectOptional("Rhythm", "fpRhythm", yesNo, detailValue(record, "fpRhythm"))}${selectOptional("FOAM", "fpFoam", yesNo, detailValue(record, "fpFoam"))}</div>
    <div class="three-col">${selectOptional("Condom", "fpCondom", yesNo, detailValue(record, "fpCondom"))}${inputOptional("Others", "fpOther", detailValue(record, "fpOther"))}${inputOptional("Date discontinued", "fpDiscontinuedDate", detailValue(record, "fpDiscontinuedDate"), "date")}</div>
    ${textareaOptional("Reason for discontinuation", "fpDiscontinuedReason", detailValue(record, "fpDiscontinuedReason"))}

    ${formDivider("Current Pregnancy Status")}
    <div class="three-col">${inputOptional("AOG", "prenatalAog", detailValue(record, "prenatalAog"))}${inputOptional("Date of Quickening", "prenatalQuickeningDate", detailValue(record, "prenatalQuickeningDate"), "date")}${inputOptional("Height", "prenatalHeight", detailValue(record, "prenatalHeight"))}</div>
    <div class="two-col">${inputOptional("Weight", "prenatalWeight", detailValue(record, "prenatalWeight"))}${inputOptional("BMI", "prenatalBmi", detailValue(record, "prenatalBmi"))}</div>

    ${formDivider("Present Problems")}
    <div class="three-col">${selectOptional("Nausea / Vomiting", "presentNauseaVomiting", yesNo, detailValue(record, "presentNauseaVomiting"))}${selectOptional("Headache", "presentHeadache", yesNo, detailValue(record, "presentHeadache"))}${selectOptional("Edema", "presentEdema", yesNo, detailValue(record, "presentEdema"))}</div>
    <div class="three-col">${selectOptional("Visual Disturbance", "presentVisualDisturbance", yesNo, detailValue(record, "presentVisualDisturbance"))}${selectOptional("Dizziness", "presentDizziness", yesNo, detailValue(record, "presentDizziness"))}${selectOptional("Syncope", "presentSyncope", yesNo, detailValue(record, "presentSyncope"))}</div>
    <div class="three-col">${selectOptional("Abdominal Pain", "presentAbdominalPain", yesNo, detailValue(record, "presentAbdominalPain"))}${selectOptional("Vaginal Bleeding", "presentVaginalBleeding", yesNo, detailValue(record, "presentVaginalBleeding"))}${selectOptional("Vaginal Discharge", "presentVaginalDischarge", yesNo, detailValue(record, "presentVaginalDischarge"))}</div>
    <div class="three-col">${selectOptional("Easy Fatigability", "presentEasyFatigability", yesNo, detailValue(record, "presentEasyFatigability"))}${selectOptional("Fever / Chills", "presentFeverChills", yesNo, detailValue(record, "presentFeverChills"))}${selectOptional("Hypertension", "presentHypertension", yesNo, detailValue(record, "presentHypertension"))}</div>
    <div class="three-col">${selectOptional("Constipation", "presentConstipation", yesNo, detailValue(record, "presentConstipation"))}${selectOptional("Backache", "presentBackache", yesNo, detailValue(record, "presentBackache"))}${selectOptional("Pelvic Pain", "presentPelvicPain", yesNo, detailValue(record, "presentPelvicPain"))}</div>
    <div class="two-col">${selectOptional("Bleeding", "presentBleeding", yesNo, detailValue(record, "presentBleeding"))}${inputOptional("Others", "presentOther", detailValue(record, "presentOther"))}</div>

    ${formDivider("Risk Factors Present")}
    <div class="two-col">${inputOptional("Risk Factor 1", "riskFactor1", detailValue(record, "riskFactor1"))}${inputOptional("Risk Factor 2", "riskFactor2", detailValue(record, "riskFactor2"))}</div>
    <div class="three-col">${inputOptional("Risk Factor 3", "riskFactor3", detailValue(record, "riskFactor3"))}${inputOptional("Risk Factor 4", "riskFactor4", detailValue(record, "riskFactor4"))}${inputOptional("Risk Factor 5", "riskFactor5", detailValue(record, "riskFactor5"))}</div>

    ${formDivider("Prenatal Visit Log", "This is editable by the parent and by the assigned barangay Nurse/Midwife for assistance.")}
    <div class="visit-grid">${visitRows}</div>
  `;
}

function renderParentForms() {
  const current = getCurrentUser();
  const mother = currentMotherRecord();
  const infants = currentInfantRecords();

  setContent(`
    <section class="section">
      ${toolbar("Parent Health Forms", "Parents can choose from three forms: Prenatal Record, Maternal Record, and Infant Immunization Card. Select a form below to fill up in a pop-up window.", "")}

      <div class="card card-pad">
        <div class="section-head">
          <div><h3>Choose a Form</h3><p>Tap a form card to open the fill-up form in a pop-up modal.</p></div>
          ${badge("Form Selection")}
        </div>
        <div class="barangay-grid">
          <button class="card barangay-card hover:border-blue-500 cursor-pointer text-left transition-all" type="button" data-open-parent-modal="prenatal">
            <div class="flex items-center gap-2 mb-2">
              <span class="material-symbols-outlined text-blue-600 text-2xl">description</span>
              <h4 class="m-0 text-base font-bold text-slate-800">Prenatal Record</h4>
            </div>
            <div class="metric-list">
              <div><span>Use for</span><strong>Initial check-up & prenatal visits</strong></div>
              <div><span>Status</span><strong>${escapeHtml(mother ? "Saved / Update anytime" : "Not submitted")}</strong></div>
            </div>
            <div class="mt-3 text-xs font-semibold text-blue-600 flex items-center gap-1">
              <span>Fill up form</span> <span class="material-symbols-outlined text-sm">open_in_new</span>
            </div>
          </button>

          <button class="card barangay-card hover:border-blue-500 cursor-pointer text-left transition-all" type="button" data-open-parent-modal="maternal">
            <div class="flex items-center gap-2 mb-2">
              <span class="material-symbols-outlined text-pink-600 text-2xl">health_and_safety</span>
              <h4 class="m-0 text-base font-bold text-slate-800">Maternal Record</h4>
            </div>
            <div class="metric-list">
              <div><span>Use for</span><strong>Maternal, postpartum & family planning</strong></div>
              <div><span>Status</span><strong>${escapeHtml(mother ? (mother.pregnancyStatus || "For Review") : "Not submitted")}</strong></div>
            </div>
            <div class="mt-3 text-xs font-semibold text-pink-600 flex items-center gap-1">
              <span>Fill up form</span> <span class="material-symbols-outlined text-sm">open_in_new</span>
            </div>
          </button>

          <button class="card barangay-card hover:border-blue-500 cursor-pointer text-left transition-all" type="button" data-open-parent-modal="infant">
            <div class="flex items-center gap-2 mb-2">
              <span class="material-symbols-outlined text-emerald-600 text-2xl">child_care</span>
              <h4 class="m-0 text-base font-bold text-slate-800">Infant Immunization Card</h4>
            </div>
            <div class="metric-list">
              <div><span>Use for</span><strong>Baby / immunization details</strong></div>
              <div><span>Reminder</span><strong>${mother ? "Ready" : "Save prenatal/maternal form first"}</strong></div>
            </div>
            <div class="mt-3 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>Fill up form</span> <span class="material-symbols-outlined text-sm">open_in_new</span>
            </div>
          </button>
        </div>
      </div>

      <div class="card card-pad mt-4">
        <div class="section-head"><div><h3>Submitted Infant Records</h3><p>Immunization & infant records linked to your profile.</p></div></div>
        ${recordTable(infants, ["Infant", "Birthdate", "Age", "Sex", "Status"], (i) => [i.infantName, fmtDate(i.birthdate), `${i.ageMonths || 0} mo.`, detailValue(i, "sex"), badge(i.immunizationStatus || "For Review")])}
      </div>
    </section>
  `);

  document.querySelectorAll("[data-open-parent-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.openParentModal;
      if (type === "prenatal") openParentPrenatalModal();
      else if (type === "maternal") openParentMaternalModal();
      else if (type === "infant") {
        if (!currentMotherRecord()) {
          toast("Please save your prenatal or maternal form first before adding an infant immunization form.", true);
          return;
        }
        openParentInfantModal();
      }
    });
  });
}

function openParentPrenatalModal() {
  const current = getCurrentUser();
  const mother = currentMotherRecord();
  openModal("Prenatal Record Form", `
    <form id="parentPrenatalForm" class="form-grid detailed-form">
      <input type="hidden" name="id" value="${escapeHtml(mother?.id || makeId("M"))}">
      ${formDivider("Basic Information")}
      <div class="two-col">${input("Full Name", "fullName", mother?.fullName || current.name)}${input("Age", "age", mother?.age || "", false, "number")}</div>
      ${input("Address", "address", mother?.address || "")}
      <div class="two-col">${select("Barangay", "barangay", barangays, mother?.barangay || current.barangay || barangays[0])}${input("Contact Number", "contact", mother?.contact || "", false, "tel")}</div>
      <div class="two-col">${input("LMP", "lmp", mother?.lmp || "", false, "date")}${input("EDD / EDC", "edd", mother?.edd || "", false, "date")}</div>
      ${prenatalRecordFieldsHtml(mother)}
      <input type="hidden" name="pregnancyStatus" value="${escapeHtml(mother?.pregnancyStatus || "For Review")}">
      <input type="hidden" name="checkupsCompleted" value="${escapeHtml(mother?.checkupsCompleted || 0)}">
      <input type="hidden" name="riskLevel" value="${escapeHtml(mother?.riskLevel || "Pending")}">
      <input type="hidden" name="assignedNurse" value="${escapeHtml(mother?.assignedNurse || "For assignment")}">
      ${textarea("Notes / Concerns", "notes", mother?.notes || "")}
      <div class="flex justify-end gap-2 mt-4">
        <button class="ghost-btn" type="button" onclick="closeModal()">Cancel</button>
        <button class="primary-btn" type="submit">Save Prenatal Record</button>
      </div>
    </form>
  `);

  document.getElementById("parentPrenatalForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const row = formData(event.target);
    const previous = state.maternalRecords.find((m) => m.id === row.id);
    const detailUpdates = packFormDetails(row, prenatalRecordFields);
    const merged = { ...(previous || {}), ...row, formDetails: { ...(previous?.formDetails || {}), ...detailUpdates } };
    upsert("maternalRecords", merged, "id");
    const updated = { ...current, motherId: merged.id, barangay: merged.barangay, name: merged.fullName };
    const index = state.users.findIndex((u) => u.id === current.id || String(u.email).toLowerCase() === String(current.email).toLowerCase());
    if (index >= 0) state.users[index] = updated;
    save("currentUser", updated);
    await persistRecord("users", updated);
    closeModal();
    toast("Prenatal record saved successfully.");
    renderParentForms();
    renderNav();
  });
}

function openParentMaternalModal() {
  const current = getCurrentUser();
  const mother = currentMotherRecord();
  openModal("Maternal Record / Postpartum Form", `
    <form id="parentMaternalForm" class="form-grid detailed-form">
      <input type="hidden" name="id" value="${escapeHtml(mother?.id || makeId("M"))}">

      ${formDivider("Personal Information")}
      <div class="three-col">${input("Full Name", "fullName", mother?.fullName || current.name)}${inputOptional("Blood Type", "bloodType", detailValue(mother, "bloodType"))}${inputOptional("Birthday", "birthday", detailValue(mother, "birthday"), "date")}</div>
      ${input("Address", "address", mother?.address || "")}
      <div class="three-col">${select("Barangay", "barangay", barangays, mother?.barangay || current.barangay || barangays[0])}${input("Contact Number", "contact", mother?.contact || "", false, "tel")}${input("Age", "age", mother?.age || "", false, "number")}</div>
      <div class="three-col">${inputOptional("Height", "heightCm", detailValue(mother, "heightCm"))}${inputOptional("Weight", "weightKg", detailValue(mother, "weightKg"))}${inputOptional("BMI", "bmi", detailValue(mother, "bmi"))}</div>

      ${formDivider("Tetanus Toxoid")}
      <div class="three-col">${selectOptional("Age Category", "tetanusAgeCategory", ["", "Below 18", "18-34", "35+"], detailValue(mother, "tetanusAgeCategory"))}${inputOptional("TT/Td Dose 1 Date", "tetanusDose1Date", detailValue(mother, "tetanusDose1Date"), "date")}${inputOptional("TT/Td Dose 2 Date", "tetanusDose2Date", detailValue(mother, "tetanusDose2Date"), "date")}</div>
      <div class="three-col">${inputOptional("TT/Td Dose 3 Date", "tetanusDose3Date", detailValue(mother, "tetanusDose3Date"), "date")}${inputOptional("TT/Td Dose 4 Date", "tetanusDose4Date", detailValue(mother, "tetanusDose4Date"), "date")}${inputOptional("TT/Td Dose 5 Date", "tetanusDose5Date", detailValue(mother, "tetanusDose5Date"), "date")}</div>

      ${formDivider("Obstetrical History")}
      <div class="three-col">${inputOptional("G-P-T-P-A-L", "obstetricGTPAL", detailValue(mother, "obstetricGTPAL"))}${inputOptional("Previous Pregnancies", "previousPregnancies", detailValue(mother, "previousPregnancies"), "number")}${selectOptional("Caesarean Section", "caesareanSection", ["", "Yes", "No"], detailValue(mother, "caesareanSection"))}</div>
      <div class="three-col">${selectOptional("Stillbirth", "stillbirth", ["", "Yes", "No"], detailValue(mother, "stillbirth"))}${selectOptional("Post-partum Hemorrhage", "postpartumHemorrhage", ["", "Yes", "No"], detailValue(mother, "postpartumHemorrhage"))}${selectOptional("3 Consecutive Miscarriages", "consecutiveMiscarriages", ["", "Yes", "No"], detailValue(mother, "consecutiveMiscarriages"))}</div>

      ${formDivider("Present Health Problems")}
      <div class="three-col">${selectOptional("Tuberculosis", "tuberculosis", ["", "Yes", "No"], detailValue(mother, "tuberculosis"))}${selectOptional("Heart Disease", "heartDisease", ["", "Yes", "No"], detailValue(mother, "heartDisease"))}${selectOptional("Diabetes", "diabetes", ["", "Yes", "No"], detailValue(mother, "diabetes"))}</div>
      <div class="three-col">${selectOptional("Bronchial Asthma", "bronchialAsthma", ["", "Yes", "No"], detailValue(mother, "bronchialAsthma"))}${selectOptional("Goiter", "goiter", ["", "Yes", "No"], detailValue(mother, "goiter"))}${selectOptional("Hypertension", "hypertension", ["", "Yes", "No"], detailValue(mother, "hypertension"))}</div>

      ${formDivider("Present Pregnancy")}
      <div class="three-col">${input("Last Menstrual Period", "lmp", mother?.lmp || "", false, "date")}${input("Expected Date of Confinement / Delivery", "edd", mother?.edd || "", false, "date")}${inputOptional("AOG in Months", "aogMonths", detailValue(mother, "aogMonths"))}</div>
      <div class="three-col">${inputOptional("Date of Visit", "latestVisitDate", detailValue(mother, "latestVisitDate"), "date")}${inputOptional("Weight in Kg", "weightVisitKg", detailValue(mother, "weightVisitKg"))}${inputOptional("Blood Pressure", "bloodPressure", detailValue(mother, "bloodPressure"))}</div>
      <div class="three-col">${selectOptional("Vaginal Bleeding", "vaginalBleeding", ["", "Yes", "No"], detailValue(mother, "vaginalBleeding"))}${selectOptional("Urinary Tract Infection", "urinaryTractInfection", ["", "Yes", "No"], detailValue(mother, "urinaryTractInfection"))}${selectOptional("BP 140/90 and above", "bp140Above", ["", "Yes", "No"], detailValue(mother, "bp140Above"))}</div>
      <div class="three-col">${selectOptional("Fever 39 and above", "fever39Above", ["", "Yes", "No"], detailValue(mother, "fever39Above"))}${selectOptional("Pallor", "pallor", ["", "Yes", "No"], detailValue(mother, "pallor"))}${selectOptional("Edema", "edema", ["", "Yes", "No"], detailValue(mother, "edema"))}</div>
      <div class="three-col">${selectOptional("Abnormal Fundal Height", "abnormalFundalHeight", ["", "Yes", "No"], detailValue(mother, "abnormalFundalHeight"))}${selectOptional("Abnormal Presentation", "abnormalPresentation", ["", "Yes", "No"], detailValue(mother, "abnormalPresentation"))}${selectOptional("Missing Fetal Heartbeat", "missingFetalHeartbeat", ["", "Yes", "No"], detailValue(mother, "missingFetalHeartbeat"))}</div>
      <div class="two-col">${selectOptional("Vaginal Infection", "vaginalInfection", ["", "Yes", "No"], detailValue(mother, "vaginalInfection"))}${inputOptional("Lab Test Results", "labTestResults", detailValue(mother, "labTestResults"))}</div>

      ${formDivider("Action and Laboratory")}
      <div class="three-col">${inputOptional("Iron/Folate #", "ironFolateNumber", detailValue(mother, "ironFolateNumber"))}${inputOptional("Iron/Folate Date", "ironFolateDate", detailValue(mother, "ironFolateDate"), "date")}${inputOptional("Calcium Carbonate #", "calciumCarbonateNumber", detailValue(mother, "calciumCarbonateNumber"))}</div>
      <div class="three-col">${inputOptional("Calcium Date", "calciumDateGiven", detailValue(mother, "calciumDateGiven"), "date")}${selectOptional("Iodine Supplementation in High Risk Areas", "iodineHighRisk", ["", "Yes", "No"], detailValue(mother, "iodineHighRisk"))}${selectOptional("Mother intends to breastfeed", "intendsBreastfeed", ["", "Yes", "No"], detailValue(mother, "intendsBreastfeed"))}</div>
      <div class="three-col">${selectOptional("Advice on 4 danger signs", "dangerSignsAdvice", ["", "Yes", "No"], detailValue(mother, "dangerSignsAdvice"))}${selectOptional("Dental Check-up", "dentalCheckup", ["", "Yes", "No"], detailValue(mother, "dentalCheckup"))}${selectOptional("Emergency plan/place of delivery", "emergencyPlan", ["", "Yes", "No"], detailValue(mother, "emergencyPlan"))}</div>
      <div class="three-col">${selectOptional("Risk", "maternalRisk", ["", "Yes", "No"], detailValue(mother, "maternalRisk"))}${inputOptional("Date of Next Visit", "nextVisitDate", detailValue(mother, "nextVisitDate"), "date")}${inputOptional("Place of Delivery", "placeOfDelivery", detailValue(mother, "placeOfDelivery"))}</div>
      <div class="three-col">${inputOptional("Type of Laboratory", "laboratoryType", detailValue(mother, "laboratoryType"))}${inputOptional("Laboratory Date", "laboratoryDate", detailValue(mother, "laboratoryDate"), "date")}${inputOptional("Laboratory Remarks", "laboratoryRemarks", detailValue(mother, "laboratoryRemarks"))}</div>

      ${formDivider("Postpartum and Family Planning")}
      <div class="three-col">${selectOptional("Timing of Postpartum Visit", "postpartumVisitTiming", ["", "24 hrs", "1 week", "2-6 weeks", "Clinic Visit"], detailValue(mother, "postpartumVisitTiming"))}${inputOptional("Postpartum Visit Date", "postpartumVisitDate", detailValue(mother, "postpartumVisitDate"), "date")}${selectOptional("Exclusive Breastfeeding", "exclusiveBreastfeeding", ["", "Yes", "No"], detailValue(mother, "exclusiveBreastfeeding"))}</div>
      <div class="three-col">${selectOptional("Intends to use Family Planning", "intendsFamilyPlanning", ["", "Yes", "No"], detailValue(mother, "intendsFamilyPlanning"))}${selectOptional("Fever >39", "postpartumFever", ["", "Yes", "No"], detailValue(mother, "postpartumFever"))}${selectOptional("Foul Smelling Vaginal Discharge", "foulSmellingDischarge", ["", "Yes", "No"], detailValue(mother, "foulSmellingDischarge"))}</div>
      <div class="three-col">${selectOptional("Excessive Bleeding", "excessiveBleeding", ["", "Yes", "No"], detailValue(mother, "excessiveBleeding"))}${selectOptional("Pallor", "postpartumPallor", ["", "Yes", "No"], detailValue(mother, "postpartumPallor"))}${selectOptional("Cord OK", "cordOk", ["", "Yes", "No"], detailValue(mother, "cordOk"))}</div>
      <div class="three-col">${selectOptional("Vitamin A 20000 IU", "vitaminA20000", ["", "Yes", "No"], detailValue(mother, "vitaminA20000"))}${inputOptional("Iron/Folate Date #", "postpartumIronFolateDate", detailValue(mother, "postpartumIronFolateDate"), "date")}${inputOptional("Family Planning Date of Visit", "familyPlanningDate", detailValue(mother, "familyPlanningDate"), "date")}</div>
      <div class="three-col">${inputOptional("Family Planning Follow-up", "familyPlanningFollowUpDate", detailValue(mother, "familyPlanningFollowUpDate"), "date")}${inputOptional("Family Planning Method", "familyPlanningMethod", detailValue(mother, "familyPlanningMethod"))}${inputOptional("Quantity Given", "familyPlanningQuantity", detailValue(mother, "familyPlanningQuantity"))}</div>
      ${textareaOptional("Family Planning Remarks", "familyPlanningRemarks", detailValue(mother, "familyPlanningRemarks"))}
      <div class="three-col">${selectOptional("Refer to Physician/RHU", "referPhysicianRhu", ["", "Yes", "No"], detailValue(mother, "referPhysicianRhu"))}${selectOptional("Close Observation of Action by Midwife/Nurse", "closeObservation", ["", "Yes", "No"], detailValue(mother, "closeObservation"))}${selectOptional("Hospital Delivery Recommended", "hospitalDeliveryRecommended", ["", "Yes", "No"], detailValue(mother, "hospitalDeliveryRecommended"))}</div>

      <input type="hidden" name="pregnancyStatus" value="${escapeHtml(mother?.pregnancyStatus || "For Review")}">
      <input type="hidden" name="checkupsCompleted" value="${escapeHtml(mother?.checkupsCompleted || 0)}">
      <input type="hidden" name="riskLevel" value="${escapeHtml(mother?.riskLevel || "Pending")}">
      <input type="hidden" name="assignedNurse" value="${escapeHtml(mother?.assignedNurse || "For assignment")}">
      ${textarea("Notes / Concerns", "notes", mother?.notes || "")}
      <div class="flex justify-end gap-2 mt-4">
        <button class="ghost-btn" type="button" onclick="closeModal()">Cancel</button>
        <button class="primary-btn" type="submit">Save Maternal Form</button>
      </div>
    </form>
  `);

  document.getElementById("parentMaternalForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const row = formData(event.target);
    const previous = state.maternalRecords.find((m) => m.id === row.id);
    const detailUpdates = packFormDetails(row, [...maternalDetailFields, ...parentMaternalClinicFields]);
    row.formDetails = { ...(previous?.formDetails || {}), ...detailUpdates };
    upsert("maternalRecords", row, "id");
    const updated = { ...current, motherId: row.id, barangay: row.barangay, name: row.fullName };
    const index = state.users.findIndex((u) => u.id === current.id || String(u.email).toLowerCase() === String(current.email).toLowerCase());
    if (index >= 0) state.users[index] = updated;
    save("currentUser", updated);
    await persistRecord("users", updated);
    closeModal();
    toast("Maternal form saved successfully.");
    renderParentForms();
    renderNav();
  });
}

function openParentInfantModal() {
  const current = getCurrentUser();
  const mother = currentMotherRecord();
  openModal("Infant Immunization Card Form", `
    <form id="parentInfantForm" class="form-grid detailed-form">
      <input type="hidden" name="id" value="${makeId("I")}">
      ${formDivider("Infant Information")}
      <div class="three-col">${input("Infant Name", "infantName", "")}${input("Birthdate", "birthdate", "", false, "date")}${input("Age in Months", "ageMonths", "", false, "number")}</div>
      ${input("Address", "address", mother?.address || "")}
      <div class="three-col">${select("Barangay", "barangay", barangays, mother?.barangay || current.barangay || barangays[0])}${selectOptional("Sex", "sex", ["", "M", "F"], "")}${inputOptional("Contact Number", "birthContactNumber", mother?.contact || "")}</div>
      <div class="three-col">${inputOptional("Place of Birth", "placeOfBirth", "")}${inputOptional("Birth Height", "birthHeight", "")}${inputOptional("Birth Weight", "birthWeight", "")}</div>
      <div class="two-col">${inputOptional("Mother's Name", "motherName", mother?.fullName || current.name)}${inputOptional("Father's Name", "fatherName", "")}</div>

      ${formDivider("Vaccination Dates")}
      <div class="three-col">${inputOptional("BCG Vaccine", "bcgDate", "", "date")}${inputOptional("Hepatitis B Vaccine", "hepatitisBDate", "", "date")}${inputOptional("Pentavalent 1", "pentavalentDose1Date", "", "date")}</div>
      <div class="three-col">${inputOptional("Pentavalent 2", "pentavalentDose2Date", "", "date")}${inputOptional("Pentavalent 3", "pentavalentDose3Date", "", "date")}${inputOptional("OPV 1", "opvDose1Date", "", "date")}</div>
      <div class="three-col">${inputOptional("OPV 2", "opvDose2Date", "", "date")}${inputOptional("OPV 3", "opvDose3Date", "", "date")}${inputOptional("IPV 1", "ipvDose1Date", "", "date")}</div>
      <div class="three-col">${inputOptional("IPV 2", "ipvDose2Date", "", "date")}${inputOptional("PCV 1", "pcvDose1Date", "", "date")}${inputOptional("PCV 2", "pcvDose2Date", "", "date")}</div>
      <div class="three-col">${inputOptional("PCV 3", "pcvDose3Date", "", "date")}${inputOptional("MMR 1", "mmrDose1Date", "", "date")}${inputOptional("MMR 2", "mmrDose2Date", "", "date")}</div>
      <div class="three-col">${inputOptional("MCV MR / MMR Grade 1", "mcvMrGrade1Date", "", "date")}${inputOptional("MCV MR / MMR Grade 7", "mcvMmrGrade7Date", "", "date")}${inputOptional("Tetanus Diphtheria", "tetanusDiphtheriaDate", "", "date")}</div>
      <div class="three-col">${inputOptional("HPV Vaccine", "hpvDate", "", "date")}${inputOptional("Influenza Vaccine", "influenzaDate", "", "date")}${inputOptional("Pneumococcal Vaccine", "pneumococcalDate", "", "date")}</div>
      ${textareaOptional("Other Vaccines", "otherVaccines", "")}
      ${textareaOptional("Vaccine Remarks", "vaccineRemarks", "")}
      ${textareaOptional("Remarks / Actions Taken", "remarksActionsTaken", "")}
      <input type="hidden" name="parentName" value="${escapeHtml(mother?.fullName || current.name)}">
      <input type="hidden" name="contact" value="${escapeHtml(mother?.contact || "")}">
      <input type="hidden" name="immunizationStatus" value="For Review">
      <input type="hidden" name="lastCheckup" value="">
      <input type="hidden" name="nextCheckup" value="">
      <input type="hidden" name="assignedNurse" value="${escapeHtml(mother?.assignedNurse || "For assignment")}">
      ${textarea("Notes / Concerns", "notes", "")}
      <div class="flex justify-end gap-2 mt-4">
        <button class="ghost-btn" type="button" onclick="closeModal()">Cancel</button>
        <button class="secondary-btn" type="submit">Add Infant Form</button>
      </div>
    </form>
  `);

  document.getElementById("parentInfantForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const linkedMother = currentMotherRecord();
    if (!linkedMother) return toast("Save your prenatal or maternal form first before adding an infant record.", true);
    const row = formData(event.target);
    row.parentName = linkedMother.fullName;
    row.barangay = linkedMother.barangay;
    const detailUpdates = packFormDetails(row, [...infantDetailFields, ...parentInfantClinicFields]);
    row.formDetails = detailUpdates;
    upsert("infantRecords", row, "id");
    closeModal();
    toast("Infant immunization form added successfully.");
    renderParentForms();
  });
}

function renderMaternal() {
  const canEdit = canManageRecords();
  const filters = getFilters();
  let rows = applySearch(scoped(state.maternalRecords), ["id", "fullName", "barangay", "pregnancyStatus", "riskLevel", "assignedNurse"]);
  if (filters.barangay) rows = rows.filter((r) => r.barangay === filters.barangay);
  if (filters.status) rows = rows.filter((r) => r.pregnancyStatus === filters.status);
  if (filters.risk) rows = rows.filter((r) => r.riskLevel === filters.risk);
  const analytics = getMaternalAnalytics(scoped(state.maternalRecords));
  setContent(`
    <section class="section">
      ${toolbar("Maternal Records", "Search and filter pregnancy records.", canEdit ? `<button class="primary-btn" data-open-mother>Add maternal record</button>` : "")}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid compact">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Mothers per Barangay</h3><p>Active maternal load</p></div></div><div id="maternalBarangayChart" class="chart-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Risk Distribution</h3><p>Low, moderate, and high risk</p></div></div><div id="maternalRiskChart" class="chart-box donut-box"></div></div>
      </div>
      ${filterBar([{ id: "barangayFilter", label: "Barangay", options: ["", ...visibleBarangays()], value: filters.barangay }, { id: "statusFilter", label: "Pregnancy Status", options: ["", "Ongoing", "Delivered", "High Risk", "Completed"], value: filters.status }, { id: "riskFilter", label: "Risk Level", options: ["", "Low", "Moderate", "High"], value: filters.risk }])}
      <div class="card card-pad">
        ${recordTable(rows, ["Mother ID", "Full Name", "Barangay", "Age", "EDD", "Check-ups", "Status", "Risk", "Assigned Nurse", "Actions"], (m) => [
          m.id, m.fullName, m.barangay, m.age, fmtDate(m.edd), m.checkupsCompleted, badge(m.pregnancyStatus), badge(m.riskLevel), m.assignedNurse, rowActions("mother", m.id, canEdit)
        ])}
      </div>
    </section>
  `);
  renderBarChart("maternalBarangayChart", analytics.byBarangay, { series: ["Mothers"] });
  renderDonutChart("maternalRiskChart", analytics.risk);
  bindFilters();
  if (canEdit) document.querySelector("[data-open-mother]").addEventListener("click", () => openMotherForm());
  bindRowActions();
}

function renderInfants() {
  const canEdit = canManageRecords();
  const filters = getFilters();
  let rows = applySearch(scoped(state.infantRecords), ["id", "infantName", "parentName", "barangay", "immunizationStatus", "assignedNurse"]);
  if (filters.barangay) rows = rows.filter((r) => r.barangay === filters.barangay);
  if (filters.immunization) rows = rows.filter((r) => r.immunizationStatus === filters.immunization);
  const analytics = getInfantAnalytics(scoped(state.infantRecords));
  setContent(`
    <section class="section">
      ${toolbar("Infant Records", "Track immunization and check-up progress.", canEdit ? `<button class="primary-btn" data-open-infant>Add infant record</button>` : "")}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid compact">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Infants per Barangay</h3><p>Barangay infant load</p></div></div><div id="infantBarangayChart" class="chart-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Immunization Distribution</h3><p>Completion and follow-up status</p></div></div><div id="infantStatusChart" class="chart-box donut-box"></div></div>
      </div>
      ${filterBar([{ id: "barangayFilter", label: "Barangay", options: ["", ...visibleBarangays()], value: filters.barangay }, { id: "immunizationFilter", label: "Immunization Status", options: ["", "Complete", "Incomplete", "Pending", "Missed"], value: filters.immunization }])}
      <div class="card card-pad">
        ${recordTable(rows, ["Infant ID", "Infant Name", "Parent", "Barangay", "Age", "Next Check-up", "Immunization", "Assigned Nurse", "Actions"], (i) => [
          i.id, i.infantName, i.parentName, i.barangay, `${i.ageMonths} mo.`, fmtDate(i.nextCheckup), badge(i.immunizationStatus), i.assignedNurse, rowActions("infant", i.id, canEdit)
        ])}
      </div>
    </section>
  `);
  renderBarChart("infantBarangayChart", analytics.byBarangay, { series: ["Infants"] });
  renderDonutChart("infantStatusChart", analytics.status);
  bindFilters();
  if (canEdit) document.querySelector("[data-open-infant]").addEventListener("click", () => openInfantForm());
  bindRowActions();
}

function renderSchedules() {
  const current = getCurrentUser();
  const isParent = current.role === "Mother / Parent";
  const canEdit = ["Administrator", "Nurse / Midwife"].includes(current.role);
  const canRequest = isParent;
  const filters = getFilters();
  let rows = isParent ? patientSchedules() : scoped(state.checkupSchedules);
  rows = applySearch(rows, ["patientName", "type", "barangay", "status", "assignedNurse"]);
  if (filters.barangay) rows = rows.filter((r) => r.barangay === filters.barangay);
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.date) rows = rows.filter((r) => r.date === filters.date);

  const actions = canEdit
    ? `<button class="primary-btn" data-open-schedule>Add schedule</button>`
    : canRequest
      ? `<button class="primary-btn" data-request-schedule>Request check-up</button>`
      : "";

  if (isParent) {
    setContent(`
      <section class="section">
        ${toolbar("Check-up Schedules", "Request and view your maternal or infant check-up schedules.", actions)}
        <div class="card card-pad">
          ${recordTable(rows, ["Patient", "Type", "Barangay", "Date", "Time", "Assigned Doctor", "Status", "Notes", "Actions"], (s) => [s.patientName, s.type, s.barangay, fmtDate(s.date), s.time, s.assignedNurse, badge(s.status), s.notes, scheduleActions(s, canEdit)])}
        </div>
      </section>
    `);
    if (canRequest) document.querySelector("[data-request-schedule]")?.addEventListener("click", () => openParentScheduleRequestForm());
    bindRowActions();
    return;
  }

  const analytics = getScheduleAnalytics(scoped(state.checkupSchedules));
  setContent(`
    <section class="section">
      ${toolbar("Check-up Schedules", "Upcoming, completed, missed, and rescheduled appointments.", actions)}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid compact">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Check-ups by Status</h3><p>Operational appointment state</p></div></div><div id="scheduleStatusChart" class="chart-box donut-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Maternal vs Infant</h3><p>Check-up volume by patient type</p></div></div><div id="scheduleTypeChart" class="chart-box"></div></div>
      </div>
      ${filterBar([{ id: "barangayFilter", label: "Barangay", options: ["", ...visibleBarangays()], value: filters.barangay }, { id: "statusFilter", label: "Status", options: ["", "Requested", "Upcoming", "Completed", "Missed", "Rescheduled"], value: filters.status }], true)}
      <div class="card card-pad">${recordTable(rows, ["Patient", "Type", "Barangay", "Date", "Time", "Assigned Doctor", "Status", "Notes", "Actions"], (s) => [s.patientName, s.type, s.barangay, fmtDate(s.date), s.time, s.assignedNurse, badge(s.status), s.notes, scheduleActions(s, canEdit)])}</div>
    </section>
  `);
  renderDonutChart("scheduleStatusChart", analytics.status);
  renderBarChart("scheduleTypeChart", analytics.type, { series: ["Check-ups"] });
  bindFilters();
  if (canEdit) document.querySelector("[data-open-schedule]")?.addEventListener("click", () => openScheduleForm());
  bindRowActions();
}


function renderReminders() {
  const current = getCurrentUser();
  const canEdit = ["Administrator", "Nurse / Midwife"].includes(current.role);

  if (current.role === "Mother / Parent") {
    const rows = applySearch(patientReminders(), ["recipientName", "contact", "messageType", "status", "message"]);
    setContent(`
      <section class="section">
        ${toolbar("My Reminders", "Reminder messages from the RHU or barangay health staff.", "")}
        <div class="list-stack">
          ${rows.map(parentReminderMessage).join("") || empty("No reminder messages yet.")}
        </div>
      </section>
    `);
    return;
  }

  let rows = applySearch(state.reminders, ["recipientName", "contact", "messageType", "status", "message"]);
  const analytics = getReminderAnalytics(state.reminders);
  setContent(`
    <section class="section">
      ${toolbar("Reminder System", "Check-up and follow-up reminder records.", canEdit ? `<button class="primary-btn" data-generate-reminder>Generate Reminder</button>` : "")}
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid compact">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Reminder Status</h3><p>Queue, sent, failed, and upcoming</p></div></div><div id="reminderStatusChart" class="chart-box donut-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Reminder Types</h3><p>Message category mix</p></div></div><div id="reminderTypeChart" class="chart-box"></div></div>
      </div>
      <div class="card card-pad">${recordTable(rows, ["Recipient", "Contact", "Message Type", "Schedule Date", "Status", "Actions"], (r) => [r.recipientName, r.contact, r.messageType, fmtDate(r.scheduleDate), badge(r.status), reminderActions(r, canEdit)])}</div>
    </section>
  `);
  renderDonutChart("reminderStatusChart", analytics.status);
  renderBarChart("reminderTypeChart", analytics.type, { series: ["Reminders"] });
  if (canEdit) document.querySelector("[data-generate-reminder]").addEventListener("click", generateReminder);
  bindRowActions();
}

function renderBarangay() {
  const options = visibleBarangays();
  if (!options.includes(selectedBarangay)) selectedBarangay = defaultVisibleBarangay();
  const stats = getBarangayStats();
  const selected = stats.find((b) => b.name === selectedBarangay) || stats[0];
  setContent(`
    <section class="section">
      ${toolbar("Barangay-Based Monitoring", "Monthly maternal and infant records per barangay clinic.", "")}
      <div class="chart-grid">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Barangay Comparison</h3><p>Mothers, infants, and missed check-ups</p></div></div><div id="barangayCompareChart" class="chart-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>High-Risk by Barangay</h3><p>Priority maternal cases</p></div></div><div id="barangayRiskChart" class="chart-box"></div></div>
      </div>
      <div class="barangay-grid">${visibleBarangays().map(barangayCard).join("")}</div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>${escapeHtml(selected.name)} Dashboard</h3><p>Selected barangay operational summary</p></div>${badge(selected.reports ? "Submitted" : "Pending")}</div>
        ${renderAnalyticsCards([
          { icon: "M", label: "Maternal", value: selected.mothers, trend: "Pregnancy records", tone: "primary" },
          { icon: "I", label: "Infant", value: selected.infants, trend: "Infant records", tone: "success" },
          { icon: "!", label: "Missed", value: selected.missed, trend: "Check-ups to follow up", tone: "error" },
          { icon: "R", label: "Reports", value: selected.reports, trend: "Submitted summaries", tone: "warning" }
        ])}
      </div>
      <div class="split-grid">
        <div class="card card-pad">
          <div class="section-head"><div><h3>${escapeHtml(selectedBarangay)} Mothers</h3><p>Maternal summary and active records</p></div></div>
          ${recordTable(state.maternalRecords.filter((m) => m.barangay === selectedBarangay), ["Name", "EDD", "Status", "Risk"], (m) => [m.fullName, fmtDate(m.edd), badge(m.pregnancyStatus), badge(m.riskLevel)])}
        </div>
        <div class="card card-pad">
          <div class="section-head"><div><h3>${escapeHtml(selectedBarangay)} Infants</h3><p>Infant summary and immunization status</p></div></div>
          ${recordTable(state.infantRecords.filter((i) => i.barangay === selectedBarangay), ["Infant", "Parent", "Next Check-up", "Status"], (i) => [i.infantName, i.parentName, fmtDate(i.nextCheckup), badge(i.immunizationStatus)])}
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Monthly Summaries</h3><p>MC maternal care and CC child immunization reports for selected barangay</p></div></div>
        ${reportsTable(state.monthlyReports.filter((r) => r.barangay === selectedBarangay))}
      </div>
    </section>
  `);
  renderBarChart("barangayCompareChart", stats.map((b) => ({ label: shortBarangay(b.name), Mothers: b.mothers, Infants: b.infants, Missed: b.missed })), { series: ["Mothers", "Infants", "Missed"] });
  renderBarChart("barangayRiskChart", stats.map((b) => ({ label: shortBarangay(b.name), "High Risk": b.highRisk })), { series: ["High Risk"] });
  document.querySelectorAll("[data-select-barangay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedBarangay = btn.dataset.selectBarangay;
      renderBarangay();
    });
  });
}

function renderReports() {
  const current = getCurrentUser();
  if (current.role === "Mother / Parent") {
    activePage = "dashboard";
    renderNav();
    toast("Parent accounts can only access health forms, check-up requests, reminders, and emergency contacts.", true);
    return renderPatientDashboard();
  }
  const canCreate = ["Administrator", "Nurse / Midwife"].includes(current.role);
  const filters = getFilters();
  const mother = current.role === "Mother / Parent" ? currentMotherRecord() : null;
  let rows = current.role === "Mother / Parent"
    ? state.monthlyReports.filter((r) => r.status === "Submitted" && (!mother || r.barangay === mother.barangay))
    : scoped(state.monthlyReports);
  rows = applySearch(rows, ["type", "month", "barangay", "preparedBy", "status"]);
  if (filters.barangay) rows = rows.filter((r) => r.barangay === filters.barangay);
  if (filters.month) rows = rows.filter((r) => r.month.toLowerCase().includes(filters.month.toLowerCase()));
  const analytics = getMonthlyReportAnalytics(scoped(state.monthlyReports));
  setContent(`
    <section class="section">
      ${toolbar("Monthly Summary Reports", "MC and CC reports are generated automatically from the records stored in the system and the selected/assigned barangay.", canCreate ? `<button class="primary-btn" data-open-report>Auto-generate MC/CC</button><button class="secondary-btn" onclick="window.print()">Print Report</button><button class="ghost-btn" data-export-mockup>Export Front-End Mockup</button>` : `<button class="secondary-btn" onclick="window.print()">Print Report</button>`)}
      <div class="barangay-grid">
        <div class="mini-item"><div><strong>MC Report</strong><br><small>Monthly maternal care summary submitted by nurses to the RHU.</small></div>${badge("Maternal")}</div>
        <div class="mini-item"><div><strong>CC Report</strong><br><small>Monthly child immunization summary submitted by nurses to the RHU.</small></div>${badge("Child")}</div>
      </div>
      ${renderAnalyticsCards(analytics.cards)}
      <div class="chart-grid">
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Submitted vs Pending</h3><p>Report completion rate</p></div></div><div id="reportStatusChart" class="chart-box donut-box"></div></div>
        <div class="card card-pad chart-card"><div class="section-head"><div><h3>Barangay Report Comparison</h3><p>Submitted summary count</p></div></div><div id="reportBarangayChart" class="chart-box"></div></div>
      </div>
      ${filterBar([{ id: "barangayFilter", label: "Barangay", options: ["", ...visibleBarangays()], value: filters.barangay }], false, true)}
      <div class="card card-pad">${reportsTable(rows, true)}</div>
    </section>
  `);
  renderDonutChart("reportStatusChart", analytics.status);
  renderBarChart("reportBarangayChart", analytics.byBarangay, { series: ["Reports"] });
  bindFilters();
  if (canCreate) {
    document.querySelector("[data-open-report]").addEventListener("click", () => openReportForm());
    document.querySelector("[data-export-mockup]").addEventListener("click", downloadBackup);
  }
  bindRowActions();
}

function renderUsers() {
  const current = getCurrentUser();
  if (current.role !== "Administrator") return renderDashboard();
  let rows = applySearch(state.users, ["name", "email", "role", "barangay"]);
  const filters = getFilters();
  if (filters.role) rows = rows.filter((r) => r.role === filters.role);
  setContent(`
    <section class="section">
      ${toolbar("Users and Roles", "Admin-managed staff accounts for MHO, Nurse/Midwife, and Doctor.", `<button class="primary-btn" data-open-user>Add staff account</button>`)}
      <div class="card card-pad">
        <p class="help-note">Public registration creates Mother / Parent accounts only. Admin creates staff login accounts here for MHO, Nurse/Midwife, and Doctor. Parents should register themselves.</p>
      </div>
      ${filterBar([{ id: "roleFilter", label: "Role", options: ["", ...roles], value: filters.role }])}
      <div class="card card-pad">${recordTable(rows, ["Name", "Email", "Role", "Assignment", "Created", "Actions"], (u) => [u.name, u.email, badge(u.role), u.barangay, fmtDate(u.createdAt), userActions(u)])}</div>
    </section>
  `);
  bindFilters();
  document.querySelector("[data-open-user]").addEventListener("click", () => openUserForm());
  bindRowActions();
}


function renderBackup() {
  const total = ["users", "maternalRecords", "infantRecords", "checkupSchedules", "reminders", "monthlyReports", "emergencyContacts"].reduce((sum, key) => sum + state[key].length, 0);
  const bytes = new Blob([JSON.stringify(getBackupPayload())]).size;
  setContent(`
    <section class="section">
      ${toolbar("Data Backup and Recovery", isOnlineMode() ? "Export, restore, or clear current Supabase-loaded records." : "Export, restore, or clear local browser records.", "")}
      ${renderAnalyticsCards([
        { icon: "B", label: "Last Backup", value: state.backupMeta?.date ? fmtDate(state.backupMeta.date) : "None", trend: isOnlineMode() ? "Supabase session" : "Local browser only", tone: "primary" },
        { icon: "R", label: "Records Stored", value: total, trend: isOnlineMode() ? "Current online records" : "Current local records", tone: "success" },
        { icon: "S", label: "Backup Size", value: `${Math.ceil(bytes / 1024)} KB`, trend: "Estimated JSON size", tone: "warning" },
        { icon: "OK", label: "Restore Status", value: "Ready", trend: "JSON restore enabled", tone: "primary" }
      ])}
      <div class="card card-pad">
        <div class="actions">
          <button class="primary-btn" data-create-backup>Create Backup</button>
          <button class="secondary-btn" data-download-backup>Download Backup JSON</button>
          <button class="ghost-btn" data-restore-backup>Restore Backup</button>
          <button class="danger-btn" data-clear-app-data>${isOnlineMode() ? "Clear Online App Data" : "Clear Local App Data"}</button>
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-head"><div><h3>Backup History</h3><p>Current app activity log</p></div></div>
        <div class="list-stack">
          <div class="mini-item"><div><strong>Manual backup</strong><br><small>${state.backupMeta?.date ? fmtDate(state.backupMeta.date) : "No backup created yet"}</small></div>${badge(state.backupMeta ? "Ready" : "Pending")}</div>
          <div class="mini-item"><div><strong>Clean testing mode</strong><br><small>No built-in records are loaded automatically.</small></div>${badge("Active")}</div>
        </div>
      </div>
    </section>
  `);
  document.querySelector("[data-create-backup]").addEventListener("click", createBackup);
  document.querySelector("[data-download-backup]").addEventListener("click", downloadBackup);
  document.querySelector("[data-restore-backup]").addEventListener("click", () => document.getElementById("restoreFile").click());
  document.querySelector("[data-clear-app-data]").addEventListener("click", clearAppData);
}

function renderContacts() {
  const current = getCurrentUser();
  let rows = state.emergencyContacts || [];
  if (current.role === "Mother / Parent") {
    const mother = currentMotherRecord();
    const parentBarangay = mother?.barangay || current.barangay;
    rows = rows.filter((c) => c.barangay === parentBarangay);
  } else if (current.role === "Nurse / Midwife") {
    rows = rows.filter((c) => c.barangay === current.barangay);
  }
  rows = applySearch(rows, ["nurseName", "barangay", "contactNumber", "clinicLocation", "hotline"]);
  const canEdit = current.role === "Administrator";
  setContent(`
    <section class="section">
      ${toolbar("Emergency Contacts", current.role === "Mother / Parent" ? "Emergency contact details for your barangay." : "Nurse, midwife, clinic, and hotline information per barangay.", canEdit ? `<button class="primary-btn" data-open-contact>Add / Edit Barangay Contact</button>` : "")}
      <div class="barangay-grid">${rows.map((c) => contactCard(c, canEdit)).join("") || empty("No emergency contacts have been added yet.")}</div>
    </section>
  `);
  if (canEdit) {
    document.querySelector("[data-open-contact]").addEventListener("click", () => openContactForm());
    bindRowActions();
  }
}

function getDashboardStats() {
  const mothers = scoped(state.maternalRecords);
  const infants = scoped(state.infantRecords);
  const schedules = scoped(state.checkupSchedules);
  const reports = scoped(state.monthlyReports);
  return {
    cards: [
      { icon: "M", label: "Pregnant Mothers", value: mothers.length, trend: "Current records", tone: "primary" },
      { icon: "I", label: "Infants", value: infants.length, trend: "Current records", tone: "success" },
      { icon: "U", label: "Upcoming", value: schedules.filter((s) => s.status === "Upcoming").length, trend: "Next schedules", tone: "warning" },
      { icon: "!", label: "Missed", value: schedules.filter((s) => s.status === "Missed").length, trend: "Needs follow-up", tone: "error" },
      { icon: "H", label: "High Risk", value: mothers.filter((m) => m.riskLevel === "High" || m.pregnancyStatus === "High Risk").length, trend: "Priority alerts", tone: "error" },
      { icon: "R", label: "Reports", value: reports.filter((r) => r.status === "Submitted").length, trend: "Submitted", tone: "primary" },
      { icon: "B", label: "Barangays", value: new Set([...mothers, ...infants].map((r) => r.barangay)).size, trend: "Monitored", tone: "primary" }
    ],
    overview: visibleBarangays().map((b) => ({ label: shortBarangay(b), Mothers: mothers.filter((m) => m.barangay === b).length, Infants: infants.filter((i) => i.barangay === b).length })),
    trend: monthLabels().map((label) => ({
      label,
      Completed: schedules.filter((s) => s.status === "Completed" && monthKey(s.date) === label).length,
      Missed: schedules.filter((s) => s.status === "Missed" && monthKey(s.date) === label).length,
      Upcoming: schedules.filter((s) => s.status === "Upcoming" && monthKey(s.date) === label).length
    })),
    risk: countBy(mothers, "riskLevel", ["Low", "Moderate", "High"]),
    immunization: countBy(infants, "immunizationStatus", ["Complete", "Incomplete", "Pending", "Missed"])
  };
}

function getMaternalAnalytics(rows) {
  return {
    cards: [
      { icon: "M", label: "Total Mothers", value: rows.length, trend: "Maternal records", tone: "primary" },
      { icon: "O", label: "Ongoing", value: rows.filter((r) => r.pregnancyStatus === "Ongoing").length, trend: "Active pregnancies", tone: "warning" },
      { icon: "D", label: "Delivered", value: rows.filter((r) => r.pregnancyStatus === "Delivered").length, trend: "Delivered cases", tone: "success" },
      { icon: "!", label: "High Risk", value: rows.filter((r) => r.riskLevel === "High" || r.pregnancyStatus === "High Risk").length, trend: "Needs review", tone: "error" }
    ],
    byBarangay: visibleBarangays().map((b) => ({ label: shortBarangay(b), Mothers: rows.filter((r) => r.barangay === b).length })),
    risk: countBy(rows, "riskLevel", ["Low", "Moderate", "High"])
  };
}

function getInfantAnalytics(rows) {
  return {
    cards: [
      { icon: "I", label: "Total Infants", value: rows.length, trend: "Infant records", tone: "primary" },
      { icon: "C", label: "Complete", value: rows.filter((r) => r.immunizationStatus === "Complete").length, trend: "Immunization done", tone: "success" },
      { icon: "P", label: "Incomplete", value: rows.filter((r) => r.immunizationStatus === "Incomplete").length, trend: "Needs follow-up", tone: "warning" },
      { icon: "!", label: "Missed", value: rows.filter((r) => r.immunizationStatus === "Missed").length, trend: "Missed immunization", tone: "error" }
    ],
    byBarangay: visibleBarangays().map((b) => ({ label: shortBarangay(b), Infants: rows.filter((r) => r.barangay === b).length })),
    status: countBy(rows, "immunizationStatus", ["Complete", "Incomplete", "Pending", "Missed"])
  };
}

function getScheduleAnalytics(rows) {
  return {
    cards: ["Upcoming", "Completed", "Missed", "Rescheduled"].map((status) => ({ icon: status[0], label: status, value: rows.filter((r) => r.status === status).length, trend: "Check-up status", tone: status === "Missed" ? "error" : status === "Completed" ? "success" : "warning" })),
    status: countBy(rows, "status", ["Upcoming", "Completed", "Missed", "Rescheduled"]),
    type: ["Maternal", "Infant"].map((type) => ({ label: type, "Check-ups": rows.filter((r) => r.type === type).length }))
  };
}

function getReminderAnalytics(rows) {
  return {
    cards: [
      { icon: "T", label: "Total", value: rows.length, trend: "Reminder records", tone: "primary" },
      { icon: "S", label: "Sent", value: rows.filter((r) => r.status === "Sent").length, trend: "Marked sent", tone: "success" },
      { icon: "Q", label: "Pending", value: rows.filter((r) => r.status === "Queue" || r.status === "Upcoming").length, trend: "Queue/upcoming", tone: "warning" },
      { icon: "!", label: "Failed", value: rows.filter((r) => r.status === "Failed").length, trend: "Needs resend", tone: "error" }
    ],
    status: countBy(rows, "status", ["Queue", "Sent", "Failed", "Upcoming"]),
    type: Object.entries(rows.reduce((acc, r) => ({ ...acc, [r.messageType]: (acc[r.messageType] || 0) + 1 }), {})).map(([label, value]) => ({ label: compactLabel(label), Reminders: value }))
  };
}

function getBarangayStats() {
  return visibleBarangays().map((name) => {
    const mothers = state.maternalRecords.filter((m) => m.barangay === name);
    const infants = state.infantRecords.filter((i) => i.barangay === name);
    const schedules = state.checkupSchedules.filter((s) => s.barangay === name);
    return {
      name,
      mothers: mothers.length,
      infants: infants.length,
      missed: schedules.filter((s) => s.status === "Missed").length,
      highRisk: mothers.filter((m) => m.riskLevel === "High" || m.pregnancyStatus === "High Risk").length,
      reports: state.monthlyReports.filter((r) => r.barangay === name && r.status === "Submitted").length
    };
  });
}

function getMonthlyReportAnalytics(rows) {
  const expected = visibleBarangays().length * 2;
  const submitted = rows.filter((r) => r.status === "Submitted").length;
  const mcSubmitted = rows.filter((r) => reportTypeShort(r.type) === "MC" && r.status === "Submitted").length;
  const ccSubmitted = rows.filter((r) => reportTypeShort(r.type) === "CC" && r.status === "Submitted").length;
  return {
    cards: [
      { icon: "%", label: "Completion", value: `${Math.min(100, Math.round((submitted / expected) * 100))}%`, trend: "Expected MC and CC reports", tone: "success" },
      { icon: "MC", label: "MC Maternal", value: mcSubmitted, trend: "Maternal care summaries submitted", tone: "primary" },
      { icon: "CC", label: "CC Child", value: ccSubmitted, trend: "Child immunization summaries submitted", tone: "warning" },
      { icon: "P", label: "Pending", value: Math.max(0, expected - submitted), trend: "Expected reports", tone: "error" }
    ],
    status: [{ label: "Submitted", value: submitted }, { label: "Pending", value: Math.max(0, expected - submitted) }],
    byBarangay: visibleBarangays().map((b) => ({ label: shortBarangay(b), Reports: rows.filter((r) => r.barangay === b).length }))
  };
}

function renderAnalyticsCards(cards) {
  return `<div class="analytics-grid">${cards.map((card) => `
    <div class="card metric-card ${card.tone || "primary"}">
      <span class="metric-icon" aria-hidden="true">${escapeHtml(card.icon)}</span>
      <div><strong>${escapeHtml(card.value)}</strong><p>${escapeHtml(card.label)}</p><small>${escapeHtml(card.trend || "")}</small></div>
    </div>
  `).join("")}</div>`;
}

function renderBarChart(containerId, data, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const series = options.series || Object.keys(data[0] || {}).filter((key) => key !== "label");
  const prepared = prepareChartData(data, series, options);
  if (!prepared.length) {
    el.innerHTML = chartEmpty(options.emptyText || "No data available yet.");
    return;
  }
  if (prepared.length > 10 || options.orientation === "horizontal") {
    renderHorizontalBarChart(el, prepared, series);
    return;
  }

  const max = Math.max(1, ...prepared.flatMap((row) => series.map((name) => Number(row[name] || 0))));
  const width = 500;
  const height = 240;
  const pad = 40;
  const bottomPad = 60;
  const chartHeight = height - pad - bottomPad;
  const groupWidth = (width - pad * 2) / Math.max(1, prepared.length);
  const barWidth = Math.max(10, Math.min(26, (groupWidth - 16) / Math.max(1, series.length)));
  const colors = ["#1976d2", "#2e7d32", "#ed6c02", "#d32f2f"];

  const bars = prepared.map((row, rowIndex) => series.map((name, seriesIndex) => {
    const value = Number(row[name] || 0);
    const barHeight = (chartHeight * value) / max;
    const groupX = pad + rowIndex * groupWidth;
    const x = groupX + (groupWidth - barWidth * series.length) / 2 + seriesIndex * barWidth;
    const y = height - bottomPad - barHeight;
    const valText = value > 0 ? `<text x="${x + barWidth / 2}" y="${Math.max(16, y - 5)}" text-anchor="middle" class="chart-label value-label">${value}</text>` : "";
    return `<rect x="${x}" y="${y}" width="${Math.max(4, barWidth - 2)}" height="${Math.max(2, barHeight)}" rx="4" fill="${colors[seriesIndex % colors.length]}"><title>${escapeHtml(row.fullLabel || row.label)} ${escapeHtml(name)}: ${value}</title></rect>${valText}`;
  }).join("")).join("");

  const labels = prepared.map((row, index) => {
    const x = pad + index * groupWidth + groupWidth / 2;
    return `<text x="${x}" y="${height - 20}" text-anchor="end" transform="rotate(-30 ${x} ${height - 20})" class="chart-label"><title>${escapeHtml(row.fullLabel || row.label)}</title>${escapeHtml(row.label)}</text>`;
  }).join("");

  el.innerHTML = chartSvg(width, height, `${gridLines(width, height - bottomPad + 8, pad)}${bars}${labels}${legend(series, colors, pad)}`);
}

function renderHorizontalBarChart(el, data, series) {
  const colors = ["#1976d2", "#2e7d32", "#ed6c02", "#d32f2f"];
  const width = 500;
  const rowHeight = Math.max(28, 18 + series.length * 11);
  const labelWidth = 130;
  const topPad = 36;
  const bottomPad = 20;
  const rightPad = 30;
  const barAreaWidth = width - labelWidth - rightPad;
  const height = topPad + bottomPad + data.length * rowHeight;
  const max = Math.max(1, ...data.flatMap((row) => series.map((name) => Number(row[name] || 0))));
  const rows = data.map((row, rowIndex) => {
    const baseY = topPad + rowIndex * rowHeight;
    const label = `<text x="12" y="${baseY + Math.min(20, rowHeight - 8)}" class="chart-label horizontal-label"><title>${escapeHtml(row.fullLabel || row.label)}</title>${escapeHtml(truncateLabel(row.fullLabel || row.label, 18))}</text>`;
    const guides = `<line x1="${labelWidth}" x2="${width - rightPad}" y1="${baseY + rowHeight - 4}" y2="${baseY + rowHeight - 4}" class="grid-line"></line>`;
    const bars = series.map((name, seriesIndex) => {
      const value = Number(row[name] || 0);
      const barHeight = Math.max(5, Math.min(13, (rowHeight - 10) / series.length));
      const gap = Math.max(2, (rowHeight - series.length * barHeight) / (series.length + 1));
      const y = baseY + gap + seriesIndex * (barHeight + gap);
      const w = value ? (barAreaWidth * value) / max : 0;
      const valueLabel = value ? `<text x="${labelWidth + w + 6}" y="${y + barHeight - 2}" class="chart-label value-label">${value}</text>` : "";
      return `<rect x="${labelWidth}" y="${y}" width="${w}" height="${barHeight}" rx="4" fill="${colors[seriesIndex % colors.length]}"><title>${escapeHtml(row.fullLabel || row.label)} ${escapeHtml(name)}: ${value}</title></rect>${valueLabel}`;
    }).join("");
    return `${guides}${label}${bars}`;
  }).join("");
  el.innerHTML = chartSvg(width, height, `${legend(series, colors, labelWidth)}${rows}`);
}

function prepareChartData(data, series, options = {}) {
  const rows = (data || []).map((row) => ({ ...row, fullLabel: row.fullLabel || row.label, label: formatChartLabel(row.label) }));
  if (options.showAll) return rows;
  return rows.filter((row) => series.some((name) => Number(row[name] || 0) > 0));
}

function formatChartLabel(value) {
  return truncateLabel(shortBarangay(value), 12);
}

function truncateLabel(value, max = 12) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, Math.max(1, max - 1))}…` : text;
}

function chartEmpty(message) {
  return `<div class="chart-empty"><strong>${escapeHtml(message)}</strong><span>Add records or generate reports to display chart data.</span></div>`;
}

function renderLineChart(containerId, data, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const series = options.series || Object.keys(data[0] || {}).filter((key) => key !== "label");
  const width = 500;
  const height = 220;
  const padLeft = 42;
  const padRight = 42;
  const padTop = 36;
  const padBottom = 34;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const max = Math.max(1, ...data.flatMap((row) => series.map((name) => Number(row[name] || 0))));
  const colors = ["#2e7d32", "#d32f2f", "#ed6c02"];
  const step = chartWidth / Math.max(1, data.length - 1);
  const lines = series.map((name, index) => {
    const points = data.map((row, i) => `${padLeft + i * step},${height - padBottom - (chartHeight * Number(row[name] || 0)) / max}`).join(" ");
    const dots = data.map((row, i) => {
      const x = padLeft + i * step;
      const val = Number(row[name] || 0);
      const y = height - padBottom - (chartHeight * val) / max;
      const valText = val > 0 ? `<text x="${x}" y="${Math.max(14, y - 7)}" text-anchor="middle" class="chart-label value-label">${val}</text>` : "";
      return `<circle cx="${x}" cy="${y}" r="4.5" fill="${colors[index]}"><title>${escapeHtml(row.label)} ${escapeHtml(name)}: ${val}</title></circle>${valText}`;
    }).join("");
    return `<polyline fill="none" stroke="${colors[index]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points}"></polyline>${dots}`;
  }).join("");
  const labels = data.map((row, index) => `<text x="${padLeft + index * step}" y="${height - 10}" text-anchor="middle" class="chart-label">${escapeHtml(row.label)}</text>`).join("");
  el.innerHTML = chartSvg(width, height, `${gridLines(width, height - padBottom, padLeft)}${lines}${labels}${legend(series, colors, padLeft)}`);
}

function renderDonutChart(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const total = Math.max(0, data.reduce((sum, item) => sum + Number(item.value || 0), 0));
  const radius = 50;
  const circumference = Math.PI * 2 * radius;
  const colors = ["#2e7d32", "#ed6c02", "#d32f2f", "#1976d2", "#9c27b0", "#00bcd4"];
  let offset = 0;
  const rings = data.map((item, index) => {
    const val = Number(item.value || 0);
    const length = total > 0 ? (val / total) * circumference : 0;
    const ring = `<circle cx="75" cy="75" r="${radius}" fill="none" stroke="${colors[index % colors.length]}" stroke-width="18" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 75 75)"><title>${escapeHtml(item.label)}: ${val}</title></circle>`;
    offset += length;
    return ring;
  }).join("");
  const items = data.map((item, index) => `<span class="legend-pill"><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(item.label)}: <strong>${escapeHtml(item.value)}</strong></span>`).join("");
  el.innerHTML = `
    <div class="donut-layout">
      <div class="donut-svg-wrap">
        ${chartSvg(150, 150, `<circle cx="75" cy="75" r="${radius}" fill="none" stroke="#e8eef3" stroke-width="18"></circle>${rings}<text x="75" y="71" text-anchor="middle" class="donut-total">${total}</text><text x="75" y="88" text-anchor="middle" class="chart-label">Total</text>`)}
      </div>
      <div class="chart-legend vertical">${items}</div>
    </div>`;
}

function renderProgressBar(containerId, value, max, label) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  el.innerHTML = `<div class="progress-block"><div class="profile-row"><span>${escapeHtml(label)}</span><strong>${percent}%</strong></div><div class="progress"><span style="width:${percent}%"></span></div></div>`;
}

function renderRoleBasedDashboard() {
  renderDashboard();
}

function updateChartsOnDataChange() {
  renderPage(activePage);
}

function chartSvg(width, height, body) {
  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Analytics chart" class="responsive-svg" style="overflow: hidden; max-width: 100%; width: 100%; display: block;">${body}</svg>`;
}

function gridLines(width, height, pad) {
  return [0, 1, 2, 3].map((i) => {
    const y = 36 + ((height - 36 - 30) / 3) * i;
    return `<line x1="${pad}" x2="${width - pad}" y1="${y}" y2="${y}" class="grid-line"></line>`;
  }).join("");
}

function legend(series, colors, startX) {
  let currentX = startX;
  return series.map((name, index) => {
    const itemX = currentX;
    currentX += Math.max(76, String(name || "").length * 7 + 22);
    return `<g transform="translate(${itemX},18)"><circle r="4.5" fill="${colors[index % colors.length]}"></circle><text x="9" y="4" class="chart-label">${escapeHtml(name)}</text></g>`;
  }).join("");
}

function countBy(rows, key, labels) {
  return labels.map((label) => ({ label, value: rows.filter((row) => row[key] === label).length }));
}


function generateStaffPassword(length = 12) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%";
  const all = upper + lower + digits + symbols;
  const pick = (set) => {
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return set[value[0] % set.length];
    }
    return set[Math.floor(Math.random() * set.length)];
  };
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < length) chars.push(pick(all));
  return chars.sort(() => Math.random() - 0.5).join("");
}

function bindStaffPasswordTools() {
  const password = document.querySelector('[name="password"]');
  const confirm = document.querySelector('[name="confirmPassword"]');
  const generateBtn = document.querySelector('[data-generate-staff-password]');
  const copyBtn = document.querySelector('[data-copy-staff-password]');
  if (generateBtn && password && confirm) {
    generateBtn.addEventListener("click", () => {
      const next = generateStaffPassword();
      password.value = next;
      confirm.value = next;
      toast("New staff password generated.");
    });
  }
  if (copyBtn && password) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(password.value);
        toast("Generated password copied.");
      } catch {
        password.select();
        toast("Copy manually from the password field.");
      }
    });
  }
}

function openUserForm(id = "") {
  const record = state.users.find((u) => u.id === id) || {};
  const isEditing = Boolean(id);
  const roleOptions = isEditing ? roles : staffRoles;
  const generatedPassword = isEditing ? "" : generateStaffPassword();
  const passwordBlock = isEditing
    ? `<div class="card card-pad"><p class="help-note">Password changes are handled through Supabase Auth. For staff password reset, use Supabase Authentication > Users or send a reset link.</p></div>`
    : `<div class="card card-pad">
        <div class="two-col">
          <label>Generated Permanent Password<input name="password" type="text" required minlength="8" autocomplete="off" value="${escapeHtml(generatedPassword)}" readonly></label>
          <label>Confirm Password<input name="confirmPassword" type="text" required minlength="8" autocomplete="off" value="${escapeHtml(generatedPassword)}" readonly></label>
        </div>
        <div class="actions"><button class="secondary-btn" type="button" data-generate-staff-password>Generate another</button><button class="ghost-btn" type="button" data-copy-staff-password>Copy password</button></div>
        <p class="help-note">Give this generated password to the staff member. It is their permanent login password until the Admin changes or resets it in Supabase Auth. Passwords are not saved in the profiles table, so copy it before closing this form.</p>
      </div>`;

  openModal(isEditing ? "Edit Managed User" : "Add Staff Account", `
    <form id="userForm" class="form-grid">
      ${input("User/Profile ID", "id", record.id || makeId("U"), true)}
      <div class="two-col">${input("Full Name", "name", record.name || "")}${input("Email", "email", record.email || "", false, "email")}</div>
      <div class="two-col">${select("Role", "role", roleOptions, record.role || "Nurse / Midwife")}${select("Barangay / Office", "barangay", ["Municipal Health Office", ...barangays], record.barangay || barangays[0])}</div>
      ${passwordBlock}
      <input type="hidden" name="username" value="${escapeHtml(record.username || record.email || "")}">
      <input type="hidden" name="motherId" value="${escapeHtml(record.motherId || "")}">
      <input type="hidden" name="createdAt" value="${escapeHtml(record.createdAt || new Date().toISOString())}">
      <input type="hidden" name="authUserId" value="${escapeHtml(record.authUserId || "")}">
      <button class="primary-btn" type="submit">${isEditing ? "Save changes" : "Create account"}</button>
    </form>
  `);

  if (!isEditing) bindStaffPasswordTools();

  document.getElementById("userForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const row = formData(event.target);
    const password = row.password || "";
    const confirmPassword = row.confirmPassword || "";
    delete row.password;
    delete row.confirmPassword;

    row.email = String(row.email || "").toLowerCase();
    row.username = row.email;
    if (!row.authUserId) delete row.authUserId;

    if (!isEditing && !staffRoles.includes(row.role)) return toast("Admin can only create MHO, Nurse/Midwife, or Doctor staff accounts here. Parents should use public registration.", true);
    if (!isEditing && password !== confirmPassword) return toast("Passwords do not match.", true);

    if (!isEditing && isOnlineMode()) {
      try {
        const profile = await createManagedAuthAccount(row, password);
        const finalProfile = { ...row, ...profile, username: profile.username || profile.email };
        rememberRow("users", finalProfile, "id");
        closeModal();
        renderUsers();
        toast("Staff account created. The user can now log in using the email and generated password.");
      } catch (error) {
        console.error(error);
        toast(`Could not create login account: ${error.message}`, true);
      }
      return;
    }

    if (!isOnlineMode() && !isEditing) row.password = password;
    upsert("users", row, "id");
    closeModal();
    renderUsers();
    toast(isEditing ? "Managed profile updated." : "Staff account created for local testing.");
  });
}

function openMotherForm(id = "") {
  const record = state.maternalRecords.find((m) => m.id === id) || {};
  openModal(id ? "Edit Maternal Record" : "Add Maternal Record", `
    <form id="motherForm" class="form-grid">
      ${input("Mother ID", "id", record.id || makeId("M"), true)}
      <div class="two-col">${input("Full Name", "fullName", record.fullName)}${input("Age", "age", record.age, false, "number")}</div>
      ${input("Address", "address", record.address)}
      <div class="two-col">${select("Barangay", "barangay", visibleBarangays(), record.barangay || defaultVisibleBarangay())}${input("Contact Number", "contact", record.contact)}</div>
      <div class="two-col">${input("Last Menstrual Period", "lmp", record.lmp, false, "date")}${input("Expected Delivery Date", "edd", record.edd, false, "date")}</div>
      <div class="two-col">${select("Pregnancy Status", "pregnancyStatus", ["Ongoing", "Delivered", "High Risk", "Completed"], record.pregnancyStatus)}${select("Risk Level", "riskLevel", ["Low", "Moderate", "High"], record.riskLevel)}</div>
      <div class="two-col">${input("Check-ups Completed", "checkupsCompleted", record.checkupsCompleted ?? 0, false, "number")}${input("Assigned Nurse / Midwife", "assignedNurse", record.assignedNurse)}</div>
      ${textarea("Notes", "notes", record.notes)}
      <button class="primary-btn" type="submit">Save maternal record</button>
    </form>
  `);
  document.getElementById("motherForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const row = formData(event.target);
    row.formDetails = record.formDetails || {};
    upsert("maternalRecords", row, "id");
    closeModal();
    renderMaternal();
    toast("Maternal record saved.");
  });
}


function openPrenatalRecordForm(id = "") {
  const record = state.maternalRecords.find((m) => m.id === id);
  if (!record) return toast("Maternal record not found.", true);
  const current = getCurrentUser();
  if (current.role === "Nurse / Midwife" && record.barangay !== current.barangay) {
    return toast("You can only edit prenatal records in your assigned barangay.", true);
  }
  openModal("Prenatal Record Form", `
    <form id="prenatalRecordForm" class="form-grid detailed-form">
      ${input("Mother ID", "id", record.id, true)}
      ${formDivider("Basic Maternal Information", "Nurse/Midwife may assist the parent in completing or correcting the prenatal record.")}
      <div class="two-col">${input("Full Name", "fullName", record.fullName)}${input("Age", "age", record.age, false, "number")}</div>
      ${input("Address", "address", record.address)}
      <div class="two-col">${select("Barangay", "barangay", visibleBarangays(), record.barangay || defaultVisibleBarangay())}${input("Contact Number", "contact", record.contact)}</div>
      <div class="two-col">${input("LMP", "lmp", record.lmp, false, "date")}${input("EDD / EDC", "edd", record.edd, false, "date")}</div>
      <div class="two-col">${select("Pregnancy Status", "pregnancyStatus", ["For Review", "Ongoing", "Delivered", "High Risk", "Completed"], record.pregnancyStatus || "For Review")}${select("Risk Level", "riskLevel", ["Pending", "Low", "Moderate", "High"], record.riskLevel || "Pending")}</div>
      <div class="two-col">${input("Check-ups Completed", "checkupsCompleted", record.checkupsCompleted ?? 0, false, "number")}${input("Assigned Nurse / Midwife", "assignedNurse", record.assignedNurse || current.name || "")}</div>
      ${prenatalRecordFieldsHtml(record)}
      ${textarea("Notes", "notes", record.notes || "")}
      <button class="primary-btn" type="submit">Save prenatal record</button>
    </form>
  `);
  document.getElementById("prenatalRecordForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const row = formData(event.target);
    const detailUpdates = packFormDetails(row, prenatalRecordFields);
    row.formDetails = { ...(record.formDetails || {}), ...detailUpdates };
    upsert("maternalRecords", row, "id");
    closeModal();
    renderMaternal();
    toast("Prenatal record saved.");
  });
}

function openInfantForm(id = "") {
  const record = state.infantRecords.find((i) => i.id === id) || {};
  openModal(id ? "Edit Infant Record" : "Add Infant Record", `
    <form id="infantForm" class="form-grid">
      ${input("Infant ID", "id", record.id || makeId("I"), true)}
      <div class="two-col">${input("Infant Name", "infantName", record.infantName)}${input("Parent / Mother Name", "parentName", record.parentName)}</div>
      ${input("Address", "address", record.address)}
      <div class="two-col">${select("Barangay", "barangay", visibleBarangays(), record.barangay || defaultVisibleBarangay())}${input("Contact Number", "contact", record.contact)}</div>
      <div class="two-col">${input("Birthdate", "birthdate", record.birthdate, false, "date")}${input("Age in months", "ageMonths", record.ageMonths ?? 0, false, "number")}</div>
      <div class="two-col">${select("Immunization Status", "immunizationStatus", ["Complete", "Incomplete", "Pending", "Missed"], record.immunizationStatus)}${input("Assigned Nurse / Midwife", "assignedNurse", record.assignedNurse)}</div>
      <div class="two-col">${input("Last Check-up Date", "lastCheckup", record.lastCheckup, false, "date")}${input("Next Check-up Date", "nextCheckup", record.nextCheckup, false, "date")}</div>
      ${textarea("Notes", "notes", record.notes)}
      <button class="primary-btn" type="submit">Save infant record</button>
    </form>
  `);
  document.getElementById("infantForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const row = formData(event.target);
    row.formDetails = record.formDetails || {};
    upsert("infantRecords", row, "id");
    closeModal();
    renderInfants();
    toast("Infant record saved.");
  });
}

function openScheduleForm(id = "") {
  const record = state.checkupSchedules.find((s) => s.id === id) || {};
  openModal(id ? "Edit Check-up Schedule" : "Add Check-up Schedule", `
    <form id="scheduleForm" class="form-grid">
      ${input("Schedule ID", "id", record.id || makeId("S"), true)}
      <div class="two-col">${input("Patient Name", "patientName", record.patientName)}${select("Type", "type", ["Maternal", "Infant"], record.type)}</div>
      <div class="two-col">${select("Barangay", "barangay", visibleBarangays(), record.barangay || defaultVisibleBarangay())}${input("Assigned Doctor", "assignedNurse", record.assignedNurse)}</div>
      <div class="two-col">${input("Date", "date", record.date, false, "date")}${input("Time", "time", record.time, false, "time")}</div>
      ${select("Status", "status", ["Requested", "Upcoming", "Completed", "Missed", "Rescheduled"], record.status)}
      ${textarea("Notes", "notes", record.notes)}
      <button class="primary-btn" type="submit">Save schedule</button>
    </form>
  `);
  document.getElementById("scheduleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    upsert("checkupSchedules", formData(event.target), "id");
    closeModal();
    renderSchedules();
    toast("Schedule saved.");
  });
}

function openParentScheduleRequestForm() {
  const mother = currentMotherRecord();
  if (!mother) {
    toast("Complete your maternal form first before requesting a check-up.", true);
    activePage = "forms";
    renderPage(activePage);
    renderNav();
    return;
  }
  const infants = currentInfantRecords();
  const patientOptions = [mother.fullName, ...infants.map((i) => i.infantName)];
  openModal("Request Check-up Schedule", `
    <form id="requestScheduleForm" class="form-grid">
      ${input("Schedule ID", "id", makeId("S"), true)}
      <div class="two-col">${select("Patient", "patientName", patientOptions, mother.fullName)}${select("Type", "type", ["Maternal", "Infant"], "Maternal")}</div>
      <div class="two-col">${input("Preferred Date", "date", today(), false, "date")}${input("Preferred Time", "time", "09:00", false, "time")}</div>
      <input type="hidden" name="barangay" value="${escapeHtml(mother.barangay)}">
      <input type="hidden" name="assignedNurse" value="For doctor assignment">
      <input type="hidden" name="status" value="Requested">
      ${textarea("Reason / Notes", "notes", "Requested by parent through the online portal.")}
      <button class="primary-btn" type="submit">Submit schedule request</button>
    </form>
  `);
  document.getElementById("requestScheduleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const row = formData(event.target);
    if (infants.some((i) => i.infantName === row.patientName)) row.type = "Infant";
    if (row.patientName === mother.fullName) row.type = "Maternal";
    state.checkupSchedules.unshift(row);
    persistRecord("checkupSchedules", row);
    closeModal();
    renderSchedules();
    toast("Check-up request submitted for RHU review.");
  });
}



function completionYesNo(value) {
  return isYes(value) ? "Yes" : (String(value || "").trim() ? value : "");
}

function saveRecordDetails(recordKey, id, details, completionKey) {
  const rows = state[recordKey];
  const row = rows.find((item) => item.id === id);
  if (!row) return toast("Record not found.", true);
  row.formDetails = {
    ...(row.formDetails || {}),
    ...details,
    [completionKey]: "Yes",
    [`${completionKey}At`]: new Date().toISOString(),
    [`${completionKey}By`]: getCurrentUser().name
  };
  if (details.pregnancyStatus) row.pregnancyStatus = details.pregnancyStatus;
  if (details.riskLevel) row.riskLevel = details.riskLevel;
  if (details.checkupsCompleted !== undefined && details.checkupsCompleted !== "") row.checkupsCompleted = Number(details.checkupsCompleted);
  if (details.immunizationStatus) row.immunizationStatus = details.immunizationStatus;
  persistRecord(recordKey, row);
  closeModal();
  renderPage(activePage);
  toast(completionKey === "mcCompleted" ? "MC maternal care details saved." : "CC child immunization details saved.");
}

function openMcCompletionForm(id) {
  const row = state.maternalRecords.find((m) => m.id === id);
  if (!row) return toast("Maternal record not found.", true);
  const ancFields = Array.from({ length: 8 }, (_, i) => {
    const n = i + 1;
    return `<div class="two-col">${inputOptional(`ANC Visit ${n} Date`, `ancVisit${n}Date`, detailValue(row, `ancVisit${n}Date`), "date")}${inputOptional(`ANC Visit ${n} BP`, `ancVisit${n}Bp`, detailValue(row, `ancVisit${n}Bp`))}</div>`;
  }).join("");
  const pncFields = Array.from({ length: 4 }, (_, i) => {
    const n = i + 1;
    return `<div class="two-col">${inputOptional(`PNC Visit ${n} Date`, `pncVisit${n}Date`, detailValue(row, `pncVisit${n}Date`), "date")}${inputOptional(`PNC Visit ${n} BP`, `pncVisit${n}Bp`, detailValue(row, `pncVisit${n}Bp`))}</div>`;
  }).join("");

  openModal("Complete MC Maternal Care Details", `
    <form id="mcCompletionForm" class="form-grid detailed-form">
      <div class="card card-pad"><p class="help-note">Parent submitted only basic details. Nurse/Midwife completes these MC fields for the Maternal Care TCL monthly report.</p></div>
      ${profileRows([["Mother", row.fullName], ["Barangay", row.barangay], ["EDD", fmtDate(row.edd)], ["Status", row.pregnancyStatus || "For Review"]])}
      ${formDivider("Registration and Client Classification")}
      <div class="three-col">${inputOptional("Date of Registration", "registrationDate", detailValue(row, "registrationDate"), "date")}${inputOptional("Family Serial Number", "familySerialNumber", detailValue(row, "familySerialNumber"))}${selectOptional("Age Group", "ageGroup", ["", "A - 10-14 yrs old", "B - 15-19 yrs old", "C - 20-49 yrs old"], detailValue(row, "ageGroup"))}</div>
      <div class="three-col">${inputOptional("Gravida-Parity (G-P)", "gravidaParity", detailValue(row, "gravidaParity"))}${selectOptional("Client Type", "clientStatus", ["", "A - Resident", "B - Trans in", "C - Trans Out"], detailValue(row, "clientStatus"))}${input("Check-ups Completed", "checkupsCompleted", row.checkupsCompleted || 0, false, "number")}</div>
      <div class="two-col">${select("Pregnancy Status", "pregnancyStatus", ["For Review", "Ongoing", "High Risk", "Delivered", "Completed"], row.pregnancyStatus || "For Review")}${select("Risk Level", "riskLevel", ["Pending", "Low", "Moderate", "High"], row.riskLevel || "Pending")}</div>
      ${formDivider("8ANC Prenatal Care", "Enter dates and BP readings from the maternal care template.")}
      ${ancFields}
      <div class="three-col">${selectOptional("Completed 8ANC?", "completed8ANC", ["", "Yes", "No"], completionYesNo(detailValue(row, "completed8ANC")))}${selectOptional("High/Elevated BP?", "highElevatedBP", ["", "Yes", "No"], completionYesNo(detailValue(row, "highElevatedBP")))}${selectOptional("With Danger Signs?", "dangerSigns", ["", "Yes", "No"], completionYesNo(detailValue(row, "dangerSigns")))}</div>
      ${textareaOptional("Danger Signs / Referral Notes", "dangerSignsNotes", detailValue(row, "dangerSignsNotes"))}
      <div class="two-col">${selectOptional("Referred High BP/Danger Signs?", "referredHighBpDangerSigns", ["", "Yes", "No"], completionYesNo(detailValue(row, "referredHighBpDangerSigns")))}${inputOptional("Date Referred", "dateReferred", detailValue(row, "dateReferred"), "date")}</div>
      ${formDivider("Immunization and Supplementation")}
      <div class="three-col">${inputOptional("Td1 Date", "tetanusDose1Date", detailValue(row, "tetanusDose1Date"), "date")}${inputOptional("Td2 Date", "tetanusDose2Date", detailValue(row, "tetanusDose2Date"), "date")}${inputOptional("Td3 Date", "tetanusDose3Date", detailValue(row, "tetanusDose3Date"), "date")}</div>
      <div class="two-col">${inputOptional("Td4 Date", "tetanusDose4Date", detailValue(row, "tetanusDose4Date"), "date")}${inputOptional("Td5 Date", "tetanusDose5Date", detailValue(row, "tetanusDose5Date"), "date")}</div>
      <div class="three-col">${selectOptional("Deworming Received?", "dewormingReceived", ["", "Yes", "No"], completionYesNo(detailValue(row, "dewormingReceived")))}${selectOptional("Completed IFA?", "ifaCompleted", ["", "Yes", "No"], completionYesNo(detailValue(row, "ifaCompleted")))}${selectOptional("Completed MM?", "mmCompleted", ["", "Yes", "No"], completionYesNo(detailValue(row, "mmCompleted")))}</div>
      <div class="two-col">${selectOptional("Completed Calcium Carbonate?", "calciumCompleted", ["", "Yes", "No"], completionYesNo(detailValue(row, "calciumCompleted")))}${textareaOptional("Supplementation Remarks", "supplementationRemarks", detailValue(row, "supplementationRemarks"))}</div>
      ${formDivider("Laboratory Screenings")}
      <div class="three-col">${inputOptional("CBC / Hgb & Hct Result", "cbcHgbHctResult", detailValue(row, "cbcHgbHctResult"))}${inputOptional("GDM Screening Result", "gdmScreeningResult", detailValue(row, "gdmScreeningResult"))}${inputOptional("Hepatitis B Result", "hepatitisBScreeningResult", detailValue(row, "hepatitisBScreeningResult"))}</div>
      <div class="three-col">${inputOptional("HIV Result", "hivScreeningResult", detailValue(row, "hivScreeningResult"))}${inputOptional("Syphilis Result", "syphilisScreeningResult", detailValue(row, "syphilisScreeningResult"))}${inputOptional("Confirmatory Test Date", "confirmatoryTestDate", detailValue(row, "confirmatoryTestDate"), "date")}</div>
      ${formDivider("Delivery and 4PNC")}
      <div class="three-col">${inputOptional("Delivery Outcome", "deliveryOutcome", detailValue(row, "deliveryOutcome"))}${inputOptional("Delivery Type", "deliveryType", detailValue(row, "deliveryType"))}${inputOptional("Birth Weight", "birthWeight", detailValue(row, "birthWeight"), "number")}</div>
      <div class="three-col">${inputOptional("Place of Delivery", "placeOfDelivery", detailValue(row, "placeOfDelivery"))}${inputOptional("Birth Attendant", "birthAttendant", detailValue(row, "birthAttendant"))}${inputOptional("Date and Time of Delivery", "deliveryDateTime", detailValue(row, "deliveryDateTime"), "datetime-local")}</div>
      ${pncFields}
      <div class="two-col">${selectOptional("Completed 4PNC?", "completed4PNC", ["", "Yes", "No"], completionYesNo(detailValue(row, "completed4PNC")))}${textareaOptional("MC Remarks / Actions Taken", "mcRemarks", detailValue(row, "mcRemarks"))}</div>
      <button class="primary-btn" type="submit">Save MC Details</button>
    </form>
  `);
  document.getElementById("mcCompletionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveRecordDetails("maternalRecords", id, formData(event.target), "mcCompleted");
  });
}

function openCcCompletionForm(id) {
  const row = state.infantRecords.find((i) => i.id === id);
  if (!row) return toast("Infant record not found.", true);
  openModal("Complete CC Child Immunization Details", `
    <form id="ccCompletionForm" class="form-grid detailed-form">
      <div class="card card-pad"><p class="help-note">Parent submitted only basic details. Nurse/Midwife completes these CC fields for the Child Immunization TCL monthly report.</p></div>
      ${profileRows([["Infant", row.infantName], ["Mother", row.parentName], ["Barangay", row.barangay], ["Birthdate", fmtDate(row.birthdate)]])}
      ${formDivider("Registration and CPAB")}
      <div class="three-col">${inputOptional("Date of Registration", "registrationDate", detailValue(row, "registrationDate"), "date")}${inputOptional("Family Serial Number", "familySerialNumber", detailValue(row, "familySerialNumber"))}${inputOptional("Mother Complete Name", "motherName", detailValue(row, "motherName", row.parentName))}</div>
      <div class="two-col">${select("Immunization Status", "immunizationStatus", ["For Review", "Pending", "Incomplete", "Missed", "Complete"], row.immunizationStatus || "For Review")}${inputOptional("Place of Birth", "placeOfBirth", detailValue(row, "placeOfBirth"))}</div>
      <div class="two-col">${selectOptional("CPAB: Td2 before delivery?", "cpabTd2BeforeDelivery", ["", "Yes", "No"], completionYesNo(detailValue(row, "cpabTd2BeforeDelivery")))}${selectOptional("CPAB: Td3-Td5 before delivery?", "cpabTd3ToTd5BeforeDelivery", ["", "Yes", "No"], completionYesNo(detailValue(row, "cpabTd3ToTd5BeforeDelivery")))}</div>
      ${formDivider("BCG and Hepa B")}
      <div class="two-col">${inputOptional("BCG within 24 hours", "bcgWithin24hDate", detailValue(row, "bcgWithin24hDate"), "date")}${inputOptional("BCG >24 hours", "bcgAfter24hDate", detailValue(row, "bcgAfter24hDate"), "date")}</div>
      <div class="two-col">${inputOptional("Hepa B within 24 hours", "hepaBWithin24hDate", detailValue(row, "hepaBWithin24hDate"), "date")}${inputOptional("Hepa B >24h to 14 days", "hepaBAfter24hTo14DaysDate", detailValue(row, "hepaBAfter24hTo14DaysDate"), "date")}</div>
      ${formDivider("DPT-HiB-HepB / OPV / IPV / PCV")}
      <div class="three-col">${inputOptional("DPT-HiB-HepB 1", "pentavalentDose1Date", detailValue(row, "pentavalentDose1Date"), "date")}${inputOptional("DPT-HiB-HepB 2", "pentavalentDose2Date", detailValue(row, "pentavalentDose2Date"), "date")}${inputOptional("DPT-HiB-HepB 3", "pentavalentDose3Date", detailValue(row, "pentavalentDose3Date"), "date")}</div>
      <div class="three-col">${inputOptional("OPV 1", "opvDose1Date", detailValue(row, "opvDose1Date"), "date")}${inputOptional("OPV 2", "opvDose2Date", detailValue(row, "opvDose2Date"), "date")}${inputOptional("OPV 3", "opvDose3Date", detailValue(row, "opvDose3Date"), "date")}</div>
      <div class="two-col">${inputOptional("IPV 1", "ipvDose1Date", detailValue(row, "ipvDose1Date"), "date")}${inputOptional("IPV 2", "ipvDose2Date", detailValue(row, "ipvDose2Date"), "date")}</div>
      <div class="three-col">${inputOptional("PCV 1", "pcvDose1Date", detailValue(row, "pcvDose1Date"), "date")}${inputOptional("PCV 2", "pcvDose2Date", detailValue(row, "pcvDose2Date"), "date")}${inputOptional("PCV 3", "pcvDose3Date", detailValue(row, "pcvDose3Date"), "date")}</div>
      ${formDivider("MMR / FIC / CIC")}
      <div class="two-col">${inputOptional("MMR 1", "mmrDose1Date", detailValue(row, "mmrDose1Date"), "date")}${inputOptional("MMR 2", "mmrDose2Date", detailValue(row, "mmrDose2Date"), "date")}</div>
      <div class="two-col">${selectOptional("FIC Completed?", "ficCompleted", ["", "Yes", "No"], completionYesNo(detailValue(row, "ficCompleted")))}${selectOptional("CIC Completed?", "cicCompleted", ["", "Yes", "No"], completionYesNo(detailValue(row, "cicCompleted")))}</div>
      ${textareaOptional("CC Remarks / Actions Taken", "ccRemarks", detailValue(row, "ccRemarks"))}
      <button class="primary-btn" type="submit">Save CC Details</button>
    </form>
  `);
  document.getElementById("ccCompletionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveRecordDetails("infantRecords", id, formData(event.target), "ccCompleted");
  });
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function isYes(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "yes" || normalized === "1" || normalized === "true" || normalized.startsWith("yes");
}

function getDetail(row, key) {
  return row?.formDetails?.[key] ?? row?.[key] ?? "";
}

function countWith(rows, key) {
  return rows.filter((row) => hasValue(getDetail(row, key))).length;
}

function countYes(rows, key) {
  return rows.filter((row) => isYes(getDetail(row, key))).length;
}

function buildReportDetails(type, barangay) {
  const code = reportTypeShort(type);
  if (code === "MC") {
    const rows = state.maternalRecords.filter((row) => row.barangay === barangay);
    const schedules = state.checkupSchedules.filter((row) => row.barangay === barangay && row.type === "Maternal");
    const details = {
      reportTemplate: "Target Client List for Maternal Care and Services",
      registeredClients: rows.length,
      withRegistrationDate: countWith(rows, "registrationDate"),
      firstTrimesterAnc: countWith(rows, "ancVisit1Date"),
      completed8ANC: countYes(rows, "completed8ANC"),
      highOrElevatedBP: rows.filter((row) => isYes(getDetail(row, "highElevatedBP")) || isYes(getDetail(row, "bp140Above")) || row.riskLevel === "High" || row.pregnancyStatus === "High Risk").length,
      withDangerSigns: countYes(rows, "dangerSigns"),
      referredHighBpDangerSigns: countYes(rows, "referredHighBpDangerSigns"),
      dewormingReceived: countYes(rows, "dewormingReceived"),
      completedIFA: countYes(rows, "ifaCompleted"),
      completedMM: countYes(rows, "mmCompleted"),
      completedCalcium: countYes(rows, "calciumCompleted"),
      cbcHgbHctRecorded: countWith(rows, "cbcHgbHctResult"),
      gdmScreened: countWith(rows, "gdmScreeningResult"),
      hepatitisBScreened: countWith(rows, "hepatitisBScreeningResult"),
      hivScreened: countWith(rows, "hivScreeningResult"),
      syphilisScreened: countWith(rows, "syphilisScreeningResult"),
      deliveredClients: rows.filter((row) => row.pregnancyStatus === "Delivered" || hasValue(getDetail(row, "deliveryOutcome"))).length,
      completed4PNC: countYes(rows, "completed4PNC"),
      completedSchedules: schedules.filter((row) => row.status === "Completed").length,
      missedSchedules: schedules.filter((row) => row.status === "Missed").length
    };
    return {
      total: rows.length,
      newCount: details.withRegistrationDate,
      completeOrDelivered: details.completed8ANC || details.deliveredClients,
      incompleteOrHighRisk: details.highOrElevatedBP + details.withDangerSigns,
      missedOrCompleted: details.completedSchedules,
      completedOrMissed: details.missedSchedules,
      reportDetails: details
    };
  }

  const rows = state.infantRecords.filter((row) => row.barangay === barangay);
  const schedules = state.checkupSchedules.filter((row) => row.barangay === barangay && row.type === "Infant");
  const details = {
    reportTemplate: "Target Client List for Child Immunization",
    registeredChildren: rows.length,
    withRegistrationDate: countWith(rows, "registrationDate"),
    cpabTd2BeforeDelivery: countYes(rows, "cpabTd2BeforeDelivery"),
    cpabTd3ToTd5BeforeDelivery: countYes(rows, "cpabTd3ToTd5BeforeDelivery"),
    bcgWithin24h: rows.filter((row) => hasValue(getDetail(row, "bcgWithin24hDate")) || hasValue(getDetail(row, "bcgDate"))).length,
    bcgAfter24h: countWith(rows, "bcgAfter24hDate"),
    hepaBWithin24h: rows.filter((row) => hasValue(getDetail(row, "hepaBWithin24hDate")) || hasValue(getDetail(row, "hepatitisBDate"))).length,
    hepaBAfter24hTo14Days: countWith(rows, "hepaBAfter24hTo14DaysDate"),
    dptHibHepB1: countWith(rows, "pentavalentDose1Date"),
    dptHibHepB2: countWith(rows, "pentavalentDose2Date"),
    dptHibHepB3: countWith(rows, "pentavalentDose3Date"),
    opv1: countWith(rows, "opvDose1Date"),
    opv2: countWith(rows, "opvDose2Date"),
    opv3: countWith(rows, "opvDose3Date"),
    ipv1: rows.filter((row) => hasValue(getDetail(row, "ipvDose1Date")) || hasValue(getDetail(row, "ipvDate"))).length,
    ipv2: countWith(rows, "ipvDose2Date"),
    pcv1: countWith(rows, "pcvDose1Date"),
    pcv2: countWith(rows, "pcvDose2Date"),
    pcv3: countWith(rows, "pcvDose3Date"),
    mmr1: countWith(rows, "mmrDose1Date"),
    mmr2: countWith(rows, "mmrDose2Date"),
    ficCompleted: rows.filter((row) => isYes(getDetail(row, "ficCompleted")) || row.immunizationStatus === "Complete").length,
    cicCompleted: countYes(rows, "cicCompleted"),
    completedSchedules: schedules.filter((row) => row.status === "Completed").length,
    missedSchedules: schedules.filter((row) => row.status === "Missed").length
  };
  return {
    total: rows.length,
    newCount: details.withRegistrationDate,
    completeOrDelivered: details.ficCompleted + details.cicCompleted,
    incompleteOrHighRisk: rows.filter((row) => ["Incomplete", "Pending", "For Review"].includes(row.immunizationStatus)).length,
    missedOrCompleted: details.missedSchedules,
    completedOrMissed: rows.filter((row) => row.immunizationStatus === "Complete").length,
    reportDetails: details
  };
}

function reportSummaryPreview(type, barangay) {
  const summary = buildReportDetails(type, barangay);
  const code = reportTypeShort(type);
  const details = summary.reportDetails || {};
  const previewRows = code === "MC"
    ? [
        ["Template", details.reportTemplate],
        ["Registered mothers", details.registeredClients],
        ["Completed 8ANC", details.completed8ANC],
        ["High BP / danger signs", details.highOrElevatedBP + details.withDangerSigns],
        ["Completed 4PNC", details.completed4PNC]
      ]
    : [
        ["Template", details.reportTemplate],
        ["Registered children", details.registeredChildren],
        ["BCG recorded", details.bcgWithin24h + details.bcgAfter24h],
        ["Penta/DPT-Hib-HepB 3", details.dptHibHepB3],
        ["FIC/CIC completed", details.ficCompleted + details.cicCompleted]
      ];
  return `<div class="detail-grid">${previewRows.map(([label, value]) => `<div class="profile-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`;
}

function buildAutomaticReportRow(type, barangay, month, preparedBy) {
  const code = reportTypeShort(type);
  const existing = state.monthlyReports.find((row) => reportTypeShort(row.type) === code && row.barangay === barangay && row.month === month);
  const auto = buildReportDetails(code, barangay);
  return {
    ...(existing || {}),
    id: existing?.id || makeId("REP"),
    type: code,
    month,
    barangay,
    preparedBy,
    dateSubmitted: today(),
    status: "Submitted",
    ...auto
  };
}

async function saveAutomaticReport(row) {
  const index = state.monthlyReports.findIndex((item) => item.id === row.id || (reportTypeShort(item.type) === reportTypeShort(row.type) && item.barangay === row.barangay && item.month === row.month));
  if (index >= 0) state.monthlyReports[index] = row;
  else state.monthlyReports.unshift(row);
  await persistRecord("monthlyReports", row);
}

function automaticReportsPreview(barangay) {
  return `
    <div class="form-divider"><strong>Auto-generated Preview</strong><span>Based on current records for ${escapeHtml(barangay)}</span></div>
    <div class="patient-grid">
      <div class="card card-pad"><div class="section-head"><div><h3>MC Maternal Care</h3><p>Generated from maternal records in ${escapeHtml(barangay)}</p></div>${badge("MC")}</div>${reportSummaryPreview("MC", barangay)}</div>
      <div class="card card-pad"><div class="section-head"><div><h3>CC Child Immunization</h3><p>Generated from infant records in ${escapeHtml(barangay)}</p></div>${badge("CC")}</div>${reportSummaryPreview("CC", barangay)}</div>
    </div>
  `;
}

function openContactForm(id = "") {
  const record = state.emergencyContacts.find((c) => c.id === id) || {};
  const isEditing = Boolean(record.id);
  openModal(isEditing ? "Edit Emergency Contact" : "Add Barangay Emergency Contact", `
    <form id="contactForm" class="form-grid">
      ${input("Contact ID", "id", record.id || makeId("EC"), true)}
      <div class="two-col">${select("Barangay", "barangay", barangays, record.barangay || barangays[0])}${input("Nurse / Midwife Name", "nurseName", record.nurseName || "")}</div>
      <div class="two-col">${input("Contact Number", "contactNumber", record.contactNumber || "", false, "tel")}${input("Emergency Hotline", "hotline", record.hotline || "")}</div>
      ${input("Clinic / Health Station Location", "clinicLocation", record.clinicLocation || "")}
      <button class="primary-btn" type="submit">Save emergency contact</button>
    </form>
  `);
  document.getElementById("contactForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const row = formData(event.target);
    const existing = state.emergencyContacts.find((c) => c.barangay === row.barangay && c.id !== row.id);
    if (existing) row.id = existing.id;
    upsert("emergencyContacts", row, "id");
    closeModal();
    renderContacts();
    toast("Emergency contact saved.");
  });
}

function openReportForm() {
  const current = getCurrentUser();
  const defaultBarangay = visibleBarangays().includes(current.barangay) ? current.barangay : defaultVisibleBarangay();
  const lockedBarangay = current.role === "Nurse / Midwife";
  openModal("Auto-generate MC/CC Monthly Reports", `
    <form id="reportForm" class="form-grid">
      <div class="card card-pad">
        <p class="help-note"><strong>MC</strong> and <strong>CC</strong> will be generated automatically using the data already saved in the system. Nurse/Midwife accounts can only generate reports for their assigned barangay.</p>
      </div>
      <div class="two-col">
        ${input("Month", "month", currentMonthName())}
        ${lockedBarangay ? input("Assigned Barangay", "barangayDisplay", defaultBarangay, true) : select("Barangay", "barangay", visibleBarangays(), defaultBarangay)}
      </div>
      ${lockedBarangay ? `<input type="hidden" name="barangay" value="${escapeHtml(defaultBarangay)}">` : ""}
      ${input("Prepared By", "preparedBy", current.name, true)}
      <div id="reportAutoPreview">${automaticReportsPreview(defaultBarangay)}</div>
      <button class="primary-btn" type="submit">Generate MC and CC Reports</button>
    </form>
  `);
  const form = document.getElementById("reportForm");
  const barangaySelect = form.elements.barangay;
  const preview = document.getElementById("reportAutoPreview");
  const updatePreview = () => {
    const barangay = form.elements.barangay.value;
    if (preview) preview.innerHTML = automaticReportsPreview(barangay);
  };
  if (!lockedBarangay && barangaySelect) barangaySelect.addEventListener("change", updatePreview);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const month = form.elements.month.value.trim() || currentMonthName();
    const barangay = form.elements.barangay.value;
    const preparedBy = current.name;
    const rows = ["MC", "CC"].map((type) => buildAutomaticReportRow(type, barangay, month, preparedBy));
    for (const row of rows) await saveAutomaticReport(row);
    closeModal();
    renderReports();
    toast(`MC and CC monthly reports generated for ${barangay}.`);
  });
}


// MC/CC exports use the exact uploaded XLSX templates in reference-templates/. CSV preview uses the same column order.
// MC = Target Client List for Maternal Care and Services.
// CC = Target Client List for Child Immunization.
const MC_TEMPLATE_HEADER_ROWS = [["TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (1/6)", "", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (2/6)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (3/6)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (4/6)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (5/6)", "", "", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR MATERNAL CARE AND SERVICES (6/6)", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], ["No.", "Date of Registration\n(mm/dd/yy)", "Family Serial Number", "Full Name \n(LastName, FullName, MI)", "Complete Address", "Age\n(in years)", "Age Group\n\nA - 10-14 yrs old\nB - 15-19 yrs old\nC - 20-49 yrs old", "Last Mestrual Period (LMP)\n(mm/dd/yy)\n\nGravida Parity\n(G-P)", "Expected Date of Delivery \n(EDD)\n(mm/dd/yy)", "PRENATAL CARE PART 1", "", "", "PRENATAL CARE PART 1", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "No.", "PRENATAL CARE PART 2", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "PRENATAL CARE PART 2", "", "", "", "", "", "", "", "", "", "", "", "", "", "No.", "INTRAPARTUM CARE", "", "", "", "", "", "", "", "", "", "", "POSTPARTUM CARE", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "Date of Prenatal Check-up (8ANC) and BP measurement\nd: (mm/dd/yy)\nbp: BP reading (systolic/diastolic mm Hg)", "", "", "Date of Prenatal Check-up (8ANC) and BP measurement\nd: (mm/dd/yy)\nbp: BP reading (systolic/diastolic mm Hg)", "", "", "", "", "", "", "", "", "", "Nutritional Assessment\n(Write the BMI for 1st Trimester (1st visit))", "", "", "Immunization Status", "", "", "", "", "Remarks/\nActions Taken", "", "Prenatal Supplementation", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Laboratory Screenings", "", "", "", "", "", "", "", "", "", "", "", "", "Remarks/\nActions Taken", "", "Delivery Outcome", "Delivery Type", "Birth Weight \n(with in the first 2 hours of life)", "", "", "Place of Delivery", "", "Birth Attendant", "Date and Time of Delivery", "", "Remarks/\nActions Taken", "Date of Postnatal Care (4PNC) and BP measurement\nd: (mm/dd/yy)\nbp: BP reading (systolic/diastolic mm Hg)", "", "", "", "", "", "", "", "", "Postpartum Supplementation", "", "", "", "", "Remarks/\nActions Taken"], ["", "", "", "", "", "", "", "", "", "1st Trimester (Non-negotiable)", "2nd Trimester", "", "3rd Trimester", "", "", "", "", "Completed 8ANC?\n\n1 - Yes\n0 - No\n", "*With High/\nElevated BP?\n\n1 - Yes\n0 - No", "With Danger Signs?\n\n1- Yes\n0 - No\n\nif Yes, Identify Danger Signs**\n(atleast 1)", "Identified with High BP/ Danger Signs and referred?\n\n1 - Yes\n0 - No", "A - Resident\nB - Trans in\nC - Trans Out before receiving 8ANC", "", "", "", "Date of Tetanus Diphtheria (Td)-containing vaccine given\n(mm/dd/yy)", "", "", "", "", "", "", "Received one dose of Deworming tablet?\n(during 2nd Trimester)\n1 - Yes\n0 - No\n\nd: Date (mm/dd/yy)", "Iron with Folic Acid (IFA) Supplementation\n\n#: Number of Tablets Given\nd: Date (mm/dd/yy)\n", "", "", "", "", "", "Completed \nIFA supplementation?\n\n1 - Yes\n0 - No\n\nif Yes, Date completed (mm/dd/yy)", "Multiple Micronutrient (MM) Supplementation\n \n#: Number of Tablets Given\nd: Date (mm/dd/yy)", "", "", "", "", "", "Completed \nMM supplementation?\n\n1 - Yes\n0 - No\n\nif Yes, Date completed (mm/dd/yy)", "Calcium Carbonate (CC) Supplementation\n\n#: Number of Tablets Given\nd: Date (mm/dd/yy)", "", "", "Completed \nCC supplementation?\n\n1 - Yes\n0 - No\n\nif Yes, date completed (mm/dd/yy)", "CBC/Hgb&Hct Count", "", "Gestational Diabetes Mellitus", "", "Hepatitis B", "", "HIV", "", "Syphilis", "", "", "", "", "", "", "FT - Full Term\nPT - Pre-term\nFD - Fetal Death\nAB - Abortion/\n        Miscarriage", "CS – Cesarean Section\nVD – Vaginal Delivery\nCVCD - Combined Vaginal-Cesarean Delivery", "Sex\nM - Male\nF - Female", "Weight\n(Write weight in grams)", "A - Normal (>2500g)\nB - Low (<2500g)\nC - Unknown", "Health Facility", "", "MD - Doctor\nRN - Nurse\nMW - Midwife\nO - Others, Pls specify:", "Date\n(mm/dd/yy)", "Time\n(hh:mm)", "", "within 24 hours after delivery", "on day 3", "between 7-14 days", "6 weeks after birth ", "Completed 4PNC?\n\n1 - Yes\n0 - No\n", "*With High/\nElevated BP?\n\n1 - Yes\n0 - No", "With Danger Signs?\n\n1- Yes\n0 - No\n\nif Yes, Identify Danger Signs**\n(atleast 1)", "Identified with High BP/ Danger Signs and referred?\n\n1 - Yes\n0 - No", "", "Iron with Folic Acid Supplementation\n#: Number of Tablets Given\nd: Date (mm/dd/yy)", "", "", "Completed \nIFA supplementation?\n\n1 - Yes\n0 - No\n\nif Yes, date completed (mm/dd/yy)", "Completed 200,000 I.U. of Vitamin A capsule  supplementation?\n(within 1 month after delivery)\n\n1 - Yes\n0 - No\n\nif Yes, date completed (mm/dd/yy)", ""], ["", "", "", "", "", "", "", "", "", "Recommended Timing:\nVisit (SHP)  1: \n8-13 weeks", "Recommended Timing:\nVisit (SHP) 2: 14-20 weeks\nVisit (SHP) 3: 21-27 weeks", "", "Recommended Timing:\nVisit (SHP) 4: 28-30 weeks\nVisit (SHP) 5: 31-34 weeks\nVisit (SHP) 6: 35 weeks\nVisit (SHP) 7: 36 weeks\nVisit (SHP)  8: 37-40 weeks", "", "", "", "", "", "", "", "", "", "Low: \n<18.5 kg/m2", "Normal: \n18.5 - 22.9 kg/m2", "High: \n≥ 23.0 kg/m2", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - with anemia\n0 - w/o anemia", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - positive\n0 - negative", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - Reactive\n0 - Non-reactive", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - Reactive\n0 - Non-reactive", "Date Screened\n(mm/dd/yy)", "Result:\n\n1 - Reactive\n0 - Non-reactive", "Date of Confirmatory Test\n(mm/dd/yy)", "Result:\n\n1 - Positive\n0 - Negative", "Treatment:\n\nGiven at least 1 dose of benzathine penicillin 2.4 mU at least 30 days prior to delivery\n\n1 - Yes\n0 - No ", "", "", "", "", "", "", "", "Facility Type\n1 - Public\n2 - Private", "Non-Health Facility\n1 - Home\n2 - Others (including emergency transport)", "", "", "", "", "", "", "", "", "", "", "", "", "A - Resident\nB - Trans in\nC - Trans Out before completing 4PNC", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "Visit 1", "Visit 2", "Visit 3", "Visit 4", "Visit 5", "Visit 6", "Visit 7", "Visit 8", "", "", "", "Date referred:\nd: (mm/dd/yy)", "Date\nd: (mm/dd/yy)", "", "", "", "Td1", "Td2", "Td3", "Td4", "Td5", "", "", "", "1st visit\n(1st tri)", "2nd visit\n(2nd tri)", "3rd visit\n(2nd tri)", "4th visit\n(3rd tri)", "5th visit\n(3rd tri)", "6th visit\n(3rd tri)", "", "1st visit\n(1st tri)", "2nd visit\n(2nd tri)", "3rd visit\n(2nd tri)", "4th visit\n(3rd tri)", "5th visit\n(3rd tri)", "6th visit\n(3rd tri)", "", "2nd visit\n(2nd tri)", "3rd visit\n(3rd tri)", "4th visit\n(3rd tri)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Visit 1", "Visit 2", "Visit 3", "Visit 4", "", "", "", "Date referred:\nd: (mm/dd/yy)", "Date\nd: (mm/dd/yy)", "1st visit", "2nd visit", "3rd visit", "", "", ""], ["", "", "", "", "", "", "", "LMP:", "", "d:", "d:", "d:", "d:", "d:", "d:", "d:", "d:", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "#:", "#:", "#:", "#:", "#:", "#:", "", "#:", "#:", "#:", "#:", "#:", "#:", "", "#:", "#:", "#:", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "d:", "d:", "d:", "d:", "", "", "", "", "", "#:", "#:", "#:", "", "", ""]];
const CC_TEMPLATE_HEADER_ROWS = [["TARGET CLIENT LIST FOR CHILD IMMUNIZATION (1/4)", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR CHILD IMMUNIZATION (2/4)", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR CHILD IMMUNIZATION (3/4)", "", "", "", "", "", "", "", "", "TARGET CLIENT LIST FOR CHILD IMMUNIZATION (4/4)", "", "", "", "", "", ""], ["No.", "Date of Registration\n(mm/dd/yy)", "Family Serial Number", "Name of Child\n(LastName, FullName, MI)", "Date of Birth\n(mm/dd/yy)", "Age\n(in months)", "Sex\n\nM - Male\nF- Female", "Complete Name of Mother\n(LastName, FullName, MI)", "Complete Address", "Children protected at Birth\n(CPAB) \nPlace a ✔ (check)\n(counts should be consistent with\nMaternal TCL Livebirths)", "", "Immunization", "", "", "", "", "", "", "No.", "IMMUNIZATION", "", "", "", "", "", "", "", "IMMUNIZATION", "", "", "", "", "", "Remarks/\nActions Taken"], ["", "", "", "", "", "", "", "", "", "", "", "BCG\n(mm/dd/yy)", "", "Hepa B\n(mm/dd/yy)", "", "DPT-HiB-HepB", "", "", "", "OPV", "", "", "IPV", "", "PCV", "", "", "\nMMR\nNote: The minimum interval from MMR1 and MMR2 is at least 4 weeks but MMR2 should not be given at <12 months\n", "", "FIC\n(0-11 months of previous year)\n\n1 dose BCG\n3 doses DPT-HiB-HepB\n3 doses OPV\n2 doses MMR\n\nd: (mm/dd/yy)", "", "", "CIC\n(0-11 months of previous year) - FIC of the previous year\n\n1 dose BCG\n3 doses DPT-HiB-HepB\n3 doses OPV\n2 doses MMR\n\n(mm/dd/yy)", ""], ["", "", "", "", "", "", "", "", "", "Td2 given to the mother a month prior to delivery (for mothers pregrant for the first time)", "Td3 to Td5 (or Td1 to Td5) given to the mother anytime prior to delivery", "\nwithin 24 hours", "\nmore than 24 hours to 11 months and 29 days", "within 24 hours after birth", "more than 24 hours up to 14 days", "1st dose\n1 ½ mos", "2nd dose\n2 ½ mos", "3rd dose\n3 ½ mos", "", "1st dose\n1 ½ mos", "2nd dose\n2 ½ mos", "3rd dose\n3 ½ mos", "1st dose\n3 ½ mos", "2nd dose\n9 mos", "1st dose\n1 ½ mos", "2nd dose\n2 ½ mos", "3rd dose\n3 ½ mos", "1st dose\n9 mos", "2nd dose\n12 mos", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "  A: (age in\nmonths & weeks)", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "d: (mm/dd/yy)", "", "", "", "", ""]];

const EXACT_TEMPLATE_FILES = {
  MC: "reference-templates/MC TCL.xlsx",
  CC: "reference-templates/CC Immunization.xlsx"
};
const TEMPLATE_DATA_START_ROWS = { MC: 8, CC: 8 };
const TEMPLATE_HEADER_ROW_COUNTS = { MC: MC_TEMPLATE_HEADER_ROWS.length, CC: CC_TEMPLATE_HEADER_ROWS.length };


function cloneRows(rows) {
  return rows.map((row) => row.slice());
}

function blankTemplateRow(count) {
  return Array.from({ length: count }, () => "");
}

function yesNoCode(value) {
  if (!hasValue(value)) return "";
  return isYes(value) ? "1" : "0";
}

function checkMark(value) {
  return isYes(value) ? "✔" : "";
}

function clientStatusCode(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("trans in")) return "B";
  if (normalized.includes("trans out")) return "C";
  if (normalized.includes("resident")) return "A";
  return value || "";
}

function ageGroupCode(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.startsWith("a") || normalized.includes("10-14")) return "A";
  if (normalized.startsWith("b") || normalized.includes("15-19")) return "B";
  if (normalized.startsWith("c") || normalized.includes("20-49")) return "C";
  return value || "";
}

function templateDate(value) {
  if (!hasValue(value)) return "";
  const raw = String(value).trim();
  const datePart = raw.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0].slice(-2)}`;
  return raw;
}

function templateTime(value) {
  if (!hasValue(value)) return "";
  const raw = String(value).trim();
  const timePart = raw.includes("T") ? raw.split("T")[1] : raw;
  return timePart.slice(0, 5);
}

function detailOr(row, key, fallback = "") {
  const value = getDetail(row, key);
  return hasValue(value) ? value : fallback;
}

function detailDate(row, key, fallback = "") {
  return templateDate(detailOr(row, key, fallback));
}

function mcTemplateRows(reportRow) {
  const rows = cloneRows(MC_TEMPLATE_HEADER_ROWS);
  const records = state.maternalRecords.filter((record) => record.barangay === reportRow.barangay);
  const colCount = 92;
  records.forEach((record, index) => {
    const number = index + 1;
    const lineA = blankTemplateRow(colCount);
    const lineB = blankTemplateRow(colCount);
    lineA[0] = number;
    lineA[1] = detailDate(record, "registrationDate");
    lineA[2] = detailOr(record, "familySerialNumber");
    lineA[3] = record.fullName || "";
    lineA[4] = record.address || "";
    lineA[5] = record.age || "";
    lineA[6] = ageGroupCode(detailOr(record, "ageGroup"));
    lineA[7] = `LMP: ${templateDate(record.lmp || detailOr(record, "lmp"))}`;
    lineB[7] = `G-P: ${detailOr(record, "gravidaParity")}`;
    lineA[8] = templateDate(record.edd || detailOr(record, "edd"));

    for (let i = 1; i <= 8; i += 1) {
      lineA[8 + i] = detailDate(record, `ancVisit${i}Date`);
      lineB[8 + i] = detailOr(record, `ancVisit${i}Bp`) ? `bp: ${detailOr(record, `ancVisit${i}Bp`)}` : "";
    }

    lineA[17] = yesNoCode(detailOr(record, "completed8ANC"));
    lineA[18] = yesNoCode(detailOr(record, "highElevatedBP", record.riskLevel === "High" || record.pregnancyStatus === "High Risk" ? "Yes" : ""));
    lineA[19] = yesNoCode(detailOr(record, "dangerSigns"));
    if (detailOr(record, "dangerSignsNotes")) lineB[19] = detailOr(record, "dangerSignsNotes");
    lineA[20] = yesNoCode(detailOr(record, "referredHighBpDangerSigns"));
    lineB[20] = detailDate(record, "dateReferred");
    lineA[21] = clientStatusCode(detailOr(record, "clientStatus"));
    lineA[22] = detailOr(record, "bmi", detailOr(record, "nutritionalAssessment"));
    lineA[25] = detailDate(record, "tetanusDose1Date");
    lineA[26] = detailDate(record, "tetanusDose2Date");
    lineA[27] = detailDate(record, "tetanusDose3Date");
    lineA[28] = detailDate(record, "tetanusDose4Date");
    lineA[29] = detailDate(record, "tetanusDose5Date");
    lineA[30] = detailOr(record, "mcRemarks");

    lineA[31] = number;
    lineA[32] = yesNoCode(detailOr(record, "dewormingReceived"));
    lineA[39] = yesNoCode(detailOr(record, "ifaCompleted"));
    lineA[46] = yesNoCode(detailOr(record, "mmCompleted"));
    lineA[50] = yesNoCode(detailOr(record, "calciumCompleted"));
    lineA[51] = detailOr(record, "cbcHgbHctResult");
    lineA[53] = detailOr(record, "gdmScreeningResult");
    lineA[55] = detailOr(record, "hepatitisBScreeningResult");
    lineA[57] = detailOr(record, "hivScreeningResult");
    lineA[59] = detailOr(record, "syphilisScreeningResult");
    lineA[61] = detailDate(record, "confirmatoryTestDate");
    lineA[64] = detailOr(record, "supplementationRemarks");

    lineA[65] = number;
    lineA[66] = detailOr(record, "deliveryOutcome");
    lineA[67] = detailOr(record, "deliveryType");
    lineA[68] = detailOr(record, "birthSex");
    lineA[69] = detailOr(record, "birthWeight");
    lineA[71] = detailOr(record, "placeOfDelivery");
    lineA[73] = detailOr(record, "birthAttendant");
    lineA[74] = templateDate(detailOr(record, "deliveryDateTime"));
    lineA[75] = templateTime(detailOr(record, "deliveryDateTime"));
    lineA[76] = detailOr(record, "deliveryRemarks", detailOr(record, "mcRemarks"));

    for (let i = 1; i <= 4; i += 1) {
      lineA[76 + i] = detailDate(record, `pncVisit${i}Date`);
      lineB[76 + i] = detailOr(record, `pncVisit${i}Bp`) ? `bp: ${detailOr(record, `pncVisit${i}Bp`)}` : "";
    }
    lineA[81] = yesNoCode(detailOr(record, "completed4PNC"));
    lineA[82] = yesNoCode(detailOr(record, "postpartumHighElevatedBP", detailOr(record, "highElevatedBP")));
    lineA[83] = yesNoCode(detailOr(record, "postpartumDangerSigns"));
    lineA[84] = yesNoCode(detailOr(record, "postpartumReferredHighBpDangerSigns"));
    lineB[84] = detailDate(record, "postpartumDateReferred");
    lineA[85] = clientStatusCode(detailOr(record, "clientStatus"));
    lineA[89] = yesNoCode(detailOr(record, "postpartumIfaCompleted"));
    lineA[90] = yesNoCode(detailOr(record, "vitaminACompleted"));
    lineA[91] = detailOr(record, "pncRemarks", detailOr(record, "mcRemarks"));
    rows.push(lineA, lineB);
  });
  return rows;
}

function ccTemplateRows(reportRow) {
  const rows = cloneRows(CC_TEMPLATE_HEADER_ROWS);
  const records = state.infantRecords.filter((record) => record.barangay === reportRow.barangay);
  const colCount = 34;
  records.forEach((record, index) => {
    const number = index + 1;
    const line = blankTemplateRow(colCount);
    line[0] = number;
    line[1] = detailDate(record, "registrationDate");
    line[2] = detailOr(record, "familySerialNumber");
    line[3] = record.infantName || "";
    line[4] = templateDate(record.birthdate || detailOr(record, "birthdate"));
    line[5] = record.ageMonths || detailOr(record, "ageMonths");
    line[6] = detailOr(record, "sex");
    line[7] = detailOr(record, "motherName", record.parentName || "");
    line[8] = record.address || detailOr(record, "address");
    line[9] = checkMark(detailOr(record, "cpabTd2BeforeDelivery"));
    line[10] = checkMark(detailOr(record, "cpabTd3ToTd5BeforeDelivery"));
    line[11] = detailDate(record, "bcgWithin24hDate", detailOr(record, "bcgDate"));
    line[12] = detailDate(record, "bcgAfter24hDate");
    line[13] = detailDate(record, "hepaBWithin24hDate", detailOr(record, "hepatitisBDate"));
    line[14] = detailDate(record, "hepaBAfter24hTo14DaysDate");
    line[15] = detailDate(record, "pentavalentDose1Date");
    line[16] = detailDate(record, "pentavalentDose2Date");
    line[17] = detailDate(record, "pentavalentDose3Date");
    line[18] = number;
    line[19] = detailDate(record, "opvDose1Date");
    line[20] = detailDate(record, "opvDose2Date");
    line[21] = detailDate(record, "opvDose3Date");
    line[22] = detailDate(record, "ipvDose1Date", detailOr(record, "ipvDate"));
    line[23] = detailDate(record, "ipvDose2Date");
    line[24] = detailDate(record, "pcvDose1Date");
    line[25] = detailDate(record, "pcvDose2Date");
    line[26] = detailDate(record, "pcvDose3Date");
    line[27] = detailDate(record, "mmrDose1Date");
    line[28] = detailDate(record, "mmrDose2Date");
    line[29] = isYes(detailOr(record, "ficCompleted")) || record.immunizationStatus === "Complete" ? "✔" : "";
    line[32] = checkMark(detailOr(record, "cicCompleted"));
    line[33] = detailOr(record, "ccRemarks", record.notes || "");
    rows.push(line);
  });
  return rows;
}

function templateRowsForReport(reportRow) {
  return reportTypeShort(reportRow.type) === "MC" ? mcTemplateRows(reportRow) : ccTemplateRows(reportRow);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rowsToCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function safeFilenamePart(value) {
  return String(value || "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "report";
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob(["﻿", content], { type });
  downloadBlob(filename, blob);
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function templateTableHtml(rows) {
  return `<div class="table-wrap template-preview"><table>${rows.map((row, rowIndex) => `<tr>${row.map((cell) => rowIndex < 7 ? `<th>${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</table></div>`;
}

function excelTemplateValue(value) {
  if (value === null || typeof value === "undefined") return "";
  return value;
}

function writeRowsToExactWorksheet(worksheet, rows, startRow) {
  rows.forEach((row, rowIndex) => {
    const excelRow = worksheet.getRow(startRow + rowIndex);
    row.forEach((value, columnIndex) => {
      excelRow.getCell(columnIndex + 1).value = excelTemplateValue(value);
    });
  });
}

async function exportExactUploadedXlsxTemplate(reportRow, rows, filenameBase, code) {
  if (!window.ExcelJS) throw new Error("ExcelJS is not loaded. Check your internet connection or CDN access.");
  const templatePath = EXACT_TEMPLATE_FILES[code];
  if (!templatePath) throw new Error(`No exact XLSX template configured for ${code}.`);
  const response = await fetch(encodeURI(templatePath));
  if (!response.ok) throw new Error(`Could not load ${templatePath}. Use a local server or deploy the project before exporting XLSX.`);

  const buffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  const dataRows = rows.slice(TEMPLATE_HEADER_ROW_COUNTS[code]);
  writeRowsToExactWorksheet(worksheet, dataRows, TEMPLATE_DATA_START_ROWS[code]);

  workbook.creator = "RHU Maternal and Infant Health Monitoring";
  workbook.modified = new Date();
  const outputBuffer = await workbook.xlsx.writeBuffer();
  downloadBlob(`${filenameBase}-template.xlsx`, new Blob([outputBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }));
}

async function exportReportTemplate(reportId, format) {
  const reportRow = state.monthlyReports.find((item) => item.id === reportId);
  if (!reportRow) return toast("Report not found.", true);
  const code = reportTypeShort(reportRow.type);
  const rows = templateRowsForReport(reportRow);
  const filenameBase = `${code}-${safeFilenamePart(reportRow.barangay)}-${safeFilenamePart(reportRow.month)}`;

  if (format === "xlsx" || format === "xls") {
    try {
      await exportExactUploadedXlsxTemplate(reportRow, rows, filenameBase, code);
      toast(`${code} Excel template exported using the exact uploaded XLSX template.`);
      return;
    } catch (error) {
      console.error(error);
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:4px;vertical-align:top;white-space:pre-wrap;font-family:Arial;font-size:10pt}th{font-weight:bold;background:#eef5fb}</style></head><body>${templateTableHtml(rows)}</body></html>`;
      downloadTextFile(`${filenameBase}-template-fallback.xls`, html, "application/vnd.ms-excel;charset=utf-8");
      toast(`${code} exact XLSX export failed, so fallback Excel-readable file was downloaded. ${error.message}`, true);
      return;
    }
  }

  downloadTextFile(`${filenameBase}-template.csv`, rowsToCsv(rows), "text/csv;charset=utf-8");
  toast(`${code} CSV template exported using the same column order.`);
}

function openReportTemplateView(reportId) {
  const reportRow = state.monthlyReports.find((item) => item.id === reportId);
  if (!reportRow) return toast("Report not found.", true);
  const code = reportTypeShort(reportRow.type);
  const rows = templateRowsForReport(reportRow);
  openModal(`${code} Template Preview`, `
    <div class="card card-pad">
      <div class="section-head">
        <div><h3>${escapeHtml(reportTypeLabel(reportRow.type))}</h3><p>${escapeHtml(reportRow.month)} • ${escapeHtml(reportRow.barangay)} • exact uploaded XLSX template is used for Excel export</p></div>
        ${badge(code)}
      </div>
      <div class="actions">
        <button class="secondary-btn" data-export-report-csv="${escapeHtml(reportRow.id)}">Export CSV</button>
        <button class="primary-btn" data-export-report-xls="${escapeHtml(reportRow.id)}">Export Excel (.xlsx)</button>
      </div>
    </div>
    ${templateTableHtml(rows)}
  `);
  bindTemplateExportButtons();
}

function bindTemplateExportButtons() {
  document.querySelectorAll("[data-view-template-report]").forEach((btn) => btn.addEventListener("click", () => openReportTemplateView(btn.dataset.viewTemplateReport)));
  document.querySelectorAll("[data-export-report-csv]").forEach((btn) => btn.addEventListener("click", () => exportReportTemplate(btn.dataset.exportReportCsv, "csv")));
  document.querySelectorAll("[data-export-report-xls]").forEach((btn) => btn.addEventListener("click", () => exportReportTemplate(btn.dataset.exportReportXls, "xlsx")));
}

function generateReminder() {
  const upcoming = state.checkupSchedules.find((s) => s.status === "Upcoming") || state.checkupSchedules[0];
  const msg = `Magandang araw, ${upcoming.patientName}. Paalala po sa inyong check-up sa ${fmtDate(upcoming.date)} sa barangay health center. Maraming salamat.`;
  const row = reminder(makeId("R"), upcoming.patientName, "09XXXXXXXXX", `${upcoming.type} Check-up Reminder`, msg, upcoming.date, "Queue");
  state.reminders.unshift(row);
  persistRecord("reminders", row);
  renderReminders();
  toast("Reminder generated.");
}

function bindRowActions() {
  document.querySelectorAll("[data-edit-user]").forEach((btn) => btn.addEventListener("click", () => openUserForm(btn.dataset.editUser)));
  document.querySelectorAll("[data-edit-contact]").forEach((btn) => btn.addEventListener("click", () => openContactForm(btn.dataset.editContact)));
  document.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
    const [kind, id] = btn.dataset.edit.split(":");
    ({ mother: openMotherForm, infant: openInfantForm, schedule: openScheduleForm }[kind])(id);
  }));
  document.querySelectorAll("[data-view]").forEach((btn) => btn.addEventListener("click", () => {
    const [kind, id] = btn.dataset.view.split(":");
    openRecordView(kind, id);
  }));
  document.querySelectorAll("[data-complete-mc]").forEach((btn) => btn.addEventListener("click", () => openMcCompletionForm(btn.dataset.completeMc)));
  document.querySelectorAll("[data-prenatal]").forEach((btn) => btn.addEventListener("click", () => openPrenatalRecordForm(btn.dataset.prenatal)));
  document.querySelectorAll("[data-complete-cc]").forEach((btn) => btn.addEventListener("click", () => openCcCompletionForm(btn.dataset.completeCc)));
  document.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => {
    const [key, id] = btn.dataset.delete.split(":");
    if (!confirm(isOnlineMode() ? "Delete this record from Supabase?" : "Delete this record from local storage?")) return;
    state[key] = state[key].filter((row) => row.id !== id);
    deleteRemoteRecord(key, id);
    if (!isOnlineMode()) persist(key);
    renderPage(activePage);
    toast("Record deleted.");
  }));
  document.querySelectorAll("[data-status]").forEach((btn) => btn.addEventListener("click", () => {
    const [id, status] = btn.dataset.status.split(":");
    const row = state.checkupSchedules.find((s) => s.id === id);
    row.status = status;
    persistRecord("checkupSchedules", row);
    renderSchedules();
    toast(`Schedule marked ${status.toLowerCase()}.`);
  }));
  document.querySelectorAll("[data-reminder]").forEach((btn) => btn.addEventListener("click", () => {
    const [id, action] = btn.dataset.reminder.split(":");
    const row = state.reminders.find((r) => r.id === id);
    if (action === "view") return openModal("Reminder Message", `<p>${escapeHtml(row.message)}</p>`);
    row.status = action === "sent" ? "Sent" : "Queue";
    persistRecord("reminders", row);
    renderReminders();
    toast(action === "sent" ? "Reminder marked as sent." : "Reminder queued for resend.");
  }));
  document.querySelectorAll("[data-view-report]").forEach((btn) => btn.addEventListener("click", () => {
    const row = state.monthlyReports.find((r) => r.id === btn.dataset.viewReport);
    const mainRows = Object.entries(row || {}).filter(([key]) => key !== "reportDetails");
    const detailRows = Object.entries(row?.reportDetails || {});
    const mainHtml = `<div class="detail-grid">${mainRows.map(([k, v]) => `<div class="profile-row"><span>${labelize(k)}</span><strong>${escapeHtml(k === "type" ? reportTypeLabel(v) : v)}</strong></div>`).join("")}</div>`;
    const detailHtml = detailRows.length ? `<div class="form-divider"><strong>Auto-generated TCL Summary</strong><span>Counts matched to the MC/CC template fields</span></div><div class="detail-grid">${detailRows.map(([k, v]) => `<div class="profile-row"><span>${labelize(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join("")}</div>` : "";
    openModal("Monthly Report", `${mainHtml}${detailHtml}`);
  }));
  bindTemplateExportButtons();
}

function userActions(userRow) {
  const current = getCurrentUser();
  const canDelete = current.role === "Administrator" && userRow.id !== current.id && String(userRow.email).toLowerCase() !== String(current.email).toLowerCase();
  return `<div class="actions"><button class="secondary-btn" data-edit-user="${escapeHtml(userRow.id)}">Edit</button>${canDelete ? `<button class="danger-btn" data-delete="users:${escapeHtml(userRow.id)}">Delete</button>` : ""}</div>`;
}

function rowActions(kind, id, canEdit) {
  const current = getCurrentUser();
  const view = `<button class="ghost-btn" data-view="${kind}:${id}">View</button>`;
  if (!canEdit) return view;
  const deleteKey = kind === "mother" ? "maternalRecords" : "infantRecords";
  const completion = kind === "mother"
    ? `<button class="secondary-btn" data-prenatal="${escapeHtml(id)}">Prenatal Form</button><button class="secondary-btn" data-complete-mc="${escapeHtml(id)}">Complete MC</button>`
    : `<button class="secondary-btn" data-complete-cc="${escapeHtml(id)}">Complete CC</button>`;
  const edit = `<button class="secondary-btn" data-edit="${kind}:${id}">Edit Basic</button>`;
  const remove = current.role === "Administrator" ? `<button class="danger-btn" data-delete="${deleteKey}:${escapeHtml(id)}">Delete</button>` : "";
  return `<div class="actions">${view}${completion}${edit}${remove}</div>`;
}

function scheduleActions(row, canEdit) {
  if (!canEdit) return `<button class="ghost-btn" data-view="schedule:${row.id}">View</button>`;
  return `<div class="actions"><button class="secondary-btn" data-edit="schedule:${row.id}">Edit</button><button class="ghost-btn" data-status="${row.id}:Completed">Complete</button><button class="ghost-btn" data-status="${row.id}:Rescheduled">Reschedule</button></div>`;
}

function reminderActions(row, canEdit) {
  const view = `<button class="ghost-btn" data-reminder="${row.id}:view">View Message</button>`;
  if (!canEdit) return view;
  return `<div class="actions">${view}<button class="secondary-btn" data-reminder="${row.id}:sent">Mark as Sent</button><button class="ghost-btn" data-reminder="${row.id}:resend">Resend</button></div>`;
}

function reportsTable(rows, withActions = false) {
  return recordTable(rows, ["Code", "Report", "Month", "Barangay", "Total", "Prepared By", "Date Submitted", "Status", ...(withActions ? ["Actions"] : [])], (r) => [
    badge(reportTypeShort(r.type)), reportTypeLabel(r.type), r.month, r.barangay, r.total, r.preparedBy, fmtDate(r.dateSubmitted), badge(r.status), ...(withActions ? [`<div class="actions"><button class="secondary-btn" data-view-report="${r.id}">View Summary</button><button class="ghost-btn" data-view-template-report="${r.id}">View Template</button><button class="ghost-btn" data-export-report-csv="${r.id}">CSV</button><button class="primary-btn" data-export-report-xls="${r.id}">Excel (.xlsx)</button></div>`] : [])
  ]);
}

function openRecordView(kind, id) {
  const sources = {
    mother: ["Maternal Record", state.maternalRecords],
    infant: ["Infant Record", state.infantRecords],
    schedule: ["Check-up Schedule", state.checkupSchedules]
  };
  const [title, rows] = sources[kind];
  const row = rows.find((item) => item.id === id);
  if (!row) return toast("Record not found.", true);
  const mainRows = Object.entries(row).filter(([key]) => key !== "formDetails");
  const detailRows = Object.entries(row.formDetails || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  const mainHtml = `<div class="detail-grid">${mainRows.map(([key, value]) => `<div class="profile-row"><span>${labelize(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`;
  const detailHtml = detailRows.length
    ? `<div class="form-divider"><strong>Submitted Form Details</strong><span>Additional fields from the RHU reference forms</span></div><div class="detail-grid">${detailRows.map(([key, value]) => `<div class="profile-row"><span>${labelize(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`
    : "";
  openModal(title, `${mainHtml}${detailHtml}`);
}

function recordTable(rows, headers, mapRow) {
  if (!rows.length) return empty("No records match the current view.");
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${mapRow(row).map((cell) => `<td>${cell ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function toolbar(title, subtitle, actions) {
  return `<div class="card card-pad section-head"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(subtitle)}</p></div><div class="actions">${actions}</div></div>`;
}

function filterBar(items, includeDate = false, includeMonth = false) {
  const controls = items.map((item) => `<label>${item.label}<select id="${item.id}">${item.options.map((opt) => `<option value="${escapeHtml(opt)}"${opt === item.value ? " selected" : ""}>${escapeHtml(opt || "All")}</option>`).join("")}</select></label>`);
  if (includeDate) controls.push(`<label>Date<input id="dateFilter" type="date" value="${escapeHtml(getFilters().date)}"></label>`);
  if (includeMonth) controls.push(`<label>Report Month<input id="monthFilter" type="text" placeholder="Month Year" value="${escapeHtml(getFilters().month)}"></label>`);
  return `<div class="card card-pad filter-row">${controls.join("")}</div>`;
}

function bindFilters() {
  ["barangayFilter", "statusFilter", "riskFilter", "immunizationFilter", "roleFilter", "dateFilter", "monthFilter"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => renderPage(activePage));
  });
}

function getFilters() {
  return {
    barangay: document.getElementById("barangayFilter")?.value || "",
    status: document.getElementById("statusFilter")?.value || "",
    risk: document.getElementById("riskFilter")?.value || "",
    immunization: document.getElementById("immunizationFilter")?.value || "",
    role: document.getElementById("roleFilter")?.value || "",
    date: document.getElementById("dateFilter")?.value || "",
    month: document.getElementById("monthFilter")?.value || ""
  };
}

function statGrid(stats, bare = false) {
  const body = stats.map(([label, value, helper]) => `<div class="card stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(helper)}</small></div>`).join("");
  return bare ? body : `<div class="stat-grid">${body}</div>`;
}

function barangayCard(name) {
  const mothers = state.maternalRecords.filter((m) => m.barangay === name);
  const infants = state.infantRecords.filter((i) => i.barangay === name);
  const schedules = state.checkupSchedules.filter((s) => s.barangay === name);
  return `<button class="card barangay-card ${name === selectedBarangay ? "active" : ""}" data-select-barangay="${escapeHtml(name)}">
    <h4>${escapeHtml(name)}</h4>
    <div class="metric-list">
      <div><span>Pregnant Mothers</span><strong>${mothers.length}</strong></div>
      <div><span>Infants</span><strong>${infants.length}</strong></div>
      <div><span>Upcoming Check-ups</span><strong>${schedules.filter((s) => s.status === "Upcoming").length}</strong></div>
      <div><span>Missed Check-ups</span><strong>${schedules.filter((s) => s.status === "Missed").length}</strong></div>
      <div><span>High-Risk Pregnancies</span><strong>${mothers.filter((m) => m.riskLevel === "High").length}</strong></div>
      <div><span>Submitted Reports</span><strong>${state.monthlyReports.filter((r) => r.barangay === name).length}</strong></div>
      <div><span>Assigned Nurse</span><strong>${escapeHtml((state.emergencyContacts.find((c) => c.barangay === name) || {}).nurseName || "RHU Staff")}</strong></div>
    </div>
  </button>`;
}

function barangayMini(name) {
  const missed = state.checkupSchedules.filter((s) => s.barangay === name && s.status === "Missed").length;
  return `<div class="mini-item"><div><strong>${escapeHtml(name)}</strong><br><small>${state.maternalRecords.filter((m) => m.barangay === name).length} mothers • ${state.infantRecords.filter((i) => i.barangay === name).length} infants</small></div>${badge(missed ? `${missed} missed` : "On track")}</div>`;
}

function performanceCard(name) {
  const stat = getBarangayStats().find((item) => item.name === name);
  return `<div class="card barangay-card">
    <div class="section-head"><div><h4>${escapeHtml(name)}</h4><p>${stat.reports ? "Report submitted" : "Report pending"}</p></div>${badge(stat.reports ? "Submitted" : "Pending")}</div>
    <div class="metric-list">
      <div><span>Pregnant</span><strong>${stat.mothers}</strong></div>
      <div><span>Infants</span><strong>${stat.infants}</strong></div>
      <div><span>Missed</span><strong>${stat.missed}</strong></div>
      <div><span>High Risk</span><strong>${stat.highRisk}</strong></div>
    </div>
  </div>`;
}

function scheduleMini(s) {
  return `<div class="mini-item"><div><strong>${escapeHtml(s.patientName)}</strong><br><small>${escapeHtml(s.type)} • ${fmtDate(s.date)} ${escapeHtml(s.time)}</small></div>${badge(s.status)}</div>`;
}

function reminderMini(r) {
  return `<div class="mini-item"><div><strong>${escapeHtml(r.messageType)}</strong><br><small>${fmtDate(r.scheduleDate)}</small></div>${badge(r.status)}</div>`;
}

function parentReminderMessage(r) {
  return `<div class="mini-item parent-reminder-message">
    <div>
      <strong>${escapeHtml(r.messageType || "Reminder")}</strong>
      <p>${escapeHtml(r.message || "No reminder message provided.")}</p>
      <small>${fmtDate(r.scheduleDate)}</small>
    </div>
  </div>`;
}

function contactCard(c, canEdit = false) {
  const actions = canEdit ? `<div class="actions"><button class="secondary-btn" data-edit-contact="${escapeHtml(c.id)}">Edit</button><button class="danger-btn" data-delete="emergencyContacts:${escapeHtml(c.id)}">Delete</button></div>` : "";
  return `<div class="card card-pad"><div class="section-head"><div><h3>${escapeHtml(c.nurseName || "Barangay Health Contact")}</h3><p>${escapeHtml(c.barangay || "")}</p></div>${badge("Emergency")}</div>${profileRows([["Barangay", c.barangay], ["Contact Number", c.contactNumber], ["Clinic Location", c.clinicLocation], ["Emergency Hotline", c.hotline]])}${actions}</div>`;
}

function profileRows(rows) {
  return `<div class="list-stack">${rows.map(([label, value]) => `<div class="profile-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`;
}

function input(label, name, value = "", readonly = false, type = "text") {
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${readonly ? "readonly" : "required"}></label>`;
}

function inputOptional(label, name, value = "", type = "text") {
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeHtml(value ?? "")}"></label>`;
}

function select(label, name, options, value = "") {
  return `<label>${label}<select name="${name}" required>${options.map((opt) => `<option value="${escapeHtml(opt)}"${opt === value ? " selected" : ""}>${escapeHtml(opt)}</option>`).join("")}</select></label>`;
}

function selectOptional(label, name, options, value = "") {
  return `<label>${label}<select name="${name}">${options.map((opt) => `<option value="${escapeHtml(opt)}"${opt === value ? " selected" : ""}>${escapeHtml(opt || "Select")}</option>`).join("")}</select></label>`;
}

function textarea(label, name, value = "") {
  return `<label>${label}<textarea name="${name}">${escapeHtml(value)}</textarea></label>`;
}

function textareaOptional(label, name, value = "") {
  return `<label>${label}<textarea name="${name}">${escapeHtml(value ?? "")}</textarea></label>`;
}

function formDivider(title, helper = "") {
  return `<div class="form-divider"><strong>${escapeHtml(title)}</strong>${helper ? `<span>${escapeHtml(helper)}</span>` : ""}</div>`;
}

function detailValue(record, key, fallback = "") {
  return record?.formDetails?.[key] ?? record?.[key] ?? fallback;
}

function packFormDetails(row, fields) {
  const details = { ...(row.formDetails || {}) };
  fields.forEach((field) => {
    if (field in row) {
      details[field] = row[field];
      delete row[field];
    }
  });
  return details;
}

function openModal(title, body) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = body;
  document.getElementById("modal").classList.remove("hidden");
  if (typeof window.lucide !== "undefined" && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function formData(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  ["age", "checkupsCompleted", "ageMonths", "total", "newCount", "completeOrDelivered", "incompleteOrHighRisk", "missedOrCompleted", "completedOrMissed", "heightCm", "weightKg", "bmi", "previousPregnancies", "aogMonths"].forEach((key) => {
    if (key in data && data[key] !== "") data[key] = Number(data[key]);
  });
  return data;
}

function upsert(key, row, idKey) {
  const index = state[key].findIndex((item) => item[idKey] === row[idKey]);
  if (index >= 0) state[key][index] = row;
  else state[key].unshift(row);
  persistRecord(key, row);
}

function canManageRecords() {
  return ["Administrator", "Nurse / Midwife"].includes(getCurrentUser().role);
}

function currentMotherRecord() {
  const current = getCurrentUser();
  if (!current || current.role !== "Mother / Parent") return null;
  return state.maternalRecords.find((m) => m.id === current.motherId)
    || state.maternalRecords.find((m) => String(m.fullName || "").toLowerCase() === String(current.name || "").toLowerCase())
    || null;
}

function currentInfantRecords() {
  const mother = currentMotherRecord();
  if (!mother) return [];
  return state.infantRecords.filter((i) => String(i.parentName || "").toLowerCase() === String(mother.fullName || "").toLowerCase());
}

function scoped(rows) {
  const current = getCurrentUser();
  if (["Administrator", "MHO", "Doctor"].includes(current.role)) return rows;
  if (current.role === "Nurse / Midwife") return rows.filter((r) => r.barangay === current.barangay);
  return rows;
}

function patientSchedules() {
  const mother = currentMotherRecord();
  if (!mother) return [];
  const infants = currentInfantRecords().map((i) => i.infantName);
  return state.checkupSchedules.filter((s) => s.patientName === mother.fullName || infants.includes(s.patientName));
}

function patientReminders() {
  const mother = currentMotherRecord();
  if (!mother) return [];
  const names = [mother.fullName, ...currentInfantRecords().map((i) => i.infantName), ...patientSchedules().map((s) => s.patientName)];
  return state.reminders.filter((r) => names.includes(r.recipientName));
}

function applySearch(rows, keys) {
  const query = document.getElementById("globalSearch")?.value.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) => keys.some((key) => String(row[key] || "").toLowerCase().includes(query)));
}

function createBackup() {
  toast("Creating backup...");
  setTimeout(() => {
    const total = ["users", "maternalRecords", "infantRecords", "checkupSchedules", "reminders", "monthlyReports", "emergencyContacts"].reduce((sum, key) => sum + state[key].length, 0);
    state.backupMeta = { date: new Date().toISOString(), total };
    persist("backupMeta");
    renderBackup();
    toast(isOnlineMode() ? "Backup marker created for this session." : "Backup created in localStorage.");
  }, 500);
}

function getBackupPayload() {
  return STORE_KEYS.reduce((payload, key) => {
    payload[key] = key in state ? state[key] : read(key, key === "backupMeta" ? null : []);
    return payload;
  }, {});
}

function downloadBackup() {
  const blob = new Blob([JSON.stringify(getBackupPayload(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rhu-health-monitor-backup-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Backup JSON prepared.");
}

function restoreBackupFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      STORE_KEYS.forEach((key) => {
        if (key in data) state[key] = data[key];
        if (!isOnlineMode() && key in data) save(key, data[key]);
      });
      if (isOnlineMode()) {
        for (const key of REMOTE_KEYS) await persistCollection(key);
      } else {
        loadState();
      }
      const restoredUser = getCurrentUser() || state.users[0];
      save("currentUser", restoredUser);
      showApp(restoredUser);
      toast(isOnlineMode() ? "Backup restored to Supabase-loaded records." : "Backup restored.");
    } catch {
      toast("Could not restore that JSON file.", true);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

async function clearAppData() {
  const current = getCurrentUser();

  if (isOnlineMode()) {
    if (current?.role !== "Administrator") {
      toast("Only the administrator can clear online app data.", true);
      return;
    }

    const message = "Clear all online app records and managed profiles except the current admin profile? Supabase Auth users will not be deleted.";
    if (!confirm(message)) return;

    const recordKeys = ["maternalRecords", "infantRecords", "checkupSchedules", "reminders", "monthlyReports", "emergencyContacts"];
    for (const key of recordKeys) {
      const { error } = await db.from(TABLES[key]).delete().neq("id", "__keep_none__");
      if (error) {
        console.error(error);
        toast(`Could not clear ${TABLES[key]}: ${error.message}`, true);
        return;
      }
    }

    if (current?.email) {
      const { error } = await db.from(TABLES.users).delete().neq("email", current.email);
      if (error) {
        console.error(error);
        toast(`Could not clear managed profiles: ${error.message}`, true);
        return;
      }
    }

    await loadState();
    const { data } = await db.auth.getUser();
    if (data?.user) {
      const refreshed = await getOrCreateCurrentProfile(data.user);
      save("currentUser", refreshed);
    }
    renderNav();
    renderPage(activePage);
    toast("Online app data cleared. Your current admin profile was kept.");
    return;
  }

  if (!confirm("Clear all local app data and return to login?")) return;
  STORE_KEYS.forEach((key) => localStorage.removeItem(key));
  state = emptyState();
  toast("Local app data cleared.");
  setTimeout(() => location.reload(), 500);
}

async function logout() {
  if (isOnlineMode()) await db.auth.signOut();
  save("currentUser", null);
  showAuth();
  toast("Signed out.");
}

function bindJumpButtons() {
  document.querySelectorAll("[data-jump]").forEach((btn) => btn.addEventListener("click", () => {
    activePage = btn.dataset.jump;
    renderPage(activePage);
    renderNav();
  }));
}

function badge(value) {
  const className = String(value).toLowerCase().replace(/\s+/g, "-").replace(/\//g, "");
  return `<span class="badge ${className}">${escapeHtml(value)}</span>`;
}

function empty(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function setContent(html) {
  document.getElementById("content").innerHTML = html;
}

function toast(message, error = false) {
  const el = document.createElement("div");
  el.className = `toast${error ? " error" : ""} flex items-center gap-2`;
  el.innerHTML = `<i data-lucide="${error ? 'alert-circle' : 'check-circle'}" class="w-4 h-4 text-current shrink-0"></i><span>${escapeHtml(message)}</span>`;
  document.getElementById("toastHost").appendChild(el);
  if (typeof window.lucide !== "undefined" && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
  setTimeout(() => el.remove(), 3200);
}

function fmtDate(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name) {
  return String(name).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function makeId(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function monthKey(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en", { month: "short" });
}

function currentMonthName() {
  return new Date().toLocaleString("en", { month: "long", year: "numeric" });
}

function monthLabels() {
  const labels = [];
  const start = new Date();
  start.setMonth(start.getMonth() - 5);
  for (let i = 0; i < 6; i += 1) {
    const date = new Date(start);
    date.setMonth(start.getMonth() + i);
    labels.push(date.toLocaleString("en", { month: "short" }));
  }
  return labels;
}

function shortBarangay(value) {
  return String(value).replace("Barangay ", "").replace("Sta. ", "Sta ");
}

function compactLabel(value) {
  return String(value).replace(" Reminder", "").replace("Missed Check-up Follow-up", "Missed Follow-up").replace("Infant Immunization", "Infant Imm.");
}

function labelize(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
