import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Calendar, Shield, Activity, Lock } from "lucide-react";

const Profile = () => {
    const { user } = useAuth();

    // Mock activity data since we don't have a direct "get user activity" API yet
    // In a real app, this would come from audit logs filtered by user ID
    const recentActivity = [
        { id: 1, action: "Approved Design", target: "Radiology Wing Layout v4.2", time: "2 hours ago", icon: CheckCircle },
        { id: 2, action: "Commented on RFI", target: "RFI-005 Medical Gas", time: "5 hours ago", icon: MessageSquare },
        { id: 3, action: "Login", target: "Web Client", time: "Today, 09:00 AM", icon: LogIn },
    ];

    return (
        <MainLayout>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg gradient-primary">
                    <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info Card */}
                <Card className="lg:col-span-1 border-border/50 shadow-card">
                    <CardHeader>
                        <div className="flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-2 border-primary/20">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl">{user?.name || "Guest User"}</CardTitle>
                            <CardDescription>{user?.role || "Project Viewer"}</CardDescription>
                            <Badge variant="secondary" className="mt-2">
                                {user?.department || "General"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{user?.email || "user@adani.com"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>+91 98765 43210</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>Site Office, Block A</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Joined Jan 2024</span>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <Button className="w-full" variant="outline">Edit Profile</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                    {/* Roles & Permissions */}
                    <Card className="border-border/50 shadow-card">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                <CardTitle>Permissions & Access</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                                    <h4 className="text-sm font-semibold mb-2">Module Access</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">Design Control</Badge>
                                        <Badge variant="outline">Construction</Badge>
                                        <Badge variant="outline">Assets</Badge>
                                        <Badge variant="outline">Data Hub</Badge>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                                    <h4 className="text-sm font-semibold mb-2">Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">View All</Badge>
                                        <Badge variant="secondary">Approve Design</Badge>
                                        <Badge variant="secondary">Create RFI</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-border/50 shadow-card">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                <CardTitle>Recent Activity</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border/30 last:border-0 last:pb-0">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                                            <activity.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{activity.action}</p>
                                            <p className="text-xs text-foreground/80">{activity.target}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

import { CheckCircle, MessageSquare, LogIn } from "lucide-react";

export default Profile;
