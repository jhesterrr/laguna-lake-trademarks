import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Shield,
  Zap,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  MessageSquareText,
  Star,
  ChevronDown,
  AlertTriangle,
  LockKeyhole,
  TrendingUp,
  Award,
} from "lucide-react";
import { cn } from "@/utils/cn";

/* ─── Images (Pexels) ─── */
const IMAGES = {
  hero:        "https://images.pexels.com/photos/7876093/pexels-photo-7876093.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
  consultation:"https://images.pexels.com/photos/7876154/pexels-photo-7876154.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1100",
  signing:     "https://images.pexels.com/photos/8815849/pexels-photo-8815849.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1100",
  patent:      "https://images.pexels.com/photos/11679118/pexels-photo-11679118.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800",
  trademark:   "https://images.pexels.com/photos/7661590/pexels-photo-7661590.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800",
  copyright:   "https://images.pexels.com/photos/7285163/pexels-photo-7285163.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800",
  attorney:    "https://images.pexels.com/photos/7876289/pexels-photo-7876289.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900",
};

/* ─── Scroll reveal wrapper ─── */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.08);
  return (
    <div
      ref={ref}
      className={cn(
        "animate-on-scroll",
        delay === 100 && "delay-100",
        delay === 200 && "delay-200",
        delay === 300 && "delay-300",
        delay === 400 && "delay-400",
        isVisible && "visible",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─── Service Card (glass) ─── */
function ServiceCard({
  icon: Icon,
  title,
  description,
  details,
  ctaLink,
  img,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  details: string;
  ctaLink: string;
  img: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl card-hover cursor-pointer h-80">
      {/* background image */}
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/10 transition-opacity duration-300 group-hover:from-slate-900/95" />

      {/* Glass pill accent */}
      <div className={cn("absolute top-5 left-5 flex items-center gap-2 glass rounded-full px-3 py-1.5", accent)}>
        <Icon className="w-3.5 h-3.5 text-white" />
        <span className="text-xs font-semibold text-white">{title}</span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-white/80 text-sm leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>
        <p className="text-white/50 text-xs mb-4 leading-relaxed line-clamp-1">
          {details}
        </p>
        <Link
          to={ctaLink}
          className="inline-flex items-center gap-2 glass-white text-slate-800 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:bg-white group-hover:translate-x-1"
        >
          Learn More
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Stat badge ─── */
function StatBadge({ value, label, icon: Icon }: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="glass-white rounded-2xl px-5 py-4 flex items-center gap-3 shimmer-border">
      <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <div className="text-xl font-extrabold text-slate-800 leading-none">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <Navbar />
      <AIChatbot />

      {/* ═══════════════════════════════════════════════════
          HERO — Full-bleed image with glassmorphism overlay
      ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0">
          <img
            src={IMAGES.hero}
            alt="Law office"
            className="w-full h-full object-cover object-center"
          />
          {/* Multi-layer gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-950/70 to-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
          {/* Noise texture */}
          <div className="absolute inset-0 noise opacity-30" />
        </div>

        {/* Decorative floating glass blobs */}
        <div className="absolute top-32 right-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float-slow pointer-events-none" />
        <div className="absolute bottom-24 left-16 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl animate-float pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-20 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              {/* Compliance badge */}
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-blue-200 mb-7 animate-fade-in border-blue-400/20">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow" />
                RA 8293 IP Code Compliant
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-slide-up"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
              >
                Secure Your{" "}
                <span className="text-gradient-gold">Intellectual</span>{" "}
                <span className="text-gradient-gold">Property</span> Assets
              </h1>

              <p
                className="text-lg sm:text-xl text-blue-100/90 leading-relaxed mb-10 max-w-lg animate-slide-up"
                style={{ animationDelay: "0.15s" }}
              >
                Professional, persistent representation for your patents,
                trademarks, and copyrights under Philippine law. Direct access
                to experienced IP attorneys.
              </p>

              {/* CTA buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up"
                style={{ animationDelay: "0.28s" }}
              >
                <Link
                  to="/services"
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  Explore Services
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="btn-glass inline-flex items-center justify-center gap-2"
                >
                  Speak with Expert
                </Link>
              </div>

              {/* Trust stats — glass cards */}
              <div
                className="grid grid-cols-3 gap-3 animate-fade-in"
                style={{ animationDelay: "0.45s" }}
              >
                <div className="glass rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-white">15+</div>
                  <div className="text-xs text-blue-200 mt-0.5">Years Exp.</div>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-white">500+</div>
                  <div className="text-xs text-blue-200 mt-0.5">Cases Filed</div>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-white">98%</div>
                  <div className="text-xs text-blue-200 mt-0.5">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right — floating glass info card */}
            <div
              className="hidden lg:block animate-slide-in-right"
              style={{ animationDelay: "0.35s" }}
            >
              <div className="glass rounded-3xl p-8 max-w-sm ml-auto shimmer-border">
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-300" />
                  Services We Offer
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Shield, label: "Patent Protection", sub: "20-year exclusive rights", color: "text-amber-300" },
                    { icon: Zap, label: "Trademark Registration", sub: "10-year renewable protection", color: "text-blue-300" },
                    { icon: FileText, label: "Copyright Services", sub: "Life + 50 years coverage", color: "text-emerald-300" },
                    { icon: AlertTriangle, label: "Infringement Enforcement", sub: "Legal action & remedies", color: "text-rose-300" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <item.icon className={cn("w-4 h-4", item.color)} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{item.label}</div>
                        <div className="text-xs text-white/50">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/contact"
                  className="mt-6 w-full block text-center glass-white text-slate-800 font-semibold text-sm py-3 rounded-2xl hover:bg-white transition-colors"
                >
                  Start Your Inquiry →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SERVICES — Image cards with glassmorphism
      ═══════════════════════════════════════════════════ */}
      <section className="section-padding bg-slate-50" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                Our Services
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Comprehensive IP Protection
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                Expert legal services for all your intellectual property needs
                under the Philippine IP Code.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Reveal delay={100}>
              <ServiceCard
                icon={Shield}
                title="Patent Protection"
                description="Secure exclusive rights for technical inventions with 20 years of enforceable protection under RA 8293."
                details="30-month priority claim, comprehensive prior art search, technical description drafting"
                ctaLink="/services#patents"
                img={IMAGES.patent}
                accent="border-amber-400/30"
              />
            </Reveal>
            <Reveal delay={200}>
              <ServiceCard
                icon={Zap}
                title="Trademark Registration"
                description="Protect your brand identity with full Nice Classification coverage across all 45 international classes."
                details="Declaration of Actual Use compliance, 10-year validity, renewal management"
                ctaLink="/services#trademarks"
                img={IMAGES.trademark}
                accent="border-blue-400/30"
              />
            </Reveal>
            <Reveal delay={300}>
              <ServiceCard
                icon={FileText}
                title="Copyright Protection"
                description="Formal registration and deposit of creative works with protection lasting the life of the author plus 50 years."
                details="National Library registration, Supreme Court Library deposit, enforcement support"
                ctaLink="/services#copyright"
                img={IMAGES.copyright}
                accent="border-emerald-400/30"
              />
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-8 text-center">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                View All Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ABOUT SPLIT — Image + glassmorphism stats
      ═══════════════════════════════════════════════════ */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image column */}
            <Reveal className="relative">
              <div className="relative rounded-3xl overflow-hidden h-[480px] lg:h-[580px]">
                <img
                  src={IMAGES.attorney}
                  alt="Expert IP Attorney"
                  className="w-full h-full object-cover object-top"
                />
                {/* floating glass badge */}
                <div className="absolute bottom-6 left-6 glass-white rounded-2xl p-4 max-w-[220px] shimmer-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Expert Counsel</div>
                      <div className="text-xs text-slate-500">Philippine IP Law</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs text-slate-500 ml-1">5.0</span>
                  </div>
                </div>

                {/* floating glass tag top right */}
                <div className="absolute top-6 right-6 glass rounded-2xl px-4 py-2.5">
                  <div className="text-xs font-bold text-white">RA 8293</div>
                  <div className="text-xs text-white/60">IP Code Certified</div>
                </div>
              </div>
            </Reveal>

            {/* Text column */}
            <div>
              <Reveal>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                  Why Choose Us
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 leading-tight">
                  Direct Access to Experienced IP Attorneys
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  We provide professional, persistent representation that puts
                  your IP interests first. Every case receives the personal
                  attention it deserves — no paralegal hand-offs, no cookie-cutter
                  solutions.
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: "15+", label: "Years Experience", icon: Award },
                  { value: "500+", label: "Cases Successfully Filed", icon: TrendingUp },
                  { value: "98%", label: "Client Success Rate", icon: CheckCircle2 },
                  { value: "<4 hrs", label: "Average Response Time", icon: Clock },
                ].map((s, i) => (
                  <Reveal key={s.label} delay={i * 100 as 0|100|200|300|400}>
                    <StatBadge value={s.value} label={s.label} icon={s.icon} />
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/about" className="btn-primary inline-flex items-center gap-2">
                    About Our Firm
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/contact" className="btn-secondary inline-flex items-center gap-2">
                    Book Consultation
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS — Process steps
      ═══════════════════════════════════════════════════ */}
      <section className="section-padding bg-slate-900 relative overflow-hidden">
        {/* bg image tinted */}
        <div className="absolute inset-0">
          <img
            src={IMAGES.signing}
            alt="Signing documents"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-950/90 to-slate-900/95" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
                Process
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Our streamlined process makes IP protection simple and
                accessible from inquiry to final approval.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: MessageSquareText,
                title: "Submit Inquiry",
                desc: "Describe your IP asset and we'll assess your needs within 24 hours.",
                color: "text-blue-400",
                glow: "from-blue-500/20 to-blue-600/5",
              },
              {
                step: "02",
                icon: Users,
                title: "Initial Consultation",
                desc: "Attorney review and comprehensive requirements assessment.",
                color: "text-amber-400",
                glow: "from-amber-500/20 to-amber-600/5",
              },
              {
                step: "03",
                icon: FileText,
                title: "Preparation & Filing",
                desc: "Documentation preparation and submission to government agencies.",
                color: "text-emerald-400",
                glow: "from-emerald-500/20 to-emerald-600/5",
              },
              {
                step: "04",
                icon: CheckCircle2,
                title: "Monitoring & Maintenance",
                desc: "Ongoing protection, renewals, and proactive IP portfolio management.",
                color: "text-purple-400",
                glow: "from-purple-500/20 to-purple-600/5",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 100 as 0|100|200|300|400}>
                <div className={cn("relative glass rounded-3xl p-6 h-full bg-gradient-to-br", item.glow)}>
                  <div className={cn("text-5xl font-extrabold mb-4 opacity-20", item.color)}>
                    {item.step}
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                    <item.icon className={cn("w-5 h-5", item.color)} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>

                  {i < 3 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CONSULTATION BANNER — Image + glass overlay CTA
      ═══════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMAGES.consultation}
            alt="Legal consultation"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/92 via-blue-900/80 to-blue-950/60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-blue-200 mb-6 border-blue-400/20">
                <MessageSquareText className="w-4 h-4" />
                AI-Powered Legal Knowledge
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Have Legal Questions?
              </h2>
              <p className="text-blue-100/80 text-lg mb-8 leading-relaxed">
                Our AI legal assistant provides instant answers based on
                Philippine IP law. For case-specific guidance, our attorneys
                are available within 4 hours.
              </p>

              {/* sample questions glass pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  "Difference between patent & trademark?",
                  "How long does TM registration take?",
                  "Patent filing costs in Philippines?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      const btn = document.querySelector(".fixed.bottom-6.right-6") as HTMLButtonElement;
                      btn?.click();
                    }}
                    className="glass text-white/80 text-sm px-4 py-2 rounded-full hover:bg-white/20 transition-colors text-left"
                  >
                    "{q}"
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const btn = document.querySelector(".fixed.bottom-6.right-6") as HTMLButtonElement;
                    btn?.click();
                  }}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <MessageSquareText className="w-5 h-5" />
                  Ask AI Assistant Now
                </button>
                <Link to="/contact" className="btn-glass inline-flex items-center justify-center gap-2">
                  Speak with Attorney
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA — Clean with glass accents
      ═══════════════════════════════════════════════════ */}
      <section className="section-padding bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        {/* Blurred decorative rings */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <Reveal>
            <div className="glass-card rounded-3xl p-10 sm:p-14">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <LockKeyhole className="w-4 h-4" />
                Trusted by 500+ Philippine Businesses
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Ready to Protect Your IP?
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Start your intellectual property journey with confidence. Our
                experienced attorneys are ready to assist you — no bureaucracy,
                just results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="btn-primary inline-flex items-center justify-center gap-2">
                  Start Your Inquiry
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/services" className="btn-secondary inline-flex items-center justify-center gap-2">
                  View All Services
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
