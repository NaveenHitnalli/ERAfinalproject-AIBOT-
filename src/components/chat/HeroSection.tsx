import { ShoppingBag, Sparkles, Search, Mic, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { QuickActionButtons } from "./QuickActionButtons";

interface HeroSectionProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const features = [
  { icon: Search, label: "Smart Search", desc: "Natural language product discovery", action: "Search for trending products" },
  { icon: Sparkles, label: "AI Recommendations", desc: "Personalized suggestions", action: "Recommend products for me" },
  { icon: Mic, label: "Voice Search", desc: "Speak to find products", action: "" },
  { icon: Globe, label: "15 Languages", desc: "Shop in your language", action: "" },
];

export function HeroSection({ onAction, disabled }: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-14 px-4">
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-6"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center relative">
          <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <Zap className="w-3.5 h-3.5 text-primary-foreground" />
          </motion.div>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-center mb-8 max-w-lg"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
          Your AI Shopping Assistant
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Discover products, compare prices, and manage your cart — all through natural conversation.
        </p>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 w-full max-w-xl"
      >
        {features.map((f, i) => (
          <motion.button
            key={f.label}
            type="button"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
            onClick={() => f.action && !disabled && onAction(f.action)}
            disabled={disabled || !f.action}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer disabled:cursor-default disabled:opacity-70"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <f.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground">{f.label}</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">{f.desc}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="w-full max-w-xl"
      >
        <p className="text-xs font-medium text-muted-foreground mb-3 text-center uppercase tracking-wider">
          Quick Start
        </p>
        <div className="flex justify-center">
          <QuickActionButtons onAction={onAction} disabled={disabled} />
        </div>
      </motion.div>
    </div>
  );
}
