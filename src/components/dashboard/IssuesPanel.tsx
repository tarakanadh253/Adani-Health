import { IssueData } from "@/types";
import { cn } from "@/lib/utils";
import { AlertCircle, MessageSquare, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IssuesPanelProps {
  issues?: IssueData[];
}

const typeIcons = {
  clash: AlertCircle,
  rfi: MessageSquare,
  "change-order": RefreshCw,
  "design-review": MessageSquare
};

const typeLabels = {
  clash: "Clash",
  rfi: "RFI",
  "change-order": "CO",
  "design-review": "Review"
};

export function IssuesPanel({ issues = [] }: IssuesPanelProps) {
  return (
    <div className="h-full relative overflow-hidden rounded-xl p-6 shadow-lg border border-white/10 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md animate-slide-up flex flex-col" style={{ animationDelay: "500ms" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Active Issues</h3>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From Autodesk ACC & SAP</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 transition-colors">
          View All <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      <div className="relative z-10 space-y-3 flex-1 overflow-auto pr-1">
        {issues.length > 0 ? (
          issues.slice(0, 5).map((issue, index) => {
            const Icon = typeIcons[issue.type] || MessageSquare;
            return (
              <div
                key={issue.id}
                className="group p-3 rounded-lg border border-white/5 bg-background/40 hover:bg-background/60 hover:border-primary/20 hover:shadow-glow-sm transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg shadow-inner",
                      issue.type === "clash" && "bg-destructive/10 text-destructive",
                      issue.type === "rfi" && "bg-primary/10 text-primary",
                      issue.type === "change-order" && "bg-secondary/10 text-secondary",
                      issue.type === "design-review" && "bg-accent/10 text-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border",
                          issue.type === "clash" && "bg-destructive/5 border-destructive/20 text-destructive",
                          issue.type === "rfi" && "bg-primary/5 border-primary/20 text-primary",
                          issue.type === "change-order" && "bg-secondary/5 border-secondary/20 text-secondary",
                          !issue.type && "bg-muted border-border text-muted-foreground"
                        )}
                      >
                        {typeLabels[issue.type] || "Issue"}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border",
                          issue.priority === "critical" && "bg-destructive/5 border-destructive/20 text-destructive",
                          issue.priority === "high" && "bg-orange-500/10 border-orange-500/20 text-orange-500",
                          issue.priority === "medium" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
                          issue.priority === "low" && "bg-muted border-border text-muted-foreground"
                        )}
                      >
                        {issue.priority}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-medium">
                      <span>{issue.zone || "No Zone"}</span>
                      <span className="opacity-30">•</span>
                      <span>{issue.assignee || "Unassigned"}</span>
                      <span className="opacity-30">•</span>
                      <span>Due: {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        issue.status === "open" && "bg-destructive animate-pulse",
                        issue.status === "in-progress" && "bg-warning",
                        issue.status === "resolved" && "bg-success"
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground bg-white/5 rounded-lg border border-dashed border-white/10">
            <div className="p-3 rounded-full bg-muted/20 mb-3">
              <MessageSquare className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-sm font-medium">No active issues found</p>
            <p className="text-xs opacity-60">Everything is running smoothly</p>
          </div>
        )}
      </div>
    </div>
  );
}
