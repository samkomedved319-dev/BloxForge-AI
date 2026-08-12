import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    name: "BloxForge AI — Roblox Studio Plugin",
    version: "1.0.0",
    downloadUrl: "/api/plugin/download",
    askEndpoint: "/api/plugin/ask",
    installInstructions: [
      "Download BloxForgeAI.lua",
      "Move it into your Studio Plugins folder (Windows: %localappdata%\\Roblox\\Plugins, macOS: ~/Documents/Roblox/Plugins)",
      "Restart Roblox Studio",
      "Open the BloxForge AI toolbar button, click ⚙ and paste your BloxForge server URL",
    ],
  });
}
