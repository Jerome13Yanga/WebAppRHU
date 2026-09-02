RHU Supabase Online Setup

1. Open your Supabase project.
2. Go to SQL Editor, paste the full contents of supabase-schema.sql, then run it.
3. Go to Project Settings > API.
4. Copy your Project URL and anon/public key.
5. Open app.js and replace:
   - PASTE_YOUR_SUPABASE_PROJECT_URL_HERE
   - PASTE_YOUR_SUPABASE_ANON_KEY_HERE
6. For easier testing, go to Authentication > Sign In / Providers > Email and turn OFF email confirmation.
   If you keep email confirmation ON, parent users must confirm through email before signing in.
7. Open index.html locally or deploy the folder to Netlify, Vercel, GitHub Pages, or Firebase Hosting.

Updated role flow:
- The public registration form is limited to Mother / Parent accounts only.
- There is one login form. After login, the app reads the user's profile role and opens the correct dashboard.
- Healthcare staff register their accounts via Healthcare Staff Registration on the login screen. Parents create their own accounts through public registration.
- Staff roles: MHO, Nurse / Midwife.

Parent account capabilities:
- Submit/update maternal information forms.
- Add infant profile forms.
- Request a check-up schedule.
- View/request their own schedules and view reminders only. Parent accounts do not access Monthly Reports.

Admin/staff capabilities:
- Admin: all dashboards, user/profile management, backup/export, records.
- MHO: monitoring dashboards, barangay summaries, reports, and records view.
- Nurse / Midwife: manage maternal/infant records, check-up schedules, reminders, and reports for assigned barangay.

Notes:
- This version keeps your current UI/theme and connects it to Supabase.
- This clean testing version does not load built-in records automatically. After setup, records appear only when users create them or when you restore a backup.
- The included SQL uses simple authenticated-user policies so the prototype works immediately.
- For final production, replace the prototype policies with stricter role/barangay Row Level Security policies or use a secured Supabase Edge Function for admin-created staff accounts.

Clean testing reset:
- To clear records already stored in Supabase from earlier tests, run clear-app-data.sql in the SQL Editor. This does not delete Supabase Auth users.
- You can also use Backup and Recovery > Clear Online App Data while logged in as admin.

Monthly report coding and template match:
- MC = Maternal Care Monthly Report / Target Client List for Maternal Care and Services.
- CC = Child Immunization Monthly Report / Target Client List for Child Immunization.
- If your Supabase project was created before this update, run update-mc-cc-template-fields.sql once in the Supabase SQL Editor.
- The Monthly Reports form now auto-generates report counts from the selected barangay's maternal or infant records.
- The uploaded CSV reference files are included in the reference-templates folder.

HEALTHCARE STAFF & PARENT USER REGISTRATION
--------------------------------------------
Healthcare personnel (MHO, Nurse/Midwife) register their own login accounts directly using the Healthcare Staff Registration form on the web app login screen.
Parents register using the Mother / Parent registration form on the login screen.

DETAILED PARENT HEALTH FORMS + MC/CC TEMPLATE UPDATE
----------------------------------------------------
The Parent Health Forms page now includes detailed maternal/prenatal/postpartum fields and infant immunization-card fields based on the reference forms. It also stores auto-generated Monthly Report details for MC/CC template counts.
If your Supabase tables already existed before this update, run this once in Supabase SQL Editor:

  update-mc-cc-template-fields.sql

This adds/keeps formDetails JSON columns for maternal_records and infant_records, and adds reportDetails JSON storage for monthly_reports.


LOGO PLACEHOLDER:
To replace the round logo, put your image in the same folder as index.html and name it logo.jpg (or logo.png). The app will automatically use it in the login screen and sidebar.
