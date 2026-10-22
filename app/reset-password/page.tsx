"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) {
        setCanReset(true);
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setCanReset(Boolean(session));
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const updatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setSuccess(true);
    setCanReset(false);
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "13px 14px", borderRadius: 10,
    border: "1px solid rgba(232,25,125,.45)", background: "rgba(255,255,255,.06)",
    color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, boxSizing: "border-box", background: "#100803", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "100%", maxWidth: 420, padding: "32px 28px", boxSizing: "border-box", borderRadius: 16, background: "#1b0e08", border: "1px solid rgba(255,255,255,.12)" }}>
        <h1 style={{ margin: "0 0 8px", color: "var(--pink, #e8197d)", fontSize: 24 }}>Reset Password</h1>
        {success ? (
          <>
            <p style={{ color: "rgba(255,255,255,.72)", lineHeight: 1.6 }}>Your password has been updated. You can now sign in with your new password.</p>
            <Link href="/" style={{ display: "block", marginTop: 22, padding: 14, borderRadius: 10, background: "linear-gradient(135deg, #e8197d, #c0156e)", color: "#fff", textAlign: "center", textDecoration: "none", fontWeight: 800 }}>Return to Log In</Link>
          </>
        ) : !ready ? (
          <p style={{ color: "rgba(255,255,255,.65)" }}>Checking your reset link…</p>
        ) : !canReset ? (
          <>
            <p style={{ color: "rgba(255,255,255,.72)", lineHeight: 1.6 }}>This password reset link is invalid or expired. Request a new one from the login page.</p>
            <Link href="/" style={{ display: "inline-block", marginTop: 12, color: "#ff4db8" }}>Back to Log In</Link>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 22px", color: "rgba(255,255,255,.65)", lineHeight: 1.5 }}>Choose a new password for your account.</p>
            {error && <p role="alert" style={{ padding: 10, borderRadius: 8, background: "rgba(232,25,125,.14)", color: "#ff8ab9", fontSize: 13 }}>{error}</p>}
            <form onSubmit={updatePassword} style={{ display: "grid", gap: 14 }}>
              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 600 }}>
                New password
                <input type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 600 }}>
                Confirm new password
                <input type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required style={inputStyle} />
              </label>
              <button type="submit" disabled={loading} style={{ marginTop: 4, padding: 14, border: 0, borderRadius: 10, background: loading ? "rgba(232,25,125,.5)" : "linear-gradient(135deg, #e8197d, #c0156e)", color: "#fff", fontWeight: 800, letterSpacing: 1.5, cursor: loading ? "wait" : "pointer" }}>
                {loading ? "UPDATING…" : "UPDATE PASSWORD"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
