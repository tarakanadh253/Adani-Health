import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { BudgetChart } from "@/components/dashboard/BudgetChart";
import { ScheduleHealth } from "@/components/dashboard/ScheduleHealth";
import { ClashHeatmap } from "@/components/dashboard/ClashHeatmap";
import { IssuesPanel } from "@/components/dashboard/IssuesPanel";
import { IDDSpineSection } from "@/components/dashboard/IDDSpineSection";
import { KPIData, IssueData, BudgetData, ScheduleData, ClashData, ApprovalData, MeetingData, ReviewData, FileLinkData } from "@/types";
import { Activity, RefreshCw, FileText, Calendar, CheckSquare, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localDataService } from "@/services/localData";

// Simple Card Components for new modules
const ModuleCard = ({ title, icon: Icon, children, isEmpty, emptyMessage, color = "primary" }: any) => (
  <div className="h-[300px] flex flex-col bg-card rounded-xl border border-border/50 shadow-card animate-slide-up bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md overflow-hidden">
    <div className="p-4 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg bg-${color}/10`}>
          <Icon className={`w-4 h-4 text-${color}`} />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
    </div>
    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
      {isEmpty ? (
        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
          <div className="p-3 rounded-full bg-muted/20 mb-3 opacity-50">
            <Icon className="w-6 h-6" />
          </div>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

const Index = () => {
  const { hasPermission } = useAuth();
  
  // Force HMR Update
  const [executiveKPIs, setExecutiveKPIs] = useState<KPIData[]>([]);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [budget, setBudget] = useState<BudgetData[]>([]);
  const [schedule, setSchedule] = useState<ScheduleData[]>([]);
  const [clashes, setClashes] = useState<ClashData[]>([]);
  const [approvals, setApprovals] = useState<ApprovalData[]>([]);
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [latestFiles, setLatestFiles] = useState<FileLinkData[]>([]);

  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<"online" | "offline">("offline");

  const [projects, setProjects] = useState<{ id: string, name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const fetchData = async (projectId?: string) => {
    setLoading(true);
    let mockData: any = {};

    try {
      mockData = await localDataService.getDashboardData();
      setExecutiveKPIs(mockData.kpis);
      setBudget(mockData.budget);
      setSchedule(mockData.schedule);
      setClashes(mockData.clashes);
      setIssues(mockData.issues);

      setApprovals([]);
      setMeetings([]);
      setReviews([]);
      setLatestFiles([]);

      setSystemStatus("online");
    } catch (e) { console.warn(e); }

    try {
      const apsData = await localDataService.getAPSData(projectId);

      // Update Project List and Active ID
      if (apsData.projects) setProjects(apsData.projects);
      if (apsData.activeProjectId) setSelectedProjectId(apsData.activeProjectId);

      if (apsData.issues && apsData.issues.length > 0) setIssues(apsData.issues);
      if (apsData.approvals && Array.isArray(apsData.approvals)) setApprovals(apsData.approvals);
      if (apsData.meetings && Array.isArray(apsData.meetings)) setMeetings(apsData.meetings);
      if (apsData.reviews && Array.isArray(apsData.reviews)) setReviews(apsData.reviews);
      if (apsData.latestFiles && Array.isArray(apsData.latestFiles)) setLatestFiles(apsData.latestFiles);

      console.log("APS Data Hydrated");
    } catch (error) { console.warn(error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedProjectId(newId);
    fetchData(newId);
  };

  return (
    <MainLayout>
      <div className="relative min-h-screen">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl opacity-50" />
        </div>

        <div className="relative z-10">
          {/* Page Header */}
          <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-background/80 to-secondary/5 border border-border/50 overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-32 h-32" />
            </div>

            <div className="relative flex items-center justify-between z-10 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
                    <Activity className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Executive Mission Control</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-destructive'}`} />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        System Status: {systemStatus === 'online' ? 'Health Nexus DB Active' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground max-w-xl">
                  Ahmedabad Campus POC — Single Source of Truth for Parivartaan Initiative.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-card/50 p-2 rounded-lg border border-border/50 backdrop-blur-md shadow-sm">
                <span className="text-sm font-medium text-muted-foreground ml-2">Project:</span>
                {/* Project Selector */}
                <div className="relative min-w-[200px] max-w-[300px]">
                  <select
                    value={selectedProjectId || ""}
                    onChange={handleProjectChange}
                    disabled={loading || projects.length === 0}
                    className="w-full h-9 pl-3 pr-8 rounded-md border border-input bg-background/80 text-foreground text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer transition-colors hover:bg-accent"
                  >
                    {projects.length === 0 ? (
                      <option>Loading projects...</option>
                    ) : (
                      <>
                        <option value="" disabled>Select a Project</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="absolute right-2.5 top-2.5 pointer-events-none opacity-50">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => fetchData(selectedProjectId || undefined)} disabled={loading} title="Refresh Data">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          {executiveKPIs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {executiveKPIs.map((kpi, index) => (
                <KPICard key={kpi.label} {...kpi} delay={index * 50} />
              ))}
            </div>
          ) : (
            <div className="mb-8 p-8 border border-dashed rounded-xl bg-muted/20 text-center">
              <p className="text-muted-foreground">{loading ? "Loading Executive KPIs..." : "No KPI Data Available"}</p>
            </div>
          )}

          {/* Core Modules Grid (Budget & Schedule) */}
          {(hasPermission('sourcing', 'view') || hasPermission('construction', 'view')) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {hasPermission('sourcing', 'view') && (budget.length > 0 ? (
                <BudgetChart data={budget} />
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center bg-card rounded-xl border border-border/50 border-dashed p-6 text-center animate-slide-up">
                  <div className="p-4 rounded-full bg-secondary/10 mb-4">
                    <Activity className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Cost Management Offline</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Connect to Oracle Primavera or SAP to visualize 5D cost analysis and budget variance.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">Connect Source</Button>
                </div>
              ))}

              {hasPermission('construction', 'view') && (schedule.length > 0 ? (
                <ScheduleHealth data={schedule} />
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center bg-card rounded-xl border border-border/50 border-dashed p-6 text-center animate-slide-up" style={{ animationDelay: "100ms" }}>
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <RefreshCw className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Schedule Sync Required</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Link P6 EPPM or MS Project to view 4D timeline progress and critical path analysis.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">Sync Schedule</Button>
                </div>
              ))}
            </div>
          )}

          {/* IDD Project Spine Section */}
          <div className="mb-8">
            <IDDSpineSection />
          </div>

          {/* Expanded Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Active Issues (Existing, refined) */}
            <div className="lg:col-span-2 row-span-2 h-full">
              <IssuesPanel issues={issues} />
            </div>

            {/* Approvals */}
            <ModuleCard title="Approvals" icon={CheckSquare} isEmpty={approvals.length === 0} emptyMessage="No pending approvals found" color="success">
              <div className="space-y-3">
                {approvals.map((approval) => (
                  <div key={approval.id} className="p-3 rounded-lg bg-background/40 border border-white/5 hover:bg-background/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">{approval.description}</h4>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${approval.status === 'approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {approval.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>By: {approval.requestedBy}</span>
                      <span>Due: {new Date(approval.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ModuleCard>

            {/* Meetings */}
            <ModuleCard title="Meetings" icon={Calendar} isEmpty={meetings.length === 0} emptyMessage="No upcoming meetings scheduled" color="info">
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-3 rounded-lg bg-background/40 border border-white/5 hover:bg-background/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">{meeting.title}</h4>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      </div>
                      <span>{meeting.attendees} Attendees</span>
                    </div>
                  </div>
                ))}
              </div>
            </ModuleCard>

            {/* Reviews */}
            {hasPermission('design', 'view') && (
              <ModuleCard title="Design Reviews" icon={FileText} isEmpty={reviews.length === 0} emptyMessage="No active design reviews" color="warning">
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-3 rounded-lg bg-background/40 border border-white/5 hover:bg-background/60 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">{review.documentName}</h4>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${review.status === 'closed' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                          {review.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(review.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ModuleCard>
            )}

            {/* Latest Files */}
            <ModuleCard title="Project Files" icon={File} isEmpty={latestFiles.length === 0} emptyMessage="No recent file updates" color="primary">
              <div className="space-y-3">
                {latestFiles.map((file) => (
                  <div key={file.id} className="group p-3 rounded-lg bg-background/40 border border-white/5 hover:bg-background/60 transition-colors cursor-pointer" onClick={() => window.open(file.url, '_blank')}>
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded bg-primary/10 text-primary">
                        <File className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{file.name}</h4>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                          <span>v{file.version}</span>
                          <span>{new Date(file.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ModuleCard>
          </div>

          {/* Clashes Section */}
          {hasPermission('design', 'view') && (
            <div className="mb-8">
              {clashes.length > 0 ? (
                <ClashHeatmap data={clashes} />
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center bg-card rounded-xl border border-border/50 border-dashed p-6 text-center animate-slide-up" style={{ animationDelay: "200ms" }}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-destructive/10">
                      <Activity className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-md">Model Coordination Empty</h3>
                      <p className="text-xs text-muted-foreground">Run clash detection in ACC to populate heatmap.</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4">Open ACC</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
