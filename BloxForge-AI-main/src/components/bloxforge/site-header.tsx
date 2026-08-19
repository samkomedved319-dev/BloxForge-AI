"use client";

import { useState } from "react";
import { Sparkles, Download, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "./account-menu";
import { cn } from "@/lib/utils";

type View =
  | "landing"
  | "app"
  | "plugin"
  | "pricing"
  | "admin"
  | "dashboard"
  | "settings"
  | "docs"
  | "privacy"
  | "tos"
  | "oauth-setup";

export function SiteHeader({
  view,
  onNavigate,
  onOpenAuth,
}: {
  view: View;
  onNavigate: (v: View) => void;
  onOpenAuth: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { label: string; v: View; anchor?: string }[] = [
    { label: "Home", v: "landing" },
    { label: "Pricing", v: "pricing" },
    { label: "Docs", v: "docs" },
    { label: "Plugin", v: "plugin" },
  ];

  const handleNav = (item: { v: View; anchor?: string }) => {
    setMobileOpen(false);
    onNavigate(item.v);
  };

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/60 glass">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center"
        >
          <Logo />
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                view === item.v
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://discord.gg/jrerzH5Bm"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:flex"
            title="Join our Discord"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
            </svg>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("plugin")}
            className="hidden gap-2 sm:flex"
          >
            <Download className="size-4" />
            Plugin
          </Button>
          <AccountMenu
            onOpenAuth={onOpenAuth}
            onNavigatePricing={() => onNavigate("pricing")}
          />
          <Button
            size="sm"
            onClick={() => onNavigate("app")}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">Launch App</span>
            <span className="sm:hidden">App</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-b border-border bg-card px-4 py-2 md:hidden">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item)}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
