import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type CreateStylistBody = {
  name?: unknown;
  role?: unknown;
  email?: unknown;
  password?: unknown;
  img?: unknown;
  photo_url?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return jsonError("Server setup is missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).", 500);
  }

  const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) return jsonError("Admin sign-in is required.", 401);

  let body: CreateStylistBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const img = typeof body.img === "string" && body.img.trim() ? body.img : "👩";
  const photo_url = typeof body.photo_url === "string" ? body.photo_url : null;
  if (!name || !role || !email || !password) {
    return jsonError("Full name, role, email, and password are required.", 400);
  }
  if (password.length < 6) return jsonError("Password must be at least 6 characters.", 400);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) return jsonError("Your admin session is invalid or expired. Log in again.", 401);

  const { data: adminProfile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (profileError) return jsonError(`Could not verify admin access: ${profileError.message}`, 500);
  if (adminProfile?.role !== "admin") return jsonError("Only a salon admin can add a stylist.", 403);

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role: "stylist" },
  });
  if (createError || !created.user) {
    return jsonError(createError?.message ?? "Could not create the stylist login account.", 400);
  }

  const { data: stylist, error: insertError } = await supabase
    .from("stylists")
    .insert({
      name,
      role,
      rating: 0,
      rating_count: 0,
      img,
      email,
      user_id: created.user.id,
      photo_url,
    })
    .select()
    .single();

  if (insertError || !stylist) {
    await supabase.auth.admin.deleteUser(created.user.id);
    return jsonError(`Could not save the stylist profile: ${insertError?.message ?? "No row was returned."}`, 500);
  }

  return Response.json({ stylist }, { status: 201 });
}
