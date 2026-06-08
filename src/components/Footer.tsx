import { Link } from "react-router-dom";
import {
  Shield,
  Mail,
  MapPin,
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 relative overflow-hidden">
      {/* subtle bg texture */}
      <div className="absolute inset-0 noise opacity-20 pointer-events-none" />
      {/* top gradient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-40 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Top CTA Banner ─── */}
      <div className="border-b border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Ready to protect your intellectual property?
            </h3>
            <p className="text-slate-400 mt-1 text-sm">
              Schedule a consultation with our IP attorneys today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 glass text-slate-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-full transition-all hover:bg-white/10"
            >
              <LockKeyhole className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
            >
              Get Started
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main footer content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Laguna Lake</div>
                <div className="text-xs text-slate-500">Trademarks</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Professional intellectual property services under Philippine law.
              Protecting your patents, trademarks, and copyrights with diligence
              and expertise.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 glass rounded-full text-xs font-medium text-emerald-400 border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-slow" />
              RA 8293 IP Code Compliant
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Patent Protection",       href: "/services#patents" },
                { label: "Trademark Registration",  href: "/services#trademarks" },
                { label: "Copyright Services",      href: "/services#copyright" },
                { label: "Infringement Enforcement",href: "/services#infringement" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-blue-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "About Us",       href: "/about" },
                { label: "FAQs",           href: "/faq" },
                { label: "Contact",        href: "/contact" },
                { label: "Client Portal",  href: "/client/dashboard" },
                { label: "Admin Portal",   href: "/admin/login" },
                { label: "Privacy Policy", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-blue-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Contact Us
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href="mailto:lagunalaketm@gmail.com"
                  className="flex items-start gap-3 text-sm text-slate-400 hover:text-blue-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-blue-600/20 flex items-center justify-center shrink-0 transition-colors">
                    <Mail className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  lagunalaketm@gmail.com
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-slate-500" />
                  </div>
                  Laguna, Philippines
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Admin portal call-out bar ─── */}
      <div className="border-t border-slate-800/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-2.5">
              <div className="w-6 h-6 bg-blue-600/30 rounded-lg flex items-center justify-center">
                <LockKeyhole className="w-3 h-3 text-blue-400" />
              </div>
              <span className="text-xs text-slate-400">
                Attorneys & Staff:{" "}
                <Link
                  to="/admin/login"
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors underline underline-offset-2"
                >
                  Access Admin Portal
                </Link>
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Laguna Lake Trademarks · Philippine IP Code (RA 8293)
          </p>
        </div>
      </div>
    </footer>
  );
}
