import { Logo } from "./logo";
import { Heart } from "lucide-react";

export function SiteFooter() {
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
              <li>AI Chat</li>
              <li>Studio Plugin</li>
              <li>Models</li>
              <li>Pricing</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Models</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Qwen2.5 Coder</li>
              <li>DeepSeek R1</li>
              <li>Nemotron 70B</li>
              <li>Llama 3.1 405B</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Documentation</li>
              <li>Luau Guide</li>
              <li>NVIDIA NIM</li>
              <li>Roblox Docs</li>
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
