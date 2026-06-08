import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { cn } from "@/utils/cn";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"loading" | "fadingOut">("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate premium loading progress
    const duration = 2500; // total 2.5 seconds
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Easing function for smooth progress
      const easeOutQuart = 1 - Math.pow(1 - currentStep / steps, 4);
      setProgress(easeOutQuart * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setStage("fadingOut");
        setTimeout(() => {
          onComplete();
        }, 800); // 800ms fade out
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-700 ease-in-out",
        stage === "fadingOut" ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 animate-pulse" />
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/50 transform rotate-3 relative z-10 border border-blue-400/20">
            <Scale className="w-10 h-10 text-white transform -rotate-3" strokeWidth={1.5} />
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center mb-10 overflow-hidden">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white/70 tracking-tight animate-[slide-up_1s_ease-out]">
            Laguna Lake
          </h1>
          <p className="text-sm font-medium text-blue-200/60 uppercase tracking-[0.3em] mt-2 animate-[slide-up_1.2s_ease-out]">
            Trademarks & IP
          </p>
        </div>

        {/* Premium Progress Bar */}
        <div className="w-64 max-w-[80vw] h-1.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 rounded-full relative"
            style={{ 
              width: `${progress}%`,
              transition: "width 50ms linear"
            }}
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
