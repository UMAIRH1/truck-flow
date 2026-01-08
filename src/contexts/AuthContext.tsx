"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  setSelectedRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  manager: {
    id: "manager-1",
    name: "Abdullah Al Mahmud",
    email: "abmahmud11@gmail.com",
    phone: "+880 1738 509 654",
    avatar: "/avatars/manager.jpg",
    role: "manager",
    country: "Greece",
    createdAt: new Date("2024-01-01"),
  },
  driver: {
    id: "driver-1",
    name: "Watson",
    email: "watson@example.com",
    phone: "+1 234 567 890",
    avatar: "/avatars/driver.jpg",
    role: "driver",
    country: "United States",
    createdAt: new Date("2024-06-01"),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = user !== null;

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("truckflow_user");
    const storedRole = localStorage.getItem("truckflow_role");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedRole) {
      setSelectedRole(storedRole as UserRole);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const role = selectedRole || "manager";
      const loggedInUser = { ...mockUsers[role], email };
      setUser(loggedInUser);
      localStorage.setItem("truckflow_user", JSON.stringify(loggedInUser));
      localStorage.setItem("truckflow_role", role);
    },
    [selectedRole]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const role = selectedRole || "manager";
      const newUser: User = {
        id: `${role}-${Date.now()}`,
        name,
        email,
        phone: "",
        role,
        createdAt: new Date(),
      };
      setUser(newUser);
      localStorage.setItem("truckflow_user", JSON.stringify(newUser));
      localStorage.setItem("truckflow_role", role);
    },
    [selectedRole]
  );

  const loginWithGoogle = useCallback(async () => {
    // Simulate Google OAuth
    await new Promise((resolve) => setTimeout(resolve, 500));
    const role = selectedRole || "manager";
    const googleUser = { ...mockUsers[role], email: "google@example.com" };
    setUser(googleUser);
    localStorage.setItem("truckflow_user", JSON.stringify(googleUser));
    localStorage.setItem("truckflow_role", role);
  }, [selectedRole]);

  const logout = useCallback(() => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    console.log("[Auth] logout called");
    setUser(null);
    setSelectedRole(null);
    localStorage.removeItem("truckflow_user");
    localStorage.removeItem("truckflow_role");
    console.log("[Auth] cleared localStorage");
    // Redirect to sign-in page after logout
    try {
      router.push("/auth/signin");
    } finally {
      setIsLoggingOut(false);
    }
  }, [router, isLoggingOut]);

  const switchRole = useCallback((role: UserRole) => {
    const switchedUser = mockUsers[role];
    setUser(switchedUser);
    setSelectedRole(role);
    localStorage.setItem("truckflow_user", JSON.stringify(switchedUser));
    localStorage.setItem("truckflow_role", role);
  }, []);

  const handleSetSelectedRole = useCallback((role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem("truckflow_role", role);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        selectedRole,
        isLoading,
        isLoggingOut,
        setSelectedRole: handleSetSelectedRole,
        login,
        signup,
        loginWithGoogle,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
