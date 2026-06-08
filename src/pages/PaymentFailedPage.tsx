import { Link } from "react-router-dom";
import { XCircle, ArrowRight, Home } from "lucide-react";

export function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-rose-50 p-4">
      <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg border border-rose-100">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Payment Failed
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          Your payment could not be processed. Please try again or contact us
          for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact" className="btn-primary text-sm inline-flex items-center gap-2">
            Contact Support <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/" className="btn-secondary text-sm inline-flex items-center gap-2">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
