import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adminProfile } from "@/store/adminStore";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Attempt login with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // If user doesn't exist and this is dev, let's try to create them just to make setup easy
      if (authError.message.includes("Invalid login credentials")) {
         setError("Invalid email or password. (Make sure you created this user in Supabase Auth)");
      } else {
         setError(authError.message);
      }
    } else if (data.user) {
      // Create/Update profile for this user as admin
      await supabase.from('profiles').upsert({
        id: data.user.id,
        role: 'admin',
        email: data.user.email,
        full_name: adminProfile.name || 'Admin'
      }, { onConflict: 'id' });
      
      navigate("/admin/dashboard");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── Left panel: background image + glass overlay ── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-end">
        <img
          src="https://images.pexels.com/photos/7876314/pexels-photo-7876314.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=800"
          alt="Legal office"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/75 to-slate-900/60" />

        {/* Brand text overlay */}
        <div className="relative z-10 p-12 pb-16">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold">Laguna Lake Trademarks</div>
              <div className="text-white/50 text-sm">Admin Portal</div>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Professional IP Management at Your Fingertips
          </h2>
          <p className="text-blue-100/70 text-base leading-relaxed mb-8">
            Access case management, client communications, payment tracking, and
            analytics — all in one secure dashboard.
          </p>

          {/* Glass feature pills */}
          <div className="space-y-3">
            {[
              "Full case lifecycle management",
              "Real-time client messaging",
              "Revenue & payment tracking",
              "Inquiry-to-case conversion",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 glass rounded-xl px-4 py-2.5">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to main site
          </Link>

          {/* Logo (shown on mobile too) */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Laguna Lake Trademarks</div>
              <div className="text-xs text-slate-400">Admin Portal</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to access the admin portal
            </p>
          </div>

          {/* Glass card form */}
          <div className="glass-card rounded-3xl p-7 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="admin-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                    placeholder="admin@lagunalake.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">Remember me for 7 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 btn-primary disabled:opacity-60 disabled:cursor-not-allowed py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Login to Dashboard"
                )}
              </button>
            </form>


          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            &copy; {new Date().getFullYear()} Laguna Lake Trademarks. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
