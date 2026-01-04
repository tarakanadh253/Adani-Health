import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import Index from "./pages/Index";
import Clinical from "./pages/Clinical";
import Sourcing from "./pages/Sourcing";
import Assets from "./pages/Assets";
import AILab from "./pages/AILab";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import DesignControl from "./pages/DesignControl";
import Construction from "./pages/Construction";
import Handover from "./pages/Handover";
import Operations from "./pages/Operations";
import CVAnalytics from "./pages/CVAnalytics";
import DataHub from "./pages/DataHub";
import Profile from "./pages/Profile";
import MyTasks from "./pages/MyTasks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute module="dashboard"><Index /></ProtectedRoute>} />
            <Route path="/clinical" element={<ProtectedRoute module="clinical"><Clinical /></ProtectedRoute>} />
            <Route path="/sourcing" element={<ProtectedRoute module="sourcing"><Sourcing /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute module="assets"><Assets /></ProtectedRoute>} />
            <Route path="/ai-lab" element={<ProtectedRoute module="ai_cv"><AILab /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute module="construction"><Audit /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/design-control" element={<ProtectedRoute module="design"><DesignControl /></ProtectedRoute>} />
            <Route path="/construction" element={<ProtectedRoute module="construction"><Construction /></ProtectedRoute>} />
            <Route path="/handover" element={<ProtectedRoute module="handover"><Handover /></ProtectedRoute>} />
            <Route path="/operations" element={<ProtectedRoute module="assets"><Operations /></ProtectedRoute>} />
            <Route path="/cv-analytics" element={<ProtectedRoute module="ai_cv"><CVAnalytics /></ProtectedRoute>} />
            <Route path="/data-hub" element={<ProtectedRoute module="admin"><DataHub /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
