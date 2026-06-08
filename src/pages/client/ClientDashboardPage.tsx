import { Link } from "react-router-dom";
import {
  Briefcase, MessageSquare, Clock, ArrowRight,
  CheckCircle2, Sparkles, Bell,
} from "lucide-react";
import { cn } from "@/utils/cn";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminStore } from "@/store/adminStore";

const STATUS_CONFIG: Record<string, { pill: string; step: number }> = {
  Review:   { pill: "bg-slate-100 text-slate-700",     step: 0 },
  Paid:     { pill: "bg-blue-100 text-blue-700",       step: 1 },
  Filed:    { pill: "bg-amber-100 text-amber-700",     step: 2 },
  Approved: { pill: "bg-emerald-100 text-emerald-700", step: 3 },
};

const STEPS = ["Review", "Paid", "Filed", "Approved"];

export function ClientDashboardPage() {
  const [clientCases, setClientCases] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { adminProfile } = useAdminStore();

  useEffect(() => {
    async function loadClientData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      const userEmail = session.user.email!;

      // Helper: map DB status to display status
      const mapStatus = (s: string) =>
        s === 'filed' ? 'Filed'
        : s === 'registered' || s === 'published' ? 'Approved'
        : s === 'draft' ? 'Paid'
        : 'Review';

      // Try by UUID first
      let { data: casesData } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      // Fallback: look up by email if no UUID match
      if (!casesData || casesData.length === 0) {
        const { data: emailCases } = await supabase
          .from('cases')
          .select('*')
          .eq('client_email', userEmail)
          .order('created_at', { ascending: false });

        if (emailCases && emailCases.length > 0) {
          casesData = emailCases;
          // Auto-link client_id
          await supabase
            .from('cases')
            .update({ client_id: userId })
            .eq('client_email', userEmail);
        }
      }

      if (casesData) {
        setClientCases(casesData.map(c => ({
          id: c.id,
          type: c.type,
          status: mapStatus(c.status),
          date: c.filing_date || c.created_at.slice(0, 10),
          description: c.title,
          nextStep: c.status === 'review' ? "Attorney is reviewing your case" : "Processing...",
        })));
      }

      // Unread count — try UUID then email
      let { data: threadsData } = await supabase
        .from('threads')
        .select('unread_count')
        .eq('client_id', userId);

      if (!threadsData || threadsData.length === 0) {
        const { data: emailThreads } = await supabase
          .from('threads')
          .select('unread_count')
          .eq('client_email', userEmail);
        if (emailThreads) threadsData = emailThreads;
      }

      if (threadsData) {
        setUnreadCount(threadsData.reduce((acc, t) => acc + (t.unread_count || 0), 0));
      }
    }

    loadClientData();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track your cases and communicate with your attorney
          </p>
        </div>
        {unreadCount > 0 && (
          <Link
            to="/client/messages"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm animate-pulse-slow"
          >
            <Bell className="w-4 h-4" />
            {unreadCount} New Message
          </Link>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Active Cases",
            value: String(clientCases.length),
            icon: Briefcase,
            color: "bg-blue-50 text-blue-600",
            link: null,
          },
          {
            label: "Unread Messages",
            value: String(unreadCount),
            icon: MessageSquare,
            color: unreadCount > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400",
            link: "/client/messages",
          },
          {
            label: "Next Milestone",
            value: "2–4 mo",
            icon: Clock,
            color: "bg-emerald-50 text-emerald-600",
            link: null,
          },
        ].map((stat) => {
          const card = (
            <div
              className={cn(
                "bg-white rounded-2xl p-4 border shadow-sm text-center card-hover transition-all",
                stat.link ? "border-slate-100 cursor-pointer hover:border-blue-200" : "border-slate-100"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          );
          return stat.link ? (
            <Link key={stat.label} to={stat.link}>{card}</Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      {/* Unread message banner */}
      {unreadCount > 0 && (
        <Link
          to="/client/messages"
          className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all group"
        >
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm">
              You have {unreadCount} unread message from {adminProfile.name}
            </div>
            <div className="text-blue-100 text-xs mt-0.5 truncate">
              "…please prepare the following documents to proceed…"
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      )}

      {/* Cases */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">My Cases</h2>
        <div className="space-y-4">
          {clientCases.map((c) => {
            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.Review;
            const currentStep = cfg.step;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm card-hover"
              >
                {/* Case header row */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-blue-600 font-semibold">{c.id}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", cfg.pill)}>
                          {c.status}
                        </span>
                        <span className="text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
                          {c.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">{c.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Filed: {c.date}</p>
                    </div>
                  </div>
                  <Link
                    to={`/client/case/${c.id}`}
                    className="shrink-0 p-2 rounded-xl hover:bg-slate-100 text-slate-300 hover:text-blue-500 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Progress stepper */}
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-0">
                    {STEPS.map((step, i) => (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs transition-all",
                              i < currentStep
                                ? "bg-blue-600 border-blue-600 text-white"
                                : i === currentStep
                                ? "bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-slate-200 text-slate-300"
                            )}
                          >
                            {i < currentStep ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <span className="font-bold">{i + 1}</span>
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-[10px] mt-1 font-medium",
                              i <= currentStep ? "text-blue-600" : "text-slate-300"
                            )}
                          >
                            {step}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div
                            className={cn(
                              "h-0.5 flex-1 -mx-1 mb-4",
                              i < currentStep ? "bg-blue-400" : "bg-slate-200"
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next step hint */}
                <div className="px-5 pb-4">
                  <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5 animate-pulse" />
                    <p className="text-xs text-slate-500">
                      <strong className="text-slate-600">Next:</strong> {c.nextStep}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message CTA */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">Have a question?</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Message your attorney directly through your secure thread.
          </p>
        </div>
        <Link
          to="/client/messages"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          Open Messages
        </Link>
      </div>
    </div>
  );
}
