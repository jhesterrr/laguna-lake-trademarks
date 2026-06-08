import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Send, CheckCheck, Briefcase, ArrowLeft, Trash2,
  Paperclip, X, Reply, Download, ZoomIn, Smile,
  Image as ImageIcon, FileText, MoreVertical,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  threads as storeThreads,
  subscribe,
  markThreadRead,
  deleteMessage,
  uploadMessageAttachment,
} from "@/store/adminStore";
import type { Thread, Message } from "@/store/adminStore";
import { supabase } from "@/lib/supabase";
import { adminProfile } from "@/store/adminStore";

/* ─── tiny emoji palette ──────────────────────────────── */
const EMOJIS = ["😊","👍","🙏","✅","📄","📋","⚖️","🔔","💼","❓","🎉","❤️","😂","🤔","👋","🚀","💡","⏰","📅","✨"];

/* ─── helpers ─────────────────────────────────────────── */
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

/* ─── DB row → Message ──────────────────────────────── */
function rowToMessage(row: any): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderType: row.sender_role === "admin" ? "Admin" : row.sender_role === "system" ? "System" : "User",
    senderName: row.sender_name,
    content: row.content ?? "",
    timestamp: row.created_at,
    isRead: row.is_read ?? false,
    replyToId: row.reply_to_id ?? null,
    replyToContent: row.reply_to_content ?? null,
    replyToSender: row.reply_to_sender ?? null,
    attachmentUrl: row.attachment_url ?? null,
    attachmentType: row.attachment_type ?? null,
    attachmentName: row.attachment_name ?? null,
    isDeleted: row.is_deleted ?? false,
  };
}

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
        alt="Attachment preview"
        className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ─── Message bubble ─────────────────────────────────── */
function MessageBubble({
  msg,
  onReply,
  onDelete,
  onOpenImage,
}: {
  msg: Message;
  onReply: (msg: Message) => void;
  onDelete: (id: string) => void;
  onOpenImage: (url: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (msg.senderType === "System") {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-slate-100 text-slate-500 text-xs px-4 py-1.5 rounded-full">{msg.content}</div>
      </div>
    );
  }

  const isAdmin = msg.senderType === "Admin";

  return (
    <div
      className={cn("flex gap-2 group", isAdmin ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setMenuOpen(false); }}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 self-end mb-1",
        isAdmin ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
      )}>
        {isAdmin ? adminProfile.name.charAt(0).toUpperCase() : msg.senderName.charAt(0).toUpperCase()}
      </div>

      <div className={cn("flex flex-col max-w-[72%]", isAdmin ? "items-end" : "items-start")}>
        {!isAdmin && (
          <span className="text-[11px] text-slate-400 font-medium mb-0.5 px-1">{msg.senderName}</span>
        )}

        {/* Reply quote */}
        {msg.replyToContent && (
          <div className={cn(
            "flex items-start gap-2 px-3 py-2 mb-1 rounded-xl text-xs border-l-4 max-w-full",
            isAdmin
              ? "bg-blue-500/20 border-blue-300 text-blue-100"
              : "bg-slate-100 border-slate-300 text-slate-500"
          )}>
            <Reply className="w-3 h-3 shrink-0 mt-0.5 opacity-60" />
            <div className="min-w-0">
              <div className="font-semibold">{msg.replyToSender}</div>
              <div className="truncate opacity-80">{msg.replyToContent}</div>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative",
          isAdmin
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md"
        )}>
          {/* Attachment */}
          {msg.attachmentUrl && (
            <div className="mb-2">
              {msg.attachmentType === "image" ? (
                <div
                  className="relative cursor-pointer group/img"
                  onClick={() => onOpenImage(msg.attachmentUrl!)}
                >
                  <img
                    src={msg.attachmentUrl}
                    alt="attachment"
                    className="rounded-xl max-w-[240px] max-h-[200px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 rounded-xl flex items-center justify-center transition-colors">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <a
                  href={msg.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                    isAdmin
                      ? "bg-white/20 hover:bg-white/30 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[160px]">{msg.attachmentName || "Attachment"}</span>
                  <Download className="w-3.5 h-3.5 shrink-0 ml-1" />
                </a>
              )}
            </div>
          )}

          {/* Text content */}
          {msg.content && <span>{msg.content}</span>}
        </div>

        {/* Meta row */}
        <div className={cn("flex items-center gap-1.5 mt-0.5 px-1", isAdmin ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[10px] text-slate-400">{fmtTime(msg.timestamp)}</span>
          {isAdmin && <CheckCheck className="w-3 h-3 text-blue-400" />}

          {/* Action buttons — appear on hover */}
          <div className={cn(
            "flex items-center gap-0.5 transition-opacity",
            hover ? "opacity-100" : "opacity-0"
          )}>
            <button
              onClick={() => onReply(msg)}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-blue-500 transition-colors"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
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
                  isAdmin ? "right-0" : "left-0"
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

/* ─── Main component ─────────────────────────────────── */
export function AdminMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([...storeThreads]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>(storeThreads[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; preview: string; type: "image" | "file" } | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  /* ── Load threads from store ── */
  useEffect(() => {
    const unsub = subscribe(() => {
      setThreads([...storeThreads]);
    });
    return unsub;
  }, []);

  /* ── Load messages for active thread + realtime subscription ── */
  const loadMessages = useCallback(async (threadId: string) => {
    if (!threadId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data.map(rowToMessage));
  }, []);

  useEffect(() => {
    if (!activeThreadId) return;
    loadMessages(activeThreadId);

    // Teardown previous channel
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`admin-thread-${activeThreadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${activeThreadId}` },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, rowToMessage(payload.new)];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `thread_id=eq.${activeThreadId}` },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "threads" },
        () => {
          // Refresh thread list for unread counts etc
          setThreads([...storeThreads]);
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [activeThreadId, loadMessages]);

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
  }, [reply]);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const selectThread = (id: string) => {
    setActiveThreadId(id);
    markThreadRead(id);
    setShowMobileChat(true);
    setReplyTo(null);
    setPendingFile(null);
  };

  /* ── File selection ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const preview = isImage ? URL.createObjectURL(file) : "";
    setPendingFile({ file, preview, type: isImage ? "image" : "file" });
    e.target.value = "";
  };

  /* ── Send ── */
  const sendMessage = async () => {
    if ((!reply.trim() && !pendingFile) || !activeThread || sending) return;
    setSending(true);

    let attachmentUrl: string | null = null;
    let attachmentType: "image" | "file" | null = null;
    let attachmentName: string | null = null;

    if (pendingFile) {
      setUploading(true);
      const result = await uploadMessageAttachment(pendingFile.file);
      setUploading(false);
      if (result) {
        attachmentUrl = result.url;
        attachmentType = result.type;
        attachmentName = result.name;
      }
    }

    const now = new Date().toISOString();
    const newMsg: Message = {
      id: String(Date.now()),
      threadId: activeThreadId,
      senderType: "Admin",
      senderName: adminProfile.name,
      content: reply.trim(),
      timestamp: now,
      isRead: true,
      replyToId: replyTo?.id ?? null,
      replyToContent: replyTo?.content ?? null,
      replyToSender: replyTo?.senderName ?? null,
      attachmentUrl,
      attachmentType,
      attachmentName,
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMsg]);
    setReply("");
    setReplyTo(null);
    setPendingFile(null);
    setSending(false);

    // Persist (realtime INSERT will also fire but we guard against duplicates)
    try {
      await supabase.from("messages").insert({
        id: newMsg.id,
        thread_id: newMsg.threadId,
        sender_name: newMsg.senderName,
        sender_role: "admin",
        content: newMsg.content,
        reply_to_id: newMsg.replyToId,
        reply_to_content: newMsg.replyToContent,
        reply_to_sender: newMsg.replyToSender,
        attachment_url: newMsg.attachmentUrl,
        attachment_type: newMsg.attachmentType,
        attachment_name: newMsg.attachmentName,
      });
      await supabase.from("threads").update({
        last_message_at: now,
      }).eq("id", activeThreadId);
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await deleteMessage(id);
  };

  /* ── Filtered threads ── */
  const filteredThreads = threads.filter((t) =>
    t.clientName.toLowerCase().includes(search.toLowerCase()) ||
    (t.lastMessage || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = threads.reduce((s, t) => s + t.unreadCount, 0);

  /* ── Group messages by date ── */
  const grouped: { label: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const label = fmtDay(msg.timestamp);
    const last = grouped[grouped.length - 1];
    if (last && last.label === label) { last.msgs.push(msg); }
    else { grouped.push({ label, msgs: [msg] }); }
  });

  return (
    <>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      <div className="flex flex-col h-[calc(100vh-7rem)] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {totalUnread > 0 ? `${totalUnread} unread` : "All caught up"} · {threads.length} threads
            </p>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* ── Thread list ── */}
          <div className={cn(
            "shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex-col overflow-hidden",
            "w-full md:w-80",
            showMobileChat ? "hidden md:flex" : "flex"
          )}>
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {filteredThreads.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">No conversations yet.</div>
              )}
              {filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => selectThread(thread.id)}
                  className={cn(
                    "w-full text-left p-4 transition-all hover:bg-slate-50 focus:outline-none",
                    activeThreadId === thread.id && "bg-blue-50 border-l-[3px] border-l-blue-500"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold",
                        activeThreadId === thread.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {thread.clientName.charAt(0).toUpperCase()}
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-sm truncate", thread.unreadCount > 0 ? "font-bold text-slate-800" : "font-semibold text-slate-700")}>
                          {thread.clientName}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1 shrink-0">
                          {new Date(thread.lastUpdated).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {thread.caseId && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-500 font-mono mt-0.5">
                          <Briefcase className="w-2.5 h-2.5" /> {thread.caseId}
                        </div>
                      )}
                      <p className={cn("text-xs mt-0.5 truncate", thread.unreadCount > 0 ? "text-slate-600 font-medium" : "text-slate-400")}>
                        {thread.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Chat area ── */}
          <div className={cn(
            "flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex-col overflow-hidden min-w-0",
            !showMobileChat ? "hidden md:flex" : "flex"
          )}>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-white">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {activeThread ? (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {activeThread.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 leading-tight">{activeThread.clientName}</h3>
                    <p className="text-xs text-emerald-500 font-medium">● Active</p>
                  </div>
                  {activeThread.caseId && (
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 shrink-0 border border-blue-100">
                      <Briefcase className="w-3.5 h-3.5" /> {activeThread.caseId}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-slate-400 text-sm">Select a conversation</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-slate-50/40">
              {!activeThread && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <Send className="w-7 h-7" />
                  </div>
                  <p className="text-sm">Select a conversation to start messaging</p>
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
                        onReply={setReplyTo}
                        onDelete={handleDelete}
                        onOpenImage={setLightboxSrc}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-end gap-2 pr-10">
                  <div className="bg-blue-100 px-4 py-2 rounded-2xl text-sm text-blue-400 animate-pulse">Sending…</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ── */}
            {activeThread && (
              <div className="border-t border-slate-100 bg-white">
                {/* Reply bar */}
                {replyTo && (
                  <div className="flex items-center gap-3 px-4 pt-3">
                    <div className="flex-1 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs">
                      <Reply className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-semibold text-blue-600">{replyTo.senderName}</div>
                        <div className="text-slate-500 truncate">{replyTo.content || "📎 Attachment"}</div>
                      </div>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="p-1 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Pending file preview */}
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
                          onClick={() => { setReply((r) => r + em); setShowEmoji(false); textareaRef.current?.focus(); }}
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
                      onClick={() => { fileInputRef.current?.setAttribute("accept", "image/*"); fileInputRef.current?.click(); fileInputRef.current?.setAttribute("accept", "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"); }}
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
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    placeholder={`Message ${activeThread.clientName}… (Enter to send, Shift+Enter for new line)`}
                    rows={1}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden leading-relaxed bg-slate-50 focus:bg-white transition-colors"
                  />

                  {/* Send */}
                  <button
                    onClick={sendMessage}
                    disabled={!reply.trim() && !pendingFile}
                    className={cn(
                      "p-2.5 rounded-2xl font-semibold transition-all shrink-0",
                      reply.trim() || pendingFile
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                    title="Send (Enter)"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
