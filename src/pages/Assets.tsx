import { useState, useEffect } from "react";
import { localDataService } from "@/services/localData";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Database, AlertTriangle, CheckCircle, Wrench, Zap, Calendar, MapPin, Shield,
  QrCode, Radio, FileText, ExternalLink, ClipboardList, Activity, Thermometer,
  Droplets, Gauge, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetData, WorkOrder, IoTSensorReading } from "@/types";

// Data moved to state inside component

import { cn } from "@/lib/utils";

const Assets = () => {
  const [assetRegistry, setAssetRegistry] = useState<AssetData[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [iotSensorReadings, setIoTSensorReadings] = useState<IoTSensorReading[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const assets = await localDataService.getAssetRegistry();
        setAssetRegistry(assets);
        const opsData = await localDataService.getOperationsData();
        setWorkOrders(opsData.workOrders);
        setIoTSensorReadings(opsData.iot);

        if (assets.length > 0) {
          setSelectedAsset(assets[0]);
        }
      } catch (e) {
        console.error("Failed to load asset data", e);
      }
    };
    loadData();
  }, []);

  const assetWorkOrders = selectedAsset ? workOrders.filter(wo => wo.assetId === selectedAsset.id) : [];
  const assetSensors = selectedAsset ? iotSensorReadings.filter(s => s.assetId === selectedAsset.id) : [];

  if (!selectedAsset) {
    return (
      <MainLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg gradient-lavender">
                <Database className="w-5 h-5 text-secondary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">7D Asset Registry</h1>
            </div>
            <p className="text-muted-foreground">
              Operations & Maintenance — Digital Twin Asset Management with CAFM/CMMS Integration
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[50vh] border rounded-xl bg-card border-dashed">
          <Database className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Assets Found</h3>
          <p className="text-muted-foreground">No assets are currently registered in the system.</p>
        </div>
      </MainLayout>
    );
  }

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'vibration': return Activity;
      case 'power': return Zap;
      case 'pressure': return Gauge;
      default: return Activity;
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-lavender">
              <Database className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">7D Asset Registry</h1>
          </div>
          <p className="text-muted-foreground">
            Operations & Maintenance — Digital Twin Asset Management with CAFM/CMMS Integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <QrCode className="w-3 h-3" />
            QR/RFID Enabled
          </Badge>
        </div>
      </div>

      {/* Alert Banner */}
      {assetRegistry.some(a => a.status === 'alert') && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">Preventive Maintenance Alert</p>
              <p className="text-sm text-muted-foreground">
                {assetRegistry.filter(a => a.status === 'alert').length} asset(s) require scheduled maintenance
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-warning/30 text-warning hover:bg-warning/10">
            Generate Work Orders
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="p-4 border-b border-border/50 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">Medical Equipment</h3>
              <p className="text-sm text-muted-foreground">{assetRegistry.length} assets registered</p>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
            {assetRegistry.filter(a =>
              a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.type.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={cn(
                  "w-full p-4 text-left transition-all hover:bg-muted/50",
                  selectedAsset.id === asset.id && "bg-primary/5 border-l-2 border-primary"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.type}</p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                      asset.status === "operational" && "bg-success/10 text-success",
                      asset.status === "alert" && "bg-warning/10 text-warning",
                      asset.status === "maintenance" && "bg-secondary/10 text-secondary"
                    )}
                  >
                    {asset.status === "operational" && <CheckCircle className="w-3 h-3" />}
                    {asset.status === "alert" && <AlertTriangle className="w-3 h-3" />}
                    {asset.status === "maintenance" && <Wrench className="w-3 h-3" />}
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] py-0">
                    <QrCode className="w-2.5 h-2.5 mr-1" />
                    {asset.qrCode.slice(0, 12)}...
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Asset Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "150ms" }}>
            <div className="p-6 border-b border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedAsset.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAsset.id} • {selectedAsset.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">Manufacturer: {selectedAsset.manufacturer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                      selectedAsset.status === "operational" && "bg-success/10 text-success",
                      selectedAsset.status === "alert" && "bg-warning/10 text-warning",
                      selectedAsset.status === "maintenance" && "bg-secondary/10 text-secondary"
                    )}
                  >
                    {selectedAsset.status === "operational" && <CheckCircle className="w-4 h-4" />}
                    {selectedAsset.status === "alert" && <AlertTriangle className="w-4 h-4" />}
                    {selectedAsset.status === "maintenance" && <Wrench className="w-4 h-4" />}
                    {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  Scan QR
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  Verify RFID
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  O&M Manual
                  <ExternalLink className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Create Work Order
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6 border-b border-border/50">
                <TabsList className="bg-transparent h-12 p-0 gap-4">
                  <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0">
                    7D Metadata
                  </TabsTrigger>
                  <TabsTrigger value="sensors" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0">
                    IoT Sensors
                  </TabsTrigger>
                  <TabsTrigger value="workorders" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0">
                    Work Orders
                  </TabsTrigger>
                  <TabsTrigger value="compliance" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0">
                    Compliance
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="details" className="p-6 mt-0">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Location</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedAsset.location}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span className="text-xs text-muted-foreground">Warranty End</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedAsset.warrantyEnd}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="text-xs text-muted-foreground">Power Load</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedAsset.powerLoad}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-4 h-4 text-accent" />
                      <span className="text-xs text-muted-foreground">Maintenance Freq.</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedAsset.maintenanceFreq}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-success" />
                      <span className="text-xs text-muted-foreground">Last Service</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedAsset.lastService}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Next Service</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedAsset.nextService}</p>
                  </div>
                </div>

                {/* Additional 7D Data */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <h4 className="text-sm font-medium text-foreground mb-3">Technical Specifications</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serial Number:</span>
                      <span className="font-mono text-foreground">{selectedAsset.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Medical Gas Req:</span>
                      <span className="text-foreground">{selectedAsset.medicalGasReq}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">QR Code:</span>
                      <span className="font-mono text-foreground">{selectedAsset.qrCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RFID Tag:</span>
                      <span className="font-mono text-foreground">{selectedAsset.rfidTag}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sensors" className="p-6 mt-0">
                <div className="grid grid-cols-3 gap-4">
                  {assetSensors.length > 0 ? (
                    assetSensors.map((sensor) => {
                      const Icon = getSensorIcon(sensor.type);
                      return (
                        <div
                          key={sensor.sensorId}
                          className={cn(
                            "p-4 rounded-lg border",
                            sensor.status === 'normal' && "bg-success/5 border-success/20",
                            sensor.status === 'warning' && "bg-warning/5 border-warning/20",
                            sensor.status === 'critical' && "bg-destructive/5 border-destructive/20"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={cn(
                              "w-4 h-4",
                              sensor.status === 'normal' && "text-success",
                              sensor.status === 'warning' && "text-warning",
                              sensor.status === 'critical' && "text-destructive"
                            )} />
                            <span className="text-xs text-muted-foreground capitalize">{sensor.type}</span>
                          </div>
                          <p className={cn(
                            "text-2xl font-bold",
                            sensor.status === 'normal' && "text-success",
                            sensor.status === 'warning' && "text-warning",
                            sensor.status === 'critical' && "text-destructive"
                          )}>
                            {sensor.value}{sensor.unit}
                          </p>
                          <p className={cn(
                            "text-xs mt-1",
                            sensor.status === 'normal' && "text-success",
                            sensor.status === 'warning' && "text-warning",
                            sensor.status === 'critical' && "text-destructive"
                          )}>
                            {sensor.status === 'normal' ? 'Normal Range' : sensor.status === 'warning' ? 'Elevated' : 'Critical'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-2">
                            Threshold: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      No IoT sensors configured for this asset
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="workorders" className="p-6 mt-0">
                <div className="space-y-3">
                  {assetWorkOrders.length > 0 ? (
                    assetWorkOrders.map((wo) => (
                      <div key={wo.id} className="p-4 bg-muted/30 rounded-lg border border-border/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{wo.id}</span>
                              <Badge variant="outline" className={cn(
                                "text-[10px] py-0",
                                wo.type === 'preventive' && "bg-primary/10 text-primary",
                                wo.type === 'corrective' && "bg-warning/10 text-warning",
                                wo.type === 'emergency' && "bg-destructive/10 text-destructive"
                              )}>
                                {wo.type}
                              </Badge>
                              <Badge variant="outline" className={cn(
                                "text-[10px] py-0",
                                wo.status === 'completed' && "bg-success/10 text-success",
                                wo.status === 'in-progress' && "bg-warning/10 text-warning",
                                wo.status === 'open' && "bg-muted text-muted-foreground"
                              )}>
                                {wo.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{wo.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-2 border-t border-border/30">
                          <span>Assigned: {wo.assignedTo}</span>
                          <span>Due: {wo.dueDate}</span>
                          <span>Triggered by: {wo.triggeredBy}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No work orders for this asset
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="p-6 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-foreground">NABH Compliance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedAsset.nabhlCompliance}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Fire Safety Rating</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedAsset.fireSafetyRating}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Assets;
