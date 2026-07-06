"use client";

import { useSyncExternalStore, useState, useCallback, useEffect } from "react";
import { signIn } from "next-auth/react";
import { SiteHeader } from "@/components/bloxforge/site-header";
import { SiteFooter } from "@/components/bloxforge/site-footer";
import { Landing } from "@/components/bloxforge/landing";
import { ChatApp } from "@/components/bloxforge/chat-app";
import { PluginPage } from "@/components/bloxforge/plugin-page";
import { Pricing } from "@/components/bloxforge/pricing";
import { AdminDashboard } from "@/components/bloxforge/admin-dashboard";
import { UserDashboard } from "@/components/bloxforge/user-dashboard";
import { Settings } from "@/components/bloxforge/settings";
import { LegalPage } from "@/components/bloxforge/legal-page";
import { OauthSetupGuide } from "@/components/bloxforge/oauth-setup-guide";
import { AuthModal } from "@/components/bloxforge/auth-modal";

type View =
  | "landing"
  | "app"
  | "plugin"
  | "pricing"
  | "admin"
  | "dashboard"
  | "settings"
  | "privacy"
  | "tos"
  | "oauth-setup";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot(): View {
  const h = window.location.hash.replace("#", "");
  if (
    h === "app" ||
    h === "plugin" ||
    h === "pricing" ||
    h === "admin" ||
    h === "dashboard" ||
    h === "settings" ||
    h === "privacy" ||
    h === "tos" ||
    h === "oauth-setup"
  )
    return h;
  return "landing";
}

function getServerSnapshot(): View {
  return "landing";
}

export default function Home() {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  const navigate = useCallback((v: View) => {
    const next = v === "landing" ? "" : `#${v}`;
    if (v === "landing" && window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else if (window.location.hash !== next) {
      window.location.hash = next;
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const openAuth = useCallback((mode: "signin" | "signup" = "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  // Handle Roblox OAuth callback: the server redirects to /#roblox-token=<base64>
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const match = hash.match(/roblox-token=([^&]+)/);
    if (match && match[1]) {
      const token = decodeURIComponent(match[1]);
      // Clean the URL hash
      history.replaceState(null, "", window.location.pathname + window.location.search);
      // Sign in via the roblox NextAuth provider with the token
      signIn("roblox", { token, redirect: false }).then(() => {
        window.location.reload();
      });
    }
    // Also surface OAuth errors
    const errMatch = hash.match(/auth-error=([^&]+)/);
    if (errMatch && errMatch[1]) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      const msg = decodeURIComponent(errMatch[1]).replace(/_/g, " ");
      import("sonner").then(({ toast }) => {
        toast.error(`Roblox sign-in failed: ${msg}`);
      });
    }
  }, []);

  const isApp = view === "app";
  const isAdmin = view === "admin";
  const isDashboard = view === "dashboard";
  const isSettings = view === "settings";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader view={view} onNavigate={navigate} onOpenAuth={() => openAuth("signup")} />
      {isApp ? (
        <ChatApp
          onExit={() => navigate("landing")}
          onOpenAuth={() => openAuth("signup")}
          onNavigatePricing={() => navigate("pricing")}
        />
      ) : isAdmin ? (
        <AdminDashboard />
      ) : isDashboard ? (
        <UserDashboard onBack={() => navigate("landing")} />
      ) : isSettings ? (
        <Settings onBack={() => navigate("landing")} />
      ) : view === "privacy" ? (
        <LegalPage type="privacy" />
      ) : view === "tos" ? (
        <LegalPage type="tos" />
      ) : view === "oauth-setup" ? (
        <OauthSetupGuide />
      ) : view === "plugin" ? (
        <PluginPage
          onBack={() => navigate("landing")}
          onLaunch={() => navigate("app")}
        />
      ) : view === "pricing" ? (
        <Pricing
          onLaunch={() => navigate("app")}
          onGetPlugin={() => navigate("plugin")}
        />
      ) : (
        <Landing
          onLaunch={() => navigate("app")}
          onGetPlugin={() => navigate("plugin")}
          onNavigatePricing={() => navigate("pricing")}
        />
      )}
      {!isApp && !isAdmin && !isDashboard && !isSettings && <SiteFooter />}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          if (typeof window !== "undefined") window.location.reload();
        }}
      />
    </div>
  );
}
