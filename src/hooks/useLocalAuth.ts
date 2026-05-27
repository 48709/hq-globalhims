import { useState, useEffect, useCallback } from "react";

export type LocalUser = {
  id: number;
  username: string;
  name: string;
  role: string;
  department: string | null;
  perms: string[];
  tabPerms: string[];
};

const STORAGE_KEY = "hrsys_local_user";

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<LocalUser> => {
    const res = await fetch("/api/trpc/system.userLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: { username, password } }),
    });
    const data = await res.json();
    if (!data.result?.data) throw new Error(data.error?.message || "Login failed");
    const userData = data.result.data as LocalUser;
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/login";
  }, []);

  const can = useCallback((perm: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.perms?.includes(perm) || false;
  }, [user]);

  const canTab = useCallback((tabId: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.tabPerms?.includes(tabId) || false;
  }, [user]);

  return { user, isLoading, login, logout, can, canTab, isAuthenticated: !!user };
}
