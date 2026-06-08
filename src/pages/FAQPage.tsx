import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronDown, ArrowRight, MessageSquareText } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";

function ScrollSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, isVisible } = useScrollAnimation(0.08);
  return (
    <div
      ref={ref}
      className={cn("animate-on-scroll", isVisible && "visible", className)}
    >
      {children}
    </div>
  );
}

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    q: "What is the difference between a patent and a trademark?",
    a: "A patent protects technical inventions for 20 years, preventing others from making, using, or selling your invention. A trademark protects brand names, logos, and slogans for 10 years (renewable) and distinguishes your goods/services from others in the marketplace. Patents require proving novelty and non-obviousness; trademarks require showing distinctiveness and use in commerce.",
    category: "General",
  },
  {
    q: "How long does trademark registration take in the Philippines?",
    a: "Trademark registration typically takes 6-12 months from filing to approval. The process includes: trademark availability search (1-2 weeks), application preparation (1-2 weeks), filing with IPO (1 day), examination period (2-4 months), 30-day publication/opposition period, and final approval (2-4 weeks).",
    category: "Trademark",
  },
  {
    q: "What are the costs for patent filing?",
    a: "Patent filing costs include: professional assessment (₱3,500), specification preparation (₱8,000-12,000), government IPO filing fee (₱2,000), and annual maintenance fees (₱500-1,000/year). Total initial costs typically range from ₱13,500 to ₱17,500 plus annual maintenance.",
    category: "Patent",
  },
  {
    q: "Do I need to register my copyright for protection?",
    a: "Copyright protection is automatic upon creation of your work under Philippine law. However, official registration with the National Library and Supreme Court Library deposit provides legal proof of ownership, making it easier to enforce your rights and claim damages in case of infringement.",
    category: "Copyright",
  },
  {
    q: "What is the Declaration of Actual Use (DAU)?",
    a: "The DAU is a mandatory filing required for trademark holders in the Philippines. You must file a DAU within 3 years from the filing date, and another between the 5th and 6th years. Failure to file the DAU results in the cancellation of your trademark registration. You must provide evidence of actual commercial use of the mark in the Philippines.",
    category: "Trademark",
  },
  {
    q: "What can I do if someone is using my registered trademark without permission?",
    a: "You have several options: (1) Send a Cease and Desist letter demanding they stop, (2) File an administrative complaint with the Bureau of Patents, Designs and Trademarks, (3) File a civil case in the Regional Trial Court for damages. We recommend starting with a formal demand letter and escalating if necessary.",
    category: "Infringement",
  },
  {
    q: "Can I file a patent application myself?",
    a: "While self-filing is technically possible, it is strongly discouraged. Patent applications require precise technical descriptions, carefully crafted claims defining the scope of protection, and compliance with strict formal requirements. Errors can result in rejection or narrower protection than intended. Professional preparation significantly increases success rates.",
    category: "Patent",
  },
  {
    q: "How long does copyright protection last?",
    a: "Under Philippine law (RA 8293), copyright protection lasts for the lifetime of the author plus 50 years after their death. For works made for hire, anonymous works, or works created by corporations, protection lasts for 50 years from the date of first publication.",
    category: "Copyright",
  },
  {
    q: "What is the Nice Classification system?",
    a: "The Nice Classification is an international system that categorizes goods and services into 45 classes (34 for goods, 11 for services) for trademark registration purposes. Your trademark is protected only for the specific classes you register under. It's important to identify all relevant classes for your business to ensure comprehensive protection.",
    category: "Trademark",
  },
];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "General", "Patent", "Trademark", "Copyright", "Infringement"];

  const filteredFaqs =
    activeCategory === "All"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  return (
    <>
      <Navbar />
      <AIChatbot />

      <section className="pt-0 pb-16 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero image banner */}
        <div className="relative pt-36 pb-16 mb-10 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/8085932/pexels-photo-8085932.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=1400"
              alt="Legal research"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/88 via-blue-950/80 to-slate-900/70" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">Knowledge Base</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-blue-100/80 max-w-2xl mx-auto">
              Answers to common questions about intellectual property protection under Philippine law.
            </p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollSection>
            <div className="hidden"></div>
          </ScrollSection>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <ScrollSection key={i}>
                <div className="glass-card border border-slate-100/60 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-start gap-3 pr-4">
                      <span className="text-xs font-bold text-slate-300 mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 shrink-0 text-slate-400 transition-transform duration-300",
                        openIndex === i && "rotate-180 text-blue-500"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openIndex === i ? "max-h-96" : "max-h-0"
                    )}
                  >
                    <div className="px-5 pb-5 pl-14 text-sm text-slate-600 leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </ScrollSection>
            ))}
          </div>

          {/* CTA */}
          <ScrollSection>
            <div className="mt-12 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Still have questions?
              </h3>
              <p className="text-slate-500 mb-6 text-sm">
                Our AI assistant can provide instant answers, or you can contact
                an attorney directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    const btn = document.querySelector(
                      ".fixed.bottom-6.right-6"
                    ) as HTMLButtonElement;
                    btn?.click();
                  }}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <MessageSquareText className="w-4 h-4" />
                  Ask AI Assistant
                </button>
                <Link to="/contact" className="btn-primary text-sm">
                  Contact Attorney
                  <ArrowRight className="w-4 h-4 inline ml-1.5" />
                </Link>
              </div>
            </div>
          </ScrollSection>
        </div>
      </section>

      <Footer />
    </>
  );
}
