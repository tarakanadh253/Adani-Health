
import { KPIData, IssueData, BudgetData, ScheduleData, ClashData, ApprovalData, MeetingData, ReviewData, FileLinkData, AssetData, RoomDataSheet, VendorData, WorkOrder, IoTSensorReading, AuditLog, P6Milestone } from "@/types";

const BASE_URL = 'http://localhost:8000/api';

export const localDataService = {
    async getDashboardData(): Promise<{
        kpis: KPIData[],
        issues: IssueData[],
        budget: BudgetData[],
        schedule: ScheduleData[],
        clashes: ClashData[],
        approvals: ApprovalData[],
        meetings: MeetingData[],
        reviews: ReviewData[],
        latestFiles: FileLinkData[]
    }> {
        const [kpis, budget, schedule, heatmap, issues] = await Promise.all([
            fetch(`${BASE_URL}/kpis`).then(r => r.json()),
            fetch(`${BASE_URL}/budget`).then(r => r.json()),
            fetch(`${BASE_URL}/schedule`).then(r => r.json()),
            fetch(`${BASE_URL}/clash-heatmap`).then(r => r.json()),
            fetch(`${BASE_URL}/issues`).then(r => r.json())
        ]);

        // Issues need mapping to match IssueData interface exactly if DB cols differ
        // db: { id, type, title, zone, priority, status, assignee, dueDate, source, slaBreached, hoursRemaining }
        // frontend might expect slightly different names?
        // User seed: matching names.
        // IssuesData interface? Let's assume it matches since user provided the code.

        return {
            kpis,
            issues,
            budget,
            schedule,
            clashes: heatmap,
            approvals: [],
            meetings: [],
            reviews: [],
            latestFiles: []
        };
    },

    async getOperationsData(): Promise<{ workOrders: WorkOrder[], iot: IoTSensorReading[] }> {
        const [workOrders, iot] = await Promise.all([
            fetch(`${BASE_URL}/work-orders`).then(r => r.json()),
            fetch(`${BASE_URL}/iot-readings`).then(r => r.json())
        ]);
        return { workOrders, iot };
    },

    async getAssetRegistry(): Promise<AssetData[]> {
        return fetch(`${BASE_URL}/assets`).then(r => r.json());
    },

    async getRoomDataSheets(): Promise<RoomDataSheet[]> {
        const data = await fetch(`${BASE_URL}/room-data-sheets`).then(r => r.json());
        // Backend returns JSON objects, no need to parse
        return data.map((room: any) => ({
            ...room,
            medicalGasOutlets: room.medicalGasOutlets || [],
            electricalRequirements: room.electricalRequirements || {},
            hvacRequirements: room.hvacRequirements || {},
            equipmentList: room.equipmentList || [],
            signoffs: room.signoffs || [],
            comments: room.comments || [],
            nabhjCompliant: Boolean(room.nabhjCompliant),
            jciCompliant: Boolean(room.jciCompliant)
        }));
    },

    async getVendorData(): Promise<VendorData[]> {
        const data = await fetch(`${BASE_URL}/vendors`).then(r => r.json());
        return data.map((v: any) => ({
            ...v,
            auditHistory: v.auditHistory || []
        }));
    },

    async getAuditLogs(): Promise<AuditLog[]> {
        const data = await fetch(`${BASE_URL}/audit-logs`).then(r => r.json());
        return data.map((l: any) => ({
            ...l,
            iso19650Compliant: Boolean(l.iso19650Compliant)
        }));
    },

    async getConstructionData(): Promise<any> {
        const [dailyReports, inventory, workforce, ncrs, safetyObservations] = await Promise.all([
            fetch(`${BASE_URL}/daily-reports`).then(r => r.json()),
            fetch(`${BASE_URL}/inventory`).then(r => r.json()),
            fetch(`${BASE_URL}/workforce`).then(r => r.json()),
            fetch(`${BASE_URL}/ncrs`).then(r => r.json()),
            fetch(`${BASE_URL}/safety-observations`).then(r => r.json())
        ]);

        return {
            dailyReports: dailyReports.map((r: any) => ({
                ...r,
                plannedActivities: r.plannedActivities || [],
                completedActivities: r.completedActivities || [],
                issues: r.issues || []
            })),
            inventory,
            workforce,
            ncrs,
            safetyObservations
        };
    },

    async getDesignData(): Promise<any> {
        const [deliverables, decisions, rfiData] = await Promise.all([
            fetch(`${BASE_URL}/deliverables`).then(r => r.json()),
            fetch(`${BASE_URL}/design-decisions`).then(r => r.json()),
            fetch(`${BASE_URL}/issues`).then(r => r.json())
        ]);

        return {
            deliverables,
            decisions: decisions.map((d: any) => ({
                ...d,
                options: d.options || [],
                linkedDocs: d.linkedDocs || []
            })),
            rfis: rfiData // Re-using issues data for RFIs as DesignControl does
        };
    },

    async getCVData(): Promise<any> {
        const [cvEvents, cameraFeeds, ppeCompliance, progressMetrics] = await Promise.all([
            fetch(`${BASE_URL}/cv-events`).then(r => r.json()),
            fetch(`${BASE_URL}/camera-feeds`).then(r => r.json()),
            fetch(`${BASE_URL}/ppe-compliance`).then(r => r.json()),
            fetch(`${BASE_URL}/progress-metrics`).then(r => r.json())
        ]);
        return { cvEvents, cameraFeeds, ppeCompliance, progressMetrics };
    },

    async getHandoverData(): Promise<any> {
        const [commissioningTests, snags, assetTags, trainingRecords] = await Promise.all([
            fetch(`${BASE_URL}/commissioning-tests`).then(r => r.json()),
            fetch(`${BASE_URL}/snags`).then(r => r.json()),
            fetch(`${BASE_URL}/asset-tags`).then(r => r.json()),
            fetch(`${BASE_URL}/training-records`).then(r => r.json())
        ]);
        return { commissioningTests, snags, assetTags, trainingRecords };
    },

    async getIDDSpineData(): Promise<any> {
        const [p6, timeline] = await Promise.all([
            fetch(`${BASE_URL}/milestones`).then(r => r.json()),
            fetch(`${BASE_URL}/timeline-milestones`).then(r => r.json())
        ]);
        return { p6: p6.map((m: any) => ({ ...m, atRiskReason: m.atRiskReason || '' })), timeline };
    },

    async getIntegrationStatus(): Promise<any> {
        const data = await fetch(`${BASE_URL}/integration-status`).then(r => r.json());
        // Convert array of key-value pairs to object if needed, or structured object
        // Seed data structure validation needed.
        // Based on seed.cjs, integrationStatus is an array of objects like {system: 'acc', status: 'connected', ...}
        // Settings.tsx expects an object keyed by system name
        const statusObj: any = {};
        data.forEach((item: any) => {
            statusObj[item.system] = {
                status: item.status,
                lastSync: item.lastSync,
                issues: item.issues ? parseInt(item.issues) : 0,
                // other fields mapped dynamically
                ...item
            };
        });
        return statusObj;
    },

    async getEtlJobs(): Promise<any[]> {
        return fetch(`${BASE_URL}/etl-jobs`).then(r => r.json());
    },

    async getDataQualityRules(): Promise<any[]> {
        return fetch(`${BASE_URL}/data-quality-rules`).then(r => r.json());
    },

    async getAPSData(projectId?: string): Promise<any> {
        // Fetch all APS related data
        const [projects, issues, approvals, meetings, reviews, files] = await Promise.all([
            fetch(`${BASE_URL}/aps-projects`).then(r => r.json()),
            fetch(`${BASE_URL}/aps-issues`).then(r => r.json()),
            fetch(`${BASE_URL}/aps-approvals`).then(r => r.json()),
            fetch(`${BASE_URL}/aps-meetings`).then(r => r.json()),
            fetch(`${BASE_URL}/aps-reviews`).then(r => r.json()),
            fetch(`${BASE_URL}/aps-files`).then(r => r.json())
        ]);

        return {
            projects,
            issues,
            approvals,
            meetings,
            reviews,
            latestFiles: files,
            activeProjectId: projectId || (projects.length > 0 ? projects[0].id : null)
        };
    },

    async searchGlobal(query: string): Promise<any> {
        return fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`).then(r => r.json());
    }

};
