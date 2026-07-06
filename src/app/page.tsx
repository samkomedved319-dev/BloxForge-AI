"use client";

import { useSyncExternalStore } from "react";
import { SiteHeader } from "@/components/bloxforge/site-header";
import { SiteFooter } from "@/components/bloxforge/site-footer";
import { Landing } from "@/components/bloxforge/landing";
import { ChatApp } from "@/components/bloxforge/chat-app";
import { PluginPage } from "@/components/bloxforge/plugin-page";

type View = "landing" | "app" | "plugin";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot(): View {
  const h = window.location.hash.replace("#", "");
  return h === "app" || h === "plugin" ? h : "landing";
}

function getServerSnapshot(): View {
  return "landing";
}

export default function Home() {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const navigate = (v: View) => {
    const next = v === "landing" ? "" : `#${v}`;
    if (window.location.hash !== next && !(next === "" && window.location.hash === "")) {
      window.location.hash = next;
    }
    // If navigating to landing (clearing hash) the hashchange event may not
    // fire, so force a re-render by pushing a clean state.
    if (v === "landing" && window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const isApp = view === "app";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader view={view} onNavigate={navigate} />
      {isApp ? (
        <ChatApp onExit={() => navigate("landing")} />
      ) : view === "plugin" ? (
        <PluginPage
          onBack={() => navigate("landing")}
          onLaunch={() => navigate("app")}
        />
      ) : (
        <Landing
          onLaunch={() => navigate("app")}
          onGetPlugin={() => navigate("plugin")}
        />
      )}
      {!isApp && <SiteFooter />}
    </div>
  );
}
