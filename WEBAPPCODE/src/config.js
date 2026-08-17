/**
 * Configuration & Constants for RHU Maternal and Infant Health System
 */

export const STORE_KEYS = [
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

export const roles = ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"];
export const staffRoles = ["MHO", "Nurse / Midwife", "Doctor"];
export const publicRegisterRole = "Mother / Parent";
export const embeddedAdminEmails = ["admin@rhu.gov"];

export const barangays = [
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

export const reportTypes = ["MC", "CC"];
export const reportTypeNames = {
  MC: "MC - Maternal Care Monthly Report",
  CC: "CC - Child Immunization Monthly Report",
  Maternal: "MC - Maternal Care Monthly Report",
  Infant: "CC - Child Immunization Monthly Report"
};

export function reportTypeLabel(type) {
  return reportTypeNames[type] || type || "";
}

export function reportTypeShort(type) {
  if (type === "Maternal") return "MC";
  if (type === "Infant") return "CC";
  return type || "";
}

export const pages = [
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", roles },
  { id: "maternal", label: "Maternal Records", icon: "heart-pulse", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "infants", label: "Infant Records", icon: "baby", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "schedules", label: "Check-up Schedules", icon: "calendar", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"] },
  { id: "forms", label: "My Health Forms", icon: "file-text", roles: ["Mother / Parent"] },
  { id: "reminders", label: "Reminders", icon: "bell", roles: ["Administrator", "Nurse / Midwife", "Mother / Parent"] },
  { id: "barangay", label: "Barangay Monitoring", icon: "building-2", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "reports", label: "Monthly Reports", icon: "file-bar-chart", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor"] },
  { id: "users", label: "Users and Roles", icon: "users", roles: ["Administrator"] },
  { id: "backup", label: "Backup and Recovery", icon: "hard-drive-download", roles: ["Administrator"] },
  { id: "contacts", label: "Emergency Contacts", icon: "phone-call", roles: ["Administrator", "MHO", "Nurse / Midwife", "Doctor", "Mother / Parent"] },
  { id: "logout", label: "Logout", icon: "log-out", roles }
];

export const SUPABASE_URL = "https://rkortcwwnrpvhrxikunb.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrb3J0Y3d3bnJwdmhyeGlrdW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDk5NjMsImV4cCI6MjA5ODQyNTk2M30.hKXXe2sG7kBvFFeWmJO8qdTEfKPjMdQlT8HrjmhgPOM";

export const TABLES = {
  users: "profiles",
  maternalRecords: "maternal_records",
  infantRecords: "infant_records",
  checkupSchedules: "checkup_schedules",
  reminders: "reminders",
  monthlyReports: "monthly_reports",
  emergencyContacts: "emergency_contacts"
};

export const maternalDetailFields = [
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

export const infantDetailFields = [
  "registrationDate", "familySerialNumber", "placeOfBirth", "motherName", "fatherName", "birthHeight", "birthWeight", "sex",
  "cpabTd2BeforeDelivery", "cpabTd3ToTd5BeforeDelivery",
  "bcgDate", "bcgWithin24hDate", "bcgAfter24hDate", "hepatitisBDate", "hepaBWithin24hDate", "hepaBAfter24hTo14DaysDate",
  "pentavalentDose1Date", "pentavalentDose2Date", "pentavalentDose3Date",
  "opvDose1Date", "opvDose2Date", "opvDose3Date", "ipvDate", "ipvDose1Date", "ipvDose2Date", "pcvDose1Date", "pcvDose2Date", "pcvDose3Date",
  "mmrDose1Date", "mmrDose2Date", "ficCompleted", "ficDate", "cicCompleted", "cicDate", "measlesSupplementalDate", "otherVaccines", "vaccineAgeRemarks", "vaccineRemarks", "remarksActionsTaken"
];
