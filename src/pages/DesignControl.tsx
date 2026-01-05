import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { localDataService } from "@/services/localData";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  GitBranch,
  ArrowUpRight,
  Calendar,
  User,
  Building2,
} from "lucide-react";
// import { apsService } from "@/services/aps";
import { IssueData } from "@/types";

interface Deliverable {
  id: string;
  name: string;
  discipline: string;
  phase: 'CD' | 'SD' | 'DD' | 'GFC';
  status: 'not-started' | 'in-progress' | 'for-review' | 'approved' | 'superseded';
  owner: string;
  dueDate: string;
  version: string;
  accDocId: string;
  progress: number;
}

interface RFI {
  id: string;
  title: string;
  zone: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'pending' | 'answered' | 'closed';
  raisedBy: string;
  assignedTo: string;
  raisedDate: string;
  dueDate: string;
  responseTime?: number;
  slaBreached: boolean;
}

interface DesignDecision {
  id: string;
  title: string;
  date: string;
  options: string[];
  decision: string;
  approver: string;
  linkedDocs: string[];
  impact: string;
}

const statusColors = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/20 text-info',
  'for-review': 'bg-warning/20 text-warning',
  'approved': 'bg-success/20 text-success',
  'superseded': 'bg-muted text-muted-foreground line-through',
};

const rfiStatusColors = {
  'open': 'bg-info/20 text-info',
  'pending': 'bg-warning/20 text-warning',
  'answered': 'bg-success/20 text-success',
  'closed': 'bg-muted text-muted-foreground',
};

const priorityColors = {
  'low': 'bg-muted text-muted-foreground',
  'medium': 'bg-info/20 text-info',
  'high': 'bg-warning/20 text-warning',
  'critical': 'bg-destructive/20 text-destructive',
};

const DesignControl = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("deliverables");

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [rfis, setRfis] = useState<RFI[]>([]);
  const [decisions, setDecisions] = useState<DesignDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await localDataService.getDesignData();
        setDeliverables(data.deliverables);
        setDecisions(data.decisions);

        // Map API Issues to local RFI interface
        // Note: the API returns generic 'IssueData', we map it to RFI specific fields where possible
        // We filter for RFIs specifically if possible, or assume all issues are displayed differently in different contexts
        const mappedRfis: RFI[] = data.rfis
          .filter((issue: IssueData) => issue.type === 'rfi')
          .map((issue: IssueData) => ({
            id: issue.id,
            title: issue.title,
            zone: issue.zone || "General",
            priority: (issue.priority === "critical" || issue.priority === "high" || issue.priority === "medium" || issue.priority === "low") ? issue.priority : "medium",
            status: (issue.status === "open" || issue.status === "resolved" || issue.status === "in-progress" || issue.status === "escalated") ? (issue.status === "resolved" ? "closed" : "open") : "pending",
            raisedBy: issue.source || "System",
            assignedTo: issue.assignee || "Unassigned",
            raisedDate: new Date().toISOString().split('T')[0], // Mock date if not in API
            dueDate: issue.dueDate || "",
            responseTime: undefined,
            slaBreached: issue.slaBreached
          }));

        setRfis(mappedRfis);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtering Logic
  const filteredDeliverables = deliverables.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRfis = rfis.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDecisions = decisions.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.decision.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedDeliverables = deliverables.filter(d => d.status === 'approved').length;
  const totalProgress = deliverables.length > 0 ? Math.round(deliverables.reduce((sum, d) => sum + d.progress, 0) / deliverables.length) : 0;
  const openRfis = rfis.filter(r => r.status === 'open' || r.status === 'pending').length;
  const breachedRfis = rfis.filter(r => r.slaBreached).length;

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-primary">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Design Control</h1>
          </div>
          <p className="text-muted-foreground">
            Deliverable Register, RFI Management & Design Decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          {hasPermission('design', 'edit') && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Issue
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Design Progress</span>
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalProgress}%</p>
          <Progress value={totalProgress} className="mt-2 h-1.5" />
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Deliverables</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{completedDeliverables}/{deliverables.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Approved</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Open RFIs</span>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-foreground">{openRfis}</p>
          <p className="text-xs text-muted-foreground mt-1">{breachedRfis} SLA breached</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Decisions</span>
            <GitBranch className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{decisions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Logged this month</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="deliverables">Deliverable Register</TabsTrigger>
            <TabsTrigger value="rfis">RFI Management</TabsTrigger>
            <TabsTrigger value="decisions">Decision Log</TabsTrigger>
            <TabsTrigger value="clashes">Clash Dashboard</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="deliverables">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Deliverable</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Discipline</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Phase</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Owner</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Progress</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Version</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">Loading...</td></tr>
                ) : filteredDeliverables.length === 0 ? (
                  <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No deliverables found</td></tr>
                ) : (
                  filteredDeliverables.map((item) => (
                    <tr key={item.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.accDocId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{item.discipline}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{item.phase}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={statusColors[item.status]}>{item.status.replace('-', ' ')}</Badge>
                      </td>
                      <td className="p-3 text-sm text-foreground">{item.owner}</td>
                      <td className="p-3 text-sm text-muted-foreground">{item.dueDate}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={item.progress} className="w-16 h-1.5" />
                          <span className="text-xs text-muted-foreground">{item.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{item.version}</td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="rfis">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">RFI</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Raised By</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Assigned To</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">SLA</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">Loading...</td></tr>
                ) : filteredRfis.length === 0 ? (
                  <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No RFIs found</td></tr>
                ) : (
                  filteredRfis.map((rfi) => (
                    <tr key={rfi.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{rfi.title}</p>
                          <p className="text-xs text-muted-foreground">{rfi.id}</p>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-foreground">{rfi.zone}</td>
                      <td className="p-3">
                        <Badge className={priorityColors[rfi.priority]}>{rfi.priority}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={rfiStatusColors[rfi.status]}>{rfi.status}</Badge>
                      </td>
                      <td className="p-3 text-sm text-foreground">{rfi.raisedBy}</td>
                      <td className="p-3 text-sm text-foreground">{rfi.assignedTo}</td>
                      <td className="p-3 text-sm text-muted-foreground">{rfi.dueDate}</td>
                      <td className="p-3">
                        {rfi.slaBreached ? (
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">Breached</span>
                          </div>
                        ) : rfi.responseTime ? (
                          <span className="text-xs text-success">{rfi.responseTime}d response</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="decisions">
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-center">Loading...</p>
            ) : filteredDecisions.length === 0 ? (
              <p className="text-muted-foreground text-center">No decisions logged</p>
            ) : (
              filteredDecisions.map((decision) => (
                <div key={decision.id} className="bg-card rounded-xl border border-border/50 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{decision.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {decision.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {decision.approver}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">{decision.id}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Options Considered</p>
                      <div className="flex flex-wrap gap-1">
                        {decision.options.map((opt, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{opt}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Final Decision</p>
                      <p className="text-sm text-foreground font-medium">{decision.decision}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Impact</p>
                      <p className="text-sm text-foreground">{decision.impact}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Linked:</span>
                    {decision.linkedDocs.map((doc) => (
                      <Badge key={doc} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                        {doc}
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )))}
          </div>
        </TabsContent>

        <TabsContent value="clashes">
          <div className="bg-card rounded-xl border border-border/50 p-6">
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Clash Dashboard</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This module displays clash detection results from ACC Model Coordination.
                Connect to Autodesk Construction Cloud to view real-time clash analysis.
              </p>
              <Button variant="outline" className="mt-4 gap-2">
                <ArrowUpRight className="w-4 h-4" />
                View in ACC
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default DesignControl;
