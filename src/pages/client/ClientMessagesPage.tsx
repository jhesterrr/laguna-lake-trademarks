import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send, CheckCheck, ArrowLeft, Paperclip, X, Reply,
  Download, ZoomIn, Smile, Image as ImageIcon, FileText,
  MoreVertical, Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAdminStore } from "@/store/adminStore";

/* ─── helpers ─────────────────────────────────────────── */
function fmtTime(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDay(iso: string | null | undefined) {
  if (!iso) return "Today";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

const EMOJIS = ["😊","👍","🙏","✅","📄","📋","⚖️","🔔","💼","❓","🎉","❤️","😂","🤔","👋","🚀","💡","⏰","📅","✨"];

/* ─── Lightbox ──────────────────────────────────────── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={onClose}>
        <X className="w-7 h-7" />
      </button>
      <img
        src={src}
        alt="Preview"
        className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ─── MessageBubble ──────────────────────────────────── */
function MessageBubble({
  msg,
  isOwn,
  onReply,
  onDelete,
  onOpenImage,
}: {
  msg: any;
  isOwn: boolean;
  onReply: (msg: any) => void;
  onDelete: (id: string) => void;
  onOpenImage: (url: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { adminProfile } = useAdminStore();

  if (msg.sender_role === "system") {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-slate-200 text-slate-500 text-xs px-4 py-1.5 rounded-full">{msg.content}</div>
      </div>
    );
  }

  const isAdmin = msg.sender_role === "admin";

  return (
    <div
      className={cn("flex gap-2.5 group", isOwn ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setMenuOpen(false); }}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 self-end mb-1",
        isAdmin ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
      )}>
        {isAdmin ? "A" : (msg.sender_name?.charAt(0)?.toUpperCase() || "Y")}
      </div>

      <div className={cn("flex flex-col max-w-[72%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-[11px] text-slate-400 font-medium mb-0.5 px-1">
            {isAdmin ? adminProfile.name : msg.sender_name}
          </span>
        )}

        {/* Reply quote */}
        {msg.reply_to_content && (
          <div className={cn(
            "flex items-start gap-2 px-3 py-2 mb-1 rounded-xl text-xs border-l-4 max-w-full",
            isOwn
              ? "bg-blue-500/20 border-blue-300 text-blue-100"
              : "bg-slate-100 border-slate-300 text-slate-500"
          )}>
            <Reply className="w-3 h-3 shrink-0 mt-0.5 opacity-60" />
            <div className="min-w-0">
              <div className="font-semibold">{msg.reply_to_sender}</div>
              <div className="truncate opacity-80">{msg.reply_to_content}</div>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
          isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md"
        )}>
          {/* Attachment */}
          {msg.attachment_url && (
            <div className="mb-2">
              {msg.attachment_type === "image" ? (
                <div
                  className="relative cursor-pointer group/img"
                  onClick={() => onOpenImage(msg.attachment_url)}
                >
                  <img
                    src={msg.attachment_url}
                    alt="attachment"
                    className="rounded-xl max-w-[220px] max-h-[180px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 rounded-xl flex items-center justify-center transition-colors">
                    <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <a
                  href={msg.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
                    isOwn
                      ? "bg-white/20 hover:bg-white/30 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[140px]">{msg.attachment_name || "Attachment"}</span>
                  <Download className="w-3 h-3 shrink-0 ml-auto" />
                </a>
              )}
            </div>
          )}
          {msg.content && <span>{msg.content}</span>}
        </div>

        {/* Meta */}
        <div className={cn("flex items-center gap-1.5 mt-0.5 px-1", isOwn ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[10px] text-slate-400">{fmtTime(msg.created_at)}</span>
          {isOwn && <CheckCheck className="w-3 h-3 text-blue-400" />}

          {/* Action buttons */}
          <div className={cn("flex items-center gap-0.5 transition-opacity", hover ? "opacity-100" : "opacity-0")}>
            <button
              onClick={() => onReply(msg)}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-blue-500 transition-colors"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
            {isOwn && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {menuOpen && (
                  <div className={cn(
                    "absolute bottom-full mb-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 min-w-[120px]",
                    isOwn ? "right-0" : "left-0"
                  )}>
                    <button
                      onClick={() => { onReply(msg); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      <Reply className="w-3.5 h-3.5" /> Reply
                    </button>
                    <button
                      onClick={() => { onDelete(msg.id); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Date divider ───────────────────────────────────── */
function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-[11px] text-slate-400 font-medium">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function ClientMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [userName, setUserName] = useState("You");
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [pendingFile, setPendingFile] = useState<{ file: File; preview: string; type: "image" | "file" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const { adminProfile } = useAdminStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  /* ── Init: get session + thread ── */
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      setUserName(session.user.user_metadata?.full_name || session.user.email || "You");

      // Find thread by client_id
      let { data: threads } = await supabase
        .from("threads")
        .select("*")
        .eq("client_id", session.user.id)
        .order("last_message_at", { ascending: false })
        .limit(1);

      // Fallback: find by email
      if (!threads || threads.length === 0) {
        const { data: emailThreads } = await supabase
          .from("threads")
          .select("*")
          .eq("client_email", session.user.email)
          .order("last_message_at", { ascending: false })
          .limit(1);

        if (emailThreads && emailThreads.length > 0) {
          threads = emailThreads;
          // Auto-link
          await supabase.from("threads").update({ client_id: session.user.id }).eq("id", emailThreads[0].id);
          await supabase.from("cases").update({ client_id: session.user.id }).eq("client_email", session.user.email);
        } else {
          // Auto-create thread if none exists
          const { data: newThread } = await supabase
            .from("threads")
            .insert({
              id: String(Date.now()),
              client_id: session.user.id,
              client_email: session.user.email,
              client_name: session.user.user_metadata?.full_name || session.user.email || "Unknown",
              status: "active",
            })
            .select()
            .single();

          if (newThread) {
            threads = [newThread];
          }
        }
      }

      if (threads && threads.length > 0) {
        setThreadId(threads[0].id);
      }
      setLoading(false);
    }
    init();
  }, []);

  /* ── Load messages + realtime ── */
  const loadMessages = useCallback(async (tid: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", tid)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  }, []);

  useEffect(() => {
    if (!threadId) return;
    loadMessages(threadId);

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`client-thread-${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [threadId, loadMessages]);

  /* ── Scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  /* ── File select ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    setPendingFile({ file, preview: isImage ? URL.createObjectURL(file) : "", type: isImage ? "image" : "file" });
    e.target.value = "";
  };

  /* ── Send ── */
  const sendMessage = async () => {
    const content = input.trim();
    if ((!content && !pendingFile) || !threadId || sending) return;
    setSending(true);

    let attachmentUrl: string | null = null;
    let attachmentType: "image" | "file" | null = null;
    let attachmentName: string | null = null;

    if (pendingFile) {
      setUploading(true);
      const ext = pendingFile.file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("message-attachments").upload(path, pendingFile.file, { cacheControl: "3600" });
      setUploading(false);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("message-attachments").getPublicUrl(path);
        attachmentUrl = publicUrl;
        attachmentType = pendingFile.type;
        attachmentName = pendingFile.file.name;
      }
    }

    const now = new Date().toISOString();
    const optimisticMsg = {
      id: String(Date.now()),
      thread_id: threadId,
      sender_name: userName,
      sender_role: "client",
      content,
      created_at: now,
      reply_to_content: replyTo?.content ?? null,
      reply_to_sender: replyTo?.sender_name ?? null,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    setReplyTo(null);
    setPendingFile(null);
    setSending(false);

    try {
      await supabase.from("messages").insert({
        id: optimisticMsg.id,
        thread_id: threadId,
        sender_name: userName,
        sender_role: "client",
        content,
        reply_to_id: replyTo?.id ?? null,
        reply_to_content: replyTo?.content ?? null,
        reply_to_sender: replyTo?.sender_name ?? null,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
      });
      await supabase.from("threads").update({ last_message_at: now }).eq("id", threadId);
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  /* ── Delete own message ── */
  const handleDelete = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await supabase.from("messages").delete().eq("id", id);
  };

  /* ── Group by date ── */
  const grouped: { label: string; msgs: any[] }[] = [];
  messages.forEach((msg) => {
    const label = fmtDay(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.label === label) last.msgs.push(msg);
    else grouped.push({ label, msgs: [msg] });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      <div className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl animate-fade-in">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
            <p className="text-sm text-slate-500 mt-0.5">Your private thread with the attorney</p>
          </div>
          <Link to="/client/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{adminProfile.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold leading-tight">{adminProfile.name}</h3>
              <p className="text-blue-100 text-xs">{adminProfile.firm} · ● Available</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-slate-50/30">
            {!threadId && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <Send className="w-7 h-7 text-blue-300" />
                </div>
                <p className="text-sm text-center text-slate-400 max-w-xs">
                  No active thread yet. The attorney will open a thread once they review your case.
                </p>
              </div>
            )}

            {grouped.map(({ label, msgs }) => (
              <div key={label}>
                <DateDivider label={label} />
                <div className="space-y-2">
                  {msgs.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isOwn={msg.sender_role === "client"}
                      onReply={setReplyTo}
                      onDelete={handleDelete}
                      onOpenImage={setLightboxSrc}
                    />
                  ))}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-end pr-10">
                <div className="bg-blue-100 px-4 py-2 rounded-2xl text-sm text-blue-400 animate-pulse">Sending…</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {threadId && (
            <div className="border-t border-slate-100 bg-white">
              {/* Reply bar */}
              {replyTo && (
                <div className="flex items-center gap-3 px-4 pt-3">
                  <div className="flex-1 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs">
                    <Reply className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-semibold text-blue-600">
                        {replyTo.sender_role === "admin" ? adminProfile.name : replyTo.sender_name}
                      </div>
                      <div className="text-slate-500 truncate">{replyTo.content || "📎 Attachment"}</div>
                    </div>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Pending file */}
              {pendingFile && (
                <div className="flex items-center gap-3 px-4 pt-3">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs flex-1 min-w-0">
                    {pendingFile.type === "image" ? (
                      <>
                        <img src={pendingFile.preview} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="truncate text-slate-600">{pendingFile.file.name}</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-600">{pendingFile.file.name}</span>
                      </>
                    )}
                    {uploading && <span className="text-blue-500 shrink-0">Uploading…</span>}
                  </div>
                  <button onClick={() => setPendingFile(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Emoji palette */}
              {showEmoji && (
                <div className="px-4 pt-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-lg grid grid-cols-10 gap-1">
                    {EMOJIS.map((em) => (
                      <button
                        key={em}
                        className="text-xl hover:bg-slate-100 rounded-lg p-1 transition-colors"
                        onClick={() => { setInput((v) => v + em); setShowEmoji(false); textareaRef.current?.focus(); }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2 p-4">
                {/* Toolbar */}
                <div className="flex items-center gap-1 pb-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Attach image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={cn("p-2 rounded-xl transition-colors", showEmoji ? "text-yellow-500 bg-yellow-50" : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50")}
                    title="Emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                  placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden leading-relaxed bg-slate-50 focus:bg-white transition-colors"
                />

                {/* Send */}
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && !pendingFile}
                  className={cn(
                    "p-2.5 rounded-2xl transition-all shrink-0",
                    input.trim() || pendingFile
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
