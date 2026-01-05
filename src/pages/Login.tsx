import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, User } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Lock, Mail, Eye, EyeOff, AlertCircle, LayoutGrid, Settings2, Bot, Database, LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DEMO_USERS, RBAC_CONFIG, UserRole } from "@/config/rbac";

const roleColors: Record<UserRole, string> = {
  executive: 'bg-primary',
  project_manager: 'bg-blue-500',
  clinical_lead: 'bg-green-500',
  design_manager: 'bg-purple-500',
  site_engineer: 'bg-orange-500',
  safety_officer: 'bg-red-500',
  procurement_manager: 'bg-yellow-500',
  facility_manager: 'bg-cyan-500',
  bim_coordinator: 'bg-indigo-500'
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sign Up State
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<UserRole>("project_manager");
  const [isSignUp, setIsSignUp] = useState(false);

  const { login, register, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRedirectPath = (user: User) => {
    const { permissions } = user;

    // Priority order for redirection
    if (permissions.dashboard !== 'none') return '/dashboard';

    // For roles without dashboard access, redirect to their primary module
    if (permissions.construction === 'edit' || permissions.construction === 'full') return '/construction';
    if (permissions.design !== 'none') return '/design-control';
    if (permissions.clinical !== 'none') return '/clinical';
    if (permissions.sourcing !== 'none') return '/sourcing';
    if (permissions.handover !== 'none') return '/handover';
    if (permissions.assets !== 'none') return '/operations';
    if (permissions.ai_cv !== 'none') return '/ai-lab';

    return '/dashboard'; // Fallback
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (isSignUp) {
      await register({ email, name, role, department, password });
      toast({
        title: "Account Created",
        description: "Welcome to Parivartaan!",
      });
      navigate("/");
    } else {
      const user = await login(email, password);
      if (user) {
        toast({
          title: "Welcome back",
          description: "You have successfully logged in.",
        });
        navigate(getRedirectPath(user));
      } else {
        setError("Invalid credentials. Use demo123 for password.");
      }
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo123");
    setIsLoading(true);
    const user = await login(demoEmail, "demo123");
    if (user) {
      toast({
        title: "Welcome to Parivartaan",
        description: "Login successful.",
      });
      navigate(getRedirectPath(user));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-glow overflow-hidden">
              <img src="/Adani_Health_favi_icon.png" alt="Adani Health" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Adani Health</h1>
              <p className="text-white/60">Parivartaan Digital Nerve Centre</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Single Source of Truth<br />
            for Healthcare Delivery
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Integrated Digital Delivery platform powering the Health City program.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Feature 1 */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <LayoutGrid className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1 text-base">Unified Digital Platform</h3>
                <p className="text-xs text-white/60 leading-normal">
                  Centralized architecture & AI integration.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                <Settings2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1 text-base">Process Automation</h3>
                <p className="text-xs text-white/60 leading-normal">
                  Automated selection & audit trails.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1 text-base">AI Chatbot for ACC</h3>
                <p className="text-xs text-white/60 leading-normal">
                  Instant BIM & project data queries.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                <Database className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1 text-base">Digital Library</h3>
                <p className="text-xs text-white/60 leading-normal">
                  Centralized Revit assets & specs.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20">
                <LineChart className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1 text-base">4D & 5D Simulation</h3>
                <p className="text-xs text-white/60 leading-normal">
                  Real-time progress simulation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 bg-background">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/Adani_Health_favi_icon.png" alt="Adani Health" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Adani Health</h1>
              <p className="text-xs text-muted-foreground">Parivartaan Nerve Centre</p>
            </div>
          </div>

          {isAuthenticated && user ? (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <div className={`w-16 h-16 rounded-full ${roleColors[user.role] || 'bg-primary'} flex items-center justify-center text-3xl font-bold text-white shadow-lg`}>
                  {user.name.charAt(0)}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Welcome back,</h2>
                <h3 className="text-xl text-primary mt-1">{user.name}</h3>
                <p className="text-muted-foreground mt-2">{RBAC_CONFIG[user.role].label}</p>
              </div>

              <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
                <Button
                  size="lg"
                  className="w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  onClick={() => navigate(getRedirectPath(user))}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">{isSignUp ? "Create your profile" : "Sign in to your account"}</h2>
              <p className="text-muted-foreground mb-8">
                Access the unified digital platform for Health City project management.
              </p>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                {isSignUp && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <select
                          id="role"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                          value={role}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                        >
                          {Object.entries(RBAC_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="dept">Department</Label>
                      <Input
                        id="dept"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Engineering"
                        className="mt-1.5"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@adanihealth.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                    className="text-sm text-primary hover:underline"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
                  </button>
                </div>
              </form>

              {!isSignUp && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
                  </div>
                </div>
              )}

              {!isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-2">
                    {Object.entries(DEMO_USERS).map(([role, user]) => (
                      <button
                        key={role}
                        onClick={() => handleQuickLogin(user.email)}
                        disabled={isLoading}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                      >
                        <div className={`w-2 h-2 rounded-full ${roleColors[role as UserRole]}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{RBAC_CONFIG[role as UserRole].label}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Password for all demo accounts: <code className="bg-muted px-1.5 py-0.5 rounded">demo123</code>
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
