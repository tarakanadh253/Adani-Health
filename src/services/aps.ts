import { KPIData, IssueData, BudgetData, ScheduleData, ClashData, ApprovalData, MeetingData, ReviewData, FileLinkData } from "@/types";

const CLIENT_ID = import.meta.env.VITE_APS_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_APS_CLIENT_SECRET;
const BASE_URL = "https://developer.api.autodesk.com";

let accessToken: string | null = null;
let tokenExpiration: number = 0;

export const apsService = {
    /**
     * Authenticate with APS to get a 2-legged access token.
     */
    async getAccessToken(): Promise<string> {
        // If we have a valid token, return it
        if (accessToken && Date.now() < tokenExpiration) {
            return accessToken;
        }

        if (!CLIENT_ID || !CLIENT_SECRET) {
            console.warn("APS Client ID or Secret is missing in environment variables.");
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
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params,
            });

            if (!response.ok) {
                throw new Error(`Auth failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            accessToken = data.access_token;
            // expires_in is in seconds. Set expiration to 1 minute before actual expiry.
            tokenExpiration = Date.now() + (data.expires_in - 60) * 1000;

            console.log("APS Authentication Successful");
            return accessToken!;
        } catch (error) {
            console.error("APS Authentication Error:", error);
            throw error;
        }
    },

    /**
     * Fetch Hubs/Projects count from ALL hubs to serve as a real KPI.
     */
    async getActiveProjectsCount(token: string): Promise<number> {
        let totalProjects = 0;
        try {
            // Fetch all hubs
            const response = await fetch(`${BASE_URL}/project/v1/hubs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const hubs = data.data || [];

                // Iterate through each hub to count projects
                for (const hub of hubs) {
                    try {
                        const projectsResp = await fetch(`${BASE_URL}/project/v1/hubs/${hub.id}/projects`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (projectsResp.ok) {
                            const projData = await projectsResp.json();
                            totalProjects += (projData.data?.length || 0);
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch projects for hub ${hub.id}`, err);
                    }
                }
            }
        } catch (e) {
            console.warn("Failed to fetch active projects from APS", e);
        }
        return totalProjects;
    },

    /**
     * Fetch Issues from APS
     */
    async getIssues(token: string, projectId: string): Promise<IssueData[]> {
        // ... (We will move the issue fetching logic to be reusable or keep it inline in getDashboardData, 
        //      but for cleaner code let's allow passing projectId)
        // For now, to minimize diff, we'll keep the logic in getDashboardData or update it here.
        // Let's rely on getDashboardData's inline logic which is already updated, 
        // OR simply update `getDashboardData` to be smarter.
        return [];
    },

    /**
     * Get Dashboard KPIs.
     * Fetches real auth token and tries to get real metrics where simple APIs exist.
     * Simulates others for the "Executive Mission Control" view.
     */
    /**
     * Get Dashboard KPIs and all related data.
     * Fetches real auth token and tries to get real metrics where simple APIs exist.
     */
    /**
     * Helper to get top folders (Project Files, Plans)
     */
    async getTopFolders(token: string, hubId: string, projectId: string): Promise<any[]> {
        try {
            const response = await fetch(`${BASE_URL}/project/v1/hubs/${hubId}/projects/${projectId}/topFolders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                return data.data || [];
            }
        } catch (e) {
            console.warn("Failed to fetch top folders", e);
        }
        return [];
    },

    /**
     * Helper to get folder contents
     */
    async getFolderContents(token: string, projectId: string, folderId: string): Promise<any[]> {
        try {
            const response = await fetch(`${BASE_URL}/data/v1/projects/${projectId}/folders/${folderId}/contents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                return data.data || [];
            }
        } catch (e) {
            console.warn("Failed to fetch folder contents", e);
        }
        return [];
    },

    /**
     * Fetch Reviews from APS (BIM 360/ACC)
     */
    async getReviews(token: string, projectId: string): Promise<ReviewData[]> {
        const reviews: ReviewData[] = [];
        try {
            // Note: projectId for this endpoint usually requires 'b.' prefix removed if it's there
            const cleanProjectId = projectId.startsWith('b.') ? projectId.replace('b.', '') : projectId;

            const response = await fetch(`${BASE_URL}/bim360/reviews/v1/projects/${cleanProjectId}/reviews`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Map API response to ReviewData
                return (data.results || []).map((r: any) => ({
                    id: r.reviewId,
                    documentName: r.name || "Untitled Review",
                    status: r.status === 'CLOSED' ? 'closed' : 'open',
                    reviewers: r.reviewers ? r.reviewers.map((rev: any) => rev.name) : [],
                    dueDate: r.dueDate || new Date().toISOString()
                }));
            }
        } catch (e) {
            console.warn("Failed to fetch reviews", e);
        }
        return reviews;
    },

    /**
     * Fetch Meetings from APS (BIM 360/ACC)
     */
    async getMeetings(token: string, projectId: string): Promise<MeetingData[]> {
        const meetings: MeetingData[] = [];
        try {
            const cleanProjectId = projectId.startsWith('b.') ? projectId.replace('b.', '') : projectId;

            const response = await fetch(`${BASE_URL}/bim360/meetings/v1/projects/${cleanProjectId}/meetings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Map API response to MeetingData
                return (data.results || []).map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    date: m.start_date || new Date().toISOString(),
                    attendees: m.attendees ? m.attendees.length : 0,
                    status: 'scheduled' // Simplified
                }));
            }
        } catch (e) {
            console.warn("Failed to fetch meetings", e);
        }
        return meetings;
    },

    /**
     * Fetch RFIs from APS (BIM 360/ACC)
     */
    async getRFIs(token: string, projectId: string): Promise<ApprovalData[]> {
        const approvals: ApprovalData[] = [];
        try {
            const cleanProjectId = projectId.startsWith('b.') ? projectId.replace('b.', '') : projectId;
            // Valid endpoint for BIM 360 RFIs
            const response = await fetch(`${BASE_URL}/bim360/rfis/v1/projects/${cleanProjectId}/rfis`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Map RFIs to ApprovalData
                return (data || []).map((rfi: any) => ({
                    id: rfi.id,
                    description: rfi.title || "Untitled RFI",
                    status: (rfi.status === 'open' || rfi.status === 'submitted') ? 'pending' : (rfi.status === 'closed' ? 'approved' : 'rejected'),
                    requestedBy: rfi.created_by_name || "Unknown",
                    approver: rfi.assigned_to_name || "Pending",
                    dueDate: rfi.due_date || new Date().toISOString()
                }));
            }
        } catch (e) {
            console.warn("Failed to fetch RFIs", e);
        }
        return approvals;
    },

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
        let projectCount = 0;
        let issues: IssueData[] = [];
        let budget: BudgetData[] = [];
        let schedule: ScheduleData[] = [];
        let clashes: ClashData[] = [];
        let approvals: ApprovalData[] = [];
        let meetings: MeetingData[] = [];
        let reviews: ReviewData[] = [];
        let latestFiles: FileLinkData[] = [];
        let authSuccess = false;

        console.log("--- Starting APS Dashboard Data Fetch (Smart Sort) ---");

        try {
            const token = await this.getAccessToken();
            authSuccess = true;
            console.log("APS Token acquired.");

            // 1. Get All Projects & Sort by Activity
            const hubsResp = await fetch(`${BASE_URL}/project/v1/hubs`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (hubsResp.ok) {
                const hubsData = await hubsResp.json();
                const hubs = hubsData.data || [];
                let allProjects: any[] = [];

                // Gather all projects
                for (const hub of hubs) {
                    const projectsResp = await fetch(`${BASE_URL}/project/v1/hubs/${hub.id}/projects`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (projectsResp.ok) {
                        const pData = await projectsResp.json();
                        if (pData.data) {
                            // Attach Hub ID for reference
                            const hubProjects = pData.data.map((p: any) => ({ ...p, hubId: hub.id }));
                            allProjects = [...allProjects, ...hubProjects];
                        }
                    }
                }

                projectCount = allProjects.length;
                console.log(`Found total ${projectCount} projects.`);

                // SORT projects by lastModifiedTime (Descending) to find the most active one
                allProjects.sort((a, b) => {
                    const dateA = new Date(a.attributes.lastModifiedTime || 0).getTime();
                    const dateB = new Date(b.attributes.lastModifiedTime || 0).getTime();
                    return dateB - dateA; // Newest first
                });

                if (allProjects.length > 0) {
                    const activeProject = allProjects[0]; // The winner
                    const projectId = activeProject.id;
                    const hubId = activeProject.hubId;
                    const containerId = projectId.startsWith('b.') ? projectId.replace('b.', '') : projectId;

                    console.log(`🔥 Active Project Selected: ${activeProject.attributes.name} (Last Updated: ${activeProject.attributes.lastModifiedTime})`);

                    // A. Fetch Issues (Split into Issues & Clashes)
                    try {
                        const issuesResp = await fetch(`${BASE_URL}/issues/v1/containers/${containerId}/quality-issues`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (issuesResp.ok) {
                            const issuesJson = await issuesResp.json();
                            const rawIssues = issuesJson.data || [];

                            // Process Issues
                            rawIssues.forEach((issue: any) => {
                                const mappedIssue: IssueData = {
                                    id: issue.id,
                                    type: (issue.attributes.sub_type === 'clash' ? 'clash' : 'rfi'),
                                    title: issue.attributes.title,
                                    zone: issue.attributes.location_description || 'General',
                                    priority: issue.attributes.root_cause === 'Design' ? 'high' : 'medium',
                                    status: issue.attributes.status === 'open' ? 'open' : 'resolved',
                                    assignee: issue.attributes.assigned_to_name || 'Unassigned',
                                    dueDate: issue.attributes.due_date || '',
                                    source: 'ACC',
                                    slaBreached: false,
                                    hoursRemaining: 0
                                };

                                if (issue.attributes.sub_type === 'clash') {
                                    // Add to clashes list (mapped to ClashData interface loosely)
                                    clashes.push({
                                        zone: mappedIssue.zone,
                                        clashCount: 1, // Individual clash
                                        severity: mappedIssue.priority === 'high' ? 'high' : 'medium',
                                        rfiCount: 0
                                    });
                                } else {
                                    issues.push(mappedIssue);
                                }
                            });
                            console.log(`Fetched and filtered: ${issues.length} General Issues, ${clashes.length} Clashes.`);
                        }
                    } catch (err) {
                        console.error("Error fetching issues:", err);
                    }

                    // B. Fetch Reviews
                    reviews = await this.getReviews(token, projectId);
                    console.log(`Fetched ${reviews.length} reviews.`);

                    // C. Fetch Meetings
                    meetings = await this.getMeetings(token, projectId);
                    console.log(`Fetched ${meetings.length} meetings.`);

                    // D. Fetch RFIs (Map to Approvals)
                    approvals = await this.getRFIs(token, projectId);
                    console.log(`Fetched ${approvals.length} RFIs (Approvals).`);

                    // E. Fetch Files
                    const topFolders = await this.getTopFolders(token, hubId, projectId);
                    const projectFilesFolder = topFolders.find((f: any) => f.attributes.name === 'Project Files');
                    if (projectFilesFolder) {
                        const contents = await this.getFolderContents(token, projectId, projectFilesFolder.id);
                        latestFiles = contents
                            .filter((item: any) => item.type === 'items')
                            .slice(0, 5)
                            .map((file: any) => ({
                                id: file.id,
                                name: file.attributes.displayName,
                                lastUpdated: file.attributes.lastModifiedTime,
                                url: file.links.self.href,
                                type: 'file',
                                version: file.attributes.versionNumber
                            }));
                        console.log(`Fetched ${latestFiles.length} files.`);
                    }
                }
            }

        } catch (error) {
            console.error("APS CRITICAL FAILURE:", error);
        }

        console.log("--- End Data Fetch ---");

        // Map data to KPIData structure
        const kpis: KPIData[] = [
            {
                label: "Active Projects",
                value: projectCount.toString(),
                change: 0,
                trend: "neutral",
                icon: "check-circle",
            },
            {
                label: "Total Budget (Cr)",
                value: "₹--",
                change: 0,
                trend: "neutral",
                icon: "wallet",
            },
            {
                label: "Schedule",
                value: "--",
                change: 0,
                trend: "neutral",
                icon: "calendar",
            },
            {
                label: "Active Issues",
                value: authSuccess ? issues.length.toString() : "--",
                change: 0,
                trend: "neutral",
                icon: "file-question",
            },
            {
                label: "Safety Incidents",
                value: "0",
                change: 0,
                trend: "neutral",
                icon: "shield",
            },
            {
                label: "Resource Util",
                value: "--%",
                change: 0,
                trend: "neutral",
                icon: "trending-up",
            }
        ];

        return { kpis, issues, budget, schedule, clashes, approvals, meetings, reviews, latestFiles };
    }
};
