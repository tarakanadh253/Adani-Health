import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleName, AccessLevel } from "@/config/rbac";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
    children: React.ReactNode;
    module?: ModuleName;
    level?: AccessLevel;
}

export const ProtectedRoute = ({ children, module, level = 'view' }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (module && !hasPermission(module, level)) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-4">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                        <p className="text-muted-foreground mt-2">
                            You do not have permission to access this module ({module}).
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
