import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { localDataService } from "@/services/localData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Database,
  RefreshCw,
  CheckCircle,
  Link2,
  Activity,
  FileText,
  Settings,
  ArrowUpDown,
  Search,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  recordsCount?: number;
  dataTypes: string[];
  refreshInterval: string;
  syncEnabled: boolean;
}

interface DataQualityRule {
  id: string;
  name: string;
  source: string;
  rule: string;
  status: 'passing' | 'failing' | 'warning';
  lastChecked: string;
  failCount: number;
}

interface ETLJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  schedule: string;
  lastRun: string;
  status: 'success' | 'failed' | 'running' | 'scheduled';
  duration: string;
  recordsProcessed: number;
}

// Removed static arrays, utilizing state with data fetching
// const integrations: Integration[] = [];
// const dataQualityRules: DataQualityRule[] = [];
// const etlJobs: ETLJob[] = [];

const statusColors = {
  connected: 'bg-success/20 text-success',
  disconnected: 'bg-muted text-muted-foreground',
  syncing: 'bg-info/20 text-info',
  error: 'bg-destructive/20 text-destructive',
};

const jobStatusColors = {
  success: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
  running: 'bg-info/20 text-info',
  scheduled: 'bg-muted text-muted-foreground',
};

const DataHub = () => {
  const [activeTab, setActiveTab] = useState("integrations");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [dataQualityRules, setDataQualityRules] = useState<DataQualityRule[]>([]);
  const [etlJobs, setEtlJobs] = useState<ETLJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [intStatus, rules, jobs] = await Promise.all([
          localDataService.getIntegrationStatus(),
          localDataService.getDataQualityRules(),
          localDataService.getEtlJobs()
        ]);

        // Transform integration status object to array
        const intList: Integration[] = Object.entries(intStatus).map(([key, value]: [string, any]) => ({
          id: key,
          name: getSystemName(key),
          description: value.description || 'System Integration',
          icon: getSystemIcon(key),
          status: value.status,
          lastSync: value.lastSync,
          recordsCount: value.recordsProcessed || value.sensors || value.milestones || 0,
          dataTypes: getSystemDataTypes(key),
          refreshInterval: 'Hourly',
          syncEnabled: true
        }));

        setIntegrations(intList);
        setDataQualityRules(rules);
        setEtlJobs(jobs);
      } catch (err) {
        console.error("Failed to load DataHub data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper functions for mapping
  const getSystemName = (key: string) => {
    const names: Record<string, string> = {
      acc: 'Autodesk Construction Cloud',
      sap: 'SAP S/4HANA',
      primavera: 'Oracle Primavera P6',
      iot: 'Azure IoT Hub',
      revit: 'Revit BIM Cloud',
      oracle: 'Oracle Financials'
    };
    return names[key] || key.toUpperCase();
  };

  const getSystemIcon = (key: string) => {
    switch (key) {
      case 'acc': return Database;
      case 'sap': return FileText;
      case 'primavera': return Activity;
      case 'iot': return Activity;
      case 'revit': return Database;
      default: return Link2;
    }
  };

  const getSystemDataTypes = (key: string) => {
    switch (key) {
      case 'acc': return ['Issues', 'Docs', 'RFIs'];
      case 'sap': return ['Cost', 'Procurement'];
      case 'primavera': return ['Schedule', 'Resources'];
      case 'iot': return ['Telemetry', 'Alerts'];
      default: return ['Data'];
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected' || i.status === 'syncing').length;
  const totalRecords = integrations.reduce((sum, i) => sum + (i.recordsCount || 0), 0);
  const passingRules = dataQualityRules.filter(r => r.status === 'passing').length;
  const runningJobs = etlJobs.filter(j => j.status === 'running').length;

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-secondary">
              <Database className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Unified Data Hub</h1>
          </div>
          <p className="text-muted-foreground">
            Integration Management, Data Quality & ETL Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </Button>
          <Button className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Loading Data Hub...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Connected</span>
              <Link2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{connectedCount}/{integrations.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Integrations active</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Records</span>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{(totalRecords / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">Indexed in hub</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Data Quality</span>
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{passingRules}/{dataQualityRules.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Rules passing</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">ETL Jobs</span>
              <Activity className="w-4 h-4 text-info" />
            </div>
            <p className="text-2xl font-bold text-foreground">{runningJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="etl">ETL Jobs</TabsTrigger>
          <TabsTrigger value="master">Master Data</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          {integrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <div key={integration.id} className="bg-card rounded-xl border border-border/50 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.status === 'connected' || integration.status === 'syncing' ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                          <Icon className={`w-5 h-5 ${integration.status === 'connected' || integration.status === 'syncing' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Switch checked={integration.syncEnabled} />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={statusColors[integration.status]}>
                        {integration.status === 'syncing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                        {integration.status}
                      </Badge>
                      {integration.lastSync && (
                        <span className="text-xs text-muted-foreground">
                          Last sync: {integration.lastSync}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {integration.dataTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">
                        {integration.recordsCount?.toLocaleString() || 0} records • Refresh: {integration.refreshInterval}
                      </span>
                      <Button variant="ghost" size="sm">
                        {integration.status === 'disconnected' ? (
                          <>
                            <Link2 className="w-3 h-3 mr-1" />
                            Connect
                          </>
                        ) : (
                          <>
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-card/50">
              <Link2 className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium text-foreground">No Integrations Configured</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Connect to external data sources to start ingesting data.
              </p>
              <Button className="mt-4 gap-2">
                <Settings className="w-4 h-4" />
                Add Integration
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quality">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {dataQualityRules.length > 0 ? (
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Rule</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Source</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Validation</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Failures</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {dataQualityRules.map((rule) => (
                    <tr key={rule.id} className="border-t border-border/30 hover:bg-muted/20">
                      <td className="p-3">
                        <p className="text-sm font-medium text-foreground">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">{rule.id}</p>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{rule.source}</Badge>
                      </td>
                      <td className="p-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{rule.rule}</code>
                      </td>
                      <td className="p-3">
                        <Badge className={
                          rule.status === 'passing' ? 'bg-success/20 text-success' :
                            rule.status === 'warning' ? 'bg-warning/20 text-warning' :
                              'bg-destructive/20 text-destructive'
                        }>
                          {rule.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`text-sm ${rule.failCount > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          {rule.failCount}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{rule.lastChecked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mb-3 opacity-20" />
                <p>No data quality rules defined</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="etl">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {etlJobs.length > 0 ? (
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Job</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Source → Destination</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Schedule</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Last Run</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Duration</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {etlJobs.map((job) => (
                    <tr key={job.id} className="border-t border-border/30 hover:bg-muted/20">
                      <td className="p-3">
                        <p className="text-sm font-medium text-foreground">{job.name}</p>
                        <p className="text-xs text-muted-foreground">{job.id}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-foreground">{job.source}</span>
                          <ArrowUpDown className="w-3 h-3 text-muted-foreground rotate-90" />
                          <span className="text-muted-foreground">{job.destination}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{job.schedule}</td>
                      <td className="p-3 text-xs text-muted-foreground">{job.lastRun}</td>
                      <td className="p-3">
                        <Badge className={jobStatusColors[job.status]}>
                          {job.status === 'running' && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                          {job.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{job.duration}</td>
                      <td className="p-3 text-sm text-foreground">{job.recordsProcessed.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Activity className="w-12 h-12 mb-3 opacity-20" />
                <p>No ETL jobs currently configured</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="master">
          <div className="bg-card rounded-xl border border-border/50 p-6">
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Master Data Management</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Configure and manage master data entities including project codes, WBS structures,
                location hierarchy, asset types, and contractor registry.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline">Projects & Zones</Button>
                <Button variant="outline">Contractors</Button>
                <Button variant="outline">Asset Types</Button>
                <Button variant="outline">Users & Roles</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default DataHub;
