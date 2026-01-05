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
  Wrench,
  Search,
  Filter,
  Download,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Ticket,
  Zap,
  Droplets,
  Thermometer,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  category: 'hvac' | 'electrical' | 'plumbing' | 'medical-gas' | 'equipment' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  location: string;
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  slaHours: number;
  hoursElapsed: number;
}

interface MaintenanceSchedule {
  id: string;
  asset: string;
  assetId: string;
  type: 'preventive' | 'predictive' | 'corrective';
  frequency: string;
  lastCompleted: string;
  nextDue: string;
  status: 'scheduled' | 'overdue' | 'completed';
  assignedTeam: string;
}

interface EnergyReading {
  area: string;
  consumption: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}

interface SpaceUtilization {
  area: string;
  type: 'OT' | 'ICU' | 'Ward' | 'OPD' | 'Diagnostic';
  capacity: number;
  occupied: number;
  peakHours: string;
  avgUtilization: number;
}

// Data moved to state inside component

const ticketStatusColors = {
  'new': 'bg-info/20 text-info',
  'assigned': 'bg-secondary/20 text-secondary',
  'in-progress': 'bg-warning/20 text-warning',
  'resolved': 'bg-success/20 text-success',
  'closed': 'bg-muted text-muted-foreground',
};

const priorityColors = {
  'low': 'bg-muted text-muted-foreground',
  'medium': 'bg-info/20 text-info',
  'high': 'bg-warning/20 text-warning',
  'critical': 'bg-destructive/20 text-destructive',
};

const categoryIcons = {
  'hvac': Thermometer,
  'electrical': Zap,
  'plumbing': Droplets,
  'medical-gas': AlertTriangle,
  'equipment': Wrench,
  'general': Ticket,
};

const Operations = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("helpdesk");
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[]>([]);
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [spaceUtilization, setSpaceUtilization] = useState<SpaceUtilization[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await localDataService.getOperationsData();

        // Map WorkOrders to Tickets
        const newTickets: Ticket[] = data.workOrders.map((wo: any) => ({
          id: wo.id,
          title: wo.description,
          category: 'equipment',
          priority: wo.priority as any,
          status: (wo.status === 'open' ? 'new' : wo.status) as any,
          location: 'Radiology', // Derived or mock
          reportedBy: 'System',
          reportedDate: wo.createdDate,
          assignedTo: wo.assignedTo,
          slaHours: 48,
          hoursElapsed: 0
        }));
        setTickets(newTickets);

        // Map WorkOrders to Maintenance
        const newMaintenance: MaintenanceSchedule[] = data.workOrders.map((wo: any) => ({
          id: wo.id,
          asset: wo.assetId,
          assetId: wo.assetId,
          type: wo.type as any,
          frequency: 'Monthly',
          lastCompleted: wo.completedDate || '-',
          nextDue: wo.dueDate,
          status: (wo.status === 'open' ? 'scheduled' : 'completed') as any,
          assignedTeam: wo.assignedTo
        }));
        setMaintenanceSchedule(newMaintenance);

        // Map IoT to Energy
        // Mocking energy for now based on power readings if present
        const powerReadings = data.iot.filter((i: any) => i.type === 'power');
        if (powerReadings.length > 0) {
          const energy = powerReadings.map((p: any) => ({
            area: "Radiology Wing",
            consumption: p.value,
            target: 160,
            unit: p.unit,
            trend: 'down',
            percentChange: 2
          }));
          setEnergyReadings(energy as any);
        } else {
          setEnergyReadings([{ area: "Overall Campus", consumption: 14500, target: 15000, unit: "kWh", trend: "down", percentChange: 3.2 }]);
        }

        // Space util mock
        setSpaceUtilization([
          { area: "OT-1", type: "OT", capacity: 1, occupied: 1, peakHours: "10AM-2PM", avgUtilization: 85 },
          { area: "Waiting Room", type: "OPD", capacity: 50, occupied: 32, peakHours: "9AM-11AM", avgUtilization: 65 }
        ]);

      } catch (e) {
        console.error("Failed to load ops data", e);
      }
    };
    loadData();
  }, []);

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaintenance = maintenanceSchedule.filter(m =>
    m.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.assetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnergy = energyReadings.filter(e =>
    e.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSpace = spaceUtilization.filter(s =>
    s.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const slaBreached = tickets.filter(t => t.hoursElapsed > t.slaHours && t.status !== 'resolved' && t.status !== 'closed').length;
  const overdueMaintenace = maintenanceSchedule.filter(m => m.status === 'overdue').length;
  const avgUtilization = spaceUtilization.length > 0 ? Math.round(spaceUtilization.reduce((sum, s) => sum + s.avgUtilization, 0) / spaceUtilization.length) : 0;

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-primary">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Operations & Maintenance</h1>
          </div>
          <p className="text-muted-foreground">
            Helpdesk, Work Orders, Energy & Space Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          {hasPermission('assets', 'edit') && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Open Tickets</span>
            <Ticket className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{openTickets}</p>
          <p className="text-xs text-destructive mt-1">{slaBreached} SLA breached</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overdue PM</span>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-foreground">{overdueMaintenace}</p>
          <p className="text-xs text-muted-foreground mt-1">Maintenance tasks</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Energy Today</span>
            <Zap className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-foreground">19.8 MWh</p>
          <p className="text-xs text-success mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            2% below target
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Utilization</span>
            <Users className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold text-foreground">{avgUtilization}%</p>
          <p className="text-xs text-muted-foreground mt-1">Average space usage</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="helpdesk">Helpdesk</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="energy">Energy & Utilities</TabsTrigger>
            <TabsTrigger value="space">Space Utilization</TabsTrigger>
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

        <TabsContent value="helpdesk">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Ticket</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Assigned</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">SLA</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const CategoryIcon = categoryIcons[ticket.category];
                  const isBreached = ticket.hoursElapsed > ticket.slaHours && ticket.status !== 'resolved' && ticket.status !== 'closed';
                  return (
                    <tr key={ticket.id} className="border-t border-border/30 hover:bg-muted/20">
                      <td className="p-3">
                        <p className="text-sm font-medium text-foreground">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground">{ticket.id} • {ticket.reportedDate}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground capitalize">{ticket.category.replace('-', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={ticketStatusColors[ticket.status]}>{ticket.status}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{ticket.location}</td>
                      <td className="p-3 text-sm text-foreground">{ticket.assignedTo || '-'}</td>
                      <td className="p-3">
                        <div className={`text-xs ${isBreached ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          {ticket.hoursElapsed}h / {ticket.slaHours}h
                          {isBreached && <span className="ml-1">⚠️</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Asset</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Frequency</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Last Done</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Next Due</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Team</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenance.map((item) => (
                  <tr key={item.id} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{item.asset}</p>
                      <p className="text-xs text-muted-foreground">{item.assetId}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{item.type}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{item.frequency}</td>
                    <td className="p-3 text-sm text-muted-foreground">{item.lastCompleted}</td>
                    <td className="p-3 text-sm text-foreground">{item.nextDue}</td>
                    <td className="p-3">
                      <Badge className={
                        item.status === 'completed' ? 'bg-success/20 text-success' :
                          item.status === 'overdue' ? 'bg-destructive/20 text-destructive' :
                            'bg-info/20 text-info'
                      }>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{item.assignedTeam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="energy">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Area</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Consumption</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Target</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Variance</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Trend</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnergy.map((reading) => {
                  const variance = reading.consumption - reading.target;
                  const isOver = variance > 0;
                  return (
                    <tr key={reading.area} className="border-t border-border/30 hover:bg-muted/20">
                      <td className="p-3 text-sm font-medium text-foreground">{reading.area}</td>
                      <td className="p-3 text-sm text-foreground">{reading.consumption.toLocaleString()} {reading.unit}</td>
                      <td className="p-3 text-sm text-muted-foreground">{reading.target.toLocaleString()} {reading.unit}</td>
                      <td className="p-3">
                        <span className={`text-sm font-medium ${isOver ? 'text-destructive' : 'text-success'}`}>
                          {isOver ? '+' : ''}{variance} {reading.unit}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className={`flex items-center gap-1 text-sm ${reading.trend === 'up' ? 'text-destructive' :
                          reading.trend === 'down' ? 'text-success' :
                            'text-muted-foreground'
                          }`}>
                          {reading.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                            reading.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                          {reading.percentChange > 0 ? '+' : ''}{reading.percentChange}%
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={isOver ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}>
                          {isOver ? 'Over Target' : 'On Target'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="space">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Area</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Capacity</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Occupied</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Utilization</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Peak Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredSpace.map((space) => (
                  <tr key={space.area} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3 text-sm font-medium text-foreground">{space.area}</td>
                    <td className="p-3">
                      <Badge variant="outline">{space.type}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{space.capacity}</td>
                    <td className="p-3 text-sm text-foreground">{space.occupied}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={space.avgUtilization} className="w-16 h-1.5" />
                        <span className="text-xs text-muted-foreground">{space.avgUtilization}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{space.peakHours}</td>
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

export default Operations;
