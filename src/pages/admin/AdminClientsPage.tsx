import { useState } from "react";
import {
  Search, Mail, Phone, Briefcase, X, User,
  Plus, CheckCircle2, MessageSquare, Calendar,
  Building2, ArrowRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { clients as seedClients, cases, payments, threads, fmt, fmtDate } from "@/store/adminStore";
import type { Client } from "@/store/adminStore";
import { useNavigate } from "react-router-dom";

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-cyan-400 to-cyan-600",
  "from-indigo-400 to-indigo-600",
];

/* ── Client Detail Modal ── */
function ClientDetailModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const navigate = useNavigate();
  const clientCases = cases.filter((c) => c.clientId === client.id);
  const clientPayments = payments.filter((p) => p.clientId === client.id);
  const clientThread = threads.find((t) => t.clientId === client.id);
  const totalPaid = clientPayments.filter((p) => p.status === "Completed").reduce((s, p) => s + p.amount, 0);
  const colorIdx = (client.id.charCodeAt(0) || 0) % AVATAR_COLORS.length;

  const STATUS_PILL: Record<string, string> = {
    Review: "bg-slate-100 text-slate-600",
    Paid: "bg-blue-100 text-blue-700",
    Filed: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold bg-gradient-to-br", AVATAR_COLORS[colorIdx])}>
              {client.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{client.name}</h2>
              <p className="text-sm text-slate-500">{client.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mail,     label: "Email",   value: client.email,    href: `mailto:${client.email}` },
              { icon: Phone,    label: "Phone",   value: client.phone,    href: `tel:${client.phone}` },
              { icon: Building2,label: "Company", value: client.company,  href: undefined },
              { icon: Calendar, label: "Joined",  value: fmtDate(client.joinedAt), href: undefined },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5">
                <item.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium text-blue-600 hover:underline break-all">{item.value}</a>
                  ) : (
                    <div className="text-sm font-medium text-slate-700 break-all">{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Revenue summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Revenue from Client</div>
              <div className="text-2xl font-extrabold text-blue-700">{fmt(totalPaid)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">{clientCases.length} cases · {clientPayments.length} payments</div>
              <div className="text-xs font-semibold text-blue-600 mt-1">Client #{client.id}</div>
            </div>
          </div>

          {/* Cases */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cases</p>
            {clientCases.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No cases yet.</p>
            ) : (
              <div className="space-y-2">
                {clientCases.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <div>
                      <span className="font-mono text-xs text-blue-600 font-semibold">{c.id}</span>
                      <span className="ml-2 text-sm text-slate-600">{c.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">{fmt(c.amount)}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_PILL[c.status])}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {clientThread && (
              <button
                onClick={() => { navigate("/admin/messages"); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> Message Client
              </button>
            )}
            <button
              onClick={() => { navigate("/admin/cases"); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Briefcase className="w-4 h-4" /> View Cases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Add Client Modal ── */
function AddClientModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Client) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.company.trim()) e.company = "Company required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    onCreate({
      id: String(Math.floor(Math.random() * 9000) + 100),
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      joinedAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Add Client</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: "name", label: "Full Name *", type: "text", placeholder: "Juan Dela Cruz" },
            { key: "email", label: "Email *", type: "email", placeholder: "client@email.com" },
            { key: "phone", label: "Phone", type: "tel", placeholder: "+63 912 345 6789" },
            { key: "company", label: "Company / Brand *", type: "text", placeholder: "Company Inc." },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className={cn("w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", (errors as any)[f.key] ? "border-red-300" : "border-slate-200")} />
              {(errors as any)[f.key] && <p className="text-red-500 text-xs mt-1">{(errors as any)[f.key]}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm">Cancel</button>
            <button onClick={handleCreate} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 text-sm">Add Client</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminClientsPage() {
  const [clientList, setClientList] = useState<Client[]>(seedClients);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = clientList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (c: Client) => {
    setClientList((prev) => [c, ...prev]);
    showToast(`Client "${c.name}" added successfully`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          <CheckCircle2 className="inline w-4 h-4 text-emerald-400 mr-2" />{toast}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clientList.length} registered clients</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or company…"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white max-w-md" />
      </div>

      {/* Client grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400">
            <User className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            No clients found.
          </div>
        )}
        {filtered.map((client) => {
          const colorIdx = (client.id.charCodeAt(0) || 0) % AVATAR_COLORS.length;
          const clientCases = cases.filter((c) => c.clientId === client.id);
          const totalPaid = payments.filter((p) => p.clientId === client.id && p.status === "Completed").reduce((s, p) => s + p.amount, 0);
          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm card-hover cursor-pointer"
              onClick={() => setSelected(client)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold bg-gradient-to-br", AVATAR_COLORS[colorIdx])}>
                  {client.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{client.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{client.company}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors truncate" onClick={(e)=>e.stopPropagation()}>
                  <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{client.email}</span>
                </a>
                <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors" onClick={(e)=>e.stopPropagation()}>
                  <Phone className="w-3.5 h-3.5 shrink-0" /> {client.phone}
                </a>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> {clientCases.length} cases
                </span>
                <span className="font-semibold text-slate-700">{fmt(totalPaid)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>

      {selected && <ClientDetailModal client={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onCreate={handleAdd} />}
    </div>
  );
}
