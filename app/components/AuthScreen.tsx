"use client";
import { useEffect, useState } from "react";

type Props = { onLogin: (role: "user" | "admin", name: string, phone: string, username: string) => void };

/* The registered profile is kept here so a returning visitor's full name and
   phone number can be restored when they log back in. */
export const USER_KEY = "salon_user";

type StoredUser = { name?: string; username?: string; phone?: string; email?: string };

function readStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

const EyeOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);


export default function AuthScreen({ onLogin }: Props) {

  const [mode, setMode]                       = useState<"login" | "signup">("login");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [name, setName]                       = useState("");
  const [username, setUsername]               = useState("");
  const [phone, setPhone]                     = useState("");
  const [showPass, setShowPass]               = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passError, setPassError]             = useState("");
  const [signedUp, setSignedUp]               = useState(false);

  /* Pre-fill the login form for a returning visitor so their registered
     details are ready to use. */
  useEffect(() => {
    const u = readStoredUser();
    if (!u) return;
    setEmail(prev => prev || u.email || "");
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = email === "admin@salon.com" ? "admin" : "user";
    if (mode === "signup") {
      if (password !== confirmPassword) {
        setPassError("Passwords do not match.");
        return;
      }
      setPassError("");
      localStorage.setItem(USER_KEY, JSON.stringify({ name, username, phone, email }));
      setSignedUp(true);
    } else {
      /* Look up the registered profile by email; if the email differs from the
         stored one, fall back to the stored profile so the reservation form
         still gets the registered full name and phone number. */
      const u = readStoredUser();
      const matched = u && u.email && u.email.toLowerCase() === email.trim().toLowerCase();
      const profile = matched ? u : u && !u.email ? u : null;
      onLogin(role, profile?.name ?? "", profile?.phone ?? "", profile?.username ?? "");
    }
  };

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "13px 46px 13px 44px",
    background: "rgba(0,0,0,0.55)",
    border: "1.5px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    backdropFilter: "blur(4px)",
    transition: "border-color 0.2s",
  };

  const labelSt: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    display: "block",
    marginBottom: 8,
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#000",
      display: "flex",
      fontFamily: "Arial, sans-serif",
    }}>
     
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
      }} className="auth-hero">
        {/* back.png fills panel */}
        <img src="/back.png" alt="" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center top",
          pointerEvents: "none", userSelect: "none",
        }} />
        {/* gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(to right," +
            "rgba(0,0,0,0.62) 0%," +
            "rgba(0,0,0,0.5) 55%," +
            "rgba(0,0,0,0.72) 100%)",
          pointerEvents: "none",
        }} />

        {/* brand tagline */}
        <div style={{ position: "relative", zIndex: 2, padding: "60px 56px 60px 56px", maxWidth: 560 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ fontSize: 26, color: "#e8197d", lineHeight: 1, marginLeft: 2 }}>♛</div>
            <span style={{ fontSize: 34, fontWeight: 900, color: "#e8197d", letterSpacing: 3, textShadow: "0 0 24px rgba(232,25,125,0.55)" }}>
              ROSSEY GIRL
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36 }}>
            <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.5)" }} />
            <span style={{ fontSize: 13, letterSpacing: 8, color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>SALON</span>
            <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.5)" }} />
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: "#e8e2d9", lineHeight: 1.2, marginBottom: 18, textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>
            Look Good.<br />Feel Great.<br /><span style={{ color: "#c9a84c" }}>Be Confident.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 420 }}>
            Book your appointment online in minutes — choose your service, pick your stylist, and let our experts take care of the rest.
          </p>
        </div>
      </div>

      {/* ── RIGHT: form panel (card) ── */}
      <div style={{
        width: "100%",
        maxWidth: 560,
        minHeight: "100vh",
        background: "#170d06",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 460,
          minHeight: 470,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(160deg,#241710 0%,#1a0f07 100%)",
          border: "1.5px solid rgba(201,168,76,0.35)",
          borderRadius: 22,
          padding: "44px 44px 48px",
          boxShadow: "0 24px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 44px rgba(232,25,125,0.10)",
        }}>

          {/* ── SUCCESS screen ── */}
          {signedUp ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center",
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "linear-gradient(135deg,#e8197d,#c0156e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 44, color: "#fff",
                boxShadow: "0 8px 32px rgba(232,25,125,0.55)",
                marginBottom: 28,
              }}>✓</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12, lineHeight: 1.3 }}>
                Account Created Successfully!
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 36 }}>
                Your account has been created.<br />Please log in now to continue.
              </p>
              <button onClick={() => {
                setSignedUp(false);
                setMode("login");
                setPassword("");
                setConfirmPassword("");
              }} style={{
                width: "100%", padding: "15px", marginTop: 12,
                background: "linear-gradient(135deg,#e8197d,#c0156e)",
                border: "none", borderRadius: 12,
                color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: 2,
                cursor: "pointer", boxShadow: "0 6px 28px rgba(232,25,125,0.5)",
              }}>
                LOG IN NOW
              </button>
            </div>
          ) : (
            <>
              {/* ── form area ── */}
              <div>
                <h2 style={{ fontSize: 30, fontWeight: 800, color: "#e8e2d9", margin: "0 0 8px" }}>
                  {mode === "login" ? "Welcome Back!" : "Create Account"}
                </h2>
                <p style={{ fontSize: 14, color: "rgba(245,230,208,0.55)", marginBottom: 28, lineHeight: 1.55 }}>
                  {mode === "login"
                    ? "Sign in to continue managing your salon appointments."
                    : "Join us and book your perfect salon experience today."}
                </p>

                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  {/* signup-only */}
                  {mode === "signup" && (
                    <>
                      {/* Full Name */}
                      <div>
                        <label style={labelSt}>Full Name</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#e8197d", pointerEvents: "none", zIndex: 1 }}>👤</span>
                          <input suppressHydrationWarning style={inp}
                            placeholder="Enter your name" value={name}
                            onChange={e => setName(e.target.value)} required
                            onFocus={e => e.currentTarget.style.borderColor = "#e8197d"}
                            onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"}
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label style={labelSt}>Phone Number</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#e8197d", pointerEvents: "none", zIndex: 1 }}>📱</span>
                          <input suppressHydrationWarning style={inp}
                            placeholder="Enter your phone" value={phone}
                            onChange={e => setPhone(e.target.value)} required
                            onFocus={e => e.currentTarget.style.borderColor = "#e8197d"}
                            onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div>
                    <label style={labelSt}>Email</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#e8197d", pointerEvents: "none", zIndex: 1 }}>✉️</span>
                      <input suppressHydrationWarning type="email" style={inp}
                        placeholder="Enter your email" value={email}
                        onChange={e => setEmail(e.target.value)} required
                        onFocus={e => e.currentTarget.style.borderColor = "#e8197d"}
                        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"}
                      />
                    </div>
                  </div>

                  {/* Username — signup only */}
                  {mode === "signup" && (
                    <div>
                      <label style={labelSt}>Username</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#e8197d", pointerEvents: "none", zIndex: 1 }}>🪪</span>
                        <input suppressHydrationWarning style={inp}
                          placeholder="Enter your username" value={username}
                          onChange={e => setUsername(e.target.value)} required
                          onFocus={e => e.currentTarget.style.borderColor = "#e8197d"}
                          onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label style={labelSt}>Password</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#e8197d", pointerEvents: "none", zIndex: 1 }}>🔒</span>
                      <input suppressHydrationWarning
                        type={showPass ? "text" : "password"}
                        style={inp}
                        placeholder="Enter your password" value={password}
                        onChange={e => setPassword(e.target.value)} required
                        onFocus={e => e.currentTarget.style.borderColor = "#e8197d"}
                        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"}
                      />
                      <button suppressHydrationWarning type="button" onClick={() => setShowPass(s => !s)} style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.45)", padding: 0, display: "flex",
                      }}>
                        {showPass ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password — signup only */}
                  {mode === "signup" && (
                    <div>
                      <label style={labelSt}>Confirm Password</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#e8197d", pointerEvents: "none", zIndex: 1 }}>🔒</span>
                        <input suppressHydrationWarning
                          type={showConfirmPass ? "text" : "password"}
                          style={{ ...inp, borderColor: passError ? "#e8197d" : "rgba(255,255,255,0.18)" }}
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); setPassError(""); }}
                          required
                          onFocus={e => e.currentTarget.style.borderColor = "#e8197d"}
                          onBlur={e => e.currentTarget.style.borderColor = passError ? "#e8197d" : "rgba(255,255,255,0.18)"}
                        />
                        <button suppressHydrationWarning type="button" onClick={() => setShowConfirmPass(s => !s)} style={{
                          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer",
                          color: "rgba(255,255,255,0.45)", padding: 0, display: "flex",
                        }}>
                          {showConfirmPass ? <EyeOff /> : <EyeOpen />}
                        </button>
                      </div>
                      {passError && (
                        <p style={{ fontSize: 12, color: "#e8197d", marginTop: 6, marginLeft: 2 }}>
                          ⚠ {passError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Forgot password — login only */}
                  {mode === "login" && (
                    <div style={{ textAlign: "right", marginTop: -6 }}>
                      <span style={{ fontSize: 13, color: "#e8197d", cursor: "pointer", fontWeight: 600 }}>
                        Forgot Password?
                      </span>
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" suppressHydrationWarning style={{
                    width: "100%", padding: "15px", marginTop: 2,
                    background: "linear-gradient(135deg,#e8197d,#c0156e)",
                    border: "none", borderRadius: 12, color: "#fff",
                    fontSize: 15, fontWeight: 800, letterSpacing: 2,
                    cursor: "pointer", boxShadow: "0 6px 28px rgba(232,25,125,0.5)",
                    transition: "opacity 0.2s, transform 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {mode === "login" ? "LOG IN" : "SIGN UP"}
                  </button>

                </form>

                {/* switch mode */}
                <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "rgba(245,230,208,0.45)" }}>
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <span style={{ color: "#e8197d", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                    {mode === "login" ? "Sign Up" : "Log In"}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
