import { useState } from "react";
import {
  Search, Plus, X, CheckCircle2, AlertTriangle, Clock,
  DollarSign, CreditCard, FileText, Calendar, User,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { payments as seedPayments, cases, fmt, fmtDate, fmtDateTime, totalRevenue } from "@/store/adminStore";
import type { Payment, PaymentMethod, PaymentStatus } from "@/store/adminStore";

const STATUS_CONFIG: Partial<Record<PaymentStatus, { pill: string; icon: typeof CheckCircle2 }>> = {
  Completed: { pill: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  Pending:   { pill: "bg-amber-100 text-amber-700",     icon: Clock },
  Failed:    { pill: "bg-red-100 text-red-700",         icon: AlertTriangle },
};

const METHOD_COLORS: Record<PaymentMethod, string> = {
  GCash:  "bg-blue-50 text-blue-700 border-blue-100",
  BDO:    "bg-slate-50 text-slate-700 border-slate-200",
  PayPal: "bg-indigo-50 text-indigo-700 border-indigo-100",
};

/* ── Payment Detail Modal ── */
function PaymentDetailModal({ p, onClose, onMarkComplete }: {
  p: Payment;
  onClose: () => void;
  onMarkComplete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <span className="font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full block mb-1">{p.id}</span>
            <h2 className="text-lg font-bold text-slate-800">{p.description}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: User,       label: "Client",      value: p.clientName },
              { icon: FileText,   label: "Invoice",     value: p.invoiceId },
              { icon: DollarSign, label: "Amount",      value: fmt(p.amount) },
              { icon: CreditCard, label: "Method",      value: p.method },
              { icon: Calendar,   label: "Created",     value: fmtDateTime(p.createdAt) },
              { icon: CheckCircle2, label: "Status",    value: p.status },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5">
                <item.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-800">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          {p.referenceNo && (
            <div className="bg-emerald-50 rounded-xl p-3">
              <div className="text-xs text-emerald-600 font-semibold">Reference Number</div>
              <div className="font-mono text-sm text-emerald-800 font-semibold mt-0.5">{p.referenceNo}</div>
            </div>
          )}
          {p.completedAt && (
            <div className="text-xs text-slate-400">Completed: {fmtDateTime(p.completedAt)}</div>
          )}
          {p.status === "Pending" && (
            <button
              onClick={() => { onMarkComplete(p.id); onClose(); }}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-colors"
            >
              Mark as Completed
            </button>
          )}
          {p.status === "Failed" && (
            <button
              onClick={() => { onMarkComplete(p.id); onClose(); }}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors"
            >
              Retry / Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Create Invoice Modal ── */
function CreateInvoiceModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (p: Payment) => void;
}) {
  const [form, setForm] = useState({ caseId: "", method: "GCash" as PaymentMethod, description: "", amount: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.caseId) e.caseId = "Select a case";
    if (!form.description.trim()) e.description = "Description required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = "Valid amount required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const c = cases.find((c) => c.id === form.caseId)!;
    const now = new Date().toISOString();
    const newPayment: Payment = {
      id: `PAY-${String(Math.floor(Math.random() * 900) + 100)}`,
      invoiceId: `INV-${now.slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 900) + 100)}`,
      caseId: c.id,
      clientId: c.clientId,
      clientName: c.clientName,
      amount: Number(form.amount),
      method: form.method,
      status: "Pending",
      referenceNo: "",
      createdAt: now,
      completedAt: null,
      description: form.description,
    };
    onCreate(newPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Create Invoice</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Case *</label>
            <select value={form.caseId} onChange={(e) => setForm(f => ({ ...f, caseId: e.target.value }))}
              className={cn("w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", errors.caseId ? "border-red-300" : "border-slate-200")}>
              <option value="">Select case…</option>
              {cases.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.clientName}</option>)}
            </select>
            {errors.caseId && <p className="text-red-500 text-xs mt-1">{errors.caseId}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
            <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className={cn("w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.description ? "border-red-300" : "border-slate-200")}
              placeholder="e.g. Trademark Registration — Classes 3, 25" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (₱) *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              className={cn("w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.amount ? "border-red-300" : "border-slate-200")}
              placeholder="e.g. 8500" />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(["GCash","BDO","PayPal"] as PaymentMethod[]).map((m) => (
                <button key={m} onClick={() => setForm(f => ({ ...f, method: m }))}
                  className={cn("py-2 rounded-xl border text-sm font-semibold transition-all", form.method === m ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm">Cancel</button>
            <button onClick={handleCreate} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 text-sm">Create Invoice</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminPaymentsPage() {
  const [paymentList, setPaymentList] = useState<Payment[]>(seedPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleMarkComplete = (id: string) => {
    setPaymentList((prev) =>
      prev.map((p) => p.id === id ? { ...p, status: "Completed" as PaymentStatus, completedAt: new Date().toISOString(), referenceNo: p.referenceNo || `REF-${Date.now()}` } : p)
    );
    showToast("Payment marked as completed");
  };

  const handleCreate = (p: Payment) => {
    setPaymentList((prev) => [p, ...prev]);
    showToast(`Invoice ${p.invoiceId} created`);
  };

  const filtered = paymentList
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        (p.clientName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.invoiceId.toLowerCase().includes(q)) &&
        (statusFilter === "All" || p.status === statusFilter) &&
        (methodFilter === "All" || p.method === methodFilter)
      );
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const revenue = totalRevenue(paymentList);
  const pending = paymentList.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const failed  = paymentList.filter((p) => p.status === "Failed").length;

  return (
    <div className="space-y-5 animate-fade-in">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          <CheckCircle2 className="inline w-4 h-4 text-emerald-400 mr-2" />{toast}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-sm text-slate-500 mt-0.5">{paymentList.length} records</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",   value: fmt(revenue), sub: "Completed payments", color: "bg-emerald-50 border-emerald-100", val: "text-emerald-700" },
          { label: "Pending Amount",  value: fmt(pending), sub: `${paymentList.filter(p=>p.status==="Pending").length} pending`, color: "bg-amber-50 border-amber-100", val: "text-amber-700" },
          { label: "Failed Payments", value: String(failed), sub: "Require follow-up", color: "bg-red-50 border-red-100", val: "text-red-700" },
          { label: "Avg. Payment",    value: fmt(Math.round(revenue / Math.max(1, paymentList.filter(p=>p.status==="Completed").length))), sub: "Per completed payment", color: "bg-blue-50 border-blue-100", val: "text-blue-700" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-2xl p-4 border", s.color)}>
            <div className={cn("text-xl font-extrabold", s.val)}>{s.value}</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">{s.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, payment ID, or invoice…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="All">All Status</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Failed</option>
        </select>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="All">All Methods</option>
          <option>GCash</option>
          <option>BDO</option>
          <option>PayPal</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Payment ID","Invoice","Client","Amount","Method","Status","Date",""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No payments match your filters.</td></tr>
              )}
              {filtered.map((p) => {
                const cfg = STATUS_CONFIG[p.status];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-blue-600 font-semibold">{p.id}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{p.invoiceId}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{p.clientName}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{fmt(p.amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", METHOD_COLORS[p.method])}>{p.method}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {cfg ? (
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", cfg.pill)}>{p.status}</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{p.status}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{fmtDate(p.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setSelected(p)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filtered.length} of {paymentList.length} records</span>
          <span className="font-semibold text-slate-600">Filtered total: {fmt(filtered.filter(p=>p.status==="Completed").reduce((s,p)=>s+p.amount,0))}</span>
        </div>
      </div>

      {selected && (
        <PaymentDetailModal p={selected} onClose={() => setSelected(null)} onMarkComplete={handleMarkComplete} />
      )}
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
