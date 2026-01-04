import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  Calendar,
  FileQuestion,
  CheckCircle,
  Shield,
  LucideIcon,
} from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: string;
  delay?: number;
}

const iconMap: Record<string, LucideIcon> = {
  wallet: Wallet,
  "trending-up": TrendingUp,
  calendar: Calendar,
  "file-question": FileQuestion,
  "check-circle": CheckCircle,
  shield: Shield,
};

export function KPICard({ label, value, change, trend, icon, delay = 0 }: KPICardProps) {
  const Icon = iconMap[icon] || Wallet;

  return (
    <div
      className="relative overflow-hidden rounded-xl p-5 shadow-lg border border-white/10 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300 animate-slide-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {change !== 0 && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border backdrop-blur-sm",
                trend === "up" && change > 0 && "bg-success/10 text-success border-success/20",
                trend === "up" && change < 0 && "bg-destructive/10 text-destructive border-destructive/20",
                trend === "down" && "bg-destructive/10 text-destructive border-destructive/20"
              )}
            >
              <TrendingUp
                className={cn(
                  "w-3 h-3",
                  trend === "down" && "rotate-180"
                )}
              />
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className="text-3xl font-extrabold text-foreground mb-1 tracking-tight">{value}</p>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
