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
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError("Server setup is missing its Supabase credentials.", 500);
  }
  if (!supabaseKey) {
    return jsonError(
      "Stylist accounts need a server-side Supabase key. Add SUPABASE_SECRET_KEY to system/.env.local, then restart the dev server.",
      500,
    );
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

  const clientOptions = {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  };
  const authClient = createClient(supabaseUrl, supabaseAnonKey, clientOptions);
  const supabase = createClient(supabaseUrl, supabaseKey, clientOptions);

  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    // Surface GoTrue's safe diagnostic so project/key mismatches can be fixed
    // without logging or returning the bearer token itself.
    const cause = authError as (Error & { cause?: unknown }) | null;
    const causeMessage = cause?.cause instanceof Error
      ? cause.cause.message
      : typeof cause?.cause === "string"
        ? cause.cause
        : "";
    const details = [authError?.message, causeMessage].filter(Boolean).join(": ");
    const reason = details ? ` (${details})` : "";
    if (/fetch failed|network/i.test(details)) {
      return jsonError(`The server could not reach Supabase Auth${reason}. Check the server connection and try again.`, 503);
    }
    return jsonError(`Could not validate the admin session${reason}. Refresh the page and sign in again.`, 401);
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (profileError) {
    if (/invalid api key/i.test(profileError.message)) {
      return jsonError("The server Supabase secret key is invalid or belongs to a different project.", 500);
    }
    return jsonError(`Could not verify admin access: ${profileError.message}`, 500);
  }
  if (adminProfile?.role !== "admin") return jsonError("Only a salon admin can add a stylist.", 403);

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role: "stylist" },
  });
  if (createError || !created.user) {
    const message = createError?.message ?? "Could not create the stylist login account.";
    if (/already (been )?registered|already exists|user already/i.test(message)) {
      return jsonError(
        "This email already has an account in Supabase Authentication. Auth accounts are separate from the public users and stylists tables; check Dashboard → Authentication → Users for this email.",
        409,
      );
    }
    return jsonError(message, 400);
  }

  // The app routes users by public.users.role; Auth metadata alone does not
  // create or update that application profile.
  const { error: userProfileError } = await supabase.from("users").upsert({
    user_id: created.user.id,
    full_name: name,
    email,
    phone: "",
    role: "stylist",
  }, { onConflict: "user_id" });
  if (userProfileError) {
    const { error: cleanupError } = await supabase.auth.admin.deleteUser(created.user.id);
    const cleanupMessage = cleanupError ? ` Account cleanup also failed: ${cleanupError.message}` : "";
    return jsonError(`Could not save the stylist login profile: ${userProfileError.message}.${cleanupMessage}`, 500);
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
    const { error: cleanupError } = await supabase.auth.admin.deleteUser(created.user.id);
    const cleanupMessage = cleanupError
      ? ` The login account could not be removed (${cleanupError.message}); check Dashboard → Authentication → Users before retrying.`
      : " The temporary login account was removed, so you can retry after fixing the profile error.";
    return jsonError(
      `Could not save the stylist profile: ${insertError?.message ?? "No row was returned."}.${cleanupMessage}`,
      500,
    );
  }

  return Response.json({ stylist }, { status: 201 });
}
