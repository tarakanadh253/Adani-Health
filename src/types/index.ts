export interface KPIData {
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    icon: string;
}

export interface BudgetData {
    category: string;
    planned: number;
    actual: number;
    variance: number;
}

export interface ScheduleData {
    phase: string;
    planned: number;
    actual: number;
    status: 'on-track' | 'delayed' | 'at-risk';
}

export interface ClashData {
    zone: string;
    clashCount: number;
    severity: 'high' | 'medium' | 'low';
    rfiCount: number;
}

export interface AssetData {
    id: string;
    name: string;
    type: string;
    location: string;
    warrantyEnd: string;
    powerLoad: string;
    maintenanceFreq: string;
    status: 'operational' | 'maintenance' | 'alert';
    lastService: string;
    nextService: string;
    serialNumber: string;
    manufacturer: string;
    omManualUrl: string;
    qrCode: string;
    rfidTag: string;
    nabhlCompliance: string;
    fireSafetyRating: string;
    medicalGasReq: string;
}

export interface VendorData {
    id: string;
    name: string;
    category: string;
    technicalScore: number;
    financialScore: number;
    experienceScore: number;
    overallScore: number;
    status: 'qualified' | 'pending' | 'disqualified';
    slaCompliance: number;
    responseTime: string;
    auditHistory: AuditEntry[];
}

export interface IssueData {
    id: string;
    type: 'clash' | 'rfi' | 'change-order' | 'design-review';
    title: string;
    zone: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'in-progress' | 'resolved' | 'escalated';
    assignee: string;
    dueDate: string;
    source: string;
    slaBreached: boolean;
    hoursRemaining: number;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    document: string;
    version: string;
    user: string;
    signature: string;
    iso19650Compliant: boolean;
}

export interface AuditEntry {
    date: string;
    action: string;
    score: number;
}

export interface RoomDataSheet {
    id: string;
    roomCode: string;
    roomName: string;
    department: string;
    floor: string;
    area: number;
    clearHeight: number;
    lodLevel: 'LOD 300' | 'LOD 350' | 'LOD 400' | 'LOD 500';
    status: 'draft' | 'for-review' | 'approved' | 'revision-required';
    clinicalLead: string;
    lastReviewed: string;
    nabhjCompliant: boolean;
    jciCompliant: boolean;
    medicalGasOutlets: MedicalGasOutlet[];
    electricalRequirements: ElectricalReq;
    hvacRequirements: HvacReq;
    equipmentList: string[];
    signoffs: SignoffRecord[];
    accDocumentId: string;
    comments: DesignComment[];
}

export interface MedicalGasOutlet {
    id: string;
    type: 'O2' | 'N2O' | 'CO2' | 'AIR' | 'VAC' | 'WAGD';
    location: string;
    inspectionStatus: 'passed' | 'pending' | 'overdue' | 'failed';
    lastInspection: string;
    nextInspection: string;
}

export interface ElectricalReq {
    normalPower: string;
    emergencyPower: string;
    upsBackup: boolean;
    isolatedPowerSystem: boolean;
    groundingType: string;
}

export interface HvacReq {
    airChangesPerHour: number;
    temperatureRange: string;
    humidityRange: string;
    pressureDifferential: string;
    hepaFiltration: boolean;
}

export interface SignoffRecord {
    id: string;
    role: string;
    name: string;
    date: string;
    status: 'approved' | 'rejected' | 'pending';
    digitalSignature: string;
    comments: string;
}

export interface DesignComment {
    id: string;
    author: string;
    role: string;
    date: string;
    content: string;
    resolved: boolean;
    linkedIssueId?: string;
}

export interface P6Milestone {
    id: string;
    wbsCode: string;
    name: string;
    plannedStart: string;
    plannedFinish: string;
    actualStart?: string;
    actualFinish?: string;
    percentComplete: number;
    isCriticalPath: boolean;
    floatDays: number;
    predecessors: string[];
    zone: string;
    trade: string;
    atRiskReason?: string;
}

export interface IoTSensorReading {
    sensorId: string;
    assetId: string;
    type: 'temperature' | 'humidity' | 'vibration' | 'power' | 'pressure' | 'radiation';
    value: number;
    unit: string;
    timestamp: string;
    status: 'normal' | 'warning' | 'critical';
    threshold: { min: number; max: number };
}

export interface WorkOrder {
    id: string;
    assetId: string;
    type: 'preventive' | 'corrective' | 'emergency';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'verified';
    description: string;
    assignedTo: string;
    createdDate: string;
    dueDate: string;
    completedDate?: string;
    triggeredBy: 'schedule' | 'sensor' | 'manual' | 'inspection';
    laborHours?: number;
    partsUsed?: string[];
}

export interface UserRole {
    id: string;
    name: string;
    permissions: string[];
    dataAccess: 'full' | 'department' | 'project' | 'restricted';
    sensitiveDataAccess: boolean;
}

export interface ApprovalData {
    id: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedBy: string;
    approver: string;
    dueDate: string;
}

export interface MeetingData {
    id: string;
    title: string;
    date: string;
    attendees: number;
    minutesUrl?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ReviewData {
    id: string;
    documentName: string;
    status: 'open' | 'closed';
    reviewers: string[];
    dueDate: string;
    outcome?: 'approved' | 'approved-with-comments' | 'rejected' | 'pending';
}

export interface FileLinkData {
    id: string;
    name: string;
    lastUpdated: string;
    url: string;
    type: string;
    version: number;
}
