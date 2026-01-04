import { useState, useEffect } from "react";
import { localDataService } from "@/services/localData";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileText, CheckCircle, Clock, User, FileSignature, Shield, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuditLog } from "@/types";

// Data moved to state

const Audit = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const logs = await localDataService.getAuditLogs();
        setAuditLogs(logs);
      } catch (e) {
        console.error("Failed to load audit data", e);
      }
    };
    loadData();
  }, []);
  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-primary">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Audit Trail</h1>
          </div>
          <p className="text-muted-foreground">
            ISO 19650 Compliant Document Audit — Version History & Digital Signatures
          </p>
        </div>
      </div>

      {/* Compliance Badge */}
      <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6 flex items-center gap-4 animate-slide-up">
        <div className="p-3 rounded-lg bg-success/20">
          <Shield className="w-6 h-6 text-success" />
        </div>
        <div>
          <p className="font-medium text-foreground">ISO 19650-1:2018 Compliant</p>
          <p className="text-sm text-muted-foreground">
            All document transactions are immutably logged with digital timestamps and cryptographic signatures
          </p>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Recent Audit Events</h3>
            <p className="text-sm text-muted-foreground">Showing last 30 days of activity</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search audit trail..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Timestamp
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Action
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Document
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Version
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Digital Signature
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {auditLogs.filter(log =>
                log.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono text-foreground">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3" />
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">{log.document}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-primary">{log.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-secondary" />
                      </div>
                      <span className="text-sm text-foreground">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileSignature className="w-4 h-4 text-success" />
                      <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                        {log.signature}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default Audit;
