import { useState, useEffect } from "react";
import { localDataService } from "@/services/localData";
import {
  Building2, Play, Pause, SkipBack, SkipForward, Calendar, IndianRupee,
  Filter, AlertTriangle, TrendingDown, Truck, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { P6Milestone } from "@/types";
import { cn } from "@/lib/utils";

interface TimelineMilestone {
  date: string;
  phase: string;
  progress: number;
  cost: number;
}

const zones = ['All Zones', 'Radiology Wing', 'Oncology Wing', 'MRI Suite', 'LINAC Vault'];
const trades = ['All Trades', 'Civil', 'MEP', 'Specialist', 'Interiors', 'Equipment'];

export const IDDSpineSection = () => {
  const [timelinePosition, setTimelinePosition] = useState([0]);
  const [timelineMilestones, setTimelineMilestones] = useState<TimelineMilestone[]>([]);
  const [p6Milestones, setP6Milestones] = useState<P6Milestone[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [selectedTrade, setSelectedTrade] = useState('All Trades');
  const [viewMode, setViewMode] = useState<'planned' | 'actual'>('actual');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await localDataService.getIDDSpineData();
        setTimelineMilestones(data.timeline);
        setP6Milestones(data.p6);
      } catch (e) {
        console.error("Failed to load spine data", e);
      }
    };
    loadData();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelinePosition(prev => {
          if (timelineMilestones.length === 0) return prev;

          const next = prev[0] + 1;
          if (next >= timelineMilestones.length) {
            setIsPlaying(false);
            return prev;
          }
          return [next];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timelineMilestones.length]);

  const handleSliderChange = (value: number[]) => {
    setTimelinePosition(value);
  };

  const currentMilestone = timelineMilestones.length > 0 && timelineMilestones[timelinePosition[0]] ? timelineMilestones[timelinePosition[0]] : null;

  const baseProgress = currentMilestone ? currentMilestone.progress : 0;
  const displayProgress = viewMode === 'actual' ? Math.max(0, baseProgress - 5) : baseProgress;

  const plannedCost = currentMilestone ? currentMilestone.cost + 50 : 0;
  const actualCost = viewMode === 'planned' ? plannedCost : (currentMilestone ? currentMilestone.cost : 0);
  const variance = actualCost - plannedCost;

  const filteredMilestones = p6Milestones.filter(m => {
    if (selectedZone !== 'All Zones' && m.zone !== selectedZone) return false;
    if (selectedTrade !== 'All Trades' && m.trade !== selectedTrade) return false;
    return true;
  });

  const atRiskMilestones = filteredMilestones.filter(m => m.atRiskReason);

  if (!currentMilestone) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-xl bg-card border-dashed min-h-[400px]">
        <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Loading Timeline Data...</h3>
        <p className="text-muted-foreground">Please wait while the project schedule is fetched.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-lavender">
              <Building2 className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">IDD Project Spine</h2>
          </div>
          <p className="text-muted-foreground">
            4D/5D Simulation — Ahmedabad Campus Critical Path Visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={viewMode === 'planned' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setViewMode('planned')}>
            Planned
          </Badge>
          <Badge variant={viewMode === 'actual' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setViewMode('actual')}>
            Actual
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 animate-slide-up">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by:</span>
        </div>
        <Select value={selectedZone} onValueChange={setSelectedZone}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            {zones.map(zone => (
              <SelectItem key={zone} value={zone}>{zone}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTrade} onValueChange={setSelectedTrade}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trade" />
          </SelectTrigger>
          <SelectContent>
            {trades.map(trade => (
              <SelectItem key={trade} value={trade}>{trade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3D Viewer Mock */}
      <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden mb-6 animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="relative h-[400px] bg-gradient-to-br from-muted via-background to-muted">
          {/* Building Structure Mock - Zone-based coloring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Building Grid */}
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 16 }).map((_, i) => {
                  const progress = displayProgress;
                  const isComplete = (i / 16) * 100 < progress;
                  const isActive = Math.abs((i / 16) * 100 - progress) < 10;

                  // Mock zone assignment for visual filtering
                  const blockZone = zones[(i % (zones.length - 1)) + 1];
                  const isHidden = selectedZone !== 'All Zones' && blockZone !== selectedZone;

                  const isDelayed = (i === 2 || i === 6) && (viewMode === 'actual'); // Only show delays in 'Actual' mode

                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-16 h-16 rounded-lg transition-all duration-500 border-2 relative group cursor-pointer",
                        isComplete && !isDelayed && "bg-success/40 border-success",
                        isDelayed && "bg-destructive/40 border-destructive",
                        isActive && !isComplete && !isDelayed && "bg-warning/40 border-warning animate-pulse",
                        !isComplete && !isActive && !isDelayed && "bg-muted/30 border-border/30",
                        isHidden && "opacity-20 blur-[1px]" // Visually dim filtered out blocks
                      )}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/50 shadow-lg z-10">
                        {isDelayed ? 'Delayed: RFI Pending' : isComplete ? 'Complete' : 'In Progress'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Zone Labels */}
              <div className="absolute -right-40 top-0 space-y-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/20 border border-destructive/30 rounded text-xs text-destructive">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  LINAC Vault (-14 days)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/20 border border-warning/30 rounded text-xs text-warning">
                  <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  MEP Rough-In (At Risk)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/20 border border-success/30 rounded text-xs text-success">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Structure (Complete)
                </div>
              </div>

              {/* Heavy Equipment Sequencing */}
              <div className="absolute -left-36 top-1/2 -translate-y-1/2 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border/50 rounded text-xs shadow-lg">
                  <Truck className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">LINAC Delivery</p>
                    <p className="text-muted-foreground">Dec 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border/50 rounded text-xs shadow-lg">
                  <Settings2 className="w-4 h-4 text-secondary" />
                  <div>
                    <p className="font-medium text-foreground">MRI Install</p>
                    <p className="text-muted-foreground">Mar 15, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay Info */}
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Current Phase</p>
            <p className="text-lg font-semibold text-foreground">{currentMilestone.phase}</p>
            <p className="text-sm text-primary">{currentMilestone.date}</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{viewMode === 'planned' ? 'Planned Progress' : 'Actual Progress'}</p>
              <p className="text-2xl font-bold text-foreground">{displayProgress}%</p>
            </div>
          </div>

          {/* Live Cost Ticker */}
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Live Cost Ticker</p>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold font-mono text-foreground">
                {actualCost.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">Cr</span>
            </div>
            <div className={cn(
              "text-xs mt-1 flex items-center gap-1",
              variance < 0 ? "text-success" : "text-destructive"
            )}>
              <TrendingDown className="w-3 h-3" />
              {variance < 0 ? 'Under' : 'Over'} budget by ₹{Math.abs(variance)} Cr
            </div>
          </div>

          {/* Progress Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success" />
              <span className="text-xs text-muted-foreground">On Schedule</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-warning" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive" />
              <span className="text-xs text-muted-foreground">Delayed</span>
            </div>
          </div>
        </div>
      </div>



      {/* 5D Cost Timeline & At-Risk Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card animate-slide-up" style={{ animationDelay: "150ms" }}>
          <h3 className="font-semibold text-foreground mb-4">Value of Work Scheduled</h3>
          <p className="text-3xl font-bold text-primary">₹{plannedCost} Cr</p>
          <p className="text-sm text-muted-foreground mt-1">As per P6 baseline</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-semibold text-foreground mb-4">Value of Work Performed</h3>
          <p className="text-3xl font-bold text-success">₹{actualCost} Cr</p>
          <p className="text-sm text-muted-foreground mt-1">Actual certified value</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card animate-slide-up" style={{ animationDelay: "250ms" }}>
          <h3 className="font-semibold text-foreground mb-4">Financial Variance</h3>
          <p className={cn("text-3xl font-bold", variance < 0 ? "text-success" : "text-destructive")}>
            {variance < 0 ? '-' : '+'}₹{Math.abs(variance)} Cr
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {variance < 0 ? 'Under-billed' : 'Over-billed'} this period
          </p>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-warning/5 rounded-xl p-6 border border-warning/30 shadow-card animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground">At-Risk Milestones</h3>
          </div>
          <div className="space-y-3">
            {atRiskMilestones.slice(0, 2).map((m) => (
              <div key={m.id} className="text-sm">
                <p className="font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.atRiskReason}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] py-0 bg-destructive/10 text-destructive border-destructive/30">
                    {m.floatDays} days float
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
