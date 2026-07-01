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
- The embedded admin email is admin@rhu.gov. Create this account in Supabase Auth first, then sign in with it.
- Admin can manage staff profiles in Users and Roles. Parents create their own accounts through public registration.
- Staff roles managed by admin: MHO, Nurse / Midwife, Doctor.
- To let staff sign in online, create or invite their matching email in Supabase Authentication, then create/update their profile in the admin dashboard using the same email.

Parent account capabilities:
- Submit/update maternal information forms.
- Add infant profile forms.
- Request a check-up schedule.
- View/request their own schedules and view reminders only. Parent accounts do not access Monthly Reports.

Admin/staff capabilities:
- Admin: all dashboards, user/profile management, backup/export, records.
- MHO and Doctor: monitoring dashboards, barangay summaries, reports, and records view.
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

ADMIN-MANAGED PASSWORDS / STAFF LOGIN
------------------------------------
The Admin dashboard now generates a permanent password when creating staff accounts for MHO, Nurse/Midwife, and Doctor users.
For online mode, this uses the included Supabase Edge Function:

  supabase/functions/admin-create-user/index.ts

Deploy it with:

  supabase functions deploy admin-create-user --project-ref rkortcwwnrpvhrxikunb

After deployment, Admin can create MHO, Nurse/Midwife, and Doctor staff accounts with an email and generated permanent password. Parents should use the public registration form. All users log in through the same login form using their email and password.

Never place the service_role key in app.js. The service_role key belongs only in Supabase server-side/Edge Function environment secrets.

DETAILED PARENT HEALTH FORMS + MC/CC TEMPLATE UPDATE
----------------------------------------------------
The Parent Health Forms page now includes detailed maternal/prenatal/postpartum fields and infant immunization-card fields based on the reference forms. It also stores auto-generated Monthly Report details for MC/CC template counts.
If your Supabase tables already existed before this update, run this once in Supabase SQL Editor:

  update-mc-cc-template-fields.sql

This adds/keeps formDetails JSON columns for maternal_records and infant_records, and adds reportDetails JSON storage for monthly_reports.


LOGO PLACEHOLDER:
To replace the round logo, put your image in the same folder as index.html and name it logo.png. The app will automatically use it in the login screen and sidebar.
