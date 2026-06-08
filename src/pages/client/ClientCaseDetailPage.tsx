import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Briefcase, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { supabase } from "@/lib/supabase";

export function ClientCaseDetailPage() {
  const { id } = useParams();
  const [caseDetails, setCaseDetails] = useState<any>(null);

  useEffect(() => {
    async function loadCase() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .eq('client_id', session.user.id)
        .single();
        
      if (data) {
        setCaseDetails(data);
      }
    }
    loadCase();
  }, [id]);

  if (!caseDetails) {
    return <div className="text-center py-20 text-slate-500">Loading case details...</div>;
  }

  const statusMap: any = {
    'review': 'Review',
    'draft': 'Paid',
    'filed': 'Filed',
    'published': 'Approved',
    'registered': 'Approved',
  };

  const status = statusMap[caseDetails.status] || 'Review';
  
  const STEPS = ["Review", "Paid", "Filed", "Approved"];
  const currentStep = STEPS.indexOf(status);

  const timelines = [
    { date: caseDetails.created_at?.slice(0, 10), event: "Case Created", description: `Your ${caseDetails.type} case has been opened.` },
    ...(currentStep >= 1 ? [{ date: caseDetails.created_at?.slice(0, 10), event: "Payment Status", description: "Case payment processed." }] : []),
    ...(currentStep >= 2 ? [{ date: caseDetails.filing_date || caseDetails.created_at?.slice(0, 10), event: "Documents Filed", description: "Application submitted." }] : []),
    ...(currentStep >= 3 ? [{ date: caseDetails.filing_date || caseDetails.created_at?.slice(0, 10), event: "Approved", description: "Case successfully approved." }] : []),
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Case {id}</h1>
          <p className="text-sm text-slate-500">{caseDetails.type} - {caseDetails.title}</p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Current Status</h3>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            {status}
          </span>
          <span className="text-sm text-slate-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Updated: {caseDetails.created_at?.slice(0, 10)}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          {status === 'Review' ? 'The attorney is currently reviewing your case details.' : 
           status === 'Paid' ? 'Payment confirmed. We are preparing the documents.' : 
           status === 'Filed' ? 'Your application has been filed and is under examination.' : 
           'Your case has been approved!'}
        </p>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Case Timeline</h3>
        <div className="space-y-0">
          {timelines.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    "bg-emerald-100"
                  )}
                >
                  <CheckCircle2
                    className={cn("w-4 h-4", "text-emerald-500")}
                  />
                </div>
                {i < timelines.length - 1 && (
                  <div className={cn("w-0.5 h-8", "bg-emerald-200")} />
                )}
              </div>
              <div className="pb-6">
                <div className="font-medium text-sm text-slate-800">{item.event}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                <div className="text-xs text-slate-400 mt-1">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Link
          to="/client/messages"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Message Attorney
        </Link>
        <Link
          to="/client/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
