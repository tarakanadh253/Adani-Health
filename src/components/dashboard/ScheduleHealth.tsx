import { ScheduleData } from "@/types";
interface ScheduleHealthProps {
  data?: ScheduleData[];
}
import { cn } from "@/lib/utils";

export function ScheduleHealth({ data = [] }: ScheduleHealthProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Schedule Health</h3>
          <p className="text-sm text-muted-foreground">4D Timeline Progress</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-muted-foreground">On Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-muted-foreground">At Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Delayed</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={item.phase} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.phase}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {item.actual}% / {item.planned}%
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      item.status === "on-track" && "bg-success/10 text-success",
                      item.status === "at-risk" && "bg-warning/10 text-warning",
                      item.status === "delayed" && "bg-destructive/10 text-destructive"
                    )}
                  >
                    {item.status === "on-track" ? "On Track" : item.status === "at-risk" ? "At Risk" : "Delayed"}
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                {/* Planned Progress */}
                <div
                  className="absolute inset-y-0 left-0 bg-primary/30 rounded-full"
                  style={{ width: `${item.planned}%` }}
                />
                {/* Actual Progress */}
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    item.status === "on-track" && "bg-success",
                    item.status === "at-risk" && "bg-warning",
                    item.status === "delayed" && "bg-destructive"
                  )}
                  style={{ width: `${item.actual}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No schedule data available
          </div>
        )}
      </div>
    </div>
  );
}
