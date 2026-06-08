import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { cn } from "@/utils/cn";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"loading" | "fadingOut">("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 2-second premium loading sequence
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Smooth easing out function
      const easeOutExpo = currentStep === steps ? 1 : 1 - Math.pow(2, -10 * currentStep / steps);
      setProgress(easeOutExpo * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setStage("fadingOut");
        setTimeout(() => {
          onComplete();
        }, 1000); // Wait for the 1s fade transition
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
        // Instead of a solid background, we use a frosted glass effect that reveals the homepage underneath
        "bg-slate-950/70 backdrop-blur-[40px]",
        stage === "fadingOut" ? "opacity-0 backdrop-blur-none pointer-events-none" : "opacity-100"
      )}
    >
      <div className={cn(
        "relative z-10 flex flex-col items-center transform transition-all duration-1000",
        stage === "fadingOut" ? "scale-110 opacity-0" : "scale-100 opacity-100"
      )}>
        {/* Elegant Logo */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-[30px] opacity-20 animate-pulse-slow" />
          <div className="w-24 h-24 bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-md relative z-10">
            <Scale className="w-12 h-12 text-white/90" strokeWidth={1} />
          </div>
        </div>

        {/* Minimalist Typography */}
        <div className="text-center mb-12 overflow-hidden">
          <h1 className="text-4xl font-light text-white tracking-[0.1em] animate-[slide-up_1s_ease-out]">
            LAGUNA LAKE
          </h1>
          <p className="text-xs font-semibold text-blue-200/50 uppercase tracking-[0.4em] mt-3 animate-[slide-up_1.2s_ease-out]">
            Intellectual Property
          </p>
        </div>

        {/* Ultra-thin elegant progress line */}
        <div className="w-48 h-[1px] bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute left-0 top-0"
            style={{ 
              width: '100%',
              transform: `translateX(${progress - 100}%)`,
              transition: "transform 20ms linear"
            }}
          />
        </div>
      </div>
    </div>
  );
}
