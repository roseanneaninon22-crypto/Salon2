"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Message = { id: string; sender_id: string; recipient_id: string | null; body: string; created_at: string };
type Profile = { user_id: string; full_name: string | null; email: string | null };
const messagesTable = () => (supabase as any).from("messages");

export default function MessageCenter({ admin = false, onBack }: { admin?: boolean; onBack?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userId, setUserId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const query = admin
      ? messagesTable().select("id, sender_id, recipient_id, body, created_at").order("created_at", { ascending: true })
      : messagesTable().select("id, sender_id, recipient_id, body, created_at").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).order("created_at", { ascending: true });
    const { data, error: loadError } = await query;
    if (loadError) { setError(loadError.message); return; }
    setMessages((data ?? []) as Message[]);
    if (admin) {
      const { data: people } = await supabase.from("users").select("user_id, full_name, email");
      setProfiles((people ?? []) as Profile[]);
    }
  };

  useEffect(() => { void loadMessages(); }, [admin]);
  useEffect(() => {
    const channel = supabase.channel(`salon-messages-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => { void loadMessages(); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [admin]);

  const conversations = useMemo(() => [...new Set(messages.map(message => message.sender_id === userId ? message.recipient_id : message.sender_id).filter((id): id is string => Boolean(id)))], [messages, userId]);
  const activeId = admin ? (selectedId || conversations[0] || "") : userId;
  const activeMessages = admin ? messages.filter(message => message.sender_id === activeId || message.recipient_id === activeId) : messages;
  const nameFor = (id: string) => profiles.find(profile => profile.user_id === id)?.full_name || profiles.find(profile => profile.user_id === id)?.email || "Customer";

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !userId || (admin && !activeId)) return;
    setSending(true); setError("");
    const { error: sendError } = await messagesTable().insert({ sender_id: userId, recipient_id: admin ? activeId : null, body });
    setSending(false);
    if (sendError) { setError(sendError.message); return; }
    setDraft(""); await loadMessages();
  };

  return <div className={`message-center${admin ? " message-center-admin" : ""}`}>
    <div className="message-center-head"><div><p className="landing-eyebrow">Support</p><h1>{admin ? "Customer Messages" : "Message the Salon"}</h1><p>{admin ? "Reply to customer questions and requests." : "Send a message directly to the salon admin."}</p></div>{onBack && <button className="btn-outline" onClick={onBack}>Back</button>}</div>
    <div className="message-center-layout">
      {admin && <aside className="message-thread-list"><p>CONVERSATIONS</p>{conversations.length === 0 ? <span>No customer messages yet.</span> : conversations.map(id => <button key={id} onClick={() => setSelectedId(id)} className={id === activeId ? "active" : ""}>{nameFor(id)}</button>)}</aside>}
      <section className="message-panel"><div className="message-panel-title">{admin ? (activeId ? nameFor(activeId) : "Choose a conversation") : "Salon Admin"}</div><div className="message-history">{activeMessages.length === 0 ? <p className="message-empty">No messages yet. Start the conversation below.</p> : activeMessages.map(message => <div key={message.id} className={`message-bubble ${message.sender_id === userId ? "mine" : "theirs"}`}><p>{message.body}</p><time>{new Date(message.created_at).toLocaleString()}</time></div>)}</div><form className="message-form" onSubmit={sendMessage}><textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder={admin ? "Write a reply..." : "Write your message to the salon..."} maxLength={1000} disabled={admin && !activeId} /><button className="btn-pink" type="submit" disabled={sending || !draft.trim() || (admin && !activeId)}>{sending ? "Sending..." : "Send Message"}</button></form>{error && <p className="message-error">{error.includes("messages") ? "Messaging needs to be set up in Supabase. Run supabase/messages.sql first." : error}</p>}</section>
    </div>
  </div>;
}
