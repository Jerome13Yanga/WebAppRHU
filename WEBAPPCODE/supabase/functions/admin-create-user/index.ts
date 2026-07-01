import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const staffRoles = ["MHO", "Nurse / Midwife", "Doctor"];
const embeddedAdminEmails = ["admin@rhu.gov"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Missing Supabase Edge Function environment variables." }, 500);
    }

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: sessionData, error: sessionError } = await userClient.auth.getUser();
    if (sessionError || !sessionData?.user) {
      return json({ error: "You must be logged in as an administrator." }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const requesterEmail = String(sessionData.user.email || "").toLowerCase();
    const { data: requesterProfile } = await adminClient
      .from("profiles")
      .select("role,email")
      .or(`authUserId.eq.${sessionData.user.id},email.eq.${requesterEmail}`)
      .maybeSingle();

    const isAdmin = requesterProfile?.role === "Administrator" || embeddedAdminEmails.includes(requesterEmail);
    if (!isAdmin) return json({ error: "Only Administrator accounts can create staff accounts." }, 403);

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "");
    const name = String(body.name || "").trim();
    const barangay = String(body.barangay || "").trim();
    const motherId = String(body.motherId || "").trim();

    if (!email || !email.includes("@")) return json({ error: "Valid email is required." }, 400);
    if (!password || password.length < 8) return json({ error: "Generated password must be at least 8 characters." }, 400);
    if (!name) return json({ error: "Full name is required." }, 400);
    if (!staffRoles.includes(role)) return json({ error: "Admin can only create MHO, Nurse/Midwife, or Doctor staff accounts here. Parents should use public registration." }, 400);
    if (!barangay) return json({ error: "Barangay or office assignment is required." }, 400);

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, barangay, motherId },
    });

    if (createError) return json({ error: createError.message }, 400);
    if (!created?.user) return json({ error: "Supabase did not return the created user." }, 500);

    const profile = {
      id: created.user.id,
      authUserId: created.user.id,
      name,
      email,
      username: email,
      role,
      barangay,
      motherId,
      createdAt: new Date().toISOString(),
    };

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(profile, { onConflict: "email" });

    if (profileError) return json({ error: profileError.message }, 400);

    return json({ profile });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown server error." }, 500);
  }
});

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
