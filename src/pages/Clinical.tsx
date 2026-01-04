import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { localDataService } from "@/services/localData";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Stethoscope, Check, X, Eye, RotateCcw, Maximize2, Layers,
  FileText, AlertTriangle, CheckCircle, Clock, MessageSquare,
  Shield, Thermometer, Wind, Zap, ExternalLink, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { RoomDataSheet } from "@/types";

// Data moved to state

const Clinical = () => {
  const [roomDataSheets, setRoomDataSheets] = useState<RoomDataSheet[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomDataSheet | null>(null);
  const [viewMode, setViewMode] = useState<"3d" | "2d" | "rds">("3d");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const rooms = await localDataService.getRoomDataSheets();
        setRoomDataSheets(rooms);
        if (rooms.length > 0) {
          setSelectedRoom(rooms[0]);
        }
      } catch (e) {
        console.error("Failed to load clinical data", e);
      }
    };
    loadData();
  }, []);

  if (!selectedRoom) {
    return (
      <MainLayout>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg gradient-maroon">
                <Stethoscope className="w-5 h-5 text-accent-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Clinical Command</h1>
            </div>
            <p className="text-muted-foreground">
              Clinical Consultation Lifecycle — Design Sign-off & RDS Management
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[50vh] border rounded-xl bg-card border-dashed">
          <Stethoscope className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Clinical Spaces</h3>
          <p className="text-muted-foreground">No Room Data Sheets found for clinical spaces.</p>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success border-success/30';
      case 'for-review': return 'bg-warning/10 text-warning border-warning/30';
      case 'revision-required': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getInspectionColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'overdue': return 'text-destructive';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-maroon">
              <Stethoscope className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Clinical Command</h1>
          </div>
          <p className="text-muted-foreground">
            Clinical Consultation Lifecycle — Design Sign-off & RDS Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Shield className="w-3 h-3" />
            NABH/JCI Compliance Tracking
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Room List */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-border/50 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">Clinical Spaces</h3>
              <p className="text-sm text-muted-foreground">Room Data Sheet Registry</p>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
            {roomDataSheets.filter(r =>
              r.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              r.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
              r.department.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={cn(
                  "w-full p-4 text-left transition-all hover:bg-muted/50",
                  selectedRoom.id === room.id && "bg-primary/5 border-l-2 border-primary"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">{room.roomName}</p>
                    <p className="text-xs text-muted-foreground">{room.department} • {room.floor}</p>
                  </div>
                  <span className={cn("text-xs px-2 py-1 rounded-full border", getStatusColor(room.status))}>
                    {room.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{room.lodLevel}</span>
                  <span>•</span>
                  <span>{room.clinicalLead}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {room.nabhjCompliant && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-success/5 text-success border-success/30">
                      NABH
                    </Badge>
                  )}
                  {room.jciCompliant && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/5 text-primary border-primary/30">
                      JCI
                    </Badge>
                  )}
                  {room.comments.filter(c => !c.resolved).length > 0 && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-warning/5 text-warning border-warning/30">
                      {room.comments.filter(c => !c.resolved).length} Comments
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Viewer & Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Viewer Header with Tabs */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedRoom.roomName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoom.lodLevel} Model • ACC: {selectedRoom.accDocumentId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "3d" | "2d" | "rds")}>
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="3d" className="text-xs">3D View</TabsTrigger>
                    <TabsTrigger value="2d" className="text-xs">2D Plan</TabsTrigger>
                    <TabsTrigger value="rds" className="text-xs">Room Data</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="icon">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 3D/2D Viewer */}
            {(viewMode === "3d" || viewMode === "2d") && (
              <div className="relative h-[350px] bg-gradient-to-br from-muted/50 via-background to-muted/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Mock Room Layout */}
                  <div className="relative w-80 h-56 border-2 border-primary/30 rounded-lg bg-primary/5">
                    <div className="absolute -top-8 left-0 text-sm font-medium text-foreground">
                      {selectedRoom.roomCode} - {viewMode === "3d" ? "Isometric" : "Plan"} View
                    </div>

                    {/* Equipment Indicators */}
                    <div className="absolute top-4 left-4 w-16 h-16 border-2 border-secondary/50 rounded bg-secondary/10 flex items-center justify-center">
                      <span className="text-xs text-secondary font-medium">Equipment</span>
                    </div>
                    <div className="absolute top-4 right-4 w-12 h-12 border-2 border-accent/50 rounded bg-accent/10 flex items-center justify-center">
                      <span className="text-[10px] text-accent font-medium">Console</span>
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-10 border-2 border-success/50 rounded bg-success/10 flex items-center justify-center">
                      <span className="text-xs text-success font-medium">Patient</span>
                    </div>

                    {/* Medical Gas Outlets with Status */}
                    {selectedRoom.medicalGasOutlets.slice(0, 4).map((outlet, idx) => (
                      <div
                        key={outlet.id}
                        className={cn(
                          "absolute w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-110",
                          outlet.inspectionStatus === 'passed' && "bg-success border-success/50",
                          outlet.inspectionStatus === 'pending' && "bg-warning border-warning/50",
                          outlet.inspectionStatus === 'overdue' && "bg-destructive border-destructive/50 animate-pulse"
                        )}
                        style={{
                          left: idx % 2 === 0 ? '-12px' : 'auto',
                          right: idx % 2 !== 0 ? '-12px' : 'auto',
                          top: `${30 + idx * 25}%`,
                        }}
                        title={`${outlet.type} - ${outlet.inspectionStatus}`}
                      >
                        <span className="text-[8px] font-bold text-white">{outlet.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Viewer Controls */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    Layers
                  </Button>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                  <p className="text-xs font-medium text-foreground mb-2">Inspection Status</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-xs text-muted-foreground">Passed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                      <span className="text-xs text-muted-foreground">Overdue</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RDS View */}
            {viewMode === "rds" && (
              <div className="p-6 space-y-6 max-h-[350px] overflow-y-auto">
                {/* Room Specifications */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground">Area</p>
                    <p className="text-lg font-semibold text-foreground">{selectedRoom.area} m²</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground">Clear Height</p>
                    <p className="text-lg font-semibold text-foreground">{selectedRoom.clearHeight} m</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground">LOD Level</p>
                    <p className="text-lg font-semibold text-foreground">{selectedRoom.lodLevel}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground">Last Reviewed</p>
                    <p className="text-lg font-semibold text-foreground">{selectedRoom.lastReviewed}</p>
                  </div>
                </div>

                {/* MEP Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Electrical</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p><span className="text-muted-foreground">Normal:</span> {selectedRoom.electricalRequirements.normalPower}</p>
                      <p><span className="text-muted-foreground">Emergency:</span> {selectedRoom.electricalRequirements.emergencyPower}</p>
                      <p><span className="text-muted-foreground">UPS:</span> {selectedRoom.electricalRequirements.upsBackup ? 'Yes' : 'No'}</p>
                      <p><span className="text-muted-foreground">IPS:</span> {selectedRoom.electricalRequirements.isolatedPowerSystem ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Wind className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium text-foreground">HVAC</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p><span className="text-muted-foreground">ACH:</span> {selectedRoom.hvacRequirements.airChangesPerHour}</p>
                      <p><span className="text-muted-foreground">Temp:</span> {selectedRoom.hvacRequirements.temperatureRange}</p>
                      <p><span className="text-muted-foreground">Humidity:</span> {selectedRoom.hvacRequirements.humidityRange}</p>
                      <p><span className="text-muted-foreground">HEPA:</span> {selectedRoom.hvacRequirements.hepaFiltration ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Thermometer className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Medical Gas</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {selectedRoom.medicalGasOutlets.map((outlet) => (
                        <p key={outlet.id} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{outlet.type}:</span>
                          <span className={getInspectionColor(outlet.inspectionStatus)}>
                            {outlet.inspectionStatus}
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Equipment List */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Equipment Schedule</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.equipmentList.map((eq, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sign-off Actions */}
            <div className="p-4 border-t border-border/50 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Clinical Sign-off Status</p>
                  <div className="flex items-center gap-3 mt-1">
                    {selectedRoom.signoffs.map((signoff) => (
                      <div key={signoff.id} className="flex items-center gap-1.5">
                        {signoff.status === 'approved' && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                        {signoff.status === 'pending' && <Clock className="w-3.5 h-3.5 text-warning" />}
                        {signoff.status === 'rejected' && <X className="w-3.5 h-3.5 text-destructive" />}
                        <span className="text-xs text-muted-foreground">{signoff.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    View in ACC
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  {hasPermission('clinical', 'approver') && (
                    <>
                      <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                        <X className="w-4 h-4" />
                        Request Revision
                      </Button>
                      <Button className="gap-2 gradient-primary border-0">
                        <Check className="w-4 h-4" />
                        Approve Layout
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comments & Activity */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "150ms" }}>
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Design Comments & Decisions</h3>
              </div>
              <Badge variant="outline">
                {selectedRoom.comments.filter(c => !c.resolved).length} Open
              </Badge>
            </div>
            <div className="divide-y divide-border/30 max-h-[200px] overflow-y-auto">
              {selectedRoom.comments.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No comments yet
                </div>
              ) : (
                selectedRoom.comments.map((comment) => (
                  <div key={comment.id} className={cn("p-4", comment.resolved && "bg-muted/20")}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{comment.author}</span>
                        <Badge variant="outline" className="text-[10px] py-0">{comment.role}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                        {comment.resolved ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                    {comment.linkedIssueId && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary">
                          Linked: {comment.linkedIssueId}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Clinical;
