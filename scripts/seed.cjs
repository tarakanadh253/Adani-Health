/* eslint-disable */
const initSqlJs = require('sql.js');
const fs = require('fs');

const executiveKPIs = [
    { label: 'Total Budget', value: '₹2,450 Cr', change: 0, trend: 'neutral', icon: 'wallet' },
    { label: 'Spent to Date', value: '₹892 Cr', change: 2.4, trend: 'up', icon: 'trending-up' },
    { label: 'Schedule Health', value: '94.2%', change: -1.2, trend: 'down', icon: 'calendar' },
    { label: 'Active RFIs', value: '124', change: 8, trend: 'up', icon: 'file-question' },
    { label: 'Clash Resolution', value: '87%', change: 5.3, trend: 'up', icon: 'check-circle' },
    { label: 'Safety Score', value: '98.5%', change: 0.5, trend: 'up', icon: 'shield' },
];

const etlJobs = [
    {
        id: 'ETL-001',
        name: 'Daily Primavera Sync',
        source: 'Oracle Primavera P6',
        destination: 'Data Warehouse',
        schedule: 'Daily at 02:00 AM',
        lastRun: '2024-11-28 02:15:00',
        status: 'success',
        duration: '15m 30s',
        recordsProcessed: 15420
    },
    {
        id: 'ETL-002',
        name: 'ACC Issue Ingestion',
        source: 'Autodesk Construction Cloud',
        destination: 'Issues DB',
        schedule: 'Hourly',
        lastRun: '2024-11-28 14:00:00',
        status: 'running',
        duration: 'Running (2m)',
        recordsProcessed: 45
    },
    {
        id: 'ETL-003',
        name: 'SAP Cost Import',
        source: 'SAP S/4HANA',
        destination: 'Budget DB',
        schedule: 'Weekly (Sun)',
        lastRun: '2024-11-24 23:00:00',
        status: 'failed',
        duration: '2m 10s',
        recordsProcessed: 0
    },
    {
        id: 'ETL-004',
        name: 'IoT Telemetry Stream',
        source: 'Azure IoT Hub',
        destination: 'Time Series DB',
        schedule: 'Continuous',
        lastRun: 'Live',
        status: 'running',
        duration: 'Continuous',
        recordsProcessed: 1500000
    }
];

const dataQualityRules = [
    {
        id: 'DQR-001',
        name: 'Missing Room Parameters',
        source: 'Revit Models',
        rule: 'All rooms must have Area and Department defined',
        status: 'passing',
        lastChecked: '2024-11-28 12:00',
        failCount: 0
    },
    {
        id: 'DQR-002',
        name: 'Unassigned RFIs',
        source: 'Issue Tracker',
        rule: 'RFIs > 48h old must have assignee',
        status: 'warning',
        lastChecked: '2024-11-28 13:30',
        failCount: 3
    },
    {
        id: 'DQR-003',
        name: 'Duplicate Assets',
        source: 'Asset Registry',
        rule: 'Asset IDs must be unique',
        status: 'passing',
        lastChecked: '2024-11-28 09:00',
        failCount: 0
    },
    {
        id: 'DQR-004',
        name: 'Budget Mismatch',
        source: 'SAP vs P6',
        rule: 'Project codes must match in both systems',
        status: 'failing',
        lastChecked: '2024-11-28 08:00',
        failCount: 12
    }
];

const budgetData = [
    { category: 'Civil Works', planned: 450, actual: 420, variance: -30 },
    { category: 'MEP Systems', planned: 380, actual: 395, variance: 15 },
    { category: 'Medical Equipment', planned: 720, actual: 312, variance: -408 },
    { category: 'IT Infrastructure', planned: 180, actual: 85, variance: -95 },
    { category: 'Interiors', planned: 290, actual: 80, variance: -210 },
    { category: 'Specialised Shielding', planned: 120, actual: 0, variance: -120 },
];

const scheduleData = [
    { phase: 'Foundation & Structure', planned: 100, actual: 98, status: 'on-track' },
    { phase: 'MEP Rough-In', planned: 85, actual: 78, status: 'at-risk' },
    { phase: 'Radiology Fit-Out', planned: 60, actual: 52, status: 'delayed' },
    { phase: 'Oncology Shielding', planned: 45, actual: 45, status: 'on-track' },
    { phase: 'Equipment Installation', planned: 25, actual: 22, status: 'at-risk' },
    { phase: 'Commissioning', planned: 10, actual: 10, status: 'on-track' },
];

const clashHeatmapData = [
    { zone: 'OT-1 (Radiology)', clashCount: 23, severity: 'high', rfiCount: 12 },
    { zone: 'OT-2 (Oncology)', clashCount: 18, severity: 'high', rfiCount: 8 },
    { zone: 'LINAC Vault', clashCount: 31, severity: 'high', rfiCount: 15 },
    { zone: 'MRI Suite', clashCount: 15, severity: 'medium', rfiCount: 6 },
    { zone: 'CT Scanner Room', clashCount: 8, severity: 'low', rfiCount: 3 },
    { zone: 'Recovery Ward', clashCount: 5, severity: 'low', rfiCount: 2 },
    { zone: 'Control Room', clashCount: 12, severity: 'medium', rfiCount: 5 },
    { zone: 'Patient Waiting', clashCount: 3, severity: 'low', rfiCount: 1 },
];

const roomDataSheets = [
    {
        id: 'RDS-001',
        roomCode: 'OT-1',
        roomName: 'OT-1 Radiology Suite',
        department: 'Radiology',
        floor: 'Level 2',
        area: 65,
        clearHeight: 3.2,
        lodLevel: 'LOD 400',
        status: 'for-review',
        clinicalLead: 'Dr. Priya Sharma',
        lastReviewed: '2024-11-28',
        nabhjCompliant: true,
        jciCompliant: true,
        medicalGasOutlets: JSON.stringify([
            { id: 'MG-001', type: 'O2', location: 'East Wall - Bay 1', inspectionStatus: 'pending', lastInspection: '2024-10-15', nextInspection: '2024-12-05' },
            { id: 'MG-002', type: 'N2O', location: 'East Wall - Bay 2', inspectionStatus: 'passed', lastInspection: '2024-11-01', nextInspection: '2025-01-01' },
            { id: 'MG-003', type: 'VAC', location: 'Ceiling Mount', inspectionStatus: 'overdue', lastInspection: '2024-09-01', nextInspection: '2024-11-01' },
            { id: 'MG-004', type: 'AIR', location: 'West Wall', inspectionStatus: 'pending', lastInspection: '2024-10-20', nextInspection: '2024-12-10' },
        ]),
        electricalRequirements: JSON.stringify({
            normalPower: '150 kVA',
            emergencyPower: '100 kVA',
            upsBackup: true,
            isolatedPowerSystem: true,
            groundingType: 'Medical Grade IT',
        }),
        hvacRequirements: JSON.stringify({
            airChangesPerHour: 25,
            temperatureRange: '20-24°C',
            humidityRange: '30-60%',
            pressureDifferential: '+15 Pa',
            hepaFiltration: true,
        }),
        equipmentList: JSON.stringify(['C-Arm Fluoroscopy', 'Patient Table', 'Anesthesia Machine', 'Monitoring System', 'Surgical Lights']),
        signoffs: JSON.stringify([
            { id: 'SO-001', role: 'Clinical Lead', name: 'Dr. Priya Sharma', date: '', status: 'pending', digitalSignature: '', comments: '' },
            { id: 'SO-002', role: 'MEP Lead', name: 'Vikram Singh', date: '2024-11-25', status: 'approved', digitalSignature: 'SHA256:abc123...', comments: 'MEP layout verified against specifications' },
            { id: 'SO-003', role: 'Fire Safety', name: 'Amit Patel', date: '2024-11-26', status: 'approved', digitalSignature: 'SHA256:def456...', comments: 'Fire safety compliant' },
        ]),
        accDocumentId: 'ACC-DOC-2024-0891',
        comments: JSON.stringify([
            { id: 'C-001', author: 'Dr. Priya Sharma', role: 'Clinical Lead', date: '2024-11-27', content: 'Please verify O2 outlet positioning meets anesthesia workflow requirements', resolved: false },
            { id: 'C-002', author: 'Vikram Singh', role: 'MEP Lead', date: '2024-11-28', content: 'Confirmed - O2 outlet within 1.5m of anesthesia station per NABH guidelines', resolved: true },
        ]),
    },
    {
        id: 'RDS-002',
        roomCode: 'OT-2',
        roomName: 'OT-2 Oncology Suite',
        department: 'Oncology',
        floor: 'Level 2',
        area: 72,
        clearHeight: 3.5,
        lodLevel: 'LOD 400',
        status: 'approved',
        clinicalLead: 'Dr. Amit Desai',
        lastReviewed: '2024-11-25',
        nabhjCompliant: true,
        jciCompliant: true,
        medicalGasOutlets: JSON.stringify([
            { id: 'MG-005', type: 'O2', location: 'East Wall', inspectionStatus: 'passed', lastInspection: '2024-11-10', nextInspection: '2025-01-10' },
            { id: 'MG-006', type: 'VAC', location: 'Ceiling', inspectionStatus: 'passed', lastInspection: '2024-11-10', nextInspection: '2025-01-10' },
        ]),
        electricalRequirements: JSON.stringify({
            normalPower: '200 kVA',
            emergencyPower: '150 kVA',
            upsBackup: true,
            isolatedPowerSystem: true,
            groundingType: 'Medical Grade IT',
        }),
        hvacRequirements: JSON.stringify({
            airChangesPerHour: 25,
            temperatureRange: '20-24°C',
            humidityRange: '30-60%',
            pressureDifferential: '+15 Pa',
            hepaFiltration: true,
        }),
        equipmentList: JSON.stringify(['LINAC Treatment System', 'Patient Positioning System', 'Imaging Panel', 'Treatment Console']),
        signoffs: JSON.stringify([
            { id: 'SO-004', role: 'Clinical Lead', name: 'Dr. Amit Desai', date: '2024-11-25', status: 'approved', digitalSignature: 'SHA256:ghi789...', comments: 'Layout optimized for patient flow' },
            { id: 'SO-005', role: 'Radiation Safety', name: 'Dr. Kavita Reddy', date: '2024-11-24', status: 'approved', digitalSignature: 'SHA256:jkl012...', comments: 'Shielding specifications verified' },
        ]),
        accDocumentId: 'ACC-DOC-2024-0892',
        comments: JSON.stringify([]),
    },
    {
        id: 'RDS-003',
        roomCode: 'MRI-1',
        roomName: 'MRI Suite - Room R-101',
        department: 'Radiology',
        floor: 'Level 1',
        area: 85,
        clearHeight: 3.0,
        lodLevel: 'LOD 350',
        status: 'revision-required',
        clinicalLead: 'Dr. Kavita Reddy',
        lastReviewed: '2024-11-20',
        nabhjCompliant: true,
        jciCompliant: false,
        medicalGasOutlets: JSON.stringify([
            { id: 'MG-007', type: 'O2', location: 'Control Room', inspectionStatus: 'pending', lastInspection: '2024-10-01', nextInspection: '2024-12-01' },
        ]),
        electricalRequirements: JSON.stringify({
            normalPower: '180 kVA',
            emergencyPower: '120 kVA',
            upsBackup: true,
            isolatedPowerSystem: false,
            groundingType: 'RF Shielded',
        }),
        hvacRequirements: JSON.stringify({
            airChangesPerHour: 15,
            temperatureRange: '18-22°C',
            humidityRange: '40-60%',
            pressureDifferential: '+10 Pa',
            hepaFiltration: false,
        }),
        equipmentList: JSON.stringify(['3T MRI Scanner', 'Patient Table', 'RF Coils', 'Quench Pipe', 'Helium Recovery System']),
        signoffs: JSON.stringify([
            { id: 'SO-006', role: 'Clinical Lead', name: 'Dr. Kavita Reddy', date: '', status: 'pending', digitalSignature: '', comments: '' },
        ]),
        accDocumentId: 'ACC-DOC-2024-0893',
        comments: JSON.stringify([
            { id: 'C-003', author: 'Dr. Kavita Reddy', role: 'Clinical Lead', date: '2024-11-20', content: 'RF shielding specifications need to be updated to meet JCI requirements for 3T systems', resolved: false, linkedIssueId: 'ISS-002' },
        ]),
    },
];

const assetRegistry = [
    {
        id: 'AST-001',
        name: 'GE SIGNA Premier 3T MRI',
        type: 'MRI Scanner',
        location: 'Radiology Wing - Room R-101',
        warrantyEnd: '15-Nov-2035',
        powerLoad: '150 kVA',
        maintenanceFreq: 'Quarterly',
        status: 'operational',
        lastService: '15-Oct-2024',
        nextService: '15-Jan-2025',
        serialNumber: 'GE-MRI-2024-78542',
        manufacturer: 'GE Healthcare',
        omManualUrl: '/docs/om/ge-signa-premier-3t.pdf',
        qrCode: 'QR-AST-001-AHC2024',
        rfidTag: 'RFID-001-AHC',
        nabhlCompliance: 'NABH-RAD-2024-001',
        fireSafetyRating: 'Class A',
        medicalGasReq: 'Helium (5G Quench), Medical Air',
    },
    {
        id: 'AST-002',
        name: 'Varian TrueBeam LINAC',
        type: 'Linear Accelerator',
        location: 'Oncology Wing - Vault V-201',
        warrantyEnd: '20-Mar-2036',
        powerLoad: '200 kVA',
        maintenanceFreq: 'Monthly',
        status: 'alert',
        lastService: '01-Nov-2024',
        nextService: '01-Dec-2024',
        serialNumber: 'VAR-TB-2024-12345',
        manufacturer: 'Varian Medical Systems',
        omManualUrl: '/docs/om/varian-truebeam.pdf',
        qrCode: 'QR-AST-002-AHC2024',
        rfidTag: 'RFID-002-AHC',
        nabhlCompliance: 'NABH-ONC-2024-002',
        fireSafetyRating: 'Class A',
        medicalGasReq: 'Medical Air, Nitrogen',
    },
    {
        id: 'AST-003',
        name: 'Siemens SOMATOM CT',
        type: 'CT Scanner',
        location: 'Radiology Wing - Room R-102',
        warrantyEnd: '10-Aug-2034',
        powerLoad: '80 kVA',
        maintenanceFreq: 'Bi-Annual',
        status: 'operational',
        lastService: '20-Sep-2024',
        nextService: '20-Mar-2025',
        serialNumber: 'SIE-CT-2024-98765',
        manufacturer: 'Siemens Healthineers',
        omManualUrl: '/docs/om/siemens-somatom.pdf',
        qrCode: 'QR-AST-003-AHC2024',
        rfidTag: 'RFID-003-AHC',
        nabhlCompliance: 'NABH-RAD-2024-003',
        fireSafetyRating: 'Class B',
        medicalGasReq: 'None',
    },
    {
        id: 'AST-004',
        name: 'Philips EPIQ Elite Ultrasound',
        type: 'Ultrasound',
        location: 'Radiology Wing - Room R-105',
        warrantyEnd: '05-Jun-2032',
        powerLoad: '5 kVA',
        maintenanceFreq: 'Annual',
        status: 'operational',
        lastService: '10-Aug-2024',
        nextService: '10-Aug-2025',
        serialNumber: 'PHI-US-2024-45678',
        manufacturer: 'Philips Healthcare',
        omManualUrl: '/docs/om/philips-epiq.pdf',
        qrCode: 'QR-AST-004-AHC2024',
        rfidTag: 'RFID-004-AHC',
        nabhlCompliance: 'NABH-RAD-2024-004',
        fireSafetyRating: 'Class C',
        medicalGasReq: 'None',
    },
    {
        id: 'AST-005',
        name: 'Elekta Versa HD',
        type: 'Linear Accelerator',
        location: 'Oncology Wing - Vault V-202',
        warrantyEnd: '28-Feb-2037',
        powerLoad: '180 kVA',
        maintenanceFreq: 'Monthly',
        status: 'maintenance',
        lastService: '25-Nov-2024',
        nextService: '25-Dec-2024',
        serialNumber: 'ELK-VH-2024-11111',
        manufacturer: 'Elekta',
        omManualUrl: '/docs/om/elekta-versa-hd.pdf',
        qrCode: 'QR-AST-005-AHC2024',
        rfidTag: 'RFID-005-AHC',
        nabhlCompliance: 'NABH-ONC-2024-005',
        fireSafetyRating: 'Class A',
        medicalGasReq: 'Medical Air',
    },
];

const workOrders = [
    {
        id: 'WO-001',
        assetId: 'AST-002',
        type: 'preventive',
        priority: 'high',
        status: 'open',
        description: 'Monthly calibration and beam output verification for Varian TrueBeam LINAC',
        assignedTo: 'RadTech Solutions',
        createdDate: '2024-11-26',
        dueDate: '2024-12-01',
        triggeredBy: 'schedule',
    },
    {
        id: 'WO-002',
        assetId: 'AST-002',
        type: 'corrective',
        priority: 'medium',
        status: 'in-progress',
        description: 'Elevated vibration sensor reading - inspect gantry bearings',
        assignedTo: 'Varian Service',
        createdDate: '2024-11-28',
        dueDate: '2024-12-05',
        triggeredBy: 'sensor',
    },
    {
        id: 'WO-003',
        assetId: 'AST-005',
        type: 'preventive',
        priority: 'medium',
        status: 'completed',
        description: 'Quarterly MLC leaf calibration',
        assignedTo: 'Elekta Service',
        createdDate: '2024-11-20',
        dueDate: '2024-11-25',
        completedDate: '2024-11-24',
        triggeredBy: 'schedule',
        laborHours: 6,
        partsUsed: JSON.stringify(['Calibration phantom', 'Alignment tool']),
    },
];

const iotSensorReadings = [
    { sensorId: 'IOT-001', assetId: 'AST-002', type: 'temperature', value: 22.5, unit: '°C', timestamp: '2024-11-28T14:30:00Z', status: 'normal', threshold: JSON.stringify({ min: 18, max: 26 }) },
    { sensorId: 'IOT-002', assetId: 'AST-002', type: 'humidity', value: 45, unit: '%', timestamp: '2024-11-28T14:30:00Z', status: 'normal', threshold: JSON.stringify({ min: 30, max: 60 }) },
    { sensorId: 'IOT-003', assetId: 'AST-002', type: 'vibration', value: 0.8, unit: 'g', timestamp: '2024-11-28T14:30:00Z', status: 'warning', threshold: JSON.stringify({ min: 0, max: 0.5 }) },
    { sensorId: 'IOT-004', assetId: 'AST-001', type: 'temperature', value: 20.1, unit: '°C', timestamp: '2024-11-28T14:30:00Z', status: 'normal', threshold: JSON.stringify({ min: 18, max: 24 }) },
    { sensorId: 'IOT-005', assetId: 'AST-001', type: 'power', value: 142, unit: 'kVA', timestamp: '2024-11-28T14:30:00Z', status: 'normal', threshold: JSON.stringify({ min: 0, max: 160 }) },
];

const p6Milestones = [
    {
        id: 'P6-001',
        wbsCode: 'AHC.RAD.FND',
        name: 'Foundation Complete - Radiology Wing',
        plannedStart: '2024-01-15',
        plannedFinish: '2024-03-30',
        actualStart: '2024-01-15',
        actualFinish: '2024-03-28',
        percentComplete: 100,
        isCriticalPath: true,
        floatDays: 0,
        predecessors: JSON.stringify([]),
        zone: 'Radiology Wing',
        trade: 'Civil',
    },
    {
        id: 'P6-002',
        wbsCode: 'AHC.RAD.MEP',
        name: 'MEP Rough-In - Radiology',
        plannedStart: '2024-04-01',
        plannedFinish: '2024-07-31',
        actualStart: '2024-04-05',
        percentComplete: 78,
        isCriticalPath: true,
        floatDays: 0,
        predecessors: JSON.stringify(['P6-001']),
        zone: 'Radiology Wing',
        trade: 'MEP',
        atRiskReason: 'RFI delays on RF shielding specs',
    },
    {
        id: 'P6-003',
        wbsCode: 'AHC.ONC.SHD',
        name: 'LINAC Vault Shielding',
        plannedStart: '2024-06-01',
        plannedFinish: '2024-09-30',
        actualStart: '2024-06-01',
        percentComplete: 85,
        isCriticalPath: true,
        floatDays: 0,
        predecessors: JSON.stringify(['P6-001']),
        zone: 'Oncology Wing',
        trade: 'Specialist',
    },
    {
        id: 'P6-004',
        wbsCode: 'AHC.RAD.FIT',
        name: 'Radiology Fit-Out',
        plannedStart: '2024-08-01',
        plannedFinish: '2024-11-30',
        actualStart: '2024-08-15',
        percentComplete: 52,
        isCriticalPath: false,
        floatDays: -14,
        predecessors: JSON.stringify(['P6-002']),
        zone: 'Radiology Wing',
        trade: 'Interiors',
        atRiskReason: 'Late start due to MEP delays',
    },
    {
        id: 'P6-005',
        wbsCode: 'AHC.ONC.EQP',
        name: 'LINAC Equipment Installation',
        plannedStart: '2024-10-01',
        plannedFinish: '2025-02-28',
        percentComplete: 22,
        isCriticalPath: true,
        floatDays: 0,
        predecessors: JSON.stringify(['P6-003']),
        zone: 'Oncology Wing',
        trade: 'Equipment',
    },
];

const vendorData = [
    {
        id: 'VND-001',
        name: 'MedTech Solutions India',
        category: 'Medical Equipment',
        technicalScore: 92,
        financialScore: 88,
        experienceScore: 95,
        overallScore: 91.7,
        status: 'qualified',
        slaCompliance: 98,
        responseTime: '< 24 hrs',
        auditHistory: JSON.stringify([
            { date: '2024-11-15', action: 'Pre-qualification submitted', score: 91.7 },
            { date: '2024-11-18', action: 'Technical evaluation complete', score: 92 },
            { date: '2024-11-20', action: 'Financial verification passed', score: 88 },
        ]),
    },
    {
        id: 'VND-002',
        name: 'BuildCon Healthcare',
        category: 'Civil Contractor',
        technicalScore: 85,
        financialScore: 90,
        experienceScore: 82,
        overallScore: 85.7,
        status: 'qualified',
        slaCompliance: 95,
        responseTime: '< 48 hrs',
        auditHistory: JSON.stringify([
            { date: '2024-11-10', action: 'Pre-qualification submitted', score: 85.7 },
            { date: '2024-11-12', action: 'Site visit completed', score: 85 },
        ]),
    },
    {
        id: 'VND-003',
        name: 'RadShield Technologies',
        category: 'Radiation Shielding',
        technicalScore: 78,
        financialScore: 72,
        experienceScore: 80,
        overallScore: 76.7,
        status: 'pending',
        slaCompliance: 0,
        responseTime: 'N/A',
        auditHistory: JSON.stringify([
            { date: '2024-11-25', action: 'Pre-qualification submitted', score: 76.7 },
            { date: '2024-11-28', action: 'Awaiting financial documents', score: 0 },
        ]),
    },
];

const issuesData = [
    {
        id: 'ISS-001',
        type: 'clash',
        title: 'HVAC Duct conflicts with structural beam in OT-1',
        zone: 'OT-1 (Radiology)',
        priority: 'critical',
        status: 'open',
        assignee: 'Rajesh Kumar',
        dueDate: '2024-12-05',
        source: 'Autodesk ACC',
        slaBreached: false,
        hoursRemaining: 48,
    },
    {
        id: 'ISS-002',
        type: 'rfi',
        title: 'Clarification needed for MRI room RF shielding specs',
        zone: 'MRI Suite',
        priority: 'high',
        status: 'in-progress',
        assignee: 'Dr. Priya Sharma',
        dueDate: '2024-12-03',
        source: 'Autodesk ACC',
        slaBreached: true,
        hoursRemaining: -24,
    },
    {
        id: 'ISS-003',
        type: 'clash',
        title: 'Medical gas piping intersects electrical conduit',
        zone: 'LINAC Vault',
        priority: 'high',
        status: 'open',
        assignee: 'Anil Verma',
        dueDate: '2024-12-08',
        source: 'Autodesk ACC',
        slaBreached: false,
        hoursRemaining: 120,
    },
    {
        id: 'ISS-004',
        type: 'change-order',
        title: 'Additional lead lining required for Vault V-201',
        zone: 'Oncology Wing',
        priority: 'medium',
        status: 'in-progress',
        assignee: 'Sunita Patel',
        dueDate: '2024-12-15',
        source: 'SAP/Ariba',
        slaBreached: false,
        hoursRemaining: 288,
    },
    {
        id: 'ISS-005',
        type: 'design-review',
        title: 'Clinical sign-off pending for OT-1 layout',
        zone: 'OT-1 (Radiology)',
        priority: 'high',
        status: 'escalated',
        assignee: 'Dr. Priya Sharma',
        dueDate: '2024-12-01',
        source: 'ACC Docs',
        slaBreached: true,
        hoursRemaining: -48,
    },
];

const auditLogs = [
    {
        id: 'AUD-001',
        timestamp: '2024-11-28 14:32:15 IST',
        action: 'Design Approved',
        document: 'Radiology Floor Plan',
        version: 'v4.2',
        user: 'Dr. Amit Desai (Clinical Lead)',
        signature: 'SHA256:9f86d081884c7d659a2feaa0c55ad015...',
        iso19650Compliant: true,
    },
    {
        id: 'AUD-002',
        timestamp: '2024-11-27 11:15:42 IST',
        action: 'Revision Submitted',
        document: 'Oncology Wing MEP Layout',
        version: 'v3.1',
        user: 'Vikram Singh (MEP Lead)',
        signature: 'SHA256:a591a6d40bf420404a011733cfb7b190...',
        iso19650Compliant: true,
    },
    {
        id: 'AUD-003',
        timestamp: '2024-11-26 09:45:30 IST',
        action: 'RFI Response',
        document: 'LINAC Power Requirements',
        version: 'v1.0',
        user: 'Rajesh Kumar (Electrical)',
        signature: 'SHA256:ef92b778bafe771e89245b89ecbc08a4...',
        iso19650Compliant: true,
    },
    {
        id: 'AUD-004',
        timestamp: '2024-11-25 16:20:00 IST',
        action: 'Document Uploaded',
        document: 'MRI RF Shielding Specifications',
        version: 'v1.0',
        user: 'RadShield Technologies',
        signature: 'SHA256:c3fcd3d76192e4007dfb496cca67e13b...',
        iso19650Compliant: true,
    },
    {
        id: 'AUD-005',
        timestamp: '2024-11-24 10:00:00 IST',
        action: 'SLA Breach Escalation',
        document: 'RFI-2024-MRI-001',
        version: 'N/A',
        user: 'System (Auto-trigger)',
        signature: 'SHA256:auto-escalation-trigger...',
        iso19650Compliant: true,
    },
];

const integrationStatus = {
    acc: JSON.stringify({ status: 'connected', issues: 124, lastSync: '2 mins ago' }),
    sap: JSON.stringify({ status: 'connected', orders: 47, lastSync: '5 mins ago' }),
    primavera: JSON.stringify({ status: 'connected', milestones: 156, lastSync: '1 min ago' }),
    iot: JSON.stringify({ status: 'active', sensors: 342, alerts: 3, lastSync: 'Live', description: 'Sensor telemetry & status' }),
    revit: JSON.stringify({ status: 'syncing', models: 12, lastSync: 'Syncing...', description: 'BIM 360 Design Collaboration' }),
    oracle: JSON.stringify({ status: 'error', tables: 0, lastSync: 'Failed 4h ago', description: 'Financial master data' }),
};

const timelineMilestones = [
    { date: 'Jan 2024', phase: 'Foundation Complete', progress: 100, cost: 180 },
    { date: 'Apr 2024', phase: 'Structure Complete', progress: 100, cost: 420 },
    { date: 'Jul 2024', phase: 'MEP Rough-In', progress: 85, cost: 680 },
    { date: 'Oct 2024', phase: 'Fit-Out Start', progress: 65, cost: 820 },
    { date: 'Jan 2025', phase: 'Equipment Install', progress: 30, cost: 950 },
    { date: 'Apr 2025', phase: 'Commissioning', progress: 10, cost: 1100 },
    { date: 'Jul 2025', phase: 'Go-Live', progress: 0, cost: 1200 },
];

const userRoles = [
    {
        id: 'ROLE-001',
        name: 'Executive Leadership',
        permissions: JSON.stringify(['view_all', 'export_reports', 'approve_budget']),
        dataAccess: 'full',
        sensitiveDataAccess: true,
    },
    {
        id: 'ROLE-002',
        name: 'Clinical SME',
        permissions: JSON.stringify(['view_clinical', 'approve_design', 'add_comments']),
        dataAccess: 'department',
        sensitiveDataAccess: false,
    },
    {
        id: 'ROLE-003',
        name: 'Contractor',
        permissions: JSON.stringify(['view_assigned', 'submit_rfi', 'upload_docs']),
        dataAccess: 'project',
        sensitiveDataAccess: false,
    },
    {
        id: 'ROLE-004',
        name: 'Project Director',
        permissions: JSON.stringify(['view_all', 'approve_all', 'manage_users', 'export_reports']),
        dataAccess: 'full',
        sensitiveDataAccess: true,
    },
];

const dailyReports = [
    {
        id: 'RPT-001',
        date: '2024-11-28',
        zone: 'Radiology Wing',
        contractor: 'BuildCon Healthcare',
        manpower: 45,
        plannedActivities: JSON.stringify(['Excavation', 'Rebar Installation', 'Formwork']),
        completedActivities: JSON.stringify(['Excavation', 'Rebar Installation']),
        issues: JSON.stringify(['Rain delay causing 2h stoppage']),
        photos: 12,
        weather: 'Cloudy, 28°C',
        submittedBy: 'Rajesh Singh (Site Engineer)'
    },
    {
        id: 'RPT-002',
        date: '2024-11-28',
        zone: 'Oncology Wing',
        contractor: 'RadShield Tech',
        manpower: 12,
        plannedActivities: JSON.stringify(['Shielding Layer 1', 'Lead Brick Laying']),
        completedActivities: JSON.stringify(['Shielding Layer 1']),
        issues: JSON.stringify([]),
        photos: 8,
        weather: 'Cloudy, 28°C',
        submittedBy: 'Mike Chen (Specialist)'
    }
];

const inventory = [
    { id: 'MAT-001', material: 'Cement - OPC 53', unit: 'Bags', stock: 450, minLevel: 100, lastReceived: '2024-11-20', location: 'Warehouse A', status: 'ok' },
    { id: 'MAT-002', material: 'Reinforcement Steel 16mm', unit: 'MT', stock: 2.5, minLevel: 5, lastReceived: '2024-11-15', location: 'Yard 2', status: 'low' },
    { id: 'MAT-003', material: 'Lead Bricks (Interlocking)', unit: 'Pallets', stock: 8, minLevel: 10, lastReceived: '2024-11-10', location: 'Secure Store', status: 'low' },
    { id: 'MAT-004', material: 'Medical Grade Copper Pipes', unit: 'm', stock: 1200, minLevel: 500, lastReceived: '2024-11-25', location: 'Warehouse B', status: 'ok' }
];

const workforce = [
    { contractor: 'BuildCon Healthcare', trade: 'Civil', planned: 50, actual: 45, zone: 'Radiology Wing' },
    { contractor: 'BuildCon Healthcare', trade: 'MEP', planned: 30, actual: 28, zone: 'Radiology Wing' },
    { contractor: 'RadShield Tech', trade: 'Specialist', planned: 15, actual: 12, zone: 'Oncology Wing' },
    { contractor: 'Voltas', trade: 'HVAC', planned: 20, actual: 20, zone: 'General' }
];

const ncrs = [
    { id: 'NCR-001', title: 'Start bar spacing incorrect', zone: 'Radiology Wing', severity: 'major', status: 'open', raisedDate: '2024-11-25', contractor: 'BuildCon Healthcare', rootCause: 'Drawing misinterpretation', daysOpen: 3 },
    { id: 'NCR-002', title: 'Concrete surface finish poor', zone: 'Corridor A', severity: 'minor', status: 'closed', raisedDate: '2024-11-20', contractor: 'BuildCon Healthcare', rootCause: 'Formwork issue', daysOpen: 1 }
];

const safetyObservations = [
    { id: 'SFT-001', type: 'unsafe-act', description: 'Worker operating vibrator without gloves', zone: 'Radiology Wing', date: '2024-11-28', reportedBy: 'Safety Officer', status: 'open', priority: 'medium' },
    { id: 'SFT-002', type: 'unsafe-condition', description: 'Exposed electrical wire near water source', zone: 'Canteen Area', date: '2024-11-28', reportedBy: 'Site Engineer', status: 'open', priority: 'high' }
];

const deliverables = [
    { id: 'DEL-001', name: 'GFC Drawings - Radiology Civil', discipline: 'Civil', phase: 'GFC', status: 'approved', owner: 'Struct Arch Consultants', dueDate: '2024-11-15', version: 'v2.0', accDocId: 'DOC-101', progress: 100 },
    { id: 'DEL-002', name: 'MEP Coordination Layout', discipline: 'MEP', phase: 'DD', status: 'for-review', owner: 'Voltas Engineering', dueDate: '2024-12-05', version: 'v1.4', accDocId: 'DOC-105', progress: 85 },
    { id: 'DEL-003', name: 'LINAC Vault Shielding Calcs', discipline: 'Specialist', phase: 'DD', status: 'approved', owner: 'RadShield Tech', dueDate: '2024-10-30', version: 'v1.0', accDocId: 'DOC-201', progress: 100 }
];

const designDecisions = [
    { id: 'DEC-001', title: 'Selection of Anti-fungal Paint', date: '2024-10-15', options: JSON.stringify(['Asian Paints Royale Health Shield', 'Dulux Professional']), decision: 'Asian Paints Royale Health Shield', approver: 'Dr. Amit Desai', linkedDocs: JSON.stringify(['Spec-Sheet-001']), impact: 'No Cost Impact' },
    { id: 'DEC-002', title: 'Change of Medical Gas Outlet Type', date: '2024-11-20', options: JSON.stringify(['Standard DIN', 'British Standard']), decision: 'British Standard', approver: 'Biomedical Lead', linkedDocs: JSON.stringify(['RFI-005']), impact: 'Minor Cost Increase' }
];

const cvEvents = [
    { id: 'EVT-001', type: 'ppe-violation', description: 'Worker without helmet detected', zone: 'Zone A', camera: 'Cam-Gate-1', timestamp: '10:05 AM', severity: 'medium', status: 'new', confidence: 95, thumbnail: '' },
    { id: 'EVT-002', type: 'unsafe-act', description: 'Working at height without harness', zone: 'Zone B', camera: 'Cam-Roof-2', timestamp: '11:20 AM', severity: 'critical', status: 'acknowledged', confidence: 98, thumbnail: '' }
];

const cameraFeeds = [
    { id: 'CAM-01', name: 'Main Gate Entrance', zone: 'Perimeter', status: 'online', eventsToday: 12, lastEvent: '10:05 AM' },
    { id: 'CAM-02', name: 'Material Yard', zone: 'Storage', status: 'recording', eventsToday: 5, lastEvent: '09:15 AM' },
    { id: 'CAM-03', name: 'Lobby Construction', zone: 'Ground Floor', status: 'offline', eventsToday: 0, lastEvent: '' }
];

const ppeCompliance = [
    { zone: 'Zone A', helmet: 95, vest: 98, gloves: 90, goggles: 85, overall: 92 },
    { zone: 'Zone B', helmet: 88, vest: 95, gloves: 85, goggles: 80, overall: 87 }
];

const progressMetrics = [
    { zone: 'Zone A', activity: 'Concreting', planned: 50, actual: 48, variance: -2, lastUpdated: 'Today' },
    { zone: 'Zone B', activity: 'Brickwork', planned: 30, actual: 35, variance: 5, lastUpdated: 'Yesterday' }
];

const commissioningTests = [
    { id: 'TEST-001', system: 'HVAC', testName: 'AHU-01 Air Balancing', zone: 'OT-1', status: 'passed', scheduledDate: '2024-11-20', contractor: 'Voltas', witness: 'Consultant', defects: 0 },
    { id: 'TEST-002', system: 'Medical Gas', testName: 'Oxygen Line Pressure Test', zone: 'ICU', status: 'in-progress', scheduledDate: '2024-11-29', contractor: 'MedGas Co', witness: 'TPA', defects: 0 }
];

const snags = [
    { id: 'SNAG-001', description: 'Paint peeling off corner wall', zone: 'Corridor 2F', location: 'Wall A', trade: 'Finishing', priority: 'low', status: 'open', raisedDate: '2024-11-25', dueDate: '2024-11-30', assignedTo: 'PaintAgency', photos: 2 },
    { id: 'SNAG-002', description: 'Door closer missing', zone: 'Room 101', location: 'Door', trade: 'Carpentry', priority: 'medium', status: 'assigned', raisedDate: '2024-11-26', dueDate: '2024-12-01', assignedTo: 'WoodWorks', photos: 0 }
];

const assetTags = [
    { id: 'TAG-001', assetName: 'AHU-01', assetId: 'EQ-101', qrCode: 'QR-1001', rfidTag: 'RF-500', zone: 'Plant Room', tagStatus: 'verified', bimLinked: 1, cafmSynced: 1 },
    { id: 'TAG-002', assetName: 'Chiller-01', assetId: 'EQ-102', qrCode: 'QR-1002', rfidTag: 'RF-501', zone: 'Roof', tagStatus: 'printed', bimLinked: 1, cafmSynced: 0 }
];

const trainingRecords = [
    { id: 'TRN-001', topic: 'Fire Safety & Evacuation', trainer: 'Safety Officer', date: '2024-11-20', duration: '2h', attendees: 15, department: 'Maintenance', completionRate: 100, materialsUploaded: 1 }
];

async function run() {
    try {
        const SQL = await initSqlJs();
        const db = new SQL.Database();

        function setupTable(tableName, schema, data, insertParams, valueMapper) {
            db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`);
            const stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} VALUES (${insertParams})`);

            db.run("BEGIN TRANSACTION");
            try {
                for (const item of data) {
                    stmt.run(valueMapper(item));
                }
                db.run("COMMIT");
            } catch (e) {
                console.error(`Error inserting data into ${tableName}`, e);
                db.run("ROLLBACK");
            } finally {
                stmt.free();
            }
        }

        try {
            // Executive KPIs
            setupTable('executive_kpis',
                'label TEXT, value TEXT, change REAL, trend TEXT, icon TEXT',
                executiveKPIs, '?, ?, ?, ?, ?',
                (item) => [item.label, item.value, item.change, item.trend, item.icon]
            );

            // Budget Data
            setupTable('budget_data',
                'category TEXT, planned REAL, actual REAL, variance REAL',
                budgetData, '?, ?, ?, ?',
                (item) => [item.category, item.planned, item.actual, item.variance]
            );

            // Schedule Data
            setupTable('schedule_data',
                'phase TEXT, planned REAL, actual REAL, status TEXT',
                scheduleData, '?, ?, ?, ?',
                (item) => [item.phase, item.planned, item.actual, item.status]
            );

            // Clash Heatmap Data
            setupTable('clash_heatmap_data',
                'zone TEXT, clashCount INTEGER, severity TEXT, rfiCount INTEGER',
                clashHeatmapData, '?, ?, ?, ?',
                (item) => [item.zone, item.clashCount, item.severity, item.rfiCount]
            );

            // Room Data Sheets
            setupTable('room_data_sheets',
                'id TEXT PRIMARY KEY, roomCode TEXT, roomName TEXT, department TEXT, floor TEXT, area REAL, clearHeight REAL, lodLevel TEXT, status TEXT, clinicalLead TEXT, lastReviewed TEXT, nabhjCompliant INTEGER, jciCompliant INTEGER, medicalGasOutlets TEXT, electricalRequirements TEXT, hvacRequirements TEXT, equipmentList TEXT, signoffs TEXT, accDocumentId TEXT, comments TEXT',
                roomDataSheets, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.roomCode, item.roomName, item.department, item.floor, item.area, item.clearHeight, item.lodLevel, item.status, item.clinicalLead, item.lastReviewed, item.nabhjCompliant ? 1 : 0, item.jciCompliant ? 1 : 0, item.medicalGasOutlets, item.electricalRequirements, item.hvacRequirements, item.equipmentList, item.signoffs, item.accDocumentId, item.comments]
            );

            // Asset Registry
            setupTable('asset_registry',
                'id TEXT PRIMARY KEY, name TEXT, type TEXT, location TEXT, warrantyEnd TEXT, powerLoad TEXT, maintenanceFreq TEXT, status TEXT, lastService TEXT, nextService TEXT, serialNumber TEXT, manufacturer TEXT, omManualUrl TEXT, qrCode TEXT, rfidTag TEXT, nabhlCompliance TEXT, fireSafetyRating TEXT, medicalGasReq TEXT',
                assetRegistry, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.name, item.type, item.location, item.warrantyEnd, item.powerLoad, item.maintenanceFreq, item.status, item.lastService, item.nextService, item.serialNumber, item.manufacturer, item.omManualUrl, item.qrCode, item.rfidTag, item.nabhlCompliance, item.fireSafetyRating, item.medicalGasReq]
            );

            // Work Orders
            setupTable('work_orders',
                'id TEXT PRIMARY KEY, assetId TEXT, type TEXT, priority TEXT, status TEXT, description TEXT, assignedTo TEXT, createdDate TEXT, dueDate TEXT, completedDate TEXT, triggeredBy TEXT, laborHours REAL, partsUsed TEXT',
                workOrders, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.assetId, item.type, item.priority, item.status, item.description, item.assignedTo, item.createdDate, item.dueDate, item.completedDate || null, item.triggeredBy, item.laborHours || null, item.partsUsed || null]
            );

            // IoT Sensor Readings
            setupTable('iot_sensor_readings',
                'sensorId TEXT, assetId TEXT, type TEXT, value REAL, unit TEXT, timestamp TEXT, status TEXT, threshold TEXT',
                iotSensorReadings, '?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.sensorId, item.assetId, item.type, item.value, item.unit, item.timestamp, item.status, item.threshold]
            );

            // P6 Milestones
            setupTable('p6_milestones',
                'id TEXT PRIMARY KEY, wbsCode TEXT, name TEXT, plannedStart TEXT, plannedFinish TEXT, actualStart TEXT, actualFinish TEXT, percentComplete INTEGER, isCriticalPath INTEGER, floatDays INTEGER, predecessors TEXT, zone TEXT, trade TEXT, atRiskReason TEXT',
                p6Milestones, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.wbsCode, item.name, item.plannedStart, item.plannedFinish, item.actualStart || null, item.actualFinish || null, item.percentComplete, item.isCriticalPath ? 1 : 0, item.floatDays, item.predecessors, item.zone, item.trade, item.atRiskReason || null]
            );

            // Timeline Milestones
            setupTable('timeline_milestones',
                'date TEXT, phase TEXT, progress INTEGER, cost INTEGER',
                timelineMilestones, '?, ?, ?, ?',
                (item) => [item.date, item.phase, item.progress, item.cost]
            );

            // Integration Status
            setupTable('integration_status',
                'system TEXT, status TEXT, issues TEXT, lastSync TEXT, orders TEXT, milestones TEXT, sensors TEXT, alerts TEXT',
                Object.entries(integrationStatus).map(([sys, val]) => {
                    const parsed = JSON.parse(val);
                    return { system: sys, ...parsed };
                }),
                '?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.system, item.status, item.issues || null, item.lastSync || null, item.orders || null, item.milestones || null, item.sensors || null, item.alerts || null]
            );


            // Vendor Data
            setupTable('vendor_data',
                'id TEXT PRIMARY KEY, name TEXT, category TEXT, technicalScore REAL, financialScore REAL, experienceScore REAL, overallScore REAL, status TEXT, slaCompliance REAL, responseTime TEXT, auditHistory TEXT',
                vendorData, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.name, item.category, item.technicalScore, item.financialScore, item.experienceScore, item.overallScore, item.status, item.slaCompliance, item.responseTime, item.auditHistory]
            );

            // Issues Data
            setupTable('issues_data',
                'id TEXT PRIMARY KEY, type TEXT, title TEXT, zone TEXT, priority TEXT, status TEXT, assignee TEXT, dueDate TEXT, source TEXT, slaBreached INTEGER, hoursRemaining REAL',
                issuesData, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.type, item.title, item.zone, item.priority, item.status, item.assignee, item.dueDate, item.source, item.slaBreached ? 1 : 0, item.hoursRemaining]
            );

            // Audit Logs
            setupTable('audit_logs',
                'id TEXT PRIMARY KEY, timestamp TEXT, action TEXT, document TEXT, version TEXT, user TEXT, signature TEXT, iso19650Compliant INTEGER',
                auditLogs, '?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.timestamp, item.action, item.document, item.version, item.user, item.signature, item.iso19650Compliant ? 1 : 0]
            );

            // User Roles
            setupTable('user_roles',
                'id TEXT PRIMARY KEY, name TEXT, permissions TEXT, dataAccess TEXT, sensitiveDataAccess INTEGER',
                userRoles, '?, ?, ?, ?, ?',
                (item) => [item.id, item.name, item.permissions, item.dataAccess, item.sensitiveDataAccess ? 1 : 0]
            );

            // Daily Reports
            setupTable('daily_reports',
                'id TEXT PRIMARY KEY, date TEXT, zone TEXT, contractor TEXT, manpower INTEGER, plannedActivities TEXT, completedActivities TEXT, issues TEXT, photos INTEGER, weather TEXT, submittedBy TEXT',
                dailyReports, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.date, item.zone, item.contractor, item.manpower, item.plannedActivities, item.completedActivities, item.issues, item.photos, item.weather, item.submittedBy]
            );

            // Inventory
            setupTable('inventory',
                'id TEXT PRIMARY KEY, material TEXT, unit TEXT, stock REAL, minLevel REAL, lastReceived TEXT, location TEXT, status TEXT',
                inventory, '?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.material, item.unit, item.stock, item.minLevel, item.lastReceived, item.location, item.status]
            );

            // Workforce
            setupTable('workforce',
                'contractor TEXT, trade TEXT, planned INTEGER, actual INTEGER, zone TEXT',
                workforce, '?, ?, ?, ?, ?',
                (item) => [item.contractor, item.trade, item.planned, item.actual, item.zone]
            );

            // NCRs
            setupTable('ncrs',
                'id TEXT PRIMARY KEY, title TEXT, zone TEXT, severity TEXT, status TEXT, raisedDate TEXT, contractor TEXT, rootCause TEXT, daysOpen INTEGER',
                ncrs, '?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.title, item.zone, item.severity, item.status, item.raisedDate, item.contractor, item.rootCause, item.daysOpen]
            );

            // Safety Observations
            setupTable('safety_observations',
                'id TEXT PRIMARY KEY, type TEXT, description TEXT, zone TEXT, date TEXT, reportedBy TEXT, status TEXT, priority TEXT',
                safetyObservations, '?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.type, item.description, item.zone, item.date, item.reportedBy, item.status, item.priority]
            );

            // Deliverables
            setupTable('deliverables',
                'id TEXT PRIMARY KEY, name TEXT, discipline TEXT, phase TEXT, status TEXT, owner TEXT, dueDate TEXT, version TEXT, accDocId TEXT, progress INTEGER',
                deliverables, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.name, item.discipline, item.phase, item.status, item.owner, item.dueDate, item.version, item.accDocId, item.progress]
            );

            // Design Decisions
            setupTable('design_decisions',
                'id TEXT PRIMARY KEY, title TEXT, date TEXT, options TEXT, decision TEXT, approver TEXT, linkedDocs TEXT, impact TEXT',
                designDecisions, '?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.title, item.date, item.options, item.decision, item.approver, item.linkedDocs, item.impact]
            );

            // CV Events
            setupTable('cv_events',
                'id TEXT PRIMARY KEY, type TEXT, description TEXT, zone TEXT, camera TEXT, timestamp TEXT, severity TEXT, status TEXT, confidence INTEGER, thumbnail TEXT',
                cvEvents, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.type, item.description, item.zone, item.camera, item.timestamp, item.severity, item.status, item.confidence, item.thumbnail]
            );

            // Camera Feeds
            setupTable('camera_feeds',
                'id TEXT PRIMARY KEY, name TEXT, zone TEXT, status TEXT, eventsToday INTEGER, lastEvent TEXT',
                cameraFeeds, '?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.name, item.zone, item.status, item.eventsToday, item.lastEvent]
            );

            // PPE Compliance
            setupTable('ppe_compliance',
                'zone TEXT, helmet INTEGER, vest INTEGER, gloves INTEGER, goggles INTEGER, overall INTEGER',
                ppeCompliance, '?, ?, ?, ?, ?, ?',
                (item) => [item.zone, item.helmet, item.vest, item.gloves, item.goggles, item.overall]
            );

            // Progress Metrics
            setupTable('progress_metrics',
                'zone TEXT, activity TEXT, planned INTEGER, actual INTEGER, variance INTEGER, lastUpdated TEXT',
                progressMetrics, '?, ?, ?, ?, ?, ?',
                (item) => [item.zone, item.activity, item.planned, item.actual, item.variance, item.lastUpdated]
            );

            // Commissioning Tests
            setupTable('commissioning_tests',
                'id TEXT PRIMARY KEY, system TEXT, testName TEXT, zone TEXT, status TEXT, scheduledDate TEXT, contractor TEXT, witness TEXT, defects INTEGER',
                commissioningTests, '?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.system, item.testName, item.zone, item.status, item.scheduledDate, item.contractor, item.witness, item.defects]
            );

            // Snags
            setupTable('snags',
                'id TEXT PRIMARY KEY, description TEXT, zone TEXT, location TEXT, trade TEXT, priority TEXT, status TEXT, raisedDate TEXT, dueDate TEXT, assignedTo TEXT, photos INTEGER',
                snags, '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.description, item.zone, item.location, item.trade, item.priority, item.status, item.raisedDate, item.dueDate, item.assignedTo, item.photos]
            );

            // Asset Tags
            setupTable('asset_tags',
                'id TEXT PRIMARY KEY, assetName TEXT, assetId TEXT, qrCode TEXT, rfidTag TEXT, zone TEXT, tagStatus TEXT, bimLinked INTEGER, cafmSynced INTEGER',
                assetTags, '?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.assetName, item.assetId, item.qrCode, item.rfidTag, item.zone, item.tagStatus, item.bimLinked, item.cafmSynced]
            );

            // Training Records
            setupTable('training_records',
                'id TEXT PRIMARY KEY, topic TEXT, trainer TEXT, date TEXT, duration TEXT, attendees INTEGER, department TEXT, completionRate INTEGER, materialsUploaded INTEGER',
                trainingRecords, '?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.topic, item.trainer, item.date, item.duration, item.attendees, item.department, item.completionRate, item.materialsUploaded]
            );

            // ETL Jobs
            setupTable('etl_jobs',
                'id TEXT PRIMARY KEY, name TEXT, source TEXT, destination TEXT, schedule TEXT, lastRun TEXT, status TEXT, duration TEXT, recordsProcessed INTEGER',
                etlJobs, '?, ?, ?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.name, item.source, item.destination, item.schedule, item.lastRun, item.status, item.duration, item.recordsProcessed]
            );

            // Data Quality Rules
            setupTable('data_quality_rules',
                'id TEXT PRIMARY KEY, name TEXT, source TEXT, rule TEXT, status TEXT, lastChecked TEXT, failCount INTEGER',
                dataQualityRules, '?, ?, ?, ?, ?, ?, ?',
                (item) => [item.id, item.name, item.source, item.rule, item.status, item.lastChecked, item.failCount]
            );

            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync('health_nexus.db', buffer);
            console.log('Database seeded successfully! health_nexus.db created.');

        } catch (error) {
            console.error('Seeding logic failed:', error);
        } finally {
            db.close();
        }
    } catch (e) {
        console.error('Init failed:', e);
    }
}

run();
