import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, RBAC_CONFIG, DEMO_USERS, ModuleName, AccessLevel } from '../config/rbac';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
  permissions: Record<ModuleName, AccessLevel>;
  dataAccess: 'full' | 'department' | 'project' | 'restricted';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (user: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (module: ModuleName, level: AccessLevel) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate mock users from RBAC config
const mockUsers: Record<string, User> = {};

Object.entries(DEMO_USERS).forEach(([role, info]) => {
  const userRole = role as UserRole;
  mockUsers[info.email.toLowerCase()] = {
    id: `USR-${role.toUpperCase()}`,
    email: info.email,
    name: info.name,
    role: userRole,
    department: RBAC_CONFIG[userRole].label,
    permissions: RBAC_CONFIG[userRole].permissions,
    dataAccess: role === 'executive' ? 'full' : 'project', // Simplified data access logic
  };
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    // Load custom registered users
    const storedUsers = localStorage.getItem('ahc_registered_users');
    if (storedUsers) {
      try {
        setRegisteredUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error("Failed to parse stored users", e);
      }
    }

    // Check for existing session
    const savedUser = localStorage.getItem('ahc_demo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('ahc_demo_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const emailKey = email.toLowerCase();
    const targetUser = mockUsers[emailKey] || registeredUsers[emailKey];

    if (targetUser && (password === 'demo123' || (targetUser as any).password === password)) {
      setUser(targetUser);
      localStorage.setItem('ahc_demo_user', JSON.stringify(targetUser));
      setIsLoading(false);
      return targetUser;
    }
    setIsLoading(false);
    return null;
  };

  const register = async (newUser: Partial<User> & { password?: string }): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Default to 'project_manager' permissions if role not found (fallback)
    const role = (newUser.role as UserRole) || 'project_manager';
    const config = RBAC_CONFIG[role] || RBAC_CONFIG['project_manager'];

    const user: User = {
      id: `USR-${Date.now()}`,
      email: newUser.email!,
      name: newUser.name!,
      role: role,
      department: newUser.department || 'General',
      permissions: config.permissions,
      dataAccess: 'project',
      ...newUser
    };

    // Save password for our simple mock login check
    (user as any).password = newUser.password;

    const updatedUsers = { ...registeredUsers, [user.email.toLowerCase()]: user };
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('ahc_registered_users', JSON.stringify(updatedUsers));

    // Auto login
    setUser(user);
    localStorage.setItem('ahc_demo_user', JSON.stringify(user));

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ahc_demo_user');
  };

  const hasPermission = (module: ModuleName, requiredLevel: AccessLevel): boolean => {
    if (!user) return false;
    
    const userLevel = user.permissions[module];
    if (!userLevel || userLevel === 'none') return false;
    
    if (requiredLevel === 'view') return true; // Any level (except none) implies view
    
    // Strict RBAC Logic
    if (requiredLevel === 'edit') return ['edit', 'full'].includes(userLevel);
    if (requiredLevel === 'approver') return ['approver', 'full'].includes(userLevel);
    if (requiredLevel === 'full') return userLevel === 'full';

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, register, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
