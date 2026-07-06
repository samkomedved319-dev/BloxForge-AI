"use client";

import { useSyncExternalStore, useState, useCallback } from "react";
import { SiteHeader } from "@/components/bloxforge/site-header";
import { SiteFooter } from "@/components/bloxforge/site-footer";
import { Landing } from "@/components/bloxforge/landing";
import { ChatApp } from "@/components/bloxforge/chat-app";
import { PluginPage } from "@/components/bloxforge/plugin-page";
import { Pricing } from "@/components/bloxforge/pricing";
import { AuthModal } from "@/components/bloxforge/auth-modal";

type View = "landing" | "app" | "plugin" | "pricing";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot(): View {
  const h = window.location.hash.replace("#", "");
  if (h === "app" || h === "plugin" || h === "pricing") return h;
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

  const isApp = view === "app";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader view={view} onNavigate={navigate} onOpenAuth={() => openAuth("signup")} />
      {isApp ? (
        <ChatApp
          onExit={() => navigate("landing")}
          onOpenAuth={() => openAuth("signup")}
          onNavigatePricing={() => navigate("pricing")}
        />
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
      {!isApp && <SiteFooter />}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          // Reload to pick up the new session + scoped conversations
          if (typeof window !== "undefined") window.location.reload();
        }}
      />
    </div>
  );
}
