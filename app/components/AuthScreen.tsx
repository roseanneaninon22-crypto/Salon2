"use client";
import { useState } from "react";

type Props = { onLogin: (role: "user" | "admin") => void };

export default function AuthScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email === "admin@salon.com" ? "admin" : "user");
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "linear-gradient(135deg, #0a0500 0%, #1a0800 40%, #2a0f00 70%, #0a0500 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px 16px",
    }}>
      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: "rgba(10,5,0,0.82)",
        borderRadius: 24,
        border: "1px solid rgba(232,25,125,0.18)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Woman image area — right side decorative */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "55%", height: 260,
          background: "linear-gradient(135deg, transparent 0%, rgba(180,80,20,0.18) 50%, rgba(120,50,10,0.35) 100%)",
          borderRadius: "0 24px 0 60%",
          overflow: "hidden",
          zIndex: 0,
        }}>
          {/* Simulated woman silhouette with CSS */}
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: "100%", height: "100%",
            background: "radial-gradient(ellipse at 70% 30%, rgba(200,120,60,0.25) 0%, transparent 60%)",
          }} />
          <div style={{
            position: "absolute", bottom: -10, right: 10,
            fontSize: 160, lineHeight: 1, opacity: 0.22,
            filter: "sepia(1) saturate(0.5) brightness(0.7)",
          }}>👩</div>
        </div>

        <div style={{ position: "relative", zIndex: 1, padding: "32px 28px 28px" }}>
          {/* Crown + Brand */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>👑</div>
            {/* Lines beside ROSSEY GIRL */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 2 }}>
              <div style={{ height: 1, width: 30, background: "var(--pink)" }} />
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--pink)", letterSpacing: 2, lineHeight: 1 }}>ROSSEY GIRL</h1>
              <div style={{ height: 1, width: 30, background: "var(--pink)" }} />
            </div>
            {/* SALON with lines */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ height: 1, flex: 1, maxWidth: 50, background: "rgba(255,255,255,0.25)" }} />
              <p style={{ fontSize: 12, letterSpacing: 6, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>SALON</p>
              <div style={{ height: 1, flex: 1, maxWidth: 50, background: "rgba(255,255,255,0.25)" }} />
            </div>
          </div>

          {mode === "login" ? (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Welcome Back!</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.5 }}>
                Sign in to continue managing<br />your salon appointments.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Create Account</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.5 }}>
                Join us and book your perfect<br />salon experience today.
              </p>
            </>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <>
                {/* Full Name */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--pink)", fontSize: 16 }}>👤</span>
                    <input suppressHydrationWarning
                      style={{
                        width: "100%", padding: "14px 14px 14px 42px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1.5px solid rgba(232,25,125,0.4)",
                        borderRadius: 12, color: "#fff", fontSize: 14, outline: "none",
                      }}
                      placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required
                      onFocus={e => e.currentTarget.style.borderColor = "var(--pink)"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(232,25,125,0.4)"}
                    />
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Phone Number</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--pink)", fontSize: 16 }}>📱</span>
                    <input suppressHydrationWarning
                      style={{
                        width: "100%", padding: "14px 14px 14px 42px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1.5px solid rgba(232,25,125,0.4)",
                        borderRadius: 12, color: "#fff", fontSize: 14, outline: "none",
                      }}
                      placeholder="Enter your phone" value={phone} onChange={e => setPhone(e.target.value)} required
                      onFocus={e => e.currentTarget.style.borderColor = "var(--pink)"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(232,25,125,0.4)"}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Email</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--pink)", fontSize: 16 }}>✉️</span>
                <input suppressHydrationWarning type="email"
                  style={{
                    width: "100%", padding: "14px 14px 14px 42px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1.5px solid rgba(232,25,125,0.4)",
                    borderRadius: 12, color: "#fff", fontSize: 14, outline: "none",
                  }}
                  placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required
                  onFocus={e => e.currentTarget.style.borderColor = "var(--pink)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(232,25,125,0.4)"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--pink)", fontSize: 16 }}>🔒</span>
                <input suppressHydrationWarning type={showPass ? "text" : "password"}
                  style={{
                    width: "100%", padding: "14px 44px 14px 42px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1.5px solid rgba(232,25,125,0.4)",
                    borderRadius: 12, color: "#fff", fontSize: 14, outline: "none",
                  }}
                  placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required
                  onFocus={e => e.currentTarget.style.borderColor = "var(--pink)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(232,25,125,0.4)"}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.4)", padding: 0 }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div style={{ textAlign: "right", marginTop: -8 }}>
                <span style={{ fontSize: 13, color: "var(--pink)", cursor: "pointer", fontWeight: 600 }}>Forgot Password?</span>
              </div>
            )}

            {/* LOG IN / SIGN UP button */}
            <button type="submit" style={{
              width: "100%", padding: "15px",
              background: "linear-gradient(135deg, #e8197d, #c0156e)",
              border: "none", borderRadius: 12, color: "#fff",
              fontSize: 15, fontWeight: 800, letterSpacing: 2,
              cursor: "pointer", marginTop: 4,
              boxShadow: "0 4px 20px rgba(232,25,125,0.4)",
              transition: "opacity 0.2s",
            }}>
              {mode === "login" ? "LOG IN" : "SIGN UP"}
            </button>

            {mode === "login" && (
              <>
                {/* OR divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
                </div>

                {/* Google button */}
                <button type="button" style={{
                  width: "100%", padding: "13px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 12, color: "#fff",
                  fontSize: 14, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                  {/* Google G icon */}
                  <svg width="20" height="20" viewBox="0 0 48 48">
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

          {/* Switch mode */}
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: "var(--pink)", fontWeight: 700, cursor: "pointer" }}
              onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Sign Up" : "Log In"}
            </span>
          </p>

          {mode === "login" && (
            <p style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
              Admin demo: admin@salon.com / any password
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
