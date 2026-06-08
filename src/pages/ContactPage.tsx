import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";
import emailjs from '@emailjs/browser';
import { useAdminStore } from "@/store/adminStore";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Mail,
  Send,
  CheckCircle2,
  Loader2,
  Star,
  Copy,
  CopyCheck,
  User,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/utils/cn";

function ScrollSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, isVisible } = useScrollAnimation(0.08);
  return (
    <div ref={ref} className={cn("animate-on-scroll", isVisible && "visible", className)}>
      {children}
    </div>
  );
}

type ServiceType = "Patent" | "Trademark" | "Copyright" | "Infringement" | "Other" | "";

interface FormData {
  serviceType: ServiceType;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  description: string;
  preferredContact: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface ChatMessage {
  id: number;
  type: "system" | "attorney" | "client";
  sender: string;
  content: string;
  time: string;
}

/* ─── Inline post-submission chat widget ─── */
function PostSubmitChat({
  inquiryId,
  clientName,
  serviceType,
}: {
  inquiryId: string;
  clientName: string;
  serviceType: ServiceType;
}) {
  const { adminProfile } = useAdminStore();
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "system",
      sender: "System",
      content: `Your inquiry ${inquiryId} has been received. A message thread has been created for this inquiry.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: 2,
      type: "attorney",
      sender: adminProfile.name,
      content: `Hello ${clientName}! Thank you for reaching out about ${serviceType || "IP"} services. I've received your inquiry and will review the details shortly. Feel free to send any additional information or questions here while you wait.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyId = () => {
    navigator.clipboard.writeText(inquiryId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  const sendMessage = async () => {
    const content = input.trim();
    if (!content) return;

    const now = new Date().toISOString();
    const clientMsg: ChatMessage = {
      id: Date.now(),
      type: "client",
      sender: clientName || "You",
      content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, clientMsg]);
    setInput("");

    // Write to real shared store so admin can see it
    const { addMessage } = await import("@/store/adminStore");
    const threadId = document.cookie.split("; ").find((c) => c.startsWith("current_thread_id="))?.split("=")[1] || "0";

    if (threadId && threadId !== "0") {
      addMessage({
        id: String(Date.now()),
        threadId,
        senderType: "User",
        senderName: clientName || "You",
        content,
        timestamp: now,
        isRead: false,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="text-center pb-2">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Inquiry Submitted!</h2>
        <p className="text-slate-500 text-sm">
          Your message thread is now open. You can chat with your attorney directly below.
        </p>
      </div>

      {/* Inquiry ID pill */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
          <div>
            <div className="text-xs text-slate-400 mb-0.5">Your Inquiry ID</div>
            <div className="font-mono font-bold text-slate-800 text-sm">{inquiryId}</div>
          </div>
          <button
            onClick={copyId}
            className="p-2 rounded-xl hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
            title="Copy ID"
          >
            {copied ? (
              <CopyCheck className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Live Chat Panel */}
      <div className="border border-blue-100 rounded-3xl overflow-hidden shadow-lg">
        {/* Chat header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-blue-600 rounded-full" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-sm">{adminProfile.name} — {adminProfile.firm}</h4>
            <p className="text-blue-100 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Online · Typically replies within 24 hours
            </p>
          </div>
          <div className="glass rounded-xl px-3 py-1.5 text-xs font-semibold text-blue-100">
            Thread #{inquiryId.slice(-3)}
          </div>
        </div>

        {/* Messages area */}
        <div className="h-72 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-slate-200/70 text-slate-500 text-xs px-4 py-2 rounded-full text-center max-w-[85%]">
                    {msg.content}
                  </div>
                </div>
              );
            }

            const isClient = msg.type === "client";
            return (
              <div
                key={msg.id}
                className={cn("flex gap-2.5 animate-slide-up", isClient && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isClient ? "bg-slate-200 text-slate-600" : "bg-blue-600 text-white"
                  )}
                >
                  {isClient ? <User className="w-4 h-4" /> : "A"}
                </div>
                <div className={cn("max-w-[75%] space-y-1", isClient && "items-end flex flex-col")}>
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      isClient
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md"
                    )}
                  >
                    {!isClient && (
                      <div className="text-xs font-semibold text-blue-600 mb-0.5">{msg.sender}</div>
                    )}
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-slate-400 px-1">{msg.time}</div>
                </div>
              </div>
            );
          })}


          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message to your attorney… (Enter to send)"
              rows={2}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all bg-slate-50 focus:bg-white"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-2xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h4 className="font-semibold text-blue-800 text-sm mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> What happens next
        </h4>
        <ol className="space-y-2.5">
          {[
            { n: "1", text: "Attorney reviews your inquiry details" },
            { n: "2", text: "Initial assessment and requirements shared via this chat" },
            { n: "3", text: "You'll receive a formal response within 24 hours" },
          ].map((s) => (
            <li key={s.n} className="flex items-start gap-2.5 text-sm text-blue-700">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {s.n}
              </span>
              {s.text}
            </li>
          ))}
        </ol>
      </div>

      {/* Portal link */}
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-3">
          Save your Inquiry ID to access your case status anytime
        </p>
        <Link
          to="/client/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-900 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Access Client Portal
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    serviceType: "",
    name: "",
    email: "",
    phone: "",
    companyName: "",
    description: "",
    preferredContact: "Email",
    agreeToTerms: false,
  });

  useEffect(() => {
    const service = searchParams.get("service");
    if (service) {
      const validServices: ServiceType[] = ["Patent", "Trademark", "Copyright", "Infringement"];
      if (validServices.includes(service as ServiceType)) {
        setFormData((prev) => ({ ...prev, serviceType: service as ServiceType }));
      }
    }
  }, [searchParams]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.serviceType) newErrors.serviceType = "Please select a service type";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.companyName.trim()) newErrors.companyName = "Company/brand name is required";
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must consent to data processing";
    if (!recaptchaToken) newErrors.recaptcha = "Please verify you are human";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    const id = `INQ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(
      Math.floor(Math.random() * 999) + 1
    ).padStart(3, "0")}`;

    // Create real inquiry in the shared store
    const newInquiry = {
      id,
      clientId: "0",
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone || "",
      serviceType: formData.serviceType as any,
      subject: `${formData.serviceType} Inquiry`,
      message: formData.description,
      preferredContact: formData.preferredContact,
      status: "Pending" as const,
      submittedAt: new Date().toISOString(),
      threadId: null,
    };

    // Dynamically import to avoid circular issues in single bundle
    const { addInquiry, addThread, addMessage } = await import("@/store/adminStore");

    addInquiry(newInquiry);

    // Send email notification via EmailJS
    try {
      if (
        import.meta.env.VITE_EMAILJS_SERVICE_ID &&
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY &&
        import.meta.env.VITE_EMAILJS_SERVICE_ID !== 'your_emailjs_service_id'
      ) {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            inquiry_id: id,
            client_name: formData.name,
            client_email: formData.email,
            client_phone: formData.phone || "N/A",
            company_name: formData.companyName,
            service_type: formData.serviceType,
            preferred_contact: formData.preferredContact,
            message_details: formData.description,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      }
    } catch (error) {
      console.error("Failed to send email notification", error);
    }

    // Create a thread for real messaging
    const threadId = String(Date.now());
    addThread({
      id: threadId,
      clientId: "0",
      clientName: formData.name,
      clientEmail: formData.email,
      inquiryId: id,
      status: "Open",
      lastMessage: "Inquiry submitted",
      lastUpdated: new Date().toISOString(),
      unreadCount: 0,
    });

    // Seed first system message
    addMessage({
      id: String(Date.now() + 1),
      threadId,
      senderType: "System",
      senderName: "System",
      content: `Inquiry ${id} received. An attorney will respond shortly.`,
      timestamp: new Date().toISOString(),
      isRead: true,
    });

    setInquiryId(id);
    setIsSubmitting(false);
    setSubmitted(true);

    // Save thread id for client portal
    document.cookie = `user_id=0; Path=/; Max-Age=2592000`;
    document.cookie = `current_thread_id=${threadId}; Path=/; Max-Age=2592000`;

    setTimeout(() => {
      document.getElementById("post-submit-chat")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <>
      <Navbar />
      <AIChatbot />

      {/* Hero */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7567551/pexels-photo-7567551.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1400"
            alt="Signing legal documents"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/88 via-blue-950/80 to-slate-900/70" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">Get in Touch</p>
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
            >
              Start Your Inquiry
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Tell us about your intellectual property needs and we'll respond
              within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-14 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">

            {/* ── Left: Contact info sidebar ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Direct Contact Methods */}
              <ScrollSection>
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-lg">Contact Us Directly</h3>
                  <div className="space-y-3">
                    <a
                      href="mailto:lagunalaketm@gmail.com"
                      className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
                    >
                      <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">Email</div>
                        <div className="text-xs text-slate-400 mt-0.5">lagunalaketm@gmail.com</div>
                      </div>
                    </a>
                  </div>
                </div>
              </ScrollSection>

              {/* Why choose us */}
              <ScrollSection>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 fill-white" />
                    Why Choose Us
                  </h4>
                  <ul className="space-y-3 text-sm text-blue-100">
                    {[
                      "15+ years experience in Philippine IP law",
                      "Direct, persistent attorney representation",
                      "Competitive fees and transparent billing",
                      "Proactive monitoring and maintenance",
                      "Response within 24 hours, usually less",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollSection>
            </div>

            {/* ── Right: Form OR Post-submit chat ── */}
            <div className="lg:col-span-3" id="post-submit-chat">
              {!submitted ? (
                <ScrollSection>
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/60">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Send Your Inquiry</h2>
                    <p className="text-sm text-slate-400 mb-6">
                      Fill in the form below and a message thread will open immediately after submission.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      {/* Service Type */}
                      <fieldset>
                        <legend className="text-sm font-semibold text-slate-700 mb-3">
                          Service Type <span className="text-red-500">*</span>
                        </legend>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(["Patent", "Trademark", "Copyright", "Infringement", "Other"] as ServiceType[]).map(
                            (type) => (
                              <label
                                key={type}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all duration-200",
                                  formData.serviceType === type
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="serviceType"
                                  value={type}
                                  checked={formData.serviceType === type}
                                  onChange={() => updateField("serviceType", type)}
                                  className="sr-only"
                                />
                                {type}
                              </label>
                            )
                          )}
                        </div>
                        {errors.serviceType && (
                          <p className="text-red-500 text-xs mt-1.5">{errors.serviceType}</p>
                        )}
                      </fieldset>

                      {/* Name & Email */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            className={cn(
                              "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white",
                              errors.name
                                ? "border-red-300 focus:ring-red-500"
                                : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                            )}
                            placeholder="Juan Dela Cruz"
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className={cn(
                              "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white",
                              errors.email
                                ? "border-red-300 focus:ring-red-500"
                                : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                            )}
                            placeholder="juan@example.com"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                      </div>

                      {/* Phone & Company */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Phone Number{" "}
                            <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            id="contact-phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                            placeholder="+63"
                          />
                        </div>
                        <div>
                          <label htmlFor="contact-company" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Company/Brand Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-company"
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => updateField("companyName", e.target.value)}
                            className={cn(
                              "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white",
                              errors.companyName
                                ? "border-red-300 focus:ring-red-500"
                                : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                            )}
                            placeholder="Your Company Inc."
                          />
                          {errors.companyName && (
                            <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="contact-desc" className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Brief Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="contact-desc"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => updateField("description", e.target.value)}
                          className={cn(
                            "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none bg-white",
                            errors.description
                              ? "border-red-300 focus:ring-red-500"
                              : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                          )}
                          placeholder="Describe your invention, brand, or creative work..."
                        />
                        <div className="flex justify-between mt-1">
                          {errors.description && (
                            <p className="text-red-500 text-xs">{errors.description}</p>
                          )}
                          <p className="text-xs text-slate-400 ml-auto">
                            {formData.description.length}/1000
                          </p>
                        </div>
                      </div>

                      {/* Preferred Contact */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Preferred Contact Method <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.preferredContact}
                          onChange={(e) => updateField("preferredContact", e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        >
                          <option>Email</option>
                        </select>
                      </div>

                      {/* Terms / Privacy */}
                      <div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.agreeToTerms}
                            onChange={(e) => updateField("agreeToTerms", e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-600">
                            I consent to the collection and processing of my personal data in accordance with the{" "}
                            <a href="#" className="text-blue-600 underline">Privacy Policy</a>{" "}
                            for the purpose of handling my inquiry.
                          </span>
                        </label>
                        {errors.agreeToTerms && (
                          <p className="text-red-500 text-xs mt-1 ml-7">{errors.agreeToTerms}</p>
                        )}
                      </div>

                      {/* reCAPTCHA */}
                      <div>
                        <ReCAPTCHA
                          sitekey="6LfJXQ4tAAAAACWaKNPPjvKAjXDGUzbBK451c6VN"
                          onChange={(token) => {
                            setRecaptchaToken(token);
                            if (token && errors.recaptcha) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.recaptcha;
                                return next;
                              });
                            }
                          }}
                        />
                        {errors.recaptcha && (
                          <p className="text-red-500 text-xs mt-1">{errors.recaptcha}</p>
                        )}
                      </div>

                      {/* Hint about chat */}
                      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
                        <MessageSquare className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                        <span>
                          After submitting, a <strong>live message thread</strong> opens instantly so you can
                          chat with your attorney right away.
                        </span>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Inquiry & Open Chat
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </ScrollSection>
              ) : (
                /* ── Post-submit: success + live chat ── */
                <div className="animate-scale-in">
                  <PostSubmitChat
                    inquiryId={inquiryId}
                    clientName={formData.name}
                    serviceType={formData.serviceType}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
