import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { localDataService } from "@/services/localData";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  HardHat,
  Search,
  Filter,
  Download,
  Plus,
  Users,
  Truck,
  ClipboardCheck,
  AlertTriangle,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  BarChart3,
  Image,
} from "lucide-react";

interface DailyReport {
  id: string;
  date: string;
  zone: string;
  contractor: string;
  manpower: number;
  plannedActivities: string[];
  completedActivities: string[];
  issues: string[];
  photos: number;
  weather: string;
  submittedBy: string;
}

interface InventoryItem {
  id: string;
  material: string;
  unit: string;
  stock: number;
  minLevel: number;
  lastReceived: string;
  location: string;
  status: 'ok' | 'low' | 'critical';
}

interface WorkforceEntry {
  contractor: string;
  trade: string;
  planned: number;
  actual: number;
  zone: string;
}

interface NCR {
  id: string;
  title: string;
  zone: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'in-progress' | 'closed' | 'verified';
  raisedDate: string;
  contractor: string;
  rootCause?: string;
  daysOpen: number;
}

interface SafetyObservation {
  id: string;
  type: 'unsafe-act' | 'unsafe-condition' | 'near-miss' | 'good-practice';
  description: string;
  zone: string;
  date: string;
  reportedBy: string;
  status: 'open' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

// Data moved to state inside component

const severityColors = {
  'minor': 'bg-warning/20 text-warning',
  'major': 'bg-accent/20 text-accent',
  'critical': 'bg-destructive/20 text-destructive',
};

const ncrStatusColors = {
  'open': 'bg-destructive/20 text-destructive',
  'in-progress': 'bg-warning/20 text-warning',
  'closed': 'bg-muted text-muted-foreground',
  'verified': 'bg-success/20 text-success',
};

const observationTypeColors = {
  'unsafe-act': 'bg-destructive/20 text-destructive',
  'unsafe-condition': 'bg-warning/20 text-warning',
  'near-miss': 'bg-accent/20 text-accent',
  'good-practice': 'bg-success/20 text-success',
};

const Construction = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [workforce, setWorkforce] = useState<WorkforceEntry[]>([]);
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [safetyObservations, setSafetyObservations] = useState<SafetyObservation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await localDataService.getConstructionData();
        setDailyReports(data.dailyReports);
        setInventory(data.inventory);
        setWorkforce(data.workforce);
        setNcrs(data.ncrs);
        setSafetyObservations(data.safetyObservations);
      } catch (e) {
        console.error("Failed to load construction data", e);
      }
    };
    loadData();
  }, []);

  // Filtering Logic
  const filteredReports = dailyReports.filter(r =>
    r.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventory = inventory.filter(i =>
    i.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkforce = workforce.filter(w =>
    w.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNCRs = ncrs.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSafety = safetyObservations.filter(s =>
    s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalManpower = workforce.reduce((sum, w) => sum + w.actual, 0);
  const plannedManpower = workforce.reduce((sum, w) => sum + w.planned, 0);
  const lowStockItems = inventory.filter(i => i.status !== 'ok').length;
  const openNCRs = ncrs.filter(n => n.status === 'open' || n.status === 'in-progress').length;
  const openSafetyIssues = safetyObservations.filter(s => s.status === 'open').length;

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-accent">
              <HardHat className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Construction Execution</h1>
          </div>
          <p className="text-muted-foreground">
            Daily Progress, Inventory, Workforce, Quality & Safety Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Workforce</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalManpower}</p>
          <p className="text-xs text-muted-foreground">{Math.round((totalManpower / plannedManpower) * 100)}% of planned</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Low Stock</span>
            <Package className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-foreground">{lowStockItems}</p>
          <p className="text-xs text-warning">Items need reorder</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Open NCRs</span>
            <XCircle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-foreground">{openNCRs}</p>
          <p className="text-xs text-destructive">Require action</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Safety Issues</span>
            <AlertTriangle className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{openSafetyIssues}</p>
          <p className="text-xs text-muted-foreground">Open observations</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Today's Photos</span>
            <Camera className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold text-foreground">{dailyReports[0]?.photos || 0}</p>
          <p className="text-xs text-muted-foreground">Uploaded</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="daily">Daily Reports</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="workforce">Workforce</TabsTrigger>
            <TabsTrigger value="quality">Quality & NCR</TabsTrigger>
            <TabsTrigger value="safety">Safety & EHS</TabsTrigger>
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

        <TabsContent value="daily">
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-card rounded-xl border border-border/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{report.id}</Badge>
                      <Badge variant="secondary">{report.zone}</Badge>
                    </div>
                    <h3 className="font-medium text-foreground">{report.contractor}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {report.manpower} workers
                      </span>
                      <span>{report.weather}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Image className="w-3 h-3" />
                    {report.photos} Photos
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Planned Activities</p>
                    <ul className="space-y-1">
                      {report.plannedActivities.map((act, i) => (
                        <li key={i} className="text-sm text-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Completed</p>
                    <ul className="space-y-1">
                      {report.completedActivities.map((act, i) => (
                        <li key={i} className="text-sm text-success flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Issues</p>
                    {report.issues.length > 0 ? (
                      <ul className="space-y-1">
                        {report.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-warning flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-success flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        No issues reported
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Submitted by: {report.submittedBy}</span>
                  <Button variant="ghost" size="sm">View Full Report</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Material</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Min Level</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Last Received</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{item.material}</p>
                      <p className="text-xs text-muted-foreground">{item.id}</p>
                    </td>
                    <td className="p-3 text-sm text-foreground">{item.stock} {item.unit}</td>
                    <td className="p-3 text-sm text-muted-foreground">{item.minLevel} {item.unit}</td>
                    <td className="p-3">
                      <Badge className={
                        item.status === 'ok' ? 'bg-success/20 text-success' :
                          item.status === 'low' ? 'bg-warning/20 text-warning' :
                            'bg-destructive/20 text-destructive'
                      }>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{item.location}</td>
                    <td className="p-3 text-sm text-muted-foreground">{item.lastReceived}</td>
                  <td className="p-3">
                    {hasPermission('construction', 'edit') && (
                      <Button variant="ghost" size="sm">Reorder</Button>
                    )}
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="workforce">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Contractor</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Trade</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Planned</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actual</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Variance</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkforce.map((entry, i) => {
                  const variance = entry.actual - entry.planned;
                  return (
                    <tr key={i} className="border-t border-border/30 hover:bg-muted/20">
                      <td className="p-3 text-sm font-medium text-foreground">{entry.contractor}</td>
                      <td className="p-3">
                        <Badge variant="outline">{entry.trade}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{entry.zone}</td>
                      <td className="p-3 text-sm text-foreground">{entry.planned}</td>
                      <td className="p-3 text-sm text-foreground">{entry.actual}</td>
                      <td className="p-3">
                        <span className={`text-sm font-medium ${variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {variance >= 0 ? '+' : ''}{variance}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="quality">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">NCR</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Severity</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Contractor</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Days Open</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Root Cause</th>
                </tr>
              </thead>
              <tbody>
                {filteredNCRs.map((ncr) => (
                  <tr key={ncr.id} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{ncr.title}</p>
                      <p className="text-xs text-muted-foreground">{ncr.id}</p>
                    </td>
                    <td className="p-3 text-sm text-foreground">{ncr.zone}</td>
                    <td className="p-3">
                      <Badge className={severityColors[ncr.severity]}>{ncr.severity}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={ncrStatusColors[ncr.status]}>{ncr.status}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{ncr.contractor}</td>
                    <td className="p-3 text-sm text-foreground">{ncr.daysOpen}d</td>
                    <td className="p-3 text-sm text-muted-foreground">{ncr.rootCause || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="safety">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Observation</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Reported By</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSafety.map((obs) => (
                  <tr key={obs.id} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3">
                      <p className="text-sm text-foreground">{obs.description}</p>
                      <p className="text-xs text-muted-foreground">{obs.id}</p>
                    </td>
                    <td className="p-3">
                      <Badge className={observationTypeColors[obs.type]}>{obs.type.replace('-', ' ')}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{obs.zone}</td>
                    <td className="p-3">
                      <Badge variant="outline">{obs.priority}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={obs.status === 'open' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}>
                        {obs.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{obs.reportedBy}</td>
                    <td className="p-3 text-sm text-muted-foreground">{obs.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Construction;
