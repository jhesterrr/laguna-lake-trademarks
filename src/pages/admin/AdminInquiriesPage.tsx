import { useState, useEffect } from "react";
import { Search, CheckCircle2, Eye, X, Mail, Phone, Clock, ArrowRight, Inbox, User, Tag, MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  inquiries as initialInquiries,
  subscribe,
  updateInquiryStatus,
  addCase,
  addThread,
  archiveInquiry,
  deleteInquiry
} from "@/store/adminStore";
import type { Inquiry } from "@/store/adminStore";
import emailjs from '@emailjs/browser';

function InquiryDetailModal({ inq, onClose, onConvert, onArchive, onDelete }: {
  inq: Inquiry;
  onClose: () => void;
  onConvert: (id: string, fee: string, notes: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [converting, setConverting] = useState(false);
  const [fee, setFee] = useState("");
  const [notes, setNotes] = useState("");

  const handleConvert = () => {
    onConvert(inq.id, fee, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">{inq.id}</span>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", inq.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600")}>
                {inq.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">{inq.subject}</h2>
          </div>
          <div className="flex items-center gap-2">
            {inq.status !== "Archived" && (
              <button onClick={() => { onArchive(inq.id); onClose(); }} className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                Archive
              </button>
            )}
            <button onClick={() => { if (confirm("Are you sure you want to delete this inquiry?")) { onDelete(inq.id); onClose(); } }} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              Delete
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Information</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Name</div>
                  <div className="font-semibold text-slate-800">{inq.clientName}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Service</div>
                  <div className="font-semibold text-slate-800">{inq.serviceType}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Email</div>
                  <a href={`mailto:${inq.clientEmail}`} className="font-medium text-blue-600 hover:underline break-all">{inq.clientEmail}</a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Phone</div>
                  <a href={`tel:${inq.clientPhone}`} className="font-medium text-slate-700">{inq.clientPhone}</a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Submitted</div>
                  <div className="font-medium text-slate-700">{new Date(inq.submittedAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Preferred Contact</div>
                  <div className="font-medium text-slate-700">{inq.preferredContact}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Inquiry Message</p>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">{inq.message}</p>
          </div>

          {inq.status === "Pending" && (
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-4 bg-blue-50/50">
              <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Convert to Case
              </p>
              {converting ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Fee (₱)</label>
                    <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="e.g. 8500"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Initial case notes…" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setConverting(false)} className="flex-1 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors">Cancel</button>
                    <button onClick={handleConvert} className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">Create Case</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConverting(true)} className="w-full py-2.5 text-sm font-semibold text-blue-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                  Convert Inquiry → Case
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminInquiriesPage() {
  const [inquiryList, setInquiryList] = useState<Inquiry[]>([...initialInquiries]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const unsub = subscribe(() => {
      setInquiryList([...initialInquiries]);
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleArchive = async (id: string) => {
    await archiveInquiry(id);
    showToast("Inquiry archived.");
  };

  const handleDelete = async (id: string) => {
    await deleteInquiry(id);
    showToast("Inquiry deleted.");
  };

  const handleConvert = async (id: string, fee: string, notes: string) => {
    const inq = inquiryList.find((i) => i.id === id);
    if (!inq) return;

    // Create a real case
    const newCaseId = `CASE-${String(Math.floor(Math.random() * 900) + 100)}`;
    addCase({
      id: newCaseId,
      clientId: inq.clientId,
      clientName: inq.clientName,
      clientEmail: inq.clientEmail,
      type: inq.serviceType as any,
      status: "Review",
      description: inq.message,
      filedDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      amount: Number(fee) || 5000,
      notes: notes || "Converted from inquiry " + id,
    });

    // Create thread if needed
    const threadId = Date.now();
    addThread({
      id: String(threadId),
      clientId: inq.clientId,
      clientName: inq.clientName,
      clientEmail: inq.clientEmail,
      caseId: newCaseId,
      inquiryId: id,
      status: "Open",
      lastMessage: "Case opened from inquiry",
      lastUpdated: new Date().toISOString(),
      unreadCount: 0,
    });

    updateInquiryStatus(id, "Closed");
    
    // Send Welcome / Invite Email to Client
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_INVITE_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    console.log("📧 EmailJS Debug:", {
      serviceId,
      templateId,
      publicKey: publicKey ? "✅ set" : "❌ missing",
      toEmail: inq.clientEmail,
    });

    if (serviceId && templateId && publicKey) {
      const emailParams = {
        to_email: inq.clientEmail,
        to_name: inq.clientName,
        case_id: newCaseId,
        service_type: inq.serviceType,
        fee_amount: fee || "5000",
        signup_link: `${window.location.origin}/signup?email=${encodeURIComponent(inq.clientEmail)}`,
      };
      console.log("📨 Sending email with params:", emailParams);

      try {
        const result = await emailjs.send(serviceId, templateId, emailParams, publicKey);
        console.log("✅ Email sent successfully!", result.status, result.text);
        showToast("✅ Case created & invite sent to " + inq.clientEmail);
      } catch (err: any) {
        console.error("❌ EmailJS failed:", err);
        showToast("⚠️ Case created but email failed: " + (err?.text || err?.message || JSON.stringify(err)));
      }
    } else {
      console.warn("⚠️ EmailJS env vars missing:", { serviceId, templateId, publicKey });
      showToast("Case created (email not configured — check .env and restart server)");
    }
  };

  const [tab, setTab] = useState<"active" | "archived">("active");

  const filtered = inquiryList
    .filter((i) => {
      const q = search.toLowerCase();
      const isArchived = i.status === "archived" || i.status === "Archived";
      if (tab === "active" && isArchived) return false;
      if (tab === "archived" && !isArchived) return false;
      
      return (
        (i.clientName.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q) || i.clientEmail.toLowerCase().includes(q)) &&
        (statusFilter === "All" || i.status === statusFilter) &&
        (typeFilter === "All" || i.serviceType === typeFilter)
      );
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const pending = inquiryList.filter((i) => i.status === "Pending").length;
  const closed = inquiryList.filter((i) => i.status === "Closed").length;

  return (
    <div className="space-y-5 animate-fade-in">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          <CheckCircle2 className="inline w-4 h-4 text-emerald-400 mr-2" />{toast}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inquiries</h1>
          <p className="text-sm text-slate-500 mt-0.5">{inquiryList.length} total · {pending} pending · {closed} closed</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setTab("active")} className={cn("px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors", tab === "active" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Active</button>
          <button onClick={() => setTab("archived")} className={cn("px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors", tab === "archived" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Archived</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "All", count: inquiryList.length, color: "bg-slate-50 text-slate-700 border-slate-200" },
          { label: "Pending", count: pending, color: "bg-amber-50 text-amber-700 border-amber-200" },
          { label: "Closed", count: closed, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          { label: "Today", count: inquiryList.filter((i) => i.submittedAt.startsWith(new Date().toISOString().slice(0, 10))).length, color: "bg-blue-50 text-blue-700 border-blue-200" },
        ].map((s) => (
          <button key={s.label} onClick={() => setStatusFilter(s.label === "Today" ? "All" : s.label === "All" ? "All" : s.label)}
            className={cn("p-4 rounded-2xl border text-left transition-all hover:shadow-sm card-hover", s.color)}>
            <div className="text-2xl font-extrabold">{s.count}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or subject…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="All">All Status</option>
          <option>Pending</option>
          <option>Closed</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="All">All Types</option>
          {["Patent", "Trademark", "Copyright", "Infringement", "Other"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Inbox className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            No inquiries match your filters.
          </div>
        )}
        {filtered.map((inq) => (
          <div key={inq.id}
            className={cn("bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer", inq.status === "Pending" ? "border-amber-100 hover:border-amber-200" : "border-slate-100")}
            onClick={() => setSelected(inq)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">{inq.id}</span>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", inq.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600")}>{inq.status}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{inq.serviceType}</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{inq.subject}</h3>
                <p className="text-sm text-slate-500">{inq.clientName} · {inq.clientEmail}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{inq.message}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-slate-400">{new Date(inq.submittedAt).toLocaleDateString()}</span>
                {inq.status === "Pending" && <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /> Needs Review</span>}
                <Eye className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && <InquiryDetailModal inq={selected} onClose={() => setSelected(null)} onConvert={handleConvert} onArchive={handleArchive} onDelete={handleDelete} />}
    </div>
  );
}
