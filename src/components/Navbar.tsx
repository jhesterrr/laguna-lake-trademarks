import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  MessageSquareText,
  LockKeyhole,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/utils/cn";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsServicesOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  /* is the page hero-dark so we need white nav text? */
  const isDarkHero =
    location.pathname === "/" ||
    location.pathname === "/faq" ||
    location.pathname === "/about";

  const isTransparent = !isScrolled;
  const textColor = isTransparent && isDarkHero ? "text-white/90" : "text-slate-700";
  const hoverColor = isTransparent && isDarkHero ? "hover:text-white hover:bg-white/10" : "hover:text-blue-600 hover:bg-slate-50";

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/faq", label: "FAQs" },
    { path: "/contact", label: "Contact" },
  ];

  const serviceLinks = [
    { path: "/services#patents",     label: "Patent Protection",       desc: "Secure your inventions" },
    { path: "/services#trademarks",  label: "Trademark Registration",  desc: "Protect your brand" },
    { path: "/services#copyright",   label: "Copyright Services",      desc: "Safeguard creative works" },
    { path: "/services#infringement",label: "Infringement Enforcement",desc: "Defend your IP rights" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "glass-nav" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mt-1 transition-all duration-300 group-hover:scale-105">
              <img 
                src="/logo.png" 
                alt="Laguna Lake Logo" 
                className={cn(
                  "w-full h-full object-contain object-center transition-all",
                  isTransparent && isDarkHero ? "drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" : ""
                )} 
              />
            </div>
            <div className="hidden sm:block">
              <div className={cn("text-sm font-bold leading-tight transition-colors", isTransparent && isDarkHero ? "text-white" : "text-slate-800")}>
                Laguna Lake
              </div>
              <div className={cn("text-xs font-medium leading-tight transition-colors", isTransparent && isDarkHero ? "text-white/60" : "text-slate-400")}>
                Trademarks
              </div>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  textColor,
                  hoverColor,
                  isActive(link.path) && (isTransparent && isDarkHero
                    ? "bg-white/15 text-white"
                    : "text-blue-600 bg-blue-50")
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Services dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  textColor,
                  hoverColor,
                  location.pathname === "/services" && (isTransparent && isDarkHero
                    ? "bg-white/15 text-white"
                    : "text-blue-600 bg-blue-50")
                )}
              >
                Services
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isServicesOpen && "rotate-180")} />
              </button>

              {isServicesOpen && (
                <div className="absolute top-full mt-3 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/80 py-2 animate-scale-in overflow-hidden">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="block px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="text-sm font-semibold text-slate-800">{link.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{link.desc}</div>
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1 px-5 pb-1">
                    <Link to="/services" className="block py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      View All Services →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right actions ── */}
          <div className="hidden lg:flex items-center gap-2">
            {/* AI button */}
            <button
              onClick={() => {
                const btn = document.querySelector(".fixed.bottom-6.right-6") as HTMLButtonElement;
                btn?.click();
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                textColor, hoverColor
              )}
            >
              <MessageSquareText className="w-4 h-4" />
              Ask AI
            </button>

            {/* Client Portal button */}
            <Link
              to="/client/login"
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                isTransparent && isDarkHero
                  ? "glass text-white/80 hover:text-white hover:bg-white/15 border-white/20"
                  : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
              )}
            >
              <UserCircle2 className="w-3.5 h-3.5" />
              Client Portal
            </Link>

            {/* Admin Portal button */}
            <Link
              to="/admin/login"
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                isTransparent && isDarkHero
                  ? "glass text-white/80 hover:text-white hover:bg-white/15 border-white/20"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200"
              )}
            >
              <LockKeyhole className="w-3.5 h-3.5" />
              Admin
            </Link>

            {/* Primary CTA */}
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-blue-300/30 hover:shadow-lg hover:shadow-blue-300/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Start Inquiry
            </Link>
          </div>


          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "lg:hidden p-2 rounded-xl transition-colors",
              isTransparent && isDarkHero
                ? "text-white hover:bg-white/10"
                : "text-slate-600 hover:bg-slate-100"
            )}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-3 space-y-1 bg-white/95 backdrop-blur-xl border-t border-slate-100/50 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive(link.path) ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">
            Services
          </div>
          {serviceLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 px-3 pb-2 space-y-2 border-t border-slate-100 mt-2">
            <Link
              to="/client/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-colors"
            >
              <UserCircle2 className="w-4 h-4" />
              Client Portal
            </Link>
            <Link
              to="/admin/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              <LockKeyhole className="w-4 h-4" />
              Admin Portal
            </Link>
            <Link
              to="/contact"
              className="w-full block text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-md"
            >
              Start Inquiry
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
