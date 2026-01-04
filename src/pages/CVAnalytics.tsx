import { useState, useEffect } from "react";
import { localDataService } from "@/services/localData";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  HardHat,
  Video,
  MapPin,
  Play,
  Pause,
  RefreshCw,
  Shield,
  Activity,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface CVEvent {
  id: string;
  type: 'ppe-violation' | 'unsafe-act' | 'congestion' | 'progress' | 'intrusion';
  description: string;
  zone: string;
  camera: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved';
  confidence: number;
  thumbnail?: string;
}

interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  status: 'online' | 'offline' | 'recording';
  lastEvent?: string;
  eventsToday: number;
}

interface PPECompliance {
  zone: string;
  helmet: number;
  vest: number;
  gloves: number;
  goggles: number;
  overall: number;
}

interface ProgressMetric {
  zone: string;
  activity: string;
  planned: number;
  actual: number;
  variance: number;
  lastUpdated: string;
}

// Data moved to state

const eventTypeColors = {
  'ppe-violation': 'bg-warning/20 text-warning',
  'unsafe-act': 'bg-destructive/20 text-destructive',
  'congestion': 'bg-accent/20 text-accent',
  'progress': 'bg-success/20 text-success',
  'intrusion': 'bg-destructive/20 text-destructive',
};

const severityColors = {
  'low': 'bg-muted text-muted-foreground',
  'medium': 'bg-warning/20 text-warning',
  'high': 'bg-accent/20 text-accent',
  'critical': 'bg-destructive/20 text-destructive',
};

const CVAnalytics = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [isLive, setIsLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const [cvEvents, setCvEvents] = useState<CVEvent[]>([]);
  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>([]);
  const [ppeCompliance, setPpeCompliance] = useState<PPECompliance[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await localDataService.getCVData();
        setCvEvents(data.cvEvents);
        setCameraFeeds(data.cameraFeeds);
        setPpeCompliance(data.ppeCompliance);
        setProgressMetrics(data.progressMetrics);
      } catch (e) {
        console.error("Failed to load CV data", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const criticalEvents = cvEvents.filter(e => e.severity === 'critical' && e.status === 'new').length;
  const onlineCameras = cameraFeeds.filter(c => c.status !== 'offline').length;
  const avgCompliance = ppeCompliance.length > 0
    ? Math.round(ppeCompliance.reduce((sum, p) => sum + p.overall, 0) / ppeCompliance.length)
    : 0;
  const totalEventsToday = cameraFeeds.reduce((sum, c) => sum + c.eventsToday, 0);

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-accent">
              <Eye className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Computer Vision Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            AI-Powered Site Monitoring, Safety Compliance & Progress Verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64 mr-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events, cameras..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            {isLive ? 'Live' : 'Paused'} • Updated {lastRefresh.toLocaleTimeString()}
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsLive(!isLive)}>
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setLastRefresh(new Date())}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Critical Alerts</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive">{criticalEvents}</p>
          <p className="text-xs text-muted-foreground mt-1">Require attention</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Cameras Online</span>
            <Camera className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{onlineCameras}/{cameraFeeds.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active feeds</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">PPE Compliance</span>
            <HardHat className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-foreground">{avgCompliance}%</p>
          <Progress value={avgCompliance} className="mt-2 h-1.5" />
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Events Today</span>
            <Activity className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalEventsToday}</p>
          <p className="text-xs text-muted-foreground mt-1">Detected by AI</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="events">Live Events</TabsTrigger>
          <TabsTrigger value="cameras">Camera Feeds</TabsTrigger>
          <TabsTrigger value="ppe">PPE Compliance</TabsTrigger>
          <TabsTrigger value="progress">Progress Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Event</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Severity</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Confidence</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cvEvents.filter(event =>
                  event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.camera.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((event) => (
                  <tr key={event.id} className={`border-t border-border/30 hover:bg-muted/20 ${event.status === 'new' && event.severity === 'critical' ? 'bg-destructive/5' : ''}`}>
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {event.camera}
                      </p>
                    </td>
                    <td className="p-3">
                      <Badge className={eventTypeColors[event.type]}>{event.type.replace('-', ' ')}</Badge>
                    </td>
                    <td className="p-3 text-sm text-foreground">{event.zone}</td>
                    <td className="p-3">
                      <Badge className={severityColors[event.severity]}>{event.severity}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{event.status}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={event.confidence} className="w-12 h-1.5" />
                        <span className="text-xs text-muted-foreground">{event.confidence}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{event.timestamp}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="cameras">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cameraFeeds.filter(camera =>
              camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              camera.zone.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((camera) => (
              <div key={camera.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="aspect-video bg-muted/50 flex items-center justify-center relative">
                  <Video className="w-12 h-12 text-muted-foreground/50" />
                  <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-xs ${camera.status === 'online' ? 'bg-success/20 text-success' :
                    camera.status === 'recording' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-success' :
                      camera.status === 'recording' ? 'bg-destructive animate-pulse' :
                        'bg-muted-foreground'
                      }`} />
                    {camera.status}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{camera.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{camera.zone}</span>
                    <span className="text-xs text-muted-foreground">{camera.eventsToday} events today</span>
                  </div>
                  {camera.lastEvent && (
                    <p className="text-xs text-warning mt-1">Last: {camera.lastEvent}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ppe">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Helmet</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Safety Vest</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Gloves</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Goggles</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Overall</th>
                </tr>
              </thead>
              <tbody>
                {ppeCompliance.filter(zone =>
                  zone.zone.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((zone) => (
                  <tr key={zone.zone} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3 text-sm font-medium text-foreground">{zone.zone}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={zone.helmet} className="w-16 h-1.5" />
                        <span className={`text-xs ${zone.helmet >= 90 ? 'text-success' : zone.helmet >= 80 ? 'text-warning' : 'text-destructive'}`}>{zone.helmet}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={zone.vest} className="w-16 h-1.5" />
                        <span className={`text-xs ${zone.vest >= 90 ? 'text-success' : zone.vest >= 80 ? 'text-warning' : 'text-destructive'}`}>{zone.vest}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={zone.gloves} className="w-16 h-1.5" />
                        <span className={`text-xs ${zone.gloves >= 90 ? 'text-success' : zone.gloves >= 80 ? 'text-warning' : 'text-destructive'}`}>{zone.gloves}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={zone.goggles} className="w-16 h-1.5" />
                        <span className={`text-xs ${zone.goggles >= 90 ? 'text-success' : zone.goggles >= 80 ? 'text-warning' : 'text-destructive'}`}>{zone.goggles}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={
                        zone.overall >= 85 ? 'bg-success/20 text-success' :
                          zone.overall >= 75 ? 'bg-warning/20 text-warning' :
                            'bg-destructive/20 text-destructive'
                      }>
                        {zone.overall}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Activity</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Planned</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actual (CV)</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Variance</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {progressMetrics.filter(metric =>
                  metric.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  metric.activity.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((metric) => (
                  <tr key={metric.zone} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3 text-sm font-medium text-foreground">{metric.zone}</td>
                    <td className="p-3 text-sm text-foreground">{metric.activity}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={metric.planned} className="w-16 h-1.5" />
                        <span className="text-xs text-muted-foreground">{metric.planned}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={metric.actual} className="w-16 h-1.5" />
                        <span className="text-xs text-foreground font-medium">{metric.actual}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-sm font-medium ${metric.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {metric.variance >= 0 ? '+' : ''}{metric.variance}%
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{metric.lastUpdated}</td>
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

export default CVAnalytics;
