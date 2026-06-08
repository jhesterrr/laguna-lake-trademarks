import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";

export function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const invoiceId = params.get("invoice") || "Unknown";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4">
      <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-slate-500 mb-4 text-sm">
          Your payment has been processed successfully. We'll update your case
          status shortly.
        </p>
        {invoiceId !== "Unknown" && (
          <p className="text-xs text-slate-400 mb-6 bg-slate-50 rounded-lg py-2 px-3 inline-block">
            Invoice: {invoiceId}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/client/dashboard" className="btn-primary text-sm inline-flex items-center gap-2">
            View Your Cases <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/" className="btn-secondary text-sm inline-flex items-center gap-2">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
