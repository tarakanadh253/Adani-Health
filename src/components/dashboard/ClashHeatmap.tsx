import { ClashData } from "@/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, FileQuestion, Layers } from "lucide-react";

interface ClashHeatmapProps {
  data?: ClashData[];
}

export function ClashHeatmap({ data = [] }: ClashHeatmapProps) {
  const maxClashes = Math.max(...data.map((d) => d.clashCount), 0);

  return (
    <div className="relative overflow-hidden rounded-xl p-6 shadow-lg border border-white/10 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Oncology Wing Heatmap</h3>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Clash Density & RFI Bottlenecks</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-background/40 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Low</span>
          </div>
          <div className="w-px h-3 bg-border/50" />
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Med</span>
          </div>
          <div className="w-px h-3 bg-border/50" />
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground">High</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {data.length > 0 ? (
          data.map((zone, index) => {
            const intensity = maxClashes > 0 ? zone.clashCount / maxClashes : 0;
            return (
              <div
                key={zone.zone}
                className={cn(
                  "relative p-4 rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer group bg-background/50 backdrop-blur-sm overflow-hidden",
                  zone.severity === "high" && "border-destructive/30 hover:border-destructive hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]",
                  zone.severity === "medium" && "border-warning/30 hover:border-warning hover:shadow-[0_0_15px_rgba(234,179,8,0.15)]",
                  zone.severity === "low" && "border-success/30 hover:border-success hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Background Gradient based on severity */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20",
                    zone.severity === "high" && "bg-gradient-to-br from-destructive to-transparent",
                    zone.severity === "medium" && "bg-gradient-to-br from-warning to-transparent",
                    zone.severity === "low" && "bg-gradient-to-br from-success to-transparent"
                  )}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-bold text-foreground line-clamp-2">{zone.zone}</h4>
                    <Layers
                      className={cn(
                        "w-4 h-4",
                        zone.severity === "high" && "text-destructive",
                        zone.severity === "medium" && "text-warning",
                        zone.severity === "low" && "text-success"
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Clashes</span>
                      <span className="text-xl font-bold text-foreground">{zone.clashCount}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">RFIs</span>
                      <span className="text-lg font-semibold text-foreground">{zone.rfiCount}</span>
                    </div>
                  </div>

                  {/* Visual Intensity Bar */}
                  <div className="mt-3 h-1 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 shadow-[0_0_8px_currentColor]",
                        zone.severity === "high" && "bg-destructive text-destructive",
                        zone.severity === "medium" && "bg-warning text-warning",
                        zone.severity === "low" && "bg-success text-success"
                      )}
                      style={{ width: `${intensity * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 lg:col-span-4 text-center py-12 text-muted-foreground bg-white/5 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-muted/20 mb-3">
              <AlertTriangle className="w-6 h-6 opacity-50" />
            </div>
            <p className="font-medium">No clash data detected</p>
            <p className="text-xs opacity-60 mt-1">Connect ACC Model Coordination to view heatmap</p>
          </div>
        )}
      </div>
    </div>
  );
}
