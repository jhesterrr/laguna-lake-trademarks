import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, Briefcase, Inbox, Clock,
  ArrowUp, ArrowRight, RefreshCw, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/utils/cn";
import { useAdminStore } from "@/store/adminStore";
import { fmt, totalRevenue } from "@/store/adminStore";

/* ── Revenue chart data (last 12 months) ── */
const barData = [
  { month: "Jul", revenue: 18000 }, { month: "Aug", revenue: 22000 },
  { month: "Sep", revenue: 15000 }, { month: "Oct", revenue: 28000 },
  { month: "Nov", revenue: 35000 }, { month: "Dec", revenue: 25000 },
  { month: "Jan", revenue: 32000 }, { month: "Feb", revenue: 40000 },
  { month: "Mar", revenue: 28000 }, { month: "Apr", revenue: 35000 },
  { month: "May", revenue: 42000 }, { month: "Jun", revenue: 45000 },
];

const TYPE_COLORS: Record<string, string> = {
  Patent: "#3b82f6", Trademark: "#f59e0b", Copyright: "#10b981", Infringement: "#f43f5e",
};

const STATUS_PILL: Record<string, string> = {
  Review: "bg-slate-100 text-slate-700",
  Paid: "bg-blue-100 text-blue-700",
  Filed: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
};

const PAY_PILL: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
};

export function AdminDashboardPage() {
  const { cases, inquiries, payments, threads, adminProfile } = useAdminStore();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const doRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 700));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  /* ── derived stats ── */
  const activeCases = cases.filter((c) => c.status !== "Approved");
  const caseBreakdown = ["Review", "Paid", "Filed", "Approved"].map((s: string) => ({
    label: s, count: cases.filter((c: typeof cases[number]) => c.status === s).length,
  }));
  const pendingInquiries = inquiries.filter((i: typeof inquiries[number]) => i.status === "Pending");
  const totalUnread = threads.reduce((s: number, t: typeof threads[number]) => s + t.unreadCount, 0);
  const revenue = totalRevenue(payments);

  /* ── pie data ── */
  const typeGroups = (["Patent","Trademark","Copyright","Infringement"] as const).map((t) => ({
    name: t, value: cases.filter((c: typeof cases[number]) => c.type === t).length, color: TYPE_COLORS[t],
  })).filter((g) => g.value > 0);

  const recentCases = [...cases].sort((a, b) => b.filedDate.localeCompare(a.filedDate)).slice(0, 5);
  const recentPayments = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-medium text-slate-700">{adminProfile.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Last updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={doRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: fmt(revenue),
            sub: `${fmt(42000)} this month`,
            up: true,
            pct: "+15%",
            icon: TrendingUp,
            bg: "bg-emerald-50",
            fg: "text-emerald-600",
            ring: "ring-emerald-100",
          },
          {
            label: "Active Cases",
            value: String(activeCases.length),
            sub: caseBreakdown.map((b) => `${b.count} ${b.label}`).join(" · "),
            up: true,
            pct: null,
            icon: Briefcase,
            bg: "bg-blue-50",
            fg: "text-blue-600",
            ring: "ring-blue-100",
          },
          {
            label: "Pending Inquiries",
            value: String(pendingInquiries.length),
            sub: "Awaiting initial review",
            up: false,
            pct: null,
            icon: Inbox,
            bg: "bg-amber-50",
            fg: "text-amber-600",
            ring: "ring-amber-100",
          },
          {
            label: "Unread Messages",
            value: String(totalUnread),
            sub: `${threads.length} open threads`,
            up: false,
            pct: null,
            icon: Clock,
            bg: "bg-purple-50",
            fg: "text-purple-600",
            ring: "ring-purple-100",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.fg)} />
              </div>
              {s.pct && (
                <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUp className="w-3 h-3" /> {s.pct}
                </span>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 leading-none">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">{s.label}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-1">Cases by Type</h3>
          <p className="text-xs text-slate-400 mb-4">{cases.length} total cases</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeGroups} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {typeGroups.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }}
                formatter={(v: any) => [v, "Cases"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {typeGroups.map((t) => (
              <div key={t.name} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                <span>{t.name}</span>
                <span className="ml-auto font-semibold text-slate-800">{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-1">Revenue Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Last 12 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v / 1000}k`} />
              <Tooltip
                formatter={(v: any) => [fmt(Number(v)), "Revenue"]}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">Recent Cases</h3>
            <Link to="/admin/cases" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/70">
                <tr>
                  {["Case", "Client", "Type", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors group" onClick={() => navigate("/admin/cases")} style={{ cursor: "pointer" }}>
                    <td className="px-5 py-3 font-mono text-xs text-blue-600 font-medium">{c.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-700 truncate max-w-[140px]">{c.clientName}</td>
                    <td className="px-5 py-3 text-slate-500">{c.type}</td>
                    <td className="px-5 py-3">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", STATUS_PILL[c.status])}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">Recent Payments</h3>
            <Link to="/admin/payments" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/70">
                <tr>
                  {["ID", "Client", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => navigate("/admin/payments")}>
                    <td className="px-5 py-3 font-mono text-xs text-blue-600 font-medium">{p.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-700 truncate max-w-[130px]">{p.clientName}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{fmt(p.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", PAY_PILL[p.status])}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Pending Inquiries alert ── */}
      {pendingInquiries.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-amber-800">
              {pendingInquiries.length} Pending {pendingInquiries.length === 1 ? "Inquiry" : "Inquiries"} Require Attention
            </h4>
            <p className="text-sm text-amber-600 mt-0.5">
              {pendingInquiries.slice(0, 2).map((i: typeof pendingInquiries[number]) => i.clientName).join(", ")}
              {pendingInquiries.length > 2 && ` and ${pendingInquiries.length - 2} more`} — waiting for review.
            </p>
          </div>
          <Link to="/admin/inquiries" className="shrink-0 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors">
            Review Now
          </Link>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Review Inquiries", href: "/admin/inquiries", color: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100" },
          { label: "Respond to Messages", href: "/admin/messages", color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" },
          { label: "Manage Payments", href: "/admin/payments", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100" },
          { label: "View All Cases", href: "/admin/cases", color: "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-100" },
        ].map((a) => (
          <Link key={a.label} to={a.href} className={cn("px-4 py-3.5 rounded-2xl text-sm font-semibold text-center border transition-all duration-200 card-hover", a.color)}>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
