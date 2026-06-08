import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Scale,
  Copyright,
  Gavel,
} from "lucide-react";
import { cn } from "@/utils/cn";

/* ─── Images ─── */
const IMAGES = {
  hero: "https://images.pexels.com/photos/8441784/pexels-photo-8441784.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1400",
  patentHero: "https://images.pexels.com/photos/11679118/pexels-photo-11679118.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1000",
  trademarkHero: "https://images.pexels.com/photos/7661590/pexels-photo-7661590.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1000",
  copyrightHero: "https://images.pexels.com/photos/7285163/pexels-photo-7285163.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1000",
  infringementHero: "https://images.pexels.com/photos/7876314/pexels-photo-7876314.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1000",
};

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <div ref={ref} className={cn("animate-on-scroll", isVisible && "visible", delay === 100 && "delay-100", delay === 200 && "delay-200", delay === 300 && "delay-300", className)}>
      {children}
    </div>
  );
}

/* ─── Service Hero Card ─── */
function ServiceHeroCard({
  icon: Icon,
  title,
  tagline,
  img,
  accent,
  id,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  img: string;
  accent: string;
  id: string;
}) {
  return (
    <a href={`#${id}`} className="group block">
      <div className="relative h-80 rounded-3xl overflow-hidden card-hover">
        <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
        
        {/* Top glass badge */}
        <div className="absolute top-5 left-5 glass rounded-full px-3 py-1.5 flex items-center gap-2">
          <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", accent)}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-white pr-1">{title}</span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-2">{tagline}</p>
          <div className="inline-flex items-center gap-2 glass-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-full group-hover:translate-x-1 transition-transform">
            Explore Service <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </a>
  );
}



/* ─── Service Detail ─── */
interface Service {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  heroImg: string;
  accent: string;
  accentLight: string;
  gradient: string;
  plainExplanation: string;
  legal: { definition: string; term: string; coverage: string; maintenance?: string };
  timeline: string;
  process: { phase: string; duration: string; desc: string }[];
  requirements: string[];
  fees: { item: string; amount: string; note?: string }[];
  ctaLabel: string;
  ctaLink: string;
}

const services: Service[] = [
  {
    id: "patents",
    icon: Shield,
    title: "Patent Protection",
    subtitle: "Secure exclusive rights for technical inventions",
    heroImg: IMAGES.patentHero,
    accent: "bg-amber-500",
    accentLight: "bg-amber-50",
    gradient: "from-amber-500 to-orange-600",
    plainExplanation:
      "A patent gives you exclusive rights to make, use, or sell your invention for 20 years. Others cannot copy your patented technology without permission — this includes improvements to existing inventions.",
    legal: {
      definition: "Inventions of machines, articles of manufacture, compositions of matter, or improvements thereof per RA 8293 Section 21.",
      term: "20 years from filing date",
      coverage: "Utility patents (most common), design patents (appearance)",
    },
    timeline: "24–30 months average",
    process: [
      { phase: "Novelty Search", duration: "2–3 weeks", desc: "Patentability assessment and prior art analysis" },
      { phase: "Specification Drafting", duration: "3–4 weeks", desc: "Technical description with claims defining scope" },
      { phase: "Filing with IPO", duration: "1 day", desc: "Official submission to Philippine IPO" },
      { phase: "Examination Period", duration: "18–24 months", desc: "IPO substantive examination" },
      { phase: "Approval & Grant", duration: "2–4 weeks", desc: "Certificate issuance after approval" },
    ],
    requirements: [
      "Power of Attorney (notarized)",
      "Detailed description of invention (English or Filipino)",
      "Technical drawings or diagrams",
      "Claims defining scope of protection",
      "Abstract for publication",
      "Inventor declaration",
      "Priority claim evidence (if applicable)",
    ],
    fees: [
      { item: "Professional Assessment", amount: "₱3,500" },
      { item: "Specification Preparation", amount: "₱8,000 – ₱12,000", note: "Varies by complexity" },
      { item: "Government Filing Fee", amount: "₱2,000", note: "Philippine IPO" },
      { item: "Annual Maintenance", amount: "₱500 – ₱1,000/yr" },
    ],
    ctaLabel: "File a Patent",
    ctaLink: "/contact?service=Patent",
  },
  {
    id: "trademarks",
    icon: Zap,
    title: "Trademark Registration",
    subtitle: "Protect your brand identity across all 45 Nice classes",
    heroImg: IMAGES.trademarkHero,
    accent: "bg-blue-500",
    accentLight: "bg-blue-50",
    gradient: "from-blue-500 to-indigo-600",
    plainExplanation:
      "A trademark protects your brand name, logo, or slogan. It's valid for 10 years and renewable indefinitely. You must prove actual use during the 3rd and 5th years through the Declaration of Actual Use (DAU).",
    legal: {
      definition: "Visible sign capable of distinguishing goods/services per RA 8293 Section 121.",
      term: "10 years from filing, renewable indefinitely",
      coverage: "45 Nice Classification classes",
      maintenance: "Declaration of Actual Use (DAU) in 3rd and 5th years",
    },
    timeline: "6–12 months average",
    process: [
      { phase: "Availability Search", duration: "1–2 weeks", desc: "Comprehensive search for conflicting marks" },
      { phase: "Classification & Prep", duration: "1–2 weeks", desc: "Nice class selection and application drafting" },
      { phase: "Filing with IPO", duration: "1 day", desc: "Official submission" },
      { phase: "Examination", duration: "2–4 months", desc: "IPO formal and substantive examination" },
      { phase: "Publication", duration: "30 days", desc: "Opposition period" },
      { phase: "Registration", duration: "2–4 weeks", desc: "Certificate issuance" },
    ],
    requirements: [
      "Clear representation of mark (image/text)",
      "List of goods/services per Nice Classification",
      "Applicant information and address",
      "Priority claim (if international filing)",
      "Power of Attorney (notarized)",
      "Declaration of Use with commercial proof",
    ],
    fees: [
      { item: "Search & Availability Analysis", amount: "₱2,000" },
      { item: "Application Preparation", amount: "₱3,000" },
      { item: "Government Filing", amount: "₱1,500/class", note: "IPO fee per Nice class" },
      { item: "DAU (3rd year)", amount: "₱2,500" },
      { item: "DAU (5th year)", amount: "₱2,500" },
      { item: "Renewal (every 10 years)", amount: "₱3,000" },
    ],
    ctaLabel: "Register a Trademark",
    ctaLink: "/contact?service=Trademark",
  },
  {
    id: "copyright",
    icon: Copyright,
    title: "Copyright Services",
    subtitle: "Formal registration for stronger enforcement rights",
    heroImg: IMAGES.copyrightHero,
    accent: "bg-emerald-500",
    accentLight: "bg-emerald-50",
    gradient: "from-emerald-500 to-teal-600",
    plainExplanation:
      "Copyright protects your creative work automatically upon creation. Formal registration with the National Library and Supreme Court Library deposit provides legal proof of ownership and stronger enforcement rights.",
    legal: {
      definition: "Original works of authorship fixed in any medium per RA 8293 Section 176.",
      term: "Life of author + 50 years (or 50 years for works made for hire)",
      coverage: "Literary, dramatic, musical, choreography, visual arts, film, software",
    },
    timeline: "4–8 weeks",
    process: [
      { phase: "Document Preparation", duration: "1–2 weeks", desc: "Application forms and affidavit preparation" },
      { phase: "Notarization", duration: "1 day", desc: "Affidavit of Ownership notarization" },
      { phase: "National Library Registration", duration: "2–4 weeks", desc: "Official registration with NLB" },
      { phase: "Supreme Court Deposit", duration: "1–2 weeks", desc: "Deposit copies with Supreme Court Library" },
    ],
    requirements: [
      "Two (2) physical copies of the work",
      "Application form (NLB-LRD)",
      "Notarized Affidavit of Ownership",
      "Certificate of Registration from National Library",
      "Proof of deposit with Supreme Court",
    ],
    fees: [
      { item: "National Library Registration", amount: "₱500" },
      { item: "Supreme Court Library Deposit", amount: "₱300" },
      { item: "Legal Preparation & Filing", amount: "₱2,000" },
      { item: "Certificate Issuance", amount: "₱300" },
    ],
    ctaLabel: "Register Copyright",
    ctaLink: "/contact?service=Copyright",
  },
  {
    id: "infringement",
    icon: Gavel,
    title: "Infringement Enforcement",
    subtitle: "Legal action to stop unauthorized use and seek damages",
    heroImg: IMAGES.infringementHero,
    accent: "bg-rose-500",
    accentLight: "bg-rose-50",
    gradient: "from-rose-500 to-pink-600",
    plainExplanation:
      "If someone is using your trademark, patent, or copyright without permission, we can take legal action to stop them and seek damages. We handle both administrative complaints and court litigation.",
    legal: {
      definition: "Unauthorized use of registered IP, counterfeiting, or piracy with remedies under RA 8293.",
      term: "Varies by case complexity (3–12+ months)",
      coverage: "Administrative (Bureau of Patents) and Judicial (Regional Trial Court) venues",
    },
    timeline: "3–12+ months",
    process: [
      { phase: "Evidence Collection", duration: "1–2 weeks", desc: "Gather proof of unauthorized use" },
      { phase: "Cease & Desist Letter", duration: "1 week", desc: "Formal demand to stop infringement" },
      { phase: "Filing Decision", duration: "1 week", desc: "Determine best venue (administrative/judicial)" },
      { phase: "Complaint Filing", duration: "1–2 weeks", desc: "File administrative or civil case" },
      { phase: "Investigation/Litigation", duration: "3–12 months", desc: "Proceedings and evidence presentation" },
      { phase: "Decision & Enforcement", duration: "1–3 months", desc: "Remedies implementation" },
    ],
    requirements: [
      "Proof of valid IP registration",
      "Evidence of unauthorized use (photos, samples, documents)",
      "Documentation of sales/distribution",
      "Cease and Desist letter response (if applicable)",
      "Proof of damages (sales records, market analysis)",
      "Witness statements",
    ],
    fees: [
      { item: "Case Assessment & Strategy", amount: "₱5,000" },
      { item: "Cease and Desist Letter", amount: "₱2,000" },
      { item: "Administrative Complaint", amount: "₱8,000 – ₱15,000" },
      { item: "Civil Litigation", amount: "₱15,000 – ₱50,000+", note: "Depends on complexity" },
      { item: "Contingency Option", amount: "Available", note: "For strong cases" },
    ],
    ctaLabel: "Report Infringement",
    ctaLink: "/contact?service=Infringement",
  },
];

function ServiceDetail({ s }: { s: Service }) {
  return (
    <div id={s.id} className="scroll-mt-24">
      {/* Hero banner */}
      <Reveal>
        <div className="relative rounded-3xl overflow-hidden mb-8 h-[280px] sm:h-[340px]">
          <img src={s.heroImg} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className={cn("absolute inset-0 bg-gradient-to-r opacity-90", s.gradient)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center">
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{s.title}</h2>
                <p className="text-white/70 text-sm">{s.subtitle}</p>
              </div>
            </div>
            <p className="text-white/85 max-w-2xl leading-relaxed">{s.plainExplanation}</p>
          </div>
        </div>
      </Reveal>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Legal summary */}
          <Reveal delay={100}>
            <div className="glass-card rounded-3xl p-6 border border-slate-100/70">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4" /> Legal Summary
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Definition", value: s.legal.definition },
                  { label: "Protection Term", value: s.legal.term },
                  { label: "Coverage", value: s.legal.coverage },
                  ...(s.legal.maintenance ? [{ label: "Maintenance", value: s.legal.maintenance }] : []),
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{item.label}</div>
                    <div className="text-sm text-slate-700 leading-relaxed">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Process timeline */}
          <Reveal delay={200}>
            <div className="glass-card rounded-3xl p-6 border border-slate-100/70">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Process & Timeline
                </h4>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {s.timeline}
                </span>
              </div>
              <div className="space-y-0">
                {s.process.map((p, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      {i < s.process.length - 1 && <div className="w-0.5 h-10 bg-blue-200" />}
                    </div>
                    <div className="pb-5 flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <h5 className="font-semibold text-slate-800 text-sm">{p.phase}</h5>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                          {p.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Requirements */}
          <Reveal delay={100}>
            <div className="glass-card rounded-3xl p-6 border border-slate-100/70">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Requirements Checklist
              </h4>
              <ul className="space-y-2.5">
                {s.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Fees */}
          <Reveal delay={200}>
            <div className="glass-card rounded-3xl p-6 border border-slate-100/70">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Fees</h4>
              <div className="space-y-0 divide-y divide-slate-100">
                {s.fees.map((fee) => (
                  <div key={fee.item} className="flex items-start justify-between py-3 first:pt-0 last:pb-0 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700">{fee.item}</div>
                      {fee.note && <div className="text-xs text-slate-400 mt-0.5">{fee.note}</div>}
                    </div>
                    <div className="text-sm font-bold text-slate-800 shrink-0">{fee.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal delay={300}>
            <Link
              to={s.ctaLink}
              className={cn(
                "block w-full text-center text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r",
                s.gradient
              )}
            >
              <span className="inline-flex items-center gap-2">
                {s.ctaLabel} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

export function ServicesPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [location.hash]);

  return (
    <>
      <Navbar />
      <AIChatbot />

      {/* ── Hero with image ── */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.hero} alt="Legal consultation" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/92 via-blue-950/85 to-slate-900/70" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-blue-200 mb-6 border-blue-400/20">
                <Sparkles className="w-4 h-4" />
                RA 8293 Philippine IP Code Experts
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
                Intellectual Property Services
              </h1>
              <p className="text-lg text-blue-100/80 leading-relaxed mb-8">
                Comprehensive protection for your innovations and brand assets under Philippine law. Clear, professional guidance at every step.
              </p>
              <div className="flex flex-wrap gap-3">
                {services.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="inline-flex items-center gap-2 glass text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-white/20 transition-all"
                  >
                    <s.icon className="w-4 h-4 opacity-80" />
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Service hero cards grid ── */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Choose Your Protection</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Each service is tailored to your specific IP asset. Click any card to jump to full details.
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={(i * 100) as 0|100|200|300}>
                <ServiceHeroCard
                  id={s.id}
                  icon={s.icon}
                  title={s.title}
                  tagline={s.subtitle}
                  img={s.heroImg}
                  accent={s.accent}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Detailed sections ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {services.map((s) => (
            <ServiceDetail key={s.id} s={s} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-30" />
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <Reveal>
            <div className="glass-dark rounded-3xl p-10 sm:p-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Not Sure Which Service You Need?
              </h2>
              <p className="text-slate-300 mb-8">
                Our attorneys will assess your situation and recommend the best course of action at no initial cost.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/contact" className="btn-primary">Get Free Assessment</Link>
                <Link to="/faq" className="btn-glass">Browse FAQs</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
