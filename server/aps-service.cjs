const fs = require('fs');
const path = require('path');

// Manually parse .env file
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
            const data = fs.readFileSync(envPath, 'utf8');
            const env = {};
            data.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const val = parts.slice(1).join('=').trim();
                    if (key && !key.startsWith('#')) {
                        env[key] = val;
                    }
                }
            });
            return env;
        }
    } catch (e) {
        console.warn("Failed to load .env file", e);
    }
    return {};
}

const env = loadEnv();
const CLIENT_ID = env.VITE_APS_CLIENT_ID || process.env.VITE_APS_CLIENT_ID;
const CLIENT_SECRET = env.VITE_APS_CLIENT_SECRET || process.env.VITE_APS_CLIENT_SECRET;
const BASE_URL = "https://developer.api.autodesk.com";

let accessToken = null;
let tokenExpiration = 0;

const apsService = {
    async getAccessToken() {
        if (accessToken && Date.now() < tokenExpiration) {
            return accessToken;
        }

        if (!CLIENT_ID || !CLIENT_SECRET) {
            console.error("APS Credentials missing. Check .env file.");
            throw new Error("Missing APS Configuration");
        }

        try {
            const params = new URLSearchParams();
            params.append("client_id", CLIENT_ID);
            params.append("client_secret", CLIENT_SECRET);
            params.append("grant_type", "client_credentials");
            params.append("scope", "data:read bucket:read account:read");

            const response = await fetch(`${BASE_URL}/authentication/v2/token`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
            });

            if (!response.ok) {
                const txt = await response.text();
                throw new Error(`Auth failed: ${response.status} ${txt}`);
            }

            const data = await response.json();
            accessToken = data.access_token;
            tokenExpiration = Date.now() + (data.expires_in - 60) * 1000;
            console.log("APS Token Refreshed");
            return accessToken;
        } catch (error) {
            console.error("APS Auth Error:", error);
            throw error;
        }
    },

    // Helper to parse typical APS list responses
    parseList(json) {
        if (Array.isArray(json)) return json;
        if (json.results && Array.isArray(json.results)) return json.results;
        if (json.data && Array.isArray(json.data)) return json.data;
        return [];
    },

    async getReviews(token, projectId) {
        try {
            const cleanId = projectId.startsWith('b.') ? projectId.replace('b.', '') : projectId;
            const url = `${BASE_URL}/bim360/reviews/v1/projects/${cleanId}/reviews`;
            console.log(`Fetching Reviews from: ${url}`);

            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

            if (response.ok) {
                const json = await response.json();
                const list = this.parseList(json);
                console.log(`Found ${list.length} reviews`);
                return list.map(r => ({
                    id: r.reviewId,
                    documentName: r.name || "Untitled Review",
                    status: r.status === 'CLOSED' ? 'closed' : 'open',
                    dueDate: r.dueDate || new Date().toISOString()
                }));
            } else {
                console.warn(`Reviews fetch failed: ${response.status}`);
            }
        } catch (e) {
            console.warn("Reviews fetch error", e.message);
        }
        return [];
    },

    async getMeetings(token, projectId) {
        try {
            const cleanId = projectId.startsWith('b.') ? projectId.replace('b.', '') : projectId;
            const url = `${BASE_URL}/bim360/meetings/v1/projects/${cleanId}/meetings`;
            console.log(`Fetching Meetings from: ${url}`);

            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

            if (response.ok) {
                const json = await response.json();
                const list = this.parseList(json);
                console.log(`Found ${list.length} meetings`);
                return list.map(m => ({
                    id: m.id,
                    title: m.title,
                    date: m.start_date,
                    attendees: (m.attendees || []).length,
                    status: 'scheduled'
                }));
            } else {
                console.warn(`Meetings fetch failed: ${response.status}`);
            }
        } catch (e) {
            console.warn("Meetings fetch error", e.message);
        }
        return [];
    },

    async getRFIs(token, projectId) {
        try {
            const cleanId = projectId.startsWith('b.') ? projectId.replace('b.', '') : projectId;
            const url = `${BASE_URL}/bim360/rfis/v1/projects/${cleanId}/rfis`;
            console.log(`Fetching RFIs from: ${url}`);

            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

            if (response.ok) {
                const json = await response.json();
                const list = this.parseList(json);
                console.log(`Found ${list.length} RFIs`);
                return list.map(r => ({
                    id: r.id,
                    description: r.title || "Untitled RFI",
                    status: (r.status === 'open' || r.status === 'submitted') ? 'pending' : (r.status === 'closed' ? 'approved' : 'rejected'),
                    requestedBy: r.created_by_name || 'Unknown',
                    approver: r.assigned_to_name || "Pending",
                    dueDate: r.due_date || new Date().toISOString()
                }));
            } else {
                console.warn(`RFIs fetch failed: ${response.status}`);
            }
        } catch (e) {
            console.warn("RFIs fetch error", e.message);
        }
        return [];
    },

    async getDashboardData(targetProjectId = null) {
        const logs = [];
        const log = (msg) => { console.log(msg); logs.push(msg); };

        log(`--- Starting APS Dashboard Fetch (Target: ${targetProjectId || 'Auto'}) ---`);

        const kpis = [];
        const issues = [];
        const latestFiles = [];
        let reviews = [];
        let meetings = [];
        let approvals = [];
        let projectCount = 0;
        let availableProjects = [];
        let activeProject = null;

        try {
            const token = await this.getAccessToken();

            // 1. Get Hubs and Projects
            const hubsResp = await fetch(`${BASE_URL}/project/v1/hubs`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (hubsResp.ok) {
                const hubsData = await hubsResp.json();
                const hubs = hubsData.data || [];
                let allProjects = [];

                for (const hub of hubs) {
                    try {
                        const projResp = await fetch(`${BASE_URL}/project/v1/hubs/${hub.id}/projects`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (projResp.ok) {
                            const pData = await projResp.json();
                            if (pData.data) {
                                allProjects = [...allProjects, ...pData.data.map(p => ({ ...p, hubId: hub.id }))];
                            }
                        }
                    } catch (e) { log(`Hub ${hub.id} fetch failed`); }
                }

                projectCount = allProjects.length;

                // Map for frontend
                availableProjects = allProjects.map(p => ({
                    id: p.id,
                    name: p.attributes.name,
                    lastModified: p.attributes.lastModifiedTime
                }));

                // Sort by last modified for default
                allProjects.sort((a, b) => {
                    const dA = new Date(a.attributes.lastModifiedTime || 0).getTime();
                    const dB = new Date(b.attributes.lastModifiedTime || 0).getTime();
                    return dB - dA;
                });

                // SELECT ACTIVE PROJECT
                if (allProjects.length > 0) {
                    if (targetProjectId) {
                        activeProject = allProjects.find(p => p.id === targetProjectId) || allProjects[0];
                    } else {
                        activeProject = allProjects[0];
                    }

                    const projectId = activeProject.id;
                    const cleanId = projectId.startsWith('b.') ? projectId.replace('b.', '') : projectId;
                    const hubId = activeProject.hubId;
                    // Correct Issue Container ID from relationships (Vital for ACC)
                    const issuesContainerId = activeProject.relationships?.issues?.data?.id || cleanId;

                    log(`Active Project: ${activeProject.attributes.name} (${projectId})`);

                    // 3. Get Issues
                    try {
                        const issuesResp = await fetch(`${BASE_URL}/issues/v1/containers/${issuesContainerId}/quality-issues`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (issuesResp.ok) {
                            const iData = await issuesResp.json();
                            const rawIssues = iData.data || [];
                            log(`Found ${rawIssues.length} issues`);
                            rawIssues.forEach(issue => {
                                issues.push({
                                    id: issue.id,
                                    title: issue.attributes.title,
                                    status: issue.attributes.status,
                                    priority: issue.attributes.root_cause === 'Design' ? 'high' : 'medium',
                                    assignee: issue.attributes.assigned_to_name || 'Unassigned',
                                    dueDate: issue.attributes.due_date,
                                    description: issue.attributes.description
                                });
                            });
                        } else {
                            log(`Issues API failed: ${issuesResp.status}`);
                        }
                    } catch (e) { log(`Issues fetch failed: ${e.message}`); }

                    // 4. Get Files 
                    try {
                        const topFoldersResp = await fetch(`${BASE_URL}/project/v1/hubs/${hubId}/projects/${projectId}/topFolders`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (topFoldersResp.ok) {
                            const tfData = await topFoldersResp.json();
                            const projFiles = (tfData.data || []).find(f => f.attributes.name === 'Project Files');

                            if (projFiles) {
                                const contentsResp = await fetch(`${BASE_URL}/data/v1/projects/${projectId}/folders/${projFiles.id}/contents`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                if (contentsResp.ok) {
                                    const cData = await contentsResp.json();
                                    const files = (cData.data || []).filter(i => i.type === 'items').slice(0, 5);
                                    log(`Found ${files.length} latest files`);
                                    files.forEach(f => {
                                        latestFiles.push({
                                            id: f.id,
                                            name: f.attributes.displayName,
                                            lastUpdated: f.attributes.lastModifiedTime,
                                            version: f.attributes.versionNumber,
                                            url: f.links.self.href
                                        });
                                    });
                                }
                            }
                        } else {
                            log(`Top Folders API failed: ${topFoldersResp.status}`);
                        }
                    } catch (e) { log(`Files fetch failed: ${e.message}`); }

                    // 5. Get Reviews, Meetings, RFIs
                    try {
                        const rUrl = `${BASE_URL}/bim360/reviews/v1/projects/${cleanId}/reviews`;
                        const rResp = await fetch(rUrl, { headers: { Authorization: `Bearer ${token}` } });
                        if (rResp.ok) {
                            const json = await rResp.json();
                            const list = this.parseList(json);
                            log(`Found ${list.length} reviews`);
                            reviews = list.map(r => ({ id: r.reviewId, documentName: r.name, status: r.status === 'CLOSED' ? 'closed' : 'open', dueDate: r.dueDate }));
                        } else { log(`Reviews API failed: ${rResp.status}`); }

                        const mUrl = `${BASE_URL}/bim360/meetings/v1/projects/${cleanId}/meetings`;
                        const mResp = await fetch(mUrl, { headers: { Authorization: `Bearer ${token}` } });
                        if (mResp.ok) {
                            const json = await mResp.json();
                            const list = this.parseList(json);
                            log(`Found ${list.length} meetings`);
                            meetings = list.map(m => ({ id: m.id, title: m.title, date: m.start_date, attendees: (m.attendees || []).length, status: 'scheduled' }));
                        } else { log(`Meetings API failed: ${mResp.status}`); }

                        const rfUrl = `${BASE_URL}/bim360/rfis/v1/projects/${cleanId}/rfis`;
                        const rfResp = await fetch(rfUrl, { headers: { Authorization: `Bearer ${token}` } });
                        if (rfResp.ok) {
                            const json = await rfResp.json();
                            const list = this.parseList(json);
                            log(`Found ${list.length} RFIs`);
                            approvals = list.map(r => ({ id: r.id, description: r.title, status: r.status === 'open' ? 'pending' : 'approved', requestedBy: r.created_by_name || 'User', dueDate: r.due_date }));
                        } else { log(`RFIS API failed: ${rfResp.status}`); }
                    } catch (e) { log("Modules error: " + e.message); }
                }
            }

        } catch (e) {
            log(`APS Service Error: ${e.message}`);
            console.error(e);
        }

        return {
            projects: availableProjects,
            activeProjectId: activeProject ? activeProject.id : null,
            activeProjectName: activeProject ? activeProject.attributes.name : "None",
            debugLogs: logs,
            kpis: [],
            issues,
            latestFiles,
            reviews,
            meetings,
            approvals,
            projectCount
        };
    }
};

module.exports = apsService;
