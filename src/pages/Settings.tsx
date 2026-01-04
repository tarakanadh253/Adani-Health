import { useState, useEffect } from "react";
import { localDataService } from "@/services/localData";
import { MainLayout } from "@/components/layout/MainLayout";
import { Settings as SettingsIcon, Database, Cloud, Bell, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
// Data moved to state inside component

const Settings = () => {
  const [integrationStatus, setIntegrationStatus] = useState({
    acc: { status: 'disconnected', issues: 0, lastSync: '-' },
    sap: { status: 'disconnected', orders: 0, lastSync: '-' },
    primavera: { status: 'disconnected', milestones: 0, lastSync: '-' },
    iot: { status: 'inactive', sensors: 0, alerts: 0 },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const status = await localDataService.getIntegrationStatus();
        // Merge with default to ensure no crashes if DB is missing keys
        setIntegrationStatus(prev => ({ ...prev, ...status }));
      } catch (e) {
        console.error("Failed to load settings data", e);
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
            <div className="p-2 rounded-lg gradient-lavender">
              <SettingsIcon className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            System Configuration & Integration Management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integrations */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <Cloud className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Integration Status</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Autodesk Construction Cloud</p>
                  <p className="text-sm text-muted-foreground">{integrationStatus.acc.issues} open issues</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-success flex items-center gap-1 justify-end">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Connected
                </span>
                <p className="text-xs text-muted-foreground mt-1">Last sync: {integrationStatus.acc.lastSync}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">SAP/Ariba</p>
                  <p className="text-sm text-muted-foreground">{integrationStatus.sap.orders} active orders</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-success flex items-center gap-1 justify-end">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Connected
                </span>
                <p className="text-xs text-muted-foreground mt-1">Last sync: {integrationStatus.sap.lastSync}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Primavera P6</p>
                  <p className="text-sm text-muted-foreground">{integrationStatus.primavera.milestones} milestones tracked</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-success flex items-center gap-1 justify-end">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Connected
                </span>
                <p className="text-xs text-muted-foreground mt-1">Last sync: {integrationStatus.primavera.lastSync}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Critical Alerts</p>
                <p className="text-sm text-muted-foreground">High-priority issues and SLA breaches</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Maintenance Reminders</p>
                <p className="text-sm text-muted-foreground">Preventive maintenance schedules</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">RFI Updates</p>
                <p className="text-sm text-muted-foreground">New RFIs and response notifications</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Cost Variance Alerts</p>
                <p className="text-sm text-muted-foreground">Budget threshold notifications</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Security Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Session Timeout</p>
                <p className="text-sm text-muted-foreground">Auto logout after 30 minutes</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Audit Logging</p>
                <p className="text-sm text-muted-foreground">Log all user actions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">User Management</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  AD
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Admin User</p>
                  <p className="text-xs text-muted-foreground">Project Director</p>
                </div>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Admin</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                  PS
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dr. Priya Sharma</p>
                  <p className="text-xs text-muted-foreground">Clinical Lead</p>
                </div>
              </div>
              <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">Approver</span>
            </div>

            <Button variant="outline" className="w-full mt-4">
              Manage Users
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
