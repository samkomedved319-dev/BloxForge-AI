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
