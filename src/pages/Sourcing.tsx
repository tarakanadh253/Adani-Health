import { useState, useEffect } from "react";
import { localDataService } from "@/services/localData";
import { MainLayout } from "@/components/layout/MainLayout";
import { Users, CheckCircle, Clock, XCircle, FileText, BarChart3, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { VendorData } from "@/types";

// Data moved to state
import { cn } from "@/lib/utils";

const workflowSteps = [
  { id: 1, name: "Pre-Qualification", status: "complete" },
  { id: 2, name: "RFI Review", status: "complete" },
  { id: 3, name: "Technical Scoring", status: "active" },
  { id: 4, name: "Financial Evaluation", status: "pending" },
  { id: 5, name: "Final Selection", status: "pending" },
];

const Sourcing = () => {
  const [vendorData, setVendorData] = useState<VendorData[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const vendors = await localDataService.getVendorData();
        setVendorData(vendors);
        if (vendors.length > 0) {
          setSelectedVendor(vendors[0]);
        }
      } catch (e) {
        console.error("Failed to load vendor data", e);
      }
    };
    loadData();
  }, []);

  if (!selectedVendor) {
    return (
      <MainLayout>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg gradient-primary">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Sourcing Hub</h1>
            </div>
            <p className="text-muted-foreground">
              Contractor Selection Automation — Pre-qualification & RFP Lifecycle
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-12 border rounded-xl bg-card border-dashed min-h-[400px]">
          <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Vendors Found</h3>
          <p className="text-muted-foreground">No pre-qualified vendors available at the moment.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-primary">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sourcing Hub</h1>
          </div>
          <p className="text-muted-foreground">
            Contractor Selection Automation — Pre-qualification & RFP Lifecycle
          </p>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card mb-6 animate-slide-up">
        <h3 className="font-semibold text-foreground mb-4">Selection Workflow Progress</h3>
        <div className="flex items-center justify-between">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    step.status === "complete" && "bg-success text-success-foreground",
                    step.status === "active" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    step.status === "pending" && "bg-muted text-muted-foreground"
                  )}
                >
                  {step.status === "complete" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : step.status === "active" ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 font-medium",
                    step.status === "active" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < workflowSteps.length - 1 && (
                <div
                  className={cn(
                    "w-16 lg:w-24 h-0.5 mx-2",
                    step.status === "complete" ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor List */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="p-4 border-b border-border/50 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">Pre-Qualified Vendors</h3>
              <p className="text-sm text-muted-foreground">3 vendors under evaluation</p>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {vendorData.filter(v =>
              v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              v.category.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className={cn(
                  "w-full p-4 text-left transition-all hover:bg-muted/50",
                  selectedVendor.id === vendor.id && "bg-primary/5 border-l-2 border-primary"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground">{vendor.category}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                      vendor.status === "qualified" && "bg-success/10 text-success",
                      vendor.status === "pending" && "bg-warning/10 text-warning",
                      vendor.status === "disqualified" && "bg-destructive/10 text-destructive"
                    )}
                  >
                    {vendor.status === "qualified" && <CheckCircle className="w-3 h-3" />}
                    {vendor.status === "pending" && <Clock className="w-3 h-3" />}
                    {vendor.status === "disqualified" && <XCircle className="w-3 h-3" />}
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Overall Score:</span>
                  <span className="text-sm font-bold text-primary">{vendor.overallScore.toFixed(1)}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Scoring Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card animate-slide-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">{selectedVendor.name}</h3>
                <p className="text-sm text-muted-foreground">Pre-Qualification Scoring Matrix</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <FileText className="w-4 h-4" />
                  View Documents
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <BarChart3 className="w-4 h-4" />
                  Audit Trail
                </Button>
              </div>
            </div>

            {/* Scoring Breakdown */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Technical Capability</span>
                  <span className="text-sm font-bold text-primary">{selectedVendor.technicalScore}%</span>
                </div>
                <Progress value={selectedVendor.technicalScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Equipment expertise, certifications, project history
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Financial Stability</span>
                  <span className="text-sm font-bold text-secondary">{selectedVendor.financialScore}%</span>
                </div>
                <Progress value={selectedVendor.financialScore} className="h-2 [&>div]:bg-secondary" />
                <p className="text-xs text-muted-foreground mt-1">
                  Credit rating, turnover, insurance coverage
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Relevant Experience</span>
                  <span className="text-sm font-bold text-accent">{selectedVendor.experienceScore}%</span>
                </div>
                <Progress value={selectedVendor.experienceScore} className="h-2 [&>div]:bg-accent" />
                <p className="text-xs text-muted-foreground mt-1">
                  Healthcare projects, similar installations, references
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">Overall Score</span>
                  <span className="text-2xl font-bold text-gradient-primary">
                    {selectedVendor.overallScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RFP Status */}
          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h3 className="font-semibold text-foreground mb-4">Active RFP Cycle</h3>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
              <div>
                <p className="font-medium text-foreground">RFP-2024-MED-SHIELD-001</p>
                <p className="text-sm text-muted-foreground">Specialized Radiation Shielding - Oncology Wing</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Submission Deadline</p>
                  <p className="text-sm font-medium text-foreground">Dec 15, 2024</p>
                </div>
                <Button className="gap-2">
                  Review Submissions
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Sourcing;
