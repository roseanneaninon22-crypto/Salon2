"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import SalonLogo from "./SalonLogo";

type AppRole = "user" | "admin" | "stylist";
type Props = {
  onLogin: (role: AppRole) => void;
  onClose?: () => void;
  initialMode?: "login" | "signup";
  modal?: boolean;
};

async function getAppRole(userId: string) {
  const { data: profile } = await supabase.from("users").select("role").eq("user_id", userId).maybeSingle();
  if (profile?.role === "admin") return "admin" as const;
  if (profile?.role === "stylist") return "stylist" as const;
  const { data: stylist } = await supabase.from("stylists").select("id").eq("user_id", userId).maybeSingle();
  return stylist ? "stylist" as const : "user" as const;
}

function formatOtpSendError(error: { message: string; status?: number; code?: string }) {
  if (error.status === 500) {
    return "Supabase could not send the email code (Auth error 500). Check that Custom SMTP is enabled, then inspect the matching Auth Log for the SMTP or template error.";
  }
  if (error.status === 429) return "Too many email code requests. Wait before requesting another code.";
  return `${error.message}${error.code ? ` (${error.code})` : ""}`;
}

export default function AuthScreen({ onLogin, onClose, initialMode = "login", modal = false }: Props) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const compactCard = modal;
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds(seconds => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds > 0]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (otpSent && otp.some(digit => !/^\d$/.test(digit))) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login" && loginMethod === "password") {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (loginError) setError(loginError.message);
        else if (data.user) {
          onLogin(await getAppRole(data.user.id));
        }
      } else if (!otpSent) {
        const normalizedEmail=email.trim().toLowerCase();
        const {error:sendError}=await supabase.auth.signInWithOtp({email:normalizedEmail,options:{shouldCreateUser:mode==="signup",...(mode==="signup"?{data:{full_name:name.trim(),phone,role:"user"}}:{})}});
        if(sendError) setError(formatOtpSendError(sendError)); else {setOtpSent(true);setResendSeconds(60);setSuccess("A one-time code was sent to "+normalizedEmail+".");}
      } else {
        const {data,error:verifyError}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:otp.join(""),type:"email"});
        if(verifyError) setError(verifyError.message); else if(data.user) {
          const role = await getAppRole(data.user.id);
          // Use the application profile or stylist assignment to choose the dashboard.
          onLogin(role);
        }
      }
    } catch {setError("Something went wrong. Please try again.");}
    setLoading(false);
  };
  const resendOtp=async()=>{
    setError("");setSuccess("");setLoading(true);
    const {error:sendError}=await supabase.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{shouldCreateUser:mode==="signup",...(mode==="signup"?{data:{full_name:name.trim(),phone,role:"user"}}:{})}});
    if(sendError)setError(formatOtpSendError(sendError));else {setResendSeconds(60);setSuccess("A new one-time code was sent to "+email.trim()+".");}
    setLoading(false);
  };

  const updateOtp = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setOtp(current => current.map((digit, position) => position === index ? "" : digit));
      return;
    }

    setOtp(current => {
      const next = [...current];
      digits.slice(0, 6 - index).split("").forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      return next;
    });
    otpInputs.current[Math.min(index + digits.length, 5)]?.focus();
  };

  const clearOtp = () => setOtp(["", "", "", "", "", ""]);

  const inputStyle = {
    width: "100%", padding: "14px 14px 14px 42px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(232,25,125,0.4)",
    borderRadius: 12, color: "#fff", fontSize: 14, outline: "none",
  };

  return (
    <div className={modal ? "auth-modal-overlay" : undefined} role={modal ? "dialog" : undefined} aria-modal={modal || undefined} style={{
      ...(modal ? {
        position: "fixed" as const, inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,.78)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
        overflowY: "auto" as const,
      } : {}),
      minHeight: "100vh", width: "100%", boxSizing: "border-box",
      background: modal ? "rgba(0,0,0,.78)" : "#100803",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: modal ? 16 : 0,
    }}>
      <div className={`auth-layout${modal ? " auth-modal-layout" : ""}${compactCard ? " auth-card-only" : ""}`} style={{
        width: modal ? (compactCard ? "min(100%, 440px)" : "min(100%, 980px)") : "100%", maxWidth: modal ? (compactCard ? 440 : 980) : "none", minHeight: modal ? (compactCard ? "0" : "min(680px, calc(100vh - 32px))") : "100vh",
        display: "grid", gridTemplateColumns: compactCard ? "1fr" : "1.15fr 0.85fr",
        background: "#170b05", borderRadius: modal ? 18 : 0,
        border: modal ? "1px solid rgba(201,168,76,.38)" : "none",
        overflow: "hidden",
        position: "relative",
        boxShadow: modal ? "0 24px 90px rgba(0,0,0,.6)" : "none",
      }}>
        {modal && onClose && <button type="button" onClick={onClose} aria-label="Close sign in" className="auth-modal-close">×</button>}
        {!compactCard && <section className="auth-hero" style={{ minHeight: 600, display: "flex", alignItems: "center", padding: "48px 52px", backgroundImage: "linear-gradient(90deg, rgba(8,5,2,.72), rgba(8,5,2,.18)), linear-gradient(0deg, rgba(8,5,2,.58), transparent 70%), url('/back.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div style={{ maxWidth: 420 }}>
            <div style={{ marginBottom: 50 }}><SalonLogo /></div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 42px)", lineHeight: 1.12, fontWeight: 850, color: "#fff", margin: 0 }}>Look Good.<br />Feel Great.<br /><span style={{ color: "#f2c94c" }}>Be Confident.</span></h2>
            <p style={{ maxWidth: 310, color: "rgba(255,255,255,.75)", fontSize: 13, lineHeight: 1.65, marginTop: 18 }}>Book your appointment online in minutes — choose your service, pick your stylist, and let our experts take care of the rest.</p>
          </div>
        </section>}
        <section className="auth-form-panel" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: compactCard ? "0" : "40px 32px", background: "#170b05" }}>
        <div style={{ width: "100%", maxWidth: 390, padding: compactCard ? "28px 30px" : "28px 24px", background: compactCard ? "transparent" : "rgba(25,14,8,.88)", borderRadius: 16, border: compactCard ? "0" : "1px solid rgba(255,255,255,.12)", boxShadow: compactCard ? "none" : "0 20px 60px rgba(0,0,0,.28)" }}>
        {/* Decorative right side */}
        <div style={{ display: "none",
          position: "absolute", top: 0, right: 0,
          width: "55%", height: 260,
          background: "linear-gradient(135deg, transparent 0%, rgba(180,80,20,0.18) 50%, rgba(120,50,10,0.35) 100%)",
          borderRadius: "0 24px 0 60%", overflow: "hidden", zIndex: 0,
        }}>
          <div style={{ position: "absolute", bottom: -10, right: 10, fontSize: 160, lineHeight: 1, opacity: 0.22, filter: "sepia(1) saturate(0.5) brightness(0.7)" }}>👩</div>
        </div>

        <div style={{ position: "relative", zIndex: 1, padding: 0 }}>
          {/* Brand */}
          <div style={{ display: "none", textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>👑</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 2 }}>
              <div style={{ height: 1, width: 30, background: "var(--pink)" }} />
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--pink)", letterSpacing: 2, lineHeight: 1 }}>ROSSEY GIRL</h1>
              <div style={{ height: 1, width: 30, background: "var(--pink)" }} />
            </div>
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
                {loginMethod === "otp" ? "Enter your email to get a one-time sign-in code." : "Sign in with the email and password assigned by your admin."}
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Create Account</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.5 }}>
                Create an account with your email<br />and a one-time code.
              </p>
            </>
          )}

          {/* Error / success message */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 12,
              background: error.startsWith("✅") ? "rgba(76,175,80,0.15)" : "rgba(232,25,125,0.15)",
              border: `1px solid ${error.startsWith("✅") ? "rgba(76,175,80,0.4)" : "rgba(232,25,125,0.4)"}`,
              color: error.startsWith("✅") ? "#4caf50" : "#ff6b9d",
            }}>
              {error}
            </div>
          )}
          {success && (
            <div role="status" style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 12, background: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.4)", color: "#8bd39a" }}>
              {success}
            </div>
          )}

          {mode === "login" && !otpSent && (
            <button type="button" onClick={() => { setLoginMethod(loginMethod === "otp" ? "password" : "otp"); setPassword(""); setError(""); setSuccess(""); }} style={{ padding: 0, margin: "0 0 16px", border: 0, background: "none", color: "var(--pink)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {loginMethod === "otp" ? "Use email and password instead" : "Use a one-time email code instead"}
            </button>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!otpSent && mode === "signup" && <>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Full Name</label>
                <input suppressHydrationWarning style={inputStyle} placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Phone Number</label>
                <input suppressHydrationWarning style={inputStyle} placeholder="Enter your phone" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </>}
            {!otpSent && <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Email</label>
              <input suppressHydrationWarning type="email" style={inputStyle} placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>}
            {mode === "login" && loginMethod === "password" && !otpSent && <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Password</label>
              <input suppressHydrationWarning type="password" autoComplete="current-password" style={inputStyle} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>}
            {otpSent && <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>Email code</label>
              <div style={{ display: "flex", gap: 8 }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={element => { otpInputs.current[index] = element; }}
                    suppressHydrationWarning
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    aria-label={`OTP digit ${index + 1} of 6`}
                    maxLength={1}
                    value={digit}
                    onChange={event => updateOtp(index, event.target.value)}
                    onPaste={event => {
                      event.preventDefault();
                      updateOtp(index, event.clipboardData.getData("text"));
                    }}
                    onKeyDown={event => {
                      if (event.key === "Backspace" && !digit && index > 0) otpInputs.current[index - 1]?.focus();
                      if (event.key === "ArrowLeft" && index > 0) otpInputs.current[index - 1]?.focus();
                      if (event.key === "ArrowRight" && index < 5) otpInputs.current[index + 1]?.focus();
                    }}
                    style={{
                      width: 48, height: 54, boxSizing: "border-box", padding: 0,
                      border: "1.5px solid rgba(232,25,125,0.55)", borderRadius: 10,
                      background: "rgba(255,255,255,0.05)", color: "#fff",
                      fontSize: 22, fontWeight: 700, textAlign: "center", outline: "none",
                    }}
                    required
                  />
                ))}
              </div>
            </div>}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "15px",
              background: loading ? "rgba(232,25,125,0.4)" : "linear-gradient(135deg, #e8197d, #c0156e)",
              border: "none", borderRadius: 12, color: "#fff",
              fontSize: 15, fontWeight: 800, letterSpacing: 2,
              cursor: loading ? "not-allowed" : "pointer", marginTop: 4,
              boxShadow: "0 4px 20px rgba(232,25,125,0.4)",
            }}>
              {loading ? "Please wait..." : otpSent ? "VERIFY CODE" : mode === "login" ? (loginMethod === "password" ? "SIGN IN" : "SEND SIGN-IN CODE") : "SEND SIGN-UP CODE"}
            </button>

          </form>

          {otpSent && <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 12 }}>
            <button type="button" onClick={resendOtp} disabled={loading || resendSeconds > 0} style={{ padding: 0, border: 0, background: "none", color: resendSeconds > 0 ? "rgba(255,255,255,.45)" : "var(--pink)", cursor: loading || resendSeconds > 0 ? "not-allowed" : "pointer" }}>
              {resendSeconds > 0 ? `Resend code in 00:${String(resendSeconds).padStart(2, "0")}` : "Resend code"}
            </button>
            <button type="button" onClick={() => { setOtpSent(false); setResendSeconds(0); clearOtp(); setSuccess(""); setError(""); }} style={{ padding: 0, border: 0, background: "none", color: "rgba(255,255,255,.65)", cursor: "pointer" }}>Change email</button>
          </div>}

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: "var(--pink)", fontWeight: 700, cursor: "pointer" }}
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setLoginMethod("otp"); setPassword(""); setOtpSent(false); setResendSeconds(0); clearOtp(); setError(""); setSuccess(""); }}>
              {mode === "login" ? "Sign Up" : "Log In"}
            </span>
          </p>
        </div>
        </div>
        </section>
      </div>
    </div>
  );
}
