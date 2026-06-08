import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Target, Eye, Award, ArrowRight, Star, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation(0.08);
  return (
    <div
      ref={ref}
      className={cn(
        "animate-on-scroll",
        delay === 100 && "delay-100",
        delay === 200 && "delay-200",
        delay === 300 && "delay-300",
        isVisible && "visible",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AboutPage() {
  return (
    <>
      <Navbar />
      <AIChatbot />

      {/* Hero — image banner */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7876150/pexels-photo-7876150.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1400"
            alt="Legal consultation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-blue-950/80 to-slate-900/60" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">About Our Firm</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Dedicated to Protecting Philippine Innovation
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Laguna Lake Trademarks provides professional IP services, combining
              deep legal expertise with personalized attention to every client's needs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission / Values */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Our Mission",
                desc: "To provide accessible, professional IP protection services that empower Filipino businesses and innovators to secure their intellectual assets under Philippine law.",
                accent: "from-blue-500/10 to-blue-600/5 border-blue-100",
                iconBg: "bg-blue-50 text-blue-600",
              },
              {
                icon: Eye,
                title: "Our Vision",
                desc: "To be the leading IP services firm in the region, known for integrity, expertise, and unwavering commitment to protecting our clients' innovations and brands.",
                accent: "from-amber-500/10 to-amber-600/5 border-amber-100",
                iconBg: "bg-amber-50 text-amber-600",
              },
              {
                icon: Award,
                title: "Our Values",
                desc: "Integrity, diligence, and accessibility guide every client interaction. Clear communication and persistent advocacy are the cornerstones of effective IP protection.",
                accent: "from-emerald-500/10 to-emerald-600/5 border-emerald-100",
                iconBg: "bg-emerald-50 text-emerald-600",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 100 as 0|100|200|300}>
                <div className={cn("glass-card rounded-3xl p-8 border bg-gradient-to-br h-full", item.accent)}>
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5", item.iconBg)}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Split: Image + Stats */}
      <section className="section-padding bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal className="relative">
              <div className="rounded-3xl overflow-hidden h-[420px] relative">
                <img
                  src="https://images.pexels.com/photos/7876088/pexels-photo-7876088.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900"
                  alt="Law books and documents"
                  className="w-full h-full object-cover"
                />
                {/* floating glass card */}
                <div className="absolute bottom-6 right-6 glass-white rounded-2xl p-4 max-w-[200px]">
                  <div className="flex gap-1 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">"Exceptional IP protection, fast and professional."</p>
                  <p className="text-xs text-slate-400 mt-1">— Manila Foods Corp.</p>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">By the Numbers</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5">Why Trust Us With Your IP</h2>
                <p className="text-slate-500 leading-relaxed mb-8">
                  With over 15 years of focused experience in Philippine IP law, we
                  bring specialized knowledge and a proven track record to every case.
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { stat: "15+", label: "Years Experience" },
                  { stat: "500+", label: "Cases Filed" },
                  { stat: "98%", label: "Success Rate" },
                  { stat: "<4hr", label: "Avg Response Time" },
                ].map((item, i) => (
                  <Reveal key={item.label} delay={i * 100 as 0|100|200|300}>
                    <div className="glass-card rounded-2xl p-5 text-center card-hover">
                      <div className="text-3xl font-extrabold text-gradient mb-1">{item.stat}</div>
                      <div className="text-xs text-slate-500">{item.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <ul className="space-y-3 mb-8">
                  {[
                    "Direct attorney representation — no paralegal hand-offs",
                    "Transparent billing and fee structures",
                    "Proactive deadline monitoring and renewals",
                    "Full RA 8293 compliance expertise",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                  Start Your Inquiry
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
