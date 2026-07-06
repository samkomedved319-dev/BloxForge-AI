import { NextRequest, NextResponse } from "next/server";
import { studioStore } from "@/lib/studio-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_INSTANCE_TYPES = [
  "Script",
  "LocalScript",
  "ModuleScript",
  "Part",
  "Model",
  "ScreenGui",
  "Frame",
  "TextLabel",
  "TextButton",
  "ImageButton",
  "ImageLabel",
  "TextBox",
  "ScrollingFrame",
  "UIGridLayout",
  "UIListLayout",
  "UICorner",
  "UIStroke",
  "UIGradient",
  "UIScale",
  "UIAspectRatioConstraint",
  "UIPadding",
];

const VALID_PARENTS = [
  "ServerScriptService",
  "ReplicatedStorage",
  "ServerStorage",
  "StarterPlayerScripts",
  "StarterCharacterScripts",
  "StarterGui",
  "Workspace",
  "Players", // for PlayerGui
];

/**
 * Web app → plugin: enqueue an insert command.
 * Body: { pairingCode, title, language, code, instanceType, instanceName, parent }
 */
export async function POST(req: NextRequest) {
  let body: {
    pairingCode?: string;
    title?: string;
    language?: string;
    code?: string;
    instanceType?: string;
    instanceName?: string;
    parent?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const pairingCode = body.pairingCode || "";
  const insertCode = (body.code || "").trim();
  if (!pairingCode) {
    return NextResponse.json(
      { ok: false, error: "pairingCode is required" },
      { status: 400 },
    );
  }

  const instanceType = VALID_INSTANCE_TYPES.includes(body.instanceType || "")
    ? body.instanceType!
    : "Script";
  const parent = VALID_PARENTS.includes(body.parent || "")
    ? body.parent!
    : "ServerScriptService";

  // Scripts require code; Parts/Models can be created with just a name
  if (
    (instanceType === "Script" ||
      instanceType === "LocalScript" ||
      instanceType === "ModuleScript") &&
    !insertCode
  ) {
    return NextResponse.json(
      { ok: false, error: "code is required for script inserts" },
      { status: 400 },
    );
  }

  const result = studioStore.insert(pairingCode, {
    title: (body.title || "BloxForge Script").slice(0, 80),
    language: (body.language || "luau").slice(0, 20),
    code: insertCode.slice(0, 100_000),
    instanceType,
    instanceName: (body.instanceName || body.title || "BloxForgeScript")
      .replace(/[^A-Za-z0-9 _-]/g, "")
      .slice(0, 50) || "BloxForgeScript",
    parent,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, commandId: result.commandId });
}
