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
  ClipboardCheck,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  QrCode,
  FileText,
  MapPin,
  Camera,
  User,
  Wrench,
  Upload,
} from "lucide-react";

interface CommissioningTest {
  id: string;
  system: string;
  testName: string;
  zone: string;
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'retest';
  scheduledDate: string;
  completedDate?: string;
  contractor: string;
  witness: string;
  defects: number;
}

interface Snag {
  id: string;
  description: string;
  zone: string;
  location: string;
  trade: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'closed' | 'verified';
  raisedDate: string;
  dueDate: string;
  assignedTo: string;
  photos: number;
}

interface AssetTag {
  id: string;
  assetName: string;
  assetId: string;
  qrCode: string;
  rfidTag: string;
  zone: string;
  tagStatus: 'generated' | 'printed' | 'installed' | 'verified';
  bimLinked: boolean;
  cafmSynced: boolean;
}

interface TrainingRecord {
  id: string;
  topic: string;
  trainer: string;
  date: string;
  duration: string;
  attendees: number;
  department: string;
  completionRate: number;
  materialsUploaded: boolean;
}

// Data moved to state

const testStatusColors = {
  'pending': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/20 text-info',
  'passed': 'bg-success/20 text-success',
  'failed': 'bg-destructive/20 text-destructive',
  'retest': 'bg-warning/20 text-warning',
};

const snagStatusColors = {
  'open': 'bg-destructive/20 text-destructive',
  'assigned': 'bg-info/20 text-info',
  'in-progress': 'bg-warning/20 text-warning',
  'closed': 'bg-muted text-muted-foreground',
  'verified': 'bg-success/20 text-success',
};

const tagStatusColors = {
  'generated': 'bg-muted text-muted-foreground',
  'printed': 'bg-info/20 text-info',
  'installed': 'bg-warning/20 text-warning',
  'verified': 'bg-success/20 text-success',
};

const Handover = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("commissioning");
  const [searchTerm, setSearchTerm] = useState("");
  const [commissioningTests, setCommissioningTests] = useState<CommissioningTest[]>([]);
  const [snags, setSnags] = useState<Snag[]>([]);
  const [assetTags, setAssetTags] = useState<AssetTag[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await localDataService.getHandoverData();
        setCommissioningTests(data.commissioningTests);
        setSnags(data.snags);
        setAssetTags(data.assetTags);
        setTrainingRecords(data.trainingRecords);
      } catch (e) {
        console.error("Failed to load handover data", e);
      }
    };
    loadData();
  }, []);

  // Filtering Logic
  const filteredTests = commissioningTests.filter(t =>
    t.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSnags = snags.filter(s =>
    s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = assetTags.filter(t =>
    t.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTraining = trainingRecords.filter(t =>
    t.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.trainer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const passedTests = commissioningTests.filter(t => t.status === 'passed').length;
  const openSnags = snags.filter(s => s.status !== 'closed' && s.status !== 'verified').length;
  const verifiedTags = assetTags.filter(t => t.tagStatus === 'verified').length;
  const completedTrainings = trainingRecords.filter(t => t.completionRate === 100).length;

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-secondary">
              <ClipboardCheck className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Handover & Commissioning</h1>
          </div>
          <p className="text-muted-foreground">
            Testing, Snagging, Asset Tagging & Training Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Package
          </Button>
          {hasPermission('handover', 'edit') && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Test
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tests Passed</span>
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{passedTests}/{commissioningTests.length}</p>
          <Progress value={(passedTests / commissioningTests.length) * 100} className="mt-2 h-1.5" />
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Open Snags</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-foreground">{openSnags}</p>
          <p className="text-xs text-muted-foreground mt-1">Require closure</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Assets Tagged</span>
            <QrCode className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{verifiedTags}/{assetTags.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Verified</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Training</span>
            <User className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{completedTrainings}/{trainingRecords.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="commissioning">Commissioning</TabsTrigger>
            <TabsTrigger value="snagging">Snagging</TabsTrigger>
            <TabsTrigger value="assets">Asset Tagging</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
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

        <TabsContent value="commissioning">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Test</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">System</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Scheduled</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Contractor</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Defects</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.id} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{test.testName}</p>
                      <p className="text-xs text-muted-foreground">{test.id}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{test.system}</Badge>
                    </td>
                    <td className="p-3 text-sm text-foreground">{test.zone}</td>
                    <td className="p-3">
                      <Badge className={testStatusColors[test.status]}>{test.status}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{test.scheduledDate}</td>
                    <td className="p-3 text-sm text-muted-foreground">{test.contractor}</td>
                    <td className="p-3">
                      {test.defects > 0 ? (
                        <span className="text-sm text-destructive font-medium">{test.defects}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="snagging">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Snag</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Trade</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Assigned</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Photos</th>
                </tr>
              </thead>
              <tbody>
                {filteredSnags.map((snag) => (
                  <tr key={snag.id} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{snag.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {snag.location}
                      </p>
                    </td>
                    <td className="p-3 text-sm text-foreground">{snag.zone}</td>
                    <td className="p-3">
                      <Badge variant="outline">{snag.trade}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary">{snag.priority}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={snagStatusColors[snag.status]}>{snag.status}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{snag.dueDate}</td>
                    <td className="p-3 text-sm text-muted-foreground">{snag.assignedTo}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Camera className="w-3 h-3" />
                        {snag.photos}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Asset</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">QR Code</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">RFID</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Tag Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">BIM Linked</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">CAFM Synced</th>
                </tr>
              </thead>
              <tbody>
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{tag.assetName}</p>
                      <p className="text-xs text-muted-foreground">{tag.assetId}</p>
                    </td>
                    <td className="p-3 text-sm text-foreground">{tag.zone}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">{tag.qrCode}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs font-mono text-muted-foreground">{tag.rfidTag}</td>
                    <td className="p-3">
                      <Badge className={tagStatusColors[tag.tagStatus]}>{tag.tagStatus}</Badge>
                    </td>
                    <td className="p-3">
                      {tag.bimLinked ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="p-3">
                      {tag.cafmSynced ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Training Topic</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Trainer</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Department</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Attendees</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Completion</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Materials</th>
                </tr>
              </thead>
              <tbody>
                {filteredTraining.map((training) => (
                  <tr key={training.id} className="border-t border-border/30 hover:bg-muted/20">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{training.topic}</p>
                      <p className="text-xs text-muted-foreground">{training.id}</p>
                    </td>
                    <td className="p-3 text-sm text-foreground">{training.trainer}</td>
                    <td className="p-3 text-sm text-muted-foreground">{training.date}</td>
                    <td className="p-3 text-sm text-muted-foreground">{training.duration}</td>
                    <td className="p-3">
                      <Badge variant="outline">{training.department}</Badge>
                    </td>
                    <td className="p-3 text-sm text-foreground">{training.attendees}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={training.completionRate} className="w-16 h-1.5" />
                        <span className="text-xs text-muted-foreground">{training.completionRate}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {training.materialsUploaded ? (
                        <Button variant="ghost" size="sm" className="gap-1">
                          <FileText className="w-3 h-3" />
                          View
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                          <Upload className="w-3 h-3" />
                          Upload
                        </Button>
                      )}
                    </td>
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

export default Handover;
