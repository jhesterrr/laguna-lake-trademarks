import { useState, useEffect } from "react";
import {
  Search, Plus, Eye, X,
  Briefcase, Calendar, DollarSign, FileText, User, CheckCircle2,
  Circle, Edit2, Save, ArrowUpDown,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  cases as seedCases,
  clients,
  fmt,
  fmtDate,
  subscribe,
  updateCaseStatus,
  updateCaseNotes,
  addCase,
  deleteCase,
  archiveCase
} from "@/store/adminStore";
import type { Case, CaseStatus, CaseType } from "@/store/adminStore";

const STATUS_CONFIG: Partial<Record<CaseStatus, { pill: string; icon: typeof Circle; next: CaseStatus | null; label: string }>> = {
  Review:   { pill: "bg-slate-100 text-slate-700",   icon: Circle,       next: "Paid",     label: "Mark as Paid"     },
  Paid:     { pill: "bg-blue-100 text-blue-700",     icon: Circle,       next: "Filed",    label: "Mark as Filed"    },
  Filed:    { pill: "bg-amber-100 text-amber-700",   icon: Circle,       next: "Approved", label: "Mark as Approved" },
  Approved: { pill: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, next: null,      label: "Completed"        },
};

const TYPE_COLORS: Record<CaseType | string, string> = {
  Patent: "bg-blue-50 text-blue-700 border-blue-100",
  Trademark: "bg-amber-50 text-amber-700 border-amber-100",
  Copyright: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Infringement: "bg-rose-50 text-rose-700 border-rose-100",
};

const TIMELINE_STEPS: Partial<Record<CaseStatus, number>> = { Review: 0, Paid: 1, Filed: 2, Approved: 3 };

function CaseDetailModal({ c, onClose, onStatusChange, onSave, onArchive, onDelete }: {
  c: Case;
  onClose: () => void;
  onStatusChange: (id: string, status: CaseStatus) => void;
  onSave: (id: string, notes: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(c.notes);
  const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG["Review"];
  const step = TIMELINE_STEPS[c.status] ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-mono text-sm text-blue-600 font-semibold">{c.id}</div>
              <h2 className="text-lg font-bold text-slate-800">{c.clientName}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {c.status !== "Archived" && (
              <button onClick={() => { onArchive(c.id); onClose(); }} className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                Archive
              </button>
            )}
            <button onClick={() => { if (confirm("Are you sure you want to delete this case?")) { onDelete(c.id); onClose(); } }} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              Delete
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Pipeline */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Case Progress</p>
            <div className="flex items-center gap-0">
              {(["Review","Paid","Filed","Approved"] as CaseStatus[]).map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={cn(
                    "flex flex-col items-center flex-1",
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                      i <= step
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-400"
                    )}>
                      {i <= step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn("text-xs mt-1.5 font-medium", i <= step ? "text-blue-600" : "text-slate-400")}>{s}</span>
                  </div>
                  {i < 3 && (
                    <div className={cn("h-0.5 flex-1 mb-5 -mx-2", i < step ? "bg-blue-400" : "bg-slate-200")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: User,        label: "Client",     value: c.clientName },
              { icon: FileText,    label: "Case Type",  value: c.type },
              { icon: Calendar,    label: "Filed Date", value: fmtDate(c.filedDate) },
              { icon: Calendar,    label: "Updated",    value: fmtDate(c.updatedAt) },
              { icon: DollarSign,  label: "Amount",     value: fmt(c.amount) },
              { icon: Briefcase,   label: "Status",     value: c.status },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3.5 flex items-start gap-3">
                <item.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">{c.description}</p>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attorney Notes</p>
              <button
                onClick={() => setEditingNotes(!editingNotes)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-3 h-3" /> {editingNotes ? "Cancel" : "Edit"}
              </button>
            </div>
            {editingNotes ? (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={() => { onSave(c.id, notes); setEditingNotes(false); }}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Notes
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 min-h-[60px]">
                {notes || <span className="text-slate-400 italic">No notes yet.</span>}
              </p>
            )}
          </div>

          {/* Actions */}
          {cfg?.next && (
            <button
              onClick={() => { onStatusChange(c.id, cfg.next!); onClose(); }}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> {cfg.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewCaseModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Case) => void }) {
  const [form, setForm] = useState({ clientId: "", type: "Trademark" as CaseType, description: "", amount: "", notes: "" });
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.clientId) e.clientId = "Select a client";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.amount || isNaN(Number(form.amount))) e.amount = "Valid amount required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const client = clients.find((c) => c.id === form.clientId)!;
    const newCase: Case = {
      id: `CASE-${String(Math.floor(Math.random() * 900) + 100)}`,
      clientId: client.id,
      clientName: client.name,
      type: form.type,
      status: "Review",
      description: form.description,
      filedDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      amount: Number(form.amount),
      notes: form.notes,
    };
    onCreate(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">New Case</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client *</label>
            <select value={form.clientId} onChange={(e) => setForm(f => ({ ...f, clientId: e.target.value }))}
              className={cn("w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", errors.clientId ? "border-red-300" : "border-slate-200")}>
              <option value="">Select client…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Case Type *</label>
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as CaseType }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {["Patent","Trademark","Copyright","Infringement"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className={cn("w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", errors.description ? "border-red-300" : "border-slate-200")}
              placeholder="Brief description of the case…" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Professional Fee (₱) *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              className={cn("w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.amount ? "border-red-300" : "border-slate-200")}
              placeholder="e.g. 8500" />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Initial Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional attorney notes…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">Cancel</button>
            <button onClick={handleCreate} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">Create Case</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCasesPage() {
  const [caseList, setCaseList] = useState<Case[]>(seedCases);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"filedDate" | "amount" | "clientName">("filedDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Case | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const unsub = subscribe(() => {
      setCaseList([...seedCases]);
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const [tab, setTab] = useState<"active" | "archived">("active");

  const filtered = caseList
    .filter((c) => {
      const q = search.toLowerCase();
      const isArchived = c.status === "archived" || c.status === "Archived";
      if (tab === "active" && isArchived) return false;
      if (tab === "archived" && !isArchived) return false;
      return (
        (c.clientName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) &&
        (typeFilter === "All" || c.type === typeFilter) &&
        (statusFilter === "All" || c.status === statusFilter)
      );
    })
    .sort((a, b) => {
      const av = sortBy === "amount" ? a.amount : (a[sortBy] ?? "");
      const bv = sortBy === "amount" ? b.amount : (b[sortBy] ?? "");
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const handleStatusChange = async (id: string, status: CaseStatus) => {
    await updateCaseStatus(id, status);
    showToast(`Case ${id} status updated to ${status}`);
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    await updateCaseNotes(id, notes);
    showToast("Notes saved successfully");
  };

  const handleCreate = async (c: Case) => {
    await addCase(c);
    showToast(`Case ${c.id} created`);
  };

  const handleArchive = async (id: string) => {
    await archiveCase(id);
    showToast("Case archived.");
  };

  const handleDelete = async (id: string) => {
    await deleteCase(id);
    showToast("Case deleted.");
  };

  const sort = (field: typeof sortBy) => {
    if (sortBy === field) setSortAsc(!sortAsc); else { setSortBy(field); setSortAsc(false); }
  };

  const summaryStats = ["Review","Paid","Filed","Approved"].map((s) => ({
    label: s, count: caseList.filter((c) => c.status === s).length,
    color: STATUS_CONFIG[s as CaseStatus]?.pill || "bg-slate-100 text-slate-700",
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          <CheckCircle2 className="inline w-4 h-4 text-emerald-400 mr-2" />{toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cases</h1>
          <p className="text-sm text-slate-500 mt-0.5">{caseList.length} total cases</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setTab("active")} className={cn("px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors", tab === "active" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Active</button>
            <button onClick={() => setTab("archived")} className={cn("px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors", tab === "archived" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Archived</button>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Case
          </button>
        </div>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {summaryStats.map((s) => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(statusFilter === s.label ? "All" : s.label)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              statusFilter === s.label ? s.color + " ring-2 ring-offset-1 ring-blue-300" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}
          >
            {s.label} <span className="font-bold">{s.count}</span>
          </button>
        ))}
        {statusFilter !== "All" && (
          <button onClick={() => setStatusFilter("All")} className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
            Clear filter ×
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, case ID, or description…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]">
          <option value="All">All Types</option>
          {["Patent","Trademark","Copyright","Infringement"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Case ID</th>
                <th
                  onClick={() => sort("clientName")}
                  className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600 select-none"
                >
                  <span className="flex items-center gap-1">Client <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Type</th>
                <th
                  onClick={() => sort("amount")}
                  className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600 select-none"
                >
                  <span className="flex items-center gap-1">Amount <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th
                  onClick={() => sort("filedDate")}
                  className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600 select-none"
                >
                  <span className="flex items-center gap-1">Filed <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No cases match your filters.</td></tr>
              )}
              {filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-blue-600 font-semibold">{c.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-700">{c.clientName}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[160px]">{c.description.slice(0, 50)}…</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", TYPE_COLORS[c.type])}>{c.type}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{fmt(c.amount)}</td>
                    <td className="p-4">
                      {cfg ? (
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", cfg.pill)}>
                          <cfg.icon className="w-3.5 h-3.5" />
                          {c.status}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          <Circle className="w-3.5 h-3.5" />
                          {c.status}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{fmtDate(c.filedDate)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {cfg && cfg.next && (
                          <button
                            onClick={() => handleStatusChange(c.id, cfg.next!)}
                            title={cfg.label}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            → {cfg.next}
                          </button>
                        )}
                        <button
                          onClick={() => setSelected(c)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
          Showing {filtered.length} of {caseList.length} cases
        </div>
      </div>

      {/* Modals */}
      {selected && <CaseDetailModal c={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} onSave={handleSaveNotes} onArchive={handleArchive} onDelete={handleDelete} />}
      {showNew && <NewCaseModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
    </div>
  );
}
