"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Message = { id: string; sender_id: string; recipient_id: string | null; body: string; created_at: string };
type Profile = { user_id: string; full_name: string | null; email: string | null };
const messagesTable = () => (supabase as any).from("messages");

export default function MessageCenter({ admin = false, onBack }: { admin?: boolean; onBack?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userId, setUserId] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null); // the salon admin's user_id
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Customer: look up the salon admin's user_id so we can set recipient_id
    if (!admin) {
      const { data: adminRow } = await supabase
        .from("users")
        .select("user_id")
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();
      setAdminId(adminRow?.user_id ?? null);
    }

    const query = admin
      ? messagesTable()
          .select("id, sender_id, recipient_id, body, created_at")
          .order("created_at", { ascending: true })
      : messagesTable()
          .select("id, sender_id, recipient_id, body, created_at")
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order("created_at", { ascending: true });

    const { data, error: loadError } = await query;
    if (loadError) { setError(loadError.message); return; }
    setMessages((data ?? []) as Message[]);

    if (admin) {
      const { data: people } = await supabase.from("users").select("user_id, full_name, email");
      setProfiles((people ?? []) as Profile[]);
    }
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, selectedId]);

  useEffect(() => { void loadMessages(); }, [admin]);

  useEffect(() => {
    const channel = supabase
      .channel(`salon-messages-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        void loadMessages();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [admin]);

  const conversations = useMemo(() => [
    ...new Set(
      messages
        .map(m => m.sender_id === userId ? m.recipient_id : m.sender_id)
        .filter((id): id is string => Boolean(id) && id !== userId)
    )
  ], [messages, userId]);

  const activeId = admin ? (selectedId || conversations[0] || "") : userId;

  const activeMessages = admin
    ? messages.filter(m => m.sender_id === activeId || m.recipient_id === activeId)
    : messages;

  const nameFor = (id: string) =>
    profiles.find(p => p.user_id === id)?.full_name ||
    profiles.find(p => p.user_id === id)?.email ||
    "Customer";

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !userId) return;
    if (admin && !activeId) return;

    // Customer must have admin's ID to send
    if (!admin && !adminId) {
      setError("Could not find the salon admin. Please try again later.");
      return;
    }

    setSending(true);
    setError("");

    const { error: sendError } = await messagesTable().insert({
      sender_id: userId,
      // Customer → admin (use admin's actual user_id as recipient)
      // Admin → customer (use the selected conversation's customer ID)
      recipient_id: admin ? activeId : adminId,
      body,
    });

    setSending(false);
    if (sendError) {
      setError(sendError.message);
      return;
    }
    setDraft("");
    await loadMessages();
  };

  const canSend = !sending && draft.trim().length > 0 && (admin ? Boolean(activeId) : Boolean(adminId));

  return (
    <div className={`message-center${admin ? " message-center-admin" : ""}`}>
      <div className="message-center-head">
        <div>
          <p className="landing-eyebrow">Support</p>
          <h1>{admin ? "Customer Messages" : "Message the Salon"}</h1>
          <p>{admin ? "Reply to customer questions and requests." : "Send a message directly to the salon team."}</p>
        </div>
        {onBack && <button className="btn-outline" onClick={onBack}>Back</button>}
      </div>

      <div className="message-center-layout">
        {/* Admin sidebar — conversation list */}
        {admin && (
          <aside className="message-thread-list">
            <p>CONVERSATIONS</p>
            {conversations.length === 0
              ? <span>No customer messages yet.</span>
              : conversations.map(id => (
                  <button
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className={id === activeId ? "active" : ""}
                  >
                    {nameFor(id)}
                  </button>
                ))
            }
          </aside>
        )}

        {/* Chat panel */}
        <section className="message-panel">
          <div className="message-panel-title">
            {admin ? (activeId ? nameFor(activeId) : "Choose a conversation") : "Salon Admin"}
          </div>

          {/* Message history */}
          <div className="message-history" ref={historyRef}>
            {activeMessages.length === 0
              ? <p className="message-empty">
                  {admin
                    ? "No messages in this conversation yet."
                    : "No messages yet. Send us a message below and we'll get back to you!"}
                </p>
              : activeMessages.map(message => (
                  <div
                    key={message.id}
                    className={`message-bubble ${message.sender_id === userId ? "mine" : "theirs"}`}
                  >
                    {admin && message.sender_id !== userId && (
                      <span className="message-sender-name">{nameFor(message.sender_id)}</span>
                    )}
                    <p>{message.body}</p>
                    <time>{new Date(message.created_at).toLocaleString()}</time>
                  </div>
                ))
            }
          </div>

          {/* Input form */}
          <form className="message-form" onSubmit={sendMessage}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={admin ? "Write a reply..." : "Write your message to the salon..."}
              maxLength={1000}
              disabled={(admin && !activeId) || (!admin && !adminId)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) sendMessage(e as unknown as FormEvent);
                }
              }}
            />
            <button className="btn-pink" type="submit" disabled={!canSend}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* No admin found warning (customer side) */}
          {!admin && !adminId && !error && (
            <p className="message-error">No salon admin account found. Please contact us directly.</p>
          )}

          {error && (
            <p className="message-error" role="alert">
              {error.includes("messages") || error.includes("relation")
                ? "Messaging needs to be set up in Supabase. Run supabase/messages.sql first."
                : error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
