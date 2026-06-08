import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles, User, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  isCaseQuery?: boolean;
}

const QUICK_QUESTIONS = [
  "What's the difference between a patent and a trademark?",
  "How long does trademark registration take?",
  "What are the costs for patent filing?",
  "How do I protect my brand name?",
];

const LAW_RESPONSES: Record<string, { reply: string; isCaseQuery?: boolean }> =
  {
    patent: {
      reply:
        "A **patent** protects technical inventions for **20 years** from the filing date, giving you exclusive rights to make, use, or sell your invention. To qualify, your invention must be **novel**, **non-obvious**, and **industrially applicable** (per RA 8293 Section 21).\n\nKey points:\n• Filing timeline: 24-30 months average\n• Government filing fee: ₱2,000\n• Professional preparation: ₱8,000-12,000\n\nWould you like to explore our patent services?",
    },
    trademark: {
      reply:
        "A **trademark** protects your brand name, logo, or slogan for **10 years** from filing and is **renewable indefinitely**. It must be a visible sign capable of distinguishing your goods/services from others (per RA 8293 Section 121).\n\nKey points:\n• Coverage: 45 Nice Classification classes\n• Filing timeline: 6-12 months average\n• Government filing fee: ₱1,500 per class\n• Renewal: Every 10 years\n\nDeclaration of Actual Use (DAU) is required in the 3rd and 5th years.",
    },
    copyright: {
      reply:
        "**Copyright** protects original creative works automatically upon creation (per RA 8293 Section 176). While registration isn't required, it provides **legal proof of ownership** and stronger enforcement rights.\n\nProtection lasts for the **life of the author + 50 years**.\n\nRegistration involves:\n• National Library registration (₱500)\n• Supreme Court Library deposit (₱300)\n• Timeline: 4-8 weeks",
    },
    infringement: {
      reply:
        "If someone is using your registered IP without permission, you have legal remedies under RA 8293:\n\n**Options include:**\n1. **Cease and Desist letter** - Formal demand to stop\n2. **Administrative complaint** - Bureau of Patents, Designs and Trademarks\n3. **Civil litigation** - Regional Trial Court\n\nRemedies: Injunctive relief, damages, destruction of infringing goods.\n\nFor specific enforcement guidance, we recommend consulting directly with our attorneys.",
    },
  };

const FALLBACKS: Record<string, string> = {
  cost: "Professional fees vary by service:\n\n• Patent: ₱8,000-12,000 (professional) + ₱2,000 (government)\n• Trademark: ₱3,000 (professional) + ₱1,500/class (government)\n• Copyright: ₱2,000 (professional) + ₱800 (government)\n\nFor a detailed quote specific to your needs, please submit an inquiry.",
  time: "Estimated timelines:\n\n• Patent: 24-30 months\n• Trademark: 6-12 months\n• Copyright: 4-8 weeks\n\nTimelines may vary based on IPO workload and application complexity.",
   contact: "You can reach us at:\n\n📧 lagunalaketm@gmail.com\n\nOr submit an inquiry through our contact form for a structured consultation.",
};

function findResponse(message: string): { reply: string; isCaseQuery?: boolean } {
  const lower = message.toLowerCase();

  // Check for case-specific queries
  if (
    /\b(my case|my application|check status|application status|my filing|update on)\b/i.test(
      lower
    )
  ) {
    return {
      reply:
        "It sounds like you're asking about a specific case or application status. For personalized legal assistance regarding your particular situation, please contact us directly through our inquiry form or live chat. Our attorneys can provide tailored guidance.",
      isCaseQuery: true,
    };
  }

  // Check law responses
  if (/\b(patent|invention|invent)\b/i.test(lower)) {
    return LAW_RESPONSES.patent;
  }
  if (/\b(trademark|brand|logo|slogan|mark)\b/i.test(lower)) {
    return LAW_RESPONSES.trademark;
  }
  if (/\b(copyright|creative|author|artistic|literary|music|book)\b/i.test(lower)) {
    return LAW_RESPONSES.copyright;
  }
  if (/\b(infring|violat|copied|stolen|unauthorized|cease)\b/i.test(lower)) {
    return LAW_RESPONSES.infringement;
  }
  if (/\b(cost|fee|price|how much|charge)\b/i.test(lower)) {
    return { reply: FALLBACKS.cost };
  }
  if (/\b(timeline|how long|duration|period|wait)\b/i.test(lower)) {
    return { reply: FALLBACKS.time };
  }
  if (/\b(contact|email|reach)\b/i.test(lower)) {
    return { reply: FALLBACKS.contact };
  }

  // General response
  return {
    reply:
      "Thank you for your question about Philippine intellectual property law. I can help with information about:\n\n• **Patent Protection** - 20-year protection for inventions\n• **Trademark Registration** - 10-year renewable brand protection\n• **Copyright Services** - Life + 50 years for creative works\n• **Infringement Enforcement** - Legal remedies against unauthorized use\n\nFor specific legal advice tailored to your situation, I recommend consulting with our attorneys directly.",
  };
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      type: "bot",
      content:
        "👋 Hello! I'm the Laguna Lake Trademarks **AI Legal Assistant**. I can answer questions about Philippine IP law (RA 8293), including patents, trademarks, copyrights, and infringement.\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = findResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response.reply,
        isCaseQuery: response.isCaseQuery,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\n/g, "<br/>")
      .replace(/• /g, '<span class="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 mb-0.5"></span>');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          isOpen
            ? "bg-slate-800/90 backdrop-blur-xl scale-90 border border-white/10"
            : "bg-gradient-to-br from-blue-500 to-blue-700 hover:scale-110 hover:shadow-blue-400/40 shadow-blue-500/30"
        )}
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] glass-card rounded-3xl shadow-2xl border border-white/60 overflow-hidden transition-all duration-300",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm">
              AI Legal Assistant
            </h4>
            <p className="text-blue-100 text-xs">Powered by Philippine IP Law</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2.5 animate-slide-up",
                msg.type === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                  msg.type === "bot"
                    ? "bg-blue-100"
                    : "bg-slate-200"
                )}
              >
                {msg.type === "bot" ? (
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.type === "bot"
                    ? "bg-white border border-slate-100 shadow-sm text-slate-700"
                    : "bg-blue-600 text-white"
                )}
                dangerouslySetInnerHTML={{
                  __html: formatContent(msg.content),
                }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && (
          <div className="px-4 py-3 space-y-2 bg-white border-t border-slate-50">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Suggested Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask about IP law..."
              className="flex-1 text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-center">
            <Link
              to="/contact"
              className="text-xs text-slate-400 hover:text-blue-500 inline-flex items-center gap-1 transition-colors"
            >
              Need specific legal advice? Contact an attorney
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
