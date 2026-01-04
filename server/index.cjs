/* eslint-disable */
console.log("Server starting...");
const express = require('express');
console.log("Express loaded");
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
console.log("Middleware configured");

const dbPath = path.join(__dirname, '..', 'health_nexus.db');

let db = null;

async function start() {
    try {
        const filebuffer = fs.readFileSync(dbPath);
        const SQL = await initSqlJs();
        db = new SQL.Database(filebuffer);
        console.log('Database loaded.');

        // Helper to query and return objects
        const query = (sql) => {
            // sql.js exec returns [{columns, values}]
            // db.prepare is better for getting objects if using step/getAsObject
            const stmt = db.prepare(sql);
            const rows = [];
            while (stmt.step()) {
                rows.push(stmt.getAsObject());
            }
            stmt.free();
            return rows;
        };

        app.get('/api/kpis', (req, res) => res.json(query('SELECT * FROM executive_kpis')));
        app.get('/api/budget', (req, res) => res.json(query('SELECT * FROM budget_data')));
        app.get('/api/schedule', (req, res) => res.json(query('SELECT * FROM schedule_data')));
        app.get('/api/clash-heatmap', (req, res) => res.json(query('SELECT * FROM clash_heatmap_data')));
        app.get('/api/issues', (req, res) => res.json(query('SELECT * FROM issues_data')));
        app.get('/api/work-orders', (req, res) => res.json(query('SELECT * FROM work_orders')));
        app.get('/api/iot', (req, res) => res.json(query('SELECT * FROM iot_sensor_readings')));
        app.get('/api/assets', (req, res) => res.json(query('SELECT * FROM asset_registry')));
        app.get('/api/approvals', (req, res) => {
            // Mock approval data or map from somewhere
            res.json([]);
        });
        app.get('/api/room-data-sheets', (req, res) => res.json(query('SELECT * FROM room_data_sheets')));
        app.get('/api/vendors', (req, res) => res.json(query('SELECT * FROM vendor_data')));
        app.get('/api/audit-logs', (req, res) => res.json(query('SELECT * FROM audit_logs')));
        app.get('/api/daily-reports', (req, res) => res.json(query('SELECT * FROM daily_reports')));
        app.get('/api/inventory', (req, res) => res.json(query('SELECT * FROM inventory')));
        app.get('/api/workforce', (req, res) => res.json(query('SELECT * FROM workforce')));
        app.get('/api/ncrs', (req, res) => res.json(query('SELECT * FROM ncrs')));
        app.get('/api/safety-observations', (req, res) => res.json(query('SELECT * FROM safety_observations')));
        app.get('/api/deliverables', (req, res) => res.json(query('SELECT * FROM deliverables')));
        app.get('/api/design-decisions', (req, res) => res.json(query('SELECT * FROM design_decisions')));
        app.get('/api/cv-events', (req, res) => res.json(query('SELECT * FROM cv_events')));
        app.get('/api/camera-feeds', (req, res) => res.json(query('SELECT * FROM camera_feeds')));
        app.get('/api/ppe-compliance', (req, res) => res.json(query('SELECT * FROM ppe_compliance')));
        app.get('/api/progress-metrics', (req, res) => res.json(query('SELECT * FROM progress_metrics')));
        app.get('/api/commissioning-tests', (req, res) => res.json(query('SELECT * FROM commissioning_tests')));
        app.get('/api/snags', (req, res) => res.json(query('SELECT * FROM snags')));
        app.get('/api/asset-tags', (req, res) => res.json(query('SELECT * FROM asset_tags')));
        app.get('/api/training-records', (req, res) => res.json(query('SELECT * FROM training_records')));
        app.get('/api/training-records', (req, res) => res.json(query('SELECT * FROM training_records')));
        app.get('/api/integration-status', (req, res) => res.json(query('SELECT * FROM integration_status')));
        app.get('/api/p6-milestones', (req, res) => res.json(query('SELECT * FROM p6_milestones').map(m => ({ ...m, atRiskReason: m.atRiskReason || undefined }))));
        app.get('/api/timeline-milestones', (req, res) => res.json(query('SELECT * FROM timeline_milestones')));
        app.get('/api/etl-jobs', (req, res) => res.json(query('SELECT * FROM etl_jobs')));
        app.get('/api/data-quality-rules', (req, res) => res.json(query('SELECT * FROM data_quality_rules')));

        app.get('/api/search', (req, res) => {
            const { q } = req.query;
            if (!q || q.length < 2) return res.json({});

            const searchTerm = `%${q}%`;
            const results = {
                assets: query(`SELECT id, name, type, location FROM asset_registry WHERE name LIKE '${searchTerm}' OR type LIKE '${searchTerm}' OR serialNumber LIKE '${searchTerm}' LIMIT 5`),
                issues: query(`SELECT id, title, zone, status FROM issues_data WHERE title LIKE '${searchTerm}' OR id LIKE '${searchTerm}' LIMIT 5`),
                rooms: query(`SELECT id, roomName, roomCode, department FROM room_data_sheets WHERE roomName LIKE '${searchTerm}' OR roomCode LIKE '${searchTerm}' LIMIT 5`),
                milestones: query(`SELECT id, name, plannedStart as date, zone as phase FROM p6_milestones WHERE name LIKE '${searchTerm}' LIMIT 5`)
            };
            res.json(results);
        });

        // APS Endpoint
        const apsService = require('./aps-service.cjs');
        app.get('/api/aps/dashboard', async (req, res) => {
            try {
                const { projectId } = req.query;
                const data = await apsService.getDashboardData(projectId);
                res.json(data);
            } catch (e) {
                console.error("APS Endpoint Error:", e);
                res.status(500).json({ error: e.message });
            }
        });

        // Add more endpoints as needed

        const PORT = 3001;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error('Failed to start server:', e);
    }
}

start();
