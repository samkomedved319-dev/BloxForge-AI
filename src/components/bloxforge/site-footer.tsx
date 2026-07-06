import { Logo } from "./logo";
import { Heart } from "lucide-react";

export function SiteFooter() {
  const go = (hash: string) => () => {
    if (typeof window !== "undefined") window.location.hash = hash;
  };

  return (
    <footer className="mt-auto border-t border-border/60 bg-sidebar/50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The NVIDIA-powered AI coding companion for Roblox developers.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={go("app")} className="hover:text-foreground">AI Chat</button></li>
              <li><button onClick={go("plugin")} className="hover:text-foreground">Studio Plugin</button></li>
              <li><button onClick={go("pricing")} className="hover:text-foreground">Pricing</button></li>
              <li><button onClick={go("dashboard")} className="hover:text-foreground">Dashboard</button></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={go("docs")} className="hover:text-foreground">Documentation</button></li>
              <li><button onClick={go("oauth-setup")} className="hover:text-foreground">OAuth Setup Guide</button></li>
              <li><a href="https://create.roblox.com/docs/cloud/auth/oauth2-overview" target="_blank" rel="noreferrer" className="hover:text-foreground">Roblox OAuth2</a></li>
              <li><a href="https://build.nvidia.com" target="_blank" rel="noreferrer" className="hover:text-foreground">NVIDIA NIM</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={go("privacy")} className="hover:text-foreground">Privacy Policy</button></li>
              <li><button onClick={go("tos")} className="hover:text-foreground">Terms of Service</button></li>
              <li><button onClick={go("oauth-setup")} className="hover:text-foreground">OAuth Setup Guide</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} BloxForge AI. Not affiliated with Roblox Corporation.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart className="size-3 text-emerald-400" /> on NVIDIA NIM
          </p>
        </div>
      </div>
    </footer>
  );
}
