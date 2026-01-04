import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { localDataService } from "@/services/localData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, FileText, CheckSquare, Clock, AlertCircle } from "lucide-react";

const MyTasks = () => {
    const [activeTab, setActiveTab] = useState("approvals");
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<{
        approvals: any[],
        rfis: any[],
        tickets: any[]
    }>({ approvals: [], rfis: [], tickets: [] });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                // In a real app, we would pass current user ID to filter
                // For now, we'll fetch all and pretend to filter or show relevant ones
                const [designData, opsData] = await Promise.all([
                    localDataService.getDesignData(),
                    localDataService.getOperationsData()
                ]);

                // Filter RFIs that are 'open' or 'pending' and assigned to 'Dr. Priya Sharma' or 'System' (mock)
                // Just showing all open items for demo purposes if no explicit assignee
                const myRfis = designData.rfis.filter((r: any) =>
                    r.status !== 'closed' && r.status !== 'resolved'
                );

                // Mock Approvals (Deliverables for review)
                const myApprovals = designData.deliverables.filter((d: any) =>
                    d.status === 'for-review'
                );

                // Work Orders
                const myTickets = opsData.workOrders.filter((w: any) =>
                    w.status !== 'closed' && w.status !== 'completed'
                );

                setTasks({
                    approvals: myApprovals,
                    rfis: myRfis,
                    tickets: myTickets
                });

            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'open': case 'new': return 'bg-blue-500/10 text-blue-500';
            case 'pending': case 'in-progress': return 'bg-yellow-500/10 text-yellow-500';
            case 'critical': return 'bg-red-500/10 text-red-500';
            case 'for-review': return 'bg-purple-500/10 text-purple-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <MainLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg gradient-primary">
                            <ClipboardList className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.approvals.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Assigned RFIs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.rfis.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Open Work Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.tickets.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="approvals">Approvals</TabsTrigger>
                    <TabsTrigger value="rfis">RFIs & Issues</TabsTrigger>
                    <TabsTrigger value="tickets">Work Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="approvals">
                    <div className="space-y-3">
                        {loading ? <p>Loading...</p> : tasks.approvals.length === 0 ? (
                            <p className="text-muted-foreground">No pending approvals.</p>
                        ) : (
                            tasks.approvals.map((item: any) => (
                                <Card key={item.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                                <CheckSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{item.name}</h4>
                                                <p className="text-sm text-muted-foreground">{item.discipline} • {item.phase}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <Badge className={getStatusColor(item.status)} variant="outline">
                                                    {item.status}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">Due: {item.dueDate}</p>
                                            </div>
                                            <Button size="sm">Review</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="rfis">
                    <div className="space-y-3">
                        {loading ? <p>Loading...</p> : tasks.rfis.length === 0 ? (
                            <p className="text-muted-foreground">No assigned RFIs.</p>
                        ) : (
                            tasks.rfis.map((item: any) => (
                                <Card key={item.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground">{item.zone} • {item.priority} priority</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <Badge className={getStatusColor(item.status)} variant="outline">
                                                    {item.status}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1 text-right">{item.assignedTo}</p>
                                            </div>
                                            <Button size="sm" variant="outline">Respond</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="tickets">
                    <div className="space-y-3">
                        {loading ? <p>Loading...</p> : tasks.tickets.length === 0 ? (
                            <p className="text-muted-foreground">No open work orders.</p>
                        ) : (
                            tasks.tickets.map((item: any) => (
                                <Card key={item.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{item.description}</h4>
                                                <p className="text-sm text-muted-foreground">{item.type} • {item.priority}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <Badge className={getStatusColor(item.status)} variant="outline">
                                                    {item.status}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">Due: {item.dueDate}</p>
                                            </div>
                                            <Button size="sm" variant="outline">View</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </MainLayout>
    );
};

export default MyTasks;
