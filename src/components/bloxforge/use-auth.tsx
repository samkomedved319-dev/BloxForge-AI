"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";

export interface UsageInfo {
  used: number;
  limit: number; // -1 = unlimited
  remaining: number;
  resetsAt: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name?: string | null;
  plan: string;
}

export interface PlanInfo {
  id: string;
  label: string;
  features: string[];
  allowedPersonalities: string[];
}

interface UsageData {
  authenticated: boolean;
  user?: UserInfo;
  usage?: UsageInfo;
  plan?: PlanInfo;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  const refreshUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      const data = await res.json();
      setUsage(data);
    } catch {
      setUsage({ authenticated: false });
    } finally {
      setLoadingUsage(false);
    }
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage, session]);

  const isAuthenticated = Boolean(session?.user) || Boolean(usage?.authenticated);
  const user = usage?.user ||
    (session?.user
      ? {
          id: (session.user as any).id,
          email: session.user.email || "",
          name: session.user.name,
          plan: (session.user as any).plan || "free",
        }
      : null);

  return {
    session,
    status,
    isAuthenticated,
    user,
    usage: usage?.usage,
    plan: usage?.plan,
    isAdmin: Boolean(usage?.isAdmin),
    isApproved: Boolean(usage?.isApproved),
    loadingUsage,
    refreshUsage,
    signOut,
  };
}
