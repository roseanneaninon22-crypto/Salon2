"use client";
import { useState } from "react";

type Props = { onLogin: (role: "user" | "admin", name: string, phone: string, username: string) => void };

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = email === "admin@salon.com" ? "admin" : "user";
    if (mode === "signup") {
      if (password !== confirmPassword) {
        setPassError("Passwords do not match.");
        return;
      }
      setPassError("");
      localStorage.setItem("salon_user", JSON.stringify({ name, username, phone, email }));
      setSignedUp(true);
    } else {
      try {
        const saved = localStorage.getItem("salon_user");
        if (saved) {
          const u = JSON.parse(saved);
          if (u.email === email) { onLogin(role, u.name, u.phone, u.username ?? ""); return; }
        }
      } catch {}
      onLogin(role, "", "", "");
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
      {/* ── LEFT: brand / image panel (website hero) ── */}
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            "rgba(0,0,0,0.55) 0%," +
            "rgba(0,0,0,0.25) 60%," +
            "rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
        }} />

        {/* brand tagline */}
        <div style={{ position: "relative", zIndex: 2, padding: "60px 56px", maxWidth: 560 }}>
          <div style={{ fontSize: 34, color: "#e8197d", lineHeight: 1, marginBottom: 10 }}>♛</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 2, background: "#e8197d" }} />
            <span style={{ fontSize: 34, fontWeight: 900, color: "#e8197d", letterSpacing: 3, textShadow: "0 0 24px rgba(232,25,125,0.55)" }}>
              ROSSEY GIRL
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
            <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.5)" }} />
            <span style={{ fontSize: 13, letterSpacing: 8, color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>SALON</span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 18, textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>
            Look Good.<br />Feel Great.<br /><span style={{ color: "#c9a84c" }}>Be Confident.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 420 }}>
            Book your appointment online in minutes — choose your service, pick your stylist, and let our experts take care of the rest.
          </p>
        </div>
      </div>

      {/* ── RIGHT: form panel ── */}
      <div style={{
        width: "100%",
        maxWidth: 520,
        minHeight: "100vh",
        background: "#0e0600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 48px",
        borderLeft: "1px solid rgba(201,168,76,0.12)",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

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
                <h2 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
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
                      <button type="button" onClick={() => setShowPass(s => !s)} style={{
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
                        <button type="button" onClick={() => setShowConfirmPass(s => !s)} style={{
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
                  <button type="submit" style={{
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

                  {/* OR + Google — login only */}
                  {mode === "login" && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.18)" }} />
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.18)" }} />
                      </div>
                      <button type="button" style={{
                        width: "100%", padding: "13px",
                        background: "rgba(0,0,0,0.5)",
                        border: "1.5px solid rgba(255,255,255,0.18)",
                        borderRadius: 12, color: "#fff",
                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        backdropFilter: "blur(4px)", transition: "background 0.2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.5)"}
                      >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Continue with Google
                      </button>
                    </>
                  )}
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
