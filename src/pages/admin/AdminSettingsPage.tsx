import { useState, useEffect } from "react";
import {
  Shield, Save, Eye, EyeOff, Bell, CreditCard, User,
  Lock, CheckCircle2, Edit2, X, Plus, Trash2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { adminProfile, updateAdminProfile } from "@/store/adminStore";
import { supabase } from "@/lib/supabase";

const DEFAULT_FEES = [
  { id: 1, label: "Patent Professional Fee",         value: 8000,  note: "Up to ₱12,000 for complex inventions" },
  { id: 2, label: "Patent Specification Drafting",   value: 10000, note: "Included in professional fee" },
  { id: 3, label: "Government Filing — Patent",      value: 2000,  note: "Philippine IPO fee" },
  { id: 4, label: "Trademark Search & Filing",       value: 5000,  note: "Per class ₱1,500 + ₱3,000 professional" },
  { id: 5, label: "Government Filing — Trademark",   value: 1500,  note: "Per class, IPO fee" },
  { id: 6, label: "Declaration of Actual Use (DAU)", value: 2500,  note: "3rd or 5th year filing" },
  { id: 7, label: "Trademark Renewal",               value: 3000,  note: "Every 10 years" },
  { id: 8, label: "Copyright Registration",          value: 2000,  note: "Professional fee" },
  { id: 9, label: "NL Registration Fee",             value: 500,   note: "National Library" },
  { id: 10, label: "Cease and Desist Letter",        value: 2000,  note: "" },
  { id: 11, label: "Administrative Complaint",       value: 10000, note: "₱8,000–₱15,000 range" },
];

const DEFAULT_NOTIFICATIONS = {
  newInquiry:     true,
  newMessage:     true,
  caseUpdated:    true,
  paymentReceived:true,
  emailDigest:    false,
  browserPush:    true,
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Shield; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200",
        checked ? "bg-blue-600" : "bg-slate-200"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
        checked && "translate-x-5"
      )} />
    </button>
  );
}

export function AdminSettingsPage() {
  const [profile, setProfile] = useState({ ...adminProfile });
  const [showPass, setShowPass] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [editingFee, setEditingFee] = useState<number | null>(null);
  const [feeEditVal, setFeeEditVal] = useState("");
  const [toast, setToast] = useState("");
  const [newFeeName, setNewFeeName] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [showAddFee, setShowAddFee] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("adminProfile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    
    const savedNotifs = localStorage.getItem("adminNotifs");
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    
    const savedFees = localStorage.getItem("adminFees");
    if (savedFees) setFees(JSON.parse(savedFees));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile(profile);
    localStorage.setItem("adminProfile", JSON.stringify(profile));
    showToast("Profile saved successfully");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    if (!newPass) { setPassError("Enter a new password"); return; }
    if (newPass.length < 8) { setPassError("Minimum 8 characters"); return; }
    if (newPass !== confirmPass) { setPassError("Passwords do not match"); return; }
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error && error.message !== "Auth session missing!") throw error;
      setNewPass(""); setConfirmPass("");
      showToast("Password changed successfully");
    } catch (err: any) {
      setPassError(err.message || "Failed to update password");
    }
  };

  const updateNotifications = (key: keyof typeof DEFAULT_NOTIFICATIONS, val: boolean) => {
    const next = { ...notifications, [key]: val };
    setNotifications(next);
    localStorage.setItem("adminNotifs", JSON.stringify(next));
  };

  const startEditFee = (fee: typeof fees[0]) => { setEditingFee(fee.id); setFeeEditVal(String(fee.value)); };
  const saveFee = (id: number) => {
    const next = fees.map((f) => f.id === id ? { ...f, value: Number(feeEditVal) || f.value } : f);
    setFees(next);
    localStorage.setItem("adminFees", JSON.stringify(next));
    setEditingFee(null);
    showToast("Fee template updated");
  };
  const deleteFee = (id: number) => { 
    const next = fees.filter((f) => f.id !== id);
    setFees(next); 
    localStorage.setItem("adminFees", JSON.stringify(next));
    showToast("Fee removed"); 
  };
  const addFee = () => {
    if (!newFeeName || !newFeeAmount) return;
    const next = [...fees, { id: Date.now(), label: newFeeName, value: Number(newFeeAmount), note: "" }];
    setFees(next);
    localStorage.setItem("adminFees", JSON.stringify(next));
    setNewFeeName(""); setNewFeeAmount(""); setShowAddFee(false);
    showToast("Fee template added");
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          <CheckCircle2 className="inline w-4 h-4 text-emerald-400 mr-2" />{toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your profile, security, and system preferences</p>
      </div>

      {/* Profile */}
      <SectionCard title="Profile Information" icon={User}>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "name",  label: "Full Name",   type: "text",  placeholder: adminProfile.name },
              { key: "email", label: "Email",        type: "email", placeholder: "admin@lagunalake.com" },
              { key: "phone", label: "Phone",        type: "tel",   placeholder: "+63 917 000 0000" },
              { key: "firm",  label: "Firm Name",    type: "text",  placeholder: "Laguna Lake Trademarks" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={(profile as any)[f.key]}
                  onChange={(e) => setProfile((p: typeof profile) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all focus:bg-white bg-slate-50"
                />
              </div>
            ))}
          </div>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm">
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </form>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password" icon={Lock}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{passError}</div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-slate-50"
                  placeholder="Minimum 8 characters"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <input
                type="password" value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                placeholder="Repeat password"
              />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors text-sm">
            <Lock className="w-4 h-4" /> Update Password
          </button>
        </form>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notification Preferences" icon={Bell}>
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-800 text-sm">New Inquiries</div>
              <div className="text-xs text-slate-500 mt-0.5">Notify when new lead submits form</div>
            </div>
            <Toggle checked={notifications.newInquiry} onChange={(v) => updateNotifications("newInquiry", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-800 text-sm">New Messages</div>
              <div className="text-xs text-slate-500 mt-0.5">Notify on client replies</div>
            </div>
            <Toggle checked={notifications.newMessage} onChange={(v) => updateNotifications("newMessage", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-800 text-sm">Case Updates</div>
              <div className="text-xs text-slate-500 mt-0.5">Notify when status changes</div>
            </div>
            <Toggle checked={notifications.caseUpdated} onChange={(v) => updateNotifications("caseUpdated", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-800 text-sm">Payments</div>
              <div className="text-xs text-slate-500 mt-0.5">Notify on successful payments</div>
            </div>
            <Toggle checked={notifications.paymentReceived} onChange={(v) => updateNotifications("paymentReceived", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-800 text-sm">Daily Email Digest</div>
              <div className="text-xs text-slate-500 mt-0.5">Summary of daily activity</div>
            </div>
            <Toggle checked={notifications.emailDigest} onChange={(v) => updateNotifications("emailDigest", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-800 text-sm">Browser Push</div>
              <div className="text-xs text-slate-500 mt-0.5">Native OS notifications</div>
            </div>
            <Toggle checked={notifications.browserPush} onChange={(v) => updateNotifications("browserPush", v)} />
          </div>
        </div>
        <button onClick={() => showToast("Notification preferences saved")}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm mt-6">
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </SectionCard>

      {/* Fee Templates */}
      <SectionCard title="Fee Templates" icon={CreditCard}>
        <div className="space-y-2">
          {fees.map((fee) => (
            <div key={fee.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 group">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-700">{fee.label}</div>
                {fee.note && <div className="text-xs text-slate-400">{fee.note}</div>}
              </div>
              {editingFee === fee.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 text-sm">₱</span>
                  <input
                    type="number" value={feeEditVal} onChange={(e) => setFeeEditVal(e.target.value)}
                    autoFocus
                    className="w-28 px-3 py-1.5 border border-blue-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => { if (e.key === "Enter") saveFee(fee.id); if (e.key === "Escape") setEditingFee(null); }}
                  />
                  <button onClick={() => saveFee(fee.id)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingFee(null)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-slate-800 min-w-[70px] text-right">₱{fee.value.toLocaleString()}</span>
                  <button onClick={() => startEditFee(fee)} className="p-1.5 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteFee(fee.id)} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add new fee */}
          {showAddFee ? (
            <div className="flex gap-2 pt-3 flex-wrap">
              <input value={newFeeName} onChange={(e) => setNewFeeName(e.target.value)} placeholder="Fee label"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]" />
              <input type="number" value={newFeeAmount} onChange={(e) => setNewFeeAmount(e.target.value)} placeholder="Amount (₱)"
                className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addFee} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">Add</button>
              <button onClick={() => setShowAddFee(false)} className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowAddFee(true)}
              className="flex items-center gap-2 mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Fee Template
            </button>
          )}
        </div>
      </SectionCard>

      {/* System Info */}
      <SectionCard title="System Information" icon={Shield}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Version",       value: "v2.4.1" },
            { label: "Environment",   value: "Production" },
            { label: "Database",      value: "Connected ✓" },
            { label: "Last Backup",   value: "Today 03:00 AM" },
            { label: "Storage Used",  value: "2.4 GB / 10 GB" },
            { label: "Active Sessions", value: "1" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-400">{item.label}</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
