"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types";
import api from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  error: string | null;
  setSelectedRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: any) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("truckflow_token");
      if (token) {
        try {
          const response = await api.getCurrentUser();
          if (response.success && response.user) {
            const userData: User = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              phone: response.user.phone,
              role: response.user.role,
              preferredLanguage: response.user.preferredLanguage,
              createdAt: new Date(response.user.createdAt),
            };
            setUser(userData);
            setSelectedRole(response.user.role);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("truckflow_token");
          localStorage.removeItem("truckflow_refresh_token");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        const response = await api.login(email, password);
        
        if (response.success && response.token && response.user) {
          // Store tokens
          localStorage.setItem("truckflow_token", response.token);
          if (response.refreshToken) {
            localStorage.setItem("truckflow_refresh_token", response.refreshToken);
          }
          
          // Set user data
          const userData: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            phone: response.user.phone,
            role: response.user.role,
            preferredLanguage: response.user.preferredLanguage,
            createdAt: new Date(response.user.createdAt),
          };
          setUser(userData);
          setSelectedRole(response.user.role);
          localStorage.setItem("truckflow_user", JSON.stringify(userData));
          localStorage.setItem("truckflow_role", response.user.role);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error: any) {
        console.error("Login failed:", error);
        setError(error.message || "Login failed");
        throw error;
      }
    },
    []
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        setError(null);
        // Note: Backend doesn't have a signup endpoint for managers
        // This would need to be implemented if needed
        throw new Error("Signup not implemented. Please contact administrator.");
      } catch (error: any) {
        console.error("Signup failed:", error);
        setError(error.message || "Signup failed");
        throw error;
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      // Note: Google OAuth not implemented in backend
      throw new Error("Google login not implemented yet");
    } catch (error: any) {
      console.error("Google login failed:", error);
      setError(error.message || "Google login failed");
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    console.log("[Auth] logout called");
    
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    
    setUser(null);
    setSelectedRole(null);
    localStorage.removeItem("truckflow_token");
    localStorage.removeItem("truckflow_refresh_token");
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
    // Role switching not supported with real API
    // User role is determined by backend
    console.warn("Role switching not supported with API authentication");
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    try {
      const response = await api.updateProfile(data);
      if (response.success && response.user) {
        const updatedUser: User = {
          ...user!,
          name: response.user.name || user!.name,
          email: response.user.email || user!.email,
          phone: response.user.phone || user!.phone,
          preferredLanguage: response.user.preferredLanguage || user!.preferredLanguage,
          avatar: response.user.avatar || user!.avatar,
          country: response.user.country || user!.country,
        };
        setUser(updatedUser);
        localStorage.setItem("truckflow_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to update profile in context:", error);
      throw error;
    }
  }, [user]);

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
        error,
        setSelectedRole: handleSetSelectedRole,
        login,
        signup,
        loginWithGoogle,
        logout,
        switchRole,
        updateProfile,
        clearError,
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
